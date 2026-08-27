require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

// Models
const Category = require('./models/Category');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const StockLog = require('./models/StockLog');

// Services
const categoryService = require('./services/categoryService');
const productService = require('./services/productService');
const saleService = require('./services/saleService');
const stockLogService = require('./services/stockLogService');
const dashboardService = require('./services/dashboardService');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${testName}`);
    results.push({ name: testName, status: 'PASS' });
  } else {
    console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${testName} ${details ? '(' + details + ')' : ''}`);
    results.push({ name: testName, status: 'FAIL', details });
  }
}

async function runTests() {
  const mongoUri = process.env.MONGODB_URI;
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Nandhipriya Electricals — 22 Endpoints Test Suite  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);
  
  console.log(`Connecting to MongoDB...`);
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`${colors.green}Connected to MongoDB successfully.${colors.reset}\n`);
  } catch (err) {
    console.error(`${colors.red}MongoDB Connection Error:${colors.reset} ${err.message}`);
    console.log(`\n${colors.yellow}👉 IMPORTANT: Please whitelist your IP in MongoDB Atlas Network Access (or set to 0.0.0.0/0).${colors.reset}\n`);
    process.exit(1);
  }

  try {
    // Clean test db
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      StockLog.deleteMany({})
    ]);

    // ─── 1. CATEGORY TESTS ──────────────────────────────────────────
    console.log(`${colors.bold}1. Category Tests (/api/categories)${colors.reset}`);
    
    // Test 1: Create category
    const cat = await categoryService.createCategory({
      name: 'Wires & Cables',
      description: 'Single-core and multi-core house wiring'
    });
    assert(cat && cat.name === 'Wires & Cables', 'POST /api/categories — Create Category');

    // Test 2: List categories
    const catList = await categoryService.getCategories();
    assert(catList.length === 1 && catList[0].name === 'Wires & Cables', 'GET /api/categories — List All Categories');

    // Test 3: Get single category
    const singleCat = await categoryService.getCategoryById(cat._id);
    assert(singleCat && singleCat._id.toString() === cat._id.toString(), 'GET /api/categories/:id — Get Single Category');

    // Test 4: Update category
    const updatedCat = await categoryService.updateCategory(cat._id, { description: 'Updated cable description' });
    assert(updatedCat.description === 'Updated cable description', 'PUT /api/categories/:id — Update Category');

    // ─── 2. PRODUCT TESTS ───────────────────────────────────────────
    console.log(`\n${colors.bold}2. Product Tests (/api/products)${colors.reset}`);

    // Test 5: Create products
    const prod1 = await productService.createProduct({
      name: 'Finolex 1.5mm Wire',
      category: cat._id,
      brand: 'Finolex',
      unit: 'coil',
      unitPrice: 1850.00,
      stockQty: 20,
      reorderLevel: 5,
      gstRate: 18,
      barcode: '8901234001'
    });
    assert(prod1 && prod1.name === 'Finolex 1.5mm Wire', 'POST /api/products — Create Product');

    // Low stock product (stockQty <= reorderLevel)
    const prod2 = await productService.createProduct({
      name: 'Havells 20W LED Batten',
      category: cat._id,
      brand: 'Havells',
      unit: 'piece',
      unitPrice: 350.00,
      stockQty: 2,
      reorderLevel: 5,
      gstRate: 18,
      barcode: '8901234002'
    });

    // Test 6: List products with pagination & search
    const prodPage = await productService.getProducts({ page: 1, limit: 10 });
    assert(prodPage.products.length === 2 && prodPage.total === 2, 'GET /api/products — List Products with Pagination');

    // Test 7: Search products
    const searchRes = await productService.getProducts({ search: 'Finolex' });
    assert(searchRes.products.length === 1 && searchRes.products[0].name.includes('Finolex'), 'GET /api/products?search=... — Text Search');

    // Test 8: Low-stock query
    const lowStockRes = await productService.getLowStockProducts();
    assert(lowStockRes.length === 1 && lowStockRes[0].name.includes('Havells'), 'GET /api/products/low-stock — Low Stock Query');

    // Test 9: Get single product
    const singleProd = await productService.getProductById(prod1._id);
    assert(singleProd && singleProd._id.toString() === prod1._id.toString(), 'GET /api/products/:id — Get Single Product');

    // Test 10: Update product
    const updatedProd = await productService.updateProduct(prod1._id, { unitPrice: 1900.00 });
    assert(updatedProd.unitPrice === 1900.00, 'PUT /api/products/:id — Update Product');

    // Test 11: Category delete protection (should block because products reference it)
    let deleteBlocked = false;
    try {
      await categoryService.deleteCategory(cat._id);
    } catch (err) {
      deleteBlocked = true;
    }
    assert(deleteBlocked, 'DELETE /api/categories/:id — Referential Integrity Block on Active Products');

    // Test 12: Soft-delete product (isActive: false)
    await productService.deleteProduct(prod2._id);
    const deletedProdCheck = await Product.findById(prod2._id);
    assert(deletedProdCheck.isActive === false, 'DELETE /api/products/:id — Soft Delete (isActive: false)');

    // ─── 3. SALES TESTS (ATOMIC TRANSACTION) ────────────────────────
    console.log(`\n${colors.bold}3. Sales Tests (/api/sales)${colors.reset}`);

    // Test 13: Create Sale (Atomic)
    const saleResult = await saleService.createSale({
      customerName: 'Kavitha Stores',
      customerPhone: '9876543210',
      items: [
        { productId: prod1._id, quantity: 3 }
      ],
      discountAmt: 100,
      paymentMethod: 'upi'
    });

    const sale = saleResult.sale;
    assert(
      sale &&
      sale.billNumber.startsWith('B-') &&
      sale.items.length === 1 &&
      sale.grandTotal > 0,
      'POST /api/sales — Create Sale Atomic Transaction & Calculations'
    );

    // Test 14: Stock decrement check (20 - 3 = 17)
    const prodAfterSale = await Product.findById(prod1._id);
    assert(prodAfterSale.stockQty === 17, 'POST /api/sales — Auto Stock Decrement Verification (20 - 3 = 17)');

    // Test 15: Stock Log creation on sale
    const saleLogs = await StockLog.find({ referenceId: sale._id });
    assert(saleLogs.length === 1 && saleLogs[0].changeType === 'sale' && saleLogs[0].qtyChange === -3, 'POST /api/sales — Automatic StockLog Creation on Sale');

    // Test 16: List Sales
    const salesList = await saleService.getSales({ page: 1, limit: 10 });
    assert(salesList.sales.length === 1, 'GET /api/sales — List Sales with Pagination');

    // Test 17: Today's sales summary
    const todaySummary = await saleService.getTodaySales();
    assert(todaySummary.count === 1 && todaySummary.revenue === sale.grandTotal, 'GET /api/sales/today — Today Sales Count & Revenue');

    // Test 18: Sale stats
    const stats = await saleService.getSaleStats();
    assert(stats.totalSales === 1 && stats.totalRevenue === sale.grandTotal, 'GET /api/sales/stats — Sales Overall Statistics');

    // Test 19: Get single sale with populated items
    const singleSale = await saleService.getSaleById(sale._id);
    assert(singleSale && singleSale.billNumber === sale.billNumber, 'GET /api/sales/:id — Single Sale Populated');

    // Test 20: Sale bill PDF data JSON
    const pdfData = await saleService.getSalePdfData(sale._id);
    assert(pdfData && pdfData.billNumber && pdfData.customer && pdfData.items.length === 1, 'GET /api/sales/:id/pdf — Bill PDF Structured JSON');

    // ─── 4. STOCK LOGS TESTS ────────────────────────────────────────
    console.log(`\n${colors.bold}4. Stock Log Tests (/api/stock-logs)${colors.reset}`);

    // Test 21: Manual stock adjustment
    const adjResult = await stockLogService.adjustStock({
      productId: prod1._id,
      qtyChange: 5,
      note: 'Supplier delivery adjustment'
    });
    assert(adjResult && adjResult.newStock === 22, 'POST /api/stock-logs/adjust — Manual Inventory Adjustment (17 + 5 = 22)');

    // Test 22: Per-product stock logs history
    const prodLogs = await stockLogService.getProductStockLogs(prod1._id);
    assert(prodLogs.length >= 2, 'GET /api/stock-logs/product/:productId — Product Stock History Audit Trail');

    // ─── 5. DASHBOARD TESTS ─────────────────────────────────────────
    console.log(`\n${colors.bold}5. Dashboard Tests (/api/dashboard)${colors.reset}`);

    // Test 23: Dashboard summary KPIs
    const dashSummary = await dashboardService.getDashboardSummary();
    assert(
      dashSummary.totalProducts === 1 &&
      dashSummary.todayRevenue > 0 &&
      dashSummary.monthlyRevenue > 0,
      'GET /api/dashboard/summary — KPI Aggregations (Products, Revenue, Bills)'
    );

    // Test 24: Dashboard 30-day revenue chart
    const revChart = await dashboardService.getRevenueChart();
    assert(Array.isArray(revChart), 'GET /api/dashboard/revenue-chart — 30-Day Revenue Trend Array');

    // Summary report
    console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
    const passedCount = results.filter(r => r.status === 'PASS').length;
    const totalCount = results.length;
    console.log(`${colors.bold}Test Results Summary:${colors.reset} ${colors.green}${passedCount} / ${totalCount} PASSED${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

    await mongoose.connection.close();
    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (err) {
    console.error(`${colors.red}Test Execution Error:${colors.reset}`, err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

runTests();
