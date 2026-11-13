/**
 * Sale Service
 * Contains all business logic for sale operations.
 * The createSale function implements an ATOMIC TRANSACTION.
 */
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const { getNextBillNumber } = require('../utils/autoIncrement');
const whatsappService = require('./whatsappService');

/**
 * Create a new sale using an atomic Mongoose transaction.
 * Steps: validate stock → snapshot pricing → calculate totals →
 *        create sale → decrement stock → create stock logs.
 *
 * @param {Object} data - { customerName?, customerPhone?, items[], discountAmt?, paymentMethod? }
 * @returns {Object} populated sale document
 * @throws {Error} on validation failure or insufficient stock (transaction aborted)
 */
const createSale = async (data) => {
  const { customerName, customerPhone, items, paymentMethod } = data;
  const discountAmt = Math.max(0, Number(data.discountAmt !== undefined ? data.discountAmt : data.discount) || 0);
  const sanitizedPhone = customerPhone && String(customerPhone).trim() ? String(customerPhone).trim() : null;
  const payMethod = (paymentMethod || 'cash').toString().toLowerCase().trim();

  // Helper function executing the sale logic with or without session
  const runSaleOperations = async (session = null) => {
    // ── Step 1-2: Validate each item & snapshot pricing ──────────────
    const saleItems = [];

    for (const item of items) {
      let productQuery = Product.findById(item.productId);
      if (session) productQuery = productQuery.session(session);
      const product = await productQuery;

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (!product.isActive) {
        throw new Error(`Product is inactive: ${product.name}`);
      }

      if (product.stockQty < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stockQty}, Requested: ${item.quantity}`
        );
      }

      // Snapshot current pricing from Product
      const unitPrice = product.unitPrice;
      const gstRate = product.gstRate || 0;
      const lineTotal = item.quantity * unitPrice;

      saleItems.push({
        product: product._id,
        productName: product.name,
        tamilName: product.tamilName || '',
        sku: product.sku || '',
        rackLocation: product.rackLocation || '',
        unit: product.unit || 'piece',
        quantity: item.quantity,
        unitPrice,
        gstRate,
        lineTotal,
        _productDoc: product, // kept for stock operations
      });
    }

    // ── Step 3-6: Calculate bill totals ──────────────────────────────
    const subTotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalGst = saleItems.reduce(
      (sum, item) => sum + (item.lineTotal * item.gstRate) / 100,
      0
    );
    const roundOff = Number(data.roundOff || 0);
    const grandTotal = subTotal + totalGst - discountAmt + roundOff;

    // ── Step 7: Generate bill number ─────────────────────────────────
    const billNumber = await getNextBillNumber(session);

    // ── Step 8: Create Sale document ─────────────────────────────────
    const saleItemsClean = saleItems.map(({ _productDoc, ...rest }) => rest);

    const saleDocData = {
      billNumber,
      customerName: customerName ? customerName.trim() : 'Walk-in Customer',
      customerPhone: sanitizedPhone,
      customerGstin: data.customerGstin ? String(data.customerGstin).trim() : '',
      items: saleItemsClean,
      subTotal: Math.round(subTotal * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      discountAmt,
      roundOff: Math.round(roundOff * 100) / 100,
      grandTotal: Math.max(0, Math.round(grandTotal * 100) / 100),
      paymentMethod: payMethod,
    };

    let sale;
    if (session) {
      const [created] = await Sale.create([saleDocData], { session });
      sale = created;
    } else {
      sale = await Sale.create(saleDocData);
    }

    // ── Step 9-10: Decrement stock & create stock logs ───────────────
    for (const item of saleItems) {
      const product = item._productDoc;
      const prevStock = product.stockQty;
      const newStock = prevStock - item.quantity;

      const logPayload = {
        product: product._id,
        productName: product.name,
        tamilName: product.tamilName || '',
        sku: product.sku || '',
        rackLocation: product.rackLocation || '',
        unit: product.unit || 'piece',
        changeType: 'sale',
        qtyChange: -item.quantity,
        prevStock,
        newStock,
        reasonCode: 'Direct Counter POS Bill',
        operator: 'Naveen [Staff]',
        referenceId: sale._id,
        note: `Sold ${item.quantity} ${product.unit || 'units'} in bill ${billNumber}`,
      };

      if (session) {
        await Product.findByIdAndUpdate(
          product._id,
          { stockQty: newStock },
          { session }
        );

        await StockLog.create([logPayload], { session });
      } else {
        await Product.findByIdAndUpdate(product._id, { stockQty: newStock });

        await StockLog.create(logPayload);
      }
    }

    return { sale, billNumber };
  };

  let result;
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    result = await runSaleOperations(session);
    await session.commitTransaction();
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }

    // Fallback if standalone MongoDB does not support replica set transactions
    const isTxnUnsupported =
      error.message &&
      (error.message.includes('replica set') ||
       error.message.includes('Transaction numbers are only allowed') ||
       error.message.includes('does not support retryable writes') ||
       error.codeName === 'IllegalOperation');

    if (isTxnUnsupported) {
      result = await runSaleOperations(null);
    } else {
      error.statusCode = 400;
      throw error;
    }
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (_) {}
    }
  }

  // ── Step 11: Return populated sale ────────────────────────────────
  const populatedSale = await Sale.findById(result.sale._id).populate(
    'items.product',
    'name productCode'
  );

  // Trigger automated WhatsApp dispatch (Open-WA or configured provider)
  if (populatedSale.customerPhone) {
    try {
      const waResult = await whatsappService.sendBillNotification(populatedSale);
      if (waResult.success) {
        populatedSale.whatsappSent = true;
        populatedSale.whatsappSentAt = new Date();
        await Sale.findByIdAndUpdate(result.sale._id, {
          whatsappSent: true,
          whatsappSentAt: populatedSale.whatsappSentAt,
        });
      }
    } catch (waErr) {
      console.warn(`[WhatsApp Service] ${waErr.message}`);
    }
  }

  return { sale: populatedSale, billNumber: result.billNumber };
};

/**
 * Get all sales with optional date range filter & pagination.
 * @param {Object} options - { page, limit, startDate, endDate }
 * @returns {{ sales, total, page, limit }}
 */
const getSales = async ({ page = 1, limit = 10, startDate, endDate, from, to, search }) => {
  const filter = {};

  const start = startDate || from;
  const end = endDate || to;

  if (start || end) {
    filter.createdAt = {};
    if (start) {
      filter.createdAt.$gte = new Date(start);
    }
    if (end) {
      const endD = new Date(end);
      endD.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endD;
    }
  }

  if (search && search.trim() !== '') {
    const q = search.trim();
    filter.$or = [
      { billNumber: { $regex: q, $options: 'i' } },
      { customerName: { $regex: q, $options: 'i' } },
      { customerPhone: { $regex: q, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate('items.product', 'name productCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Sale.countDocuments(filter),
  ]);

  return { sales, total, page: pageNum, limit: limitNum };
};

/**
 * Get today's sales count and revenue.
 * @returns {{ count, revenue }}
 */
const getTodaySales = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
      },
    },
  ]);

  return result[0] || { count: 0, revenue: 0 };
};

/**
 * Get overall sales statistics.
 * @returns {{ totalSales, totalRevenue, avgBillValue }}
 */
const getSaleStats = async () => {
  const result = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$grandTotal' },
        avgBillValue: { $avg: '$grandTotal' },
      },
    },
  ]);

  const data = result[0] || { totalSales: 0, totalRevenue: 0, avgBillValue: 0 };

  return {
    totalSales: data.totalSales,
    totalRevenue: data.totalRevenue,
    avgBillValue: Math.round(data.avgBillValue * 100) / 100,
  };
};

/**
 * Get a single sale by ID with populated items.
 * @param {String} id - Sale ID
 * @returns {Object} sale
 * @throws {Error} if not found
 */
const getSaleById = async (id) => {
  const sale = await Sale.findById(id).populate(
    'items.product',
    'name productCode brand unit'
  );

  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    throw error;
  }

  return sale;
};

/**
 * Get structured PDF data for a sale bill.
 * @param {String} id - Sale ID
 * @returns {Object} pdfData - structured JSON for frontend PDF generation
 * @throws {Error} if not found
 */
const getSalePdfData = async (id) => {
  const sale = await Sale.findById(id).populate(
    'items.product',
    'name productCode brand unit'
  );

  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    throw error;
  }

  const pdfData = {
    billNumber: sale.billNumber,
    date: sale.createdAt,
    customer: {
      name: sale.customerName || 'Walk-in Customer',
      phone: sale.customerPhone || null,
    },
    items: sale.items.map((item, index) => ({
      sno: index + 1,
      productName: item.productName,
      productCode: item.product?.productCode || '',
      brand: item.product?.brand || '',
      unit: item.product?.unit || 'pcs',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate,
      gstAmount: (item.lineTotal * item.gstRate) / 100,
      lineTotal: item.lineTotal,
    })),
    summary: {
      subTotal: sale.subTotal,
      totalGst: sale.totalGst,
      discountAmt: sale.discountAmt,
      grandTotal: sale.grandTotal,
    },
    paymentMethod: sale.paymentMethod || 'cash',
    company: {
      name: 'Nandhipriya Electricals',
      tagline: 'Quality Electrical Solutions',
    },
  };

  return pdfData;
};

/**
 * Trigger or re-send WhatsApp notification for a sale by ID.
 * @param {String} id - Sale ID
 * @returns {Promise<Object>} dispatch result
 */
const sendWhatsAppForSale = async (id) => {
  const sale = await Sale.findById(id).populate(
    'items.product',
    'name productCode brand unit'
  );

  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    throw error;
  }

  if (!sale.customerPhone) {
    const error = new Error('Sale has no customer phone number');
    error.statusCode = 400;
    throw error;
  }

  const result = await whatsappService.sendBillNotification(sale);
  if (result.success) {
    await Sale.findByIdAndUpdate(id, {
      whatsappSent: true,
      whatsappSentAt: new Date(),
    });
  }

  return {
    ...result,
    billNumber: sale.billNumber,
    customerPhone: sale.customerPhone,
  };
};

module.exports = {
  createSale,
  getSales,
  getTodaySales,
  getSaleStats,
  getSaleById,
  getSalePdfData,
  sendWhatsAppForSale,
};
