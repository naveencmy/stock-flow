/**
 * Sale Controller
 * Handles HTTP request/response flow for sales.
 * Delegates business logic (including atomic transaction) to saleService.
 */
const asyncHandler = require('../middleware/asyncHandler');
const saleService = require('../services/saleService');

// @desc    Create a new sale (ATOMIC TRANSACTION)
// @route   POST /api/sales
const createSale = asyncHandler(async (req, res) => {
  const { sale, billNumber } = await saleService.createSale(req.body);

  res.status(201).json({
    success: true,
    data: sale,
    message: `Sale ${billNumber} created successfully`,
  });
});

// @desc    Get all sales with date range filter & pagination
// @route   GET /api/sales
const getSales = asyncHandler(async (req, res) => {
  const { page, limit, startDate, endDate, from, to, search } = req.query;
  const result = await saleService.getSales({ page, limit, startDate, endDate, from, to, search });

  res.status(200).json({
    success: true,
    data: result.sales,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.ceil(result.total / result.limit),
    },
  });
});

// @desc    Get today's sales count + revenue
// @route   GET /api/sales/today
const getTodaySales = asyncHandler(async (req, res) => {
  const data = await saleService.getTodaySales();

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get sales statistics (total sales, revenue, avg bill)
// @route   GET /api/sales/stats
const getSaleStats = asyncHandler(async (req, res) => {
  const data = await saleService.getSaleStats();

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get single sale with populated items
// @route   GET /api/sales/:id
const getSale = asyncHandler(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.id);

  res.status(200).json({
    success: true,
    data: sale,
  });
});

// @desc    Get bill PDF data as JSON or download vector PDF
// @route   GET /api/sales/:id/pdf
const getSalePdf = asyncHandler(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.id);

  if (req.query.download === 'true' || req.headers.accept?.includes('application/pdf')) {
    const { generateInvoicePdfBuffer } = require('../utils/pdfGenerator');
    const pdfBuf = await generateInvoicePdfBuffer(sale);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Invoice_${sale.billNumber || 'Bill'}.pdf"`
    );
    return res.send(pdfBuf);
  }

  const pdfData = await saleService.getSalePdfData(req.params.id);

  res.status(200).json({
    success: true,
    data: pdfData,
  });
});

// @desc    Trigger WhatsApp message dispatch for a sale
// @route   POST /api/sales/:id/whatsapp
const sendWhatsApp = asyncHandler(async (req, res) => {
  const result = await saleService.sendWhatsAppForSale(req.params.id);

  res.status(200).json({
    success: true,
    data: result,
    message: result.success
      ? `WhatsApp invoice successfully dispatched to +91 ${result.customerPhone}`
      : `WhatsApp message queued or requires client dispatch (${result.reason || 'see details'})`,
  });
});

module.exports = {
  createSale,
  getSales,
  getTodaySales,
  getSaleStats,
  getSale,
  getSalePdf,
  sendWhatsApp,
};
