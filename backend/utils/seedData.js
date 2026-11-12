require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const Sale = require('../models/Sale');

const seedCategories = [
  {
    name: 'Wires & Cables',
    description: 'Single-core, multi-core, and armoured electrical cables and house wiring.'
  },
  {
    name: 'Switches & Sockets',
    description: 'Modular switches, power sockets, plugs, and cover plates.'
  },
  {
    name: 'Lights & Bulbs',
    description: 'Energy-saving LED bulbs, battens, ceiling downlights, and outdoor fixtures.'
  },
  {
    name: 'MCB & Distribution',
    description: 'Miniature circuit breakers, isolators, RCCBs, and distribution boards.'
  },
  {
    name: 'Tools & Accessories',
    description: 'Electrical tape, testers, ceiling roses, and installation supplies.'
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nandhipriya_electricals';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to database.');

    console.log('Clearing existing collections...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      StockLog.deleteMany({}),
      Sale.deleteMany({})
    ]);

    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(seedCategories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('Seeding products...');
    const productsData = [
      {
        name: 'Finolex 1.5mm Wire',
        category: categoryMap['Wires & Cables'],
        brand: 'Finolex',
        unit: 'coil',
        unitPrice: 1850.00,
        stockQty: 25,
        reorderLevel: 10,
        gstRate: 18,
        barcode: '890123400001',
        isActive: true
      },
      {
        name: 'Havells 20W LED',
        category: categoryMap['Lights & Bulbs'],
        brand: 'Havells',
        unit: 'piece',
        unitPrice: 320.00,
        stockQty: 3, // LOW STOCK (<= reorderLevel 8)
        reorderLevel: 8,
        gstRate: 18,
        barcode: '890123400002',
        isActive: true
      },
      {
        name: 'Legrand 32A MCB',
        category: categoryMap['MCB & Distribution'],
        brand: 'Legrand',
        unit: 'piece',
        unitPrice: 460.00,
        stockQty: 18,
        reorderLevel: 5,
        gstRate: 18,
        barcode: '890123400003',
        isActive: true
      },
      {
        name: 'Anchor Roma 6A Switch',
        category: categoryMap['Switches & Sockets'],
        brand: 'Anchor',
        unit: 'box',
        unitPrice: 420.00,
        stockQty: 12,
        reorderLevel: 5,
        gstRate: 18,
        barcode: '890123400004',
        isActive: true
      },
      {
        name: 'Polycab 2.5mm Wire',
        category: categoryMap['Wires & Cables'],
        brand: 'Polycab',
        unit: 'coil',
        unitPrice: 2950.00,
        stockQty: 4, // LOW STOCK (<= reorderLevel 8)
        reorderLevel: 8,
        gstRate: 18,
        barcode: '890123400005',
        isActive: true
      },
      {
        name: 'Philips 9W LED Tube',
        category: categoryMap['Lights & Bulbs'],
        brand: 'Philips',
        unit: 'piece',
        unitPrice: 210.00,
        stockQty: 30,
        reorderLevel: 10,
        gstRate: 18,
        barcode: '890123400006',
        isActive: true
      },
      {
        name: 'Havells 16A Socket',
        category: categoryMap['Switches & Sockets'],
        brand: 'Havells',
        unit: 'piece',
        unitPrice: 145.00,
        stockQty: 40,
        reorderLevel: 15,
        gstRate: 18,
        barcode: '890123400007',
        isActive: true
      },
      {
        name: 'Finolex 4mm Wire',
        category: categoryMap['Wires & Cables'],
        brand: 'Finolex',
        unit: 'coil',
        unitPrice: 4600.00,
        stockQty: 2, // LOW STOCK (<= reorderLevel 5)
        reorderLevel: 5,
        gstRate: 18,
        barcode: '890123400008',
        isActive: true
      },
      {
        name: 'Legrand 20A DP MCB',
        category: categoryMap['MCB & Distribution'],
        brand: 'Legrand',
        unit: 'piece',
        unitPrice: 580.00,
        stockQty: 14,
        reorderLevel: 6,
        gstRate: 18,
        barcode: '890123400009',
        isActive: true
      },
      {
        name: 'GM 6A Modular Switch',
        category: categoryMap['Switches & Sockets'],
        brand: 'GM',
        unit: 'box',
        unitPrice: 380.00,
        stockQty: 20,
        reorderLevel: 6,
        gstRate: 18,
        barcode: '890123400010',
        isActive: true
      },
      {
        name: 'Polycab Ceiling Rose',
        category: categoryMap['Tools & Accessories'],
        brand: 'Polycab',
        unit: 'piece',
        unitPrice: 38.00,
        stockQty: 60,
        reorderLevel: 20,
        gstRate: 18,
        barcode: '890123400011',
        isActive: true
      },
      {
        name: 'Havells 40W LED Flood Light',
        category: categoryMap['Lights & Bulbs'],
        brand: 'Havells',
        unit: 'piece',
        unitPrice: 1650.00,
        stockQty: 1, // LOW STOCK (<= reorderLevel 4)
        reorderLevel: 4,
        gstRate: 18,
        barcode: '890123400012',
        isActive: true
      },
      {
        name: 'Anchor 3-Pin Plug',
        category: categoryMap['Switches & Sockets'],
        brand: 'Anchor',
        unit: 'piece',
        unitPrice: 65.00,
        stockQty: 45,
        reorderLevel: 15,
        gstRate: 18,
        barcode: '890123400013',
        isActive: true
      },
      {
        name: 'Finolex 6mm Wire',
        category: categoryMap['Wires & Cables'],
        brand: 'Finolex',
        unit: 'coil',
        unitPrice: 6800.00,
        stockQty: 6,
        reorderLevel: 3,
        gstRate: 18,
        barcode: '890123400014',
        isActive: true
      },
      {
        name: 'Havells 25A RCCB',
        category: categoryMap['MCB & Distribution'],
        brand: 'Havells',
        unit: 'piece',
        unitPrice: 1950.00,
        stockQty: 8,
        reorderLevel: 3,
        gstRate: 18,
        barcode: '890123400015',
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(productsData);

    console.log('Generating initial stock audit logs for inventory...');
    const initialLogs = createdProducts.map((p) => ({
      product: p._id,
      productName: p.name,
      changeType: 'purchase',
      qtyChange: p.stockQty,
      prevStock: 0,
      newStock: p.stockQty,
      referenceId: 'INIT-AUDIT',
      note: 'Initial inventory seeding'
    }));
    await StockLog.insertMany(initialLogs);

    console.log('Generating realistic sales history for the last 30 days...');
    const customerNames = [
      'Kuppusamy Electrician',
      'Muthusamy K',
      'Venkatesh Construction',
      'Senthil Kumar',
      'Ravi Electricals',
      'Praveen Kumar',
      'Anand Building Works',
      'Karthik & Sons',
      'Walk-in Customer'
    ];
    const customerPhones = [
      '9876543210',
      '9443211234',
      '9894000123',
      '9123456789',
      '9789012345'
    ];
    const paymentMethods = ['cash', 'upi', 'card'];

    const salableProducts = createdProducts.filter(p => p.stockQty > p.reorderLevel);
    const seedSales = [];
    const saleLogs = [];
    let billCounter = 1;

    const now = new Date();
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const salesCount = dayOffset === 0 ? 2 : (dayOffset % 7 === 0 || dayOffset % 7 === 6 ? 3 : (dayOffset % 2 === 0 ? 2 : 1));

      for (let s = 0; s < salesCount; s++) {
        const saleDate = new Date(now.getTime() - dayOffset * 86400000);
        saleDate.setHours(9 + s * 4, (s * 23) % 60, 0, 0);

        const numItems = (billCounter % 2) + 1;
        const selectedItems = [];
        let subTotal = 0;
        let totalGst = 0;

        for (let i = 0; i < numItems; i++) {
          const prod = salableProducts[(billCounter + i) % salableProducts.length];
          const qty = (billCounter % 2) + 1;
          const lineTotal = qty * prod.unitPrice;
          const gstAmount = Math.round((lineTotal * (prod.gstRate / 100)) * 100) / 100;

          subTotal += lineTotal;
          totalGst += gstAmount;

          selectedItems.push({
            product: prod._id,
            productName: prod.name,
            quantity: qty,
            unitPrice: prod.unitPrice,
            gstRate: prod.gstRate,
            lineTotal: lineTotal
          });
        }

        const calculatedTotal = subTotal + totalGst;
        const discountAmt = (billCounter % 5 === 0 && calculatedTotal > 100) ? 50 : 0;
        const grandTotal = Math.max(0, Math.round(calculatedTotal - discountAmt));
        const billNumber = `B-${String(billCounter).padStart(5, '0')}`;
        const custName = customerNames[billCounter % customerNames.length];
        const custPhone = custName === 'Walk-in Customer' ? null : customerPhones[billCounter % customerPhones.length];
        const payMethod = paymentMethods[billCounter % paymentMethods.length];

        seedSales.push({
          billNumber,
          customerName: custName,
          customerPhone: custPhone,
          items: selectedItems,
          subTotal: Math.round(subTotal),
          totalGst: Math.round(totalGst),
          discountAmt,
          grandTotal,
          paymentMethod: payMethod,
          createdAt: saleDate,
          updatedAt: saleDate
        });
        billCounter++;
      }
    }

    const createdSales = await Sale.insertMany(seedSales);

    createdSales.forEach(sale => {
      sale.items.forEach(item => {
        saleLogs.push({
          product: item.product,
          productName: item.productName,
          changeType: 'sale',
          qtyChange: -item.quantity,
          prevStock: 30,
          newStock: 30 - item.quantity,
          referenceId: sale._id.toString(),
          note: `Sale invoice ${sale.billNumber}`,
          createdAt: sale.createdAt
        });
      });
    });
    if (saleLogs.length > 0) {
      await StockLog.insertMany(saleLogs);
    }

    console.log('✅ Seeding complete!');
    console.log(`- Categories created: ${createdCategories.length}`);
    console.log(`- Products created: ${createdProducts.length}`);
    console.log(`- Sales created: ${createdSales.length}`);
    console.log(`- Stock audit logs created: ${initialLogs.length + saleLogs.length}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
