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
    name: 'Switchgear',
    description: 'Modular switches, MCBs, isolators, RCCBs, and distribution boards.'
  },
  {
    name: 'Fans & Lighting',
    description: 'BLDC ceiling fans, LED battens, street lights, and downlights.'
  },
  {
    name: 'Plumbing',
    description: 'CPVC pipes, fittings, brass ball valves, solvent cements.'
  },
  {
    name: 'Fasteners',
    description: 'SS 304 screws, anchor bolts, hex nuts, washers, and rawl plugs.'
  },
  {
    name: 'Tools & Accessories',
    description: 'Insulation tapes, testers, wire strippers, and installation supplies.'
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

    console.log('Seeding products with bilingual names & rack locations...');
    const productsData = [
      {
        name: 'Finolex 1.5 Sq.mm FR Copper Wire (Red)',
        tamilName: 'பினோலெக்ஸ் 1.5 மிமீ காப்பர் ஒயர் (சிவப்பு)',
        sku: 'FIN-WIR-1.5-RD',
        rackLocation: 'RACK E-03',
        packagingConversion: '1 Coil = 90 meters',
        category: categoryMap['Wires & Cables'],
        brand: 'Finolex',
        unit: 'coil',
        purchasePrice: 1180.00,
        unitPrice: 1450.00,
        stockQty: 14,
        reorderLevel: 5,
        gstRate: 18,
        hsnCode: '8544',
        barcode: '890123400001',
        isActive: true
      },
      {
        name: 'Schneider 16A SP MCB C-Curve',
        tamilName: 'ஷ்னைடர் 16A எம்.சி.பி சுவிட்ச் (சி-கர்வு)',
        sku: 'SCH-MCB-16A',
        rackLocation: 'RACK S-02',
        packagingConversion: '1 Box = 12 Pieces',
        category: categoryMap['Switchgear'],
        brand: 'Schneider',
        unit: 'piece',
        purchasePrice: 142.00,
        unitPrice: 182.00,
        stockQty: 4, // CRITICAL LOW STOCK
        reorderLevel: 20,
        gstRate: 18,
        hsnCode: '8536',
        barcode: '890123400002',
        isActive: true
      },
      {
        name: 'Crompton 28W BLDC Fan 1200mm Brown',
        tamilName: 'கிராம்டன் 28W BLDC மின்விசிறி (பிரவுன்)',
        sku: 'CRM-FAN-BLDC-28W',
        rackLocation: 'LOFT-F01',
        packagingConversion: '1 Box = 1 Complete Set',
        category: categoryMap['Fans & Lighting'],
        brand: 'Crompton',
        unit: 'unit',
        purchasePrice: 2350.00,
        unitPrice: 2850.00,
        stockQty: 12,
        reorderLevel: 4,
        gstRate: 18,
        hsnCode: '8414',
        barcode: '890123400003',
        isActive: true
      },
      {
        name: 'Supreme 1" Brass-Core PVC Ball Valve',
        tamilName: 'சுப்ரீம் 1 அங்குல பித்தளை பால் வால்வு',
        sku: 'SUP-VAL-BAL-1IN',
        rackLocation: 'BIN P-14',
        packagingConversion: '1 Bag = 25 Pcs',
        category: categoryMap['Plumbing'],
        brand: 'Supreme',
        unit: 'piece',
        purchasePrice: 145.00,
        unitPrice: 185.00,
        stockQty: 3, // CRITICAL LOW STOCK
        reorderLevel: 25,
        gstRate: 18,
        hsnCode: '8481',
        barcode: '890123400004',
        isActive: true
      },
      {
        name: 'SS 304 Star Head Wood Screws 1.5" x 8',
        tamilName: 'எஸ்.எஸ் 304 ஸ்டார் மர திருகுகள் 1.5 அங்குலம்',
        sku: 'SCR-SS-1.5X8',
        rackLocation: 'DRAWER H-04',
        packagingConversion: '1 Box = 100 Pcs (3,500 Pcs total)',
        category: categoryMap['Fasteners'],
        brand: 'FastenFit',
        unit: 'box',
        purchasePrice: 72.00,
        unitPrice: 95.00,
        stockQty: 35,
        reorderLevel: 10,
        gstRate: 18,
        hsnCode: '7318',
        barcode: '890123400005',
        isActive: true
      },
      {
        name: 'GM 6A Modular Switch 1-Way (White)',
        tamilName: 'ஜி.எம் 6A மாடுலர் சுவிட்ச் (வெள்ளை)',
        sku: 'GM-MOD-SW-6A',
        rackLocation: 'RACK G-01',
        packagingConversion: '1 Box = 20 Pcs',
        category: categoryMap['Switchgear'],
        brand: 'GM',
        unit: 'piece',
        purchasePrice: 24.00,
        unitPrice: 34.00,
        stockQty: 120,
        reorderLevel: 30,
        gstRate: 18,
        hsnCode: '8536',
        barcode: '890123400006',
        isActive: true
      },
      {
        name: 'Astral 3/4" CPVC Hot/Cold Pipe (3m)',
        tamilName: 'ஆஸ்ட்ரல் 3/4 அங்குல சிபிவிசி பைப் (3 மீ)',
        sku: 'AST-CPVC-075-3M',
        rackLocation: 'RACK PIPE-02',
        packagingConversion: '1 Bundle = 10 Pcs',
        category: categoryMap['Plumbing'],
        brand: 'Astral',
        unit: 'piece',
        purchasePrice: 215.00,
        unitPrice: 275.00,
        stockQty: 45,
        reorderLevel: 15,
        gstRate: 18,
        hsnCode: '3917',
        barcode: '890123400007',
        isActive: true
      },
      {
        name: 'Finolex 2.5 Sq.mm FR Copper Wire (Blue)',
        tamilName: 'பினோலெக்ஸ் 2.5 மிமீ காப்பர் ஒயர் (நீலம்)',
        sku: 'FIN-WIR-2.5-BL',
        rackLocation: 'RACK E-04',
        packagingConversion: '1 Coil = 90 meters',
        category: categoryMap['Wires & Cables'],
        brand: 'Finolex',
        unit: 'coil',
        purchasePrice: 1950.00,
        unitPrice: 2450.00,
        stockQty: 8,
        reorderLevel: 5,
        gstRate: 18,
        hsnCode: '8544',
        barcode: '890123400008',
        isActive: true
      },
      {
        name: 'Solar Street Light 20W All-in-One',
        tamilName: 'சூரிய சக்தி தெரு விளக்கு 20W',
        sku: 'SOL-LGT-20W',
        rackLocation: 'LOFT-L02',
        packagingConversion: '1 Unit = 1 Box with Solar Panel',
        category: categoryMap['Fans & Lighting'],
        brand: 'Havells',
        unit: 'unit',
        purchasePrice: 1950.00,
        unitPrice: 2400.00,
        stockQty: 6,
        reorderLevel: 2,
        gstRate: 5,
        hsnCode: '9405',
        barcode: '890123400009',
        isActive: true
      },
      {
        name: 'Steelgrip PVC Electrical Insulation Tape',
        tamilName: 'ஸ்டீல்கிரிப் பிவிசி இன்சுலேஷன் டேப்',
        sku: 'STG-TAPE-PVC',
        rackLocation: 'COUNTER-B01',
        packagingConversion: '1 Box = 30 Rolls',
        category: categoryMap['Tools & Accessories'],
        brand: 'Steelgrip',
        unit: 'piece',
        purchasePrice: 10.00,
        unitPrice: 15.00,
        stockQty: 180,
        reorderLevel: 50,
        gstRate: 18,
        hsnCode: '3919',
        barcode: '890123400010',
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    const prodMap = {};
    createdProducts.forEach((p) => {
      prodMap[p.sku] = p;
    });

    console.log('Seeding sales ledger matching terminal emulator...');
    const now = new Date();

    const sampleSales = [
      {
        billNumber: '#INV-2026-0843',
        customerName: 'Senthil Contractor (செந்தில்)',
        customerPhone: '9443188210',
        customerGstin: '33AAAAB0000A1Z5',
        items: [
          {
            product: prodMap['FIN-WIR-1.5-RD']._id,
            productName: prodMap['FIN-WIR-1.5-RD'].name,
            tamilName: prodMap['FIN-WIR-1.5-RD'].tamilName,
            sku: prodMap['FIN-WIR-1.5-RD'].sku,
            rackLocation: prodMap['FIN-WIR-1.5-RD'].rackLocation,
            unit: 'coil',
            quantity: 1,
            unitPrice: 1450.00,
            gstRate: 18,
            lineTotal: 1450.00
          },
          {
            product: prodMap['SUP-VAL-BAL-1IN']._id,
            productName: prodMap['SUP-VAL-BAL-1IN'].name,
            tamilName: prodMap['SUP-VAL-BAL-1IN'].tamilName,
            sku: prodMap['SUP-VAL-BAL-1IN'].sku,
            rackLocation: prodMap['SUP-VAL-BAL-1IN'].rackLocation,
            unit: 'piece',
            quantity: 2,
            unitPrice: 185.00,
            gstRate: 18,
            lineTotal: 370.00
          },
          {
            product: prodMap['GM-MOD-SW-6A']._id,
            productName: prodMap['GM-MOD-SW-6A'].name,
            tamilName: prodMap['GM-MOD-SW-6A'].tamilName,
            sku: prodMap['GM-MOD-SW-6A'].sku,
            rackLocation: prodMap['GM-MOD-SW-6A'].rackLocation,
            unit: 'piece',
            quantity: 4,
            unitPrice: 34.00,
            gstRate: 18,
            lineTotal: 136.00
          },
          {
            product: prodMap['AST-CPVC-075-3M']._id,
            productName: prodMap['AST-CPVC-075-3M'].name,
            tamilName: prodMap['AST-CPVC-075-3M'].tamilName,
            sku: prodMap['AST-CPVC-075-3M'].sku,
            rackLocation: prodMap['AST-CPVC-075-3M'].rackLocation,
            unit: 'piece',
            quantity: 2,
            unitPrice: 275.00,
            gstRate: 18,
            lineTotal: 550.00
          }
        ],
        subTotal: 2506.00,
        totalGst: 451.08,
        discountAmt: 0,
        roundOff: 0.92,
        grandTotal: 3240.00,
        paymentMethod: 'upi',
        createdAt: new Date(now.getTime() - 15 * 60000)
      },
      {
        billNumber: '#INV-2026-0842',
        customerName: 'Kumar Electrician (குமார்)',
        customerPhone: '9842210492',
        items: [
          {
            product: prodMap['FIN-WIR-1.5-RD']._id,
            productName: prodMap['FIN-WIR-1.5-RD'].name,
            tamilName: prodMap['FIN-WIR-1.5-RD'].tamilName,
            sku: prodMap['FIN-WIR-1.5-RD'].sku,
            rackLocation: prodMap['FIN-WIR-1.5-RD'].rackLocation,
            unit: 'coil',
            quantity: 4,
            unitPrice: 1450.00,
            gstRate: 18,
            lineTotal: 5800.00
          },
          {
            product: prodMap['CRM-FAN-BLDC-28W']._id,
            productName: prodMap['CRM-FAN-BLDC-28W'].name,
            tamilName: prodMap['CRM-FAN-BLDC-28W'].tamilName,
            sku: prodMap['CRM-FAN-BLDC-28W'].sku,
            rackLocation: prodMap['CRM-FAN-BLDC-28W'].rackLocation,
            unit: 'unit',
            quantity: 1,
            unitPrice: 2850.00,
            gstRate: 18,
            lineTotal: 2850.00
          }
        ],
        subTotal: 7161.02,
        totalGst: 1288.98,
        discountAmt: 0,
        roundOff: 0,
        grandTotal: 8450.00,
        paymentMethod: 'khata',
        createdAt: new Date(now.getTime() - 48 * 60000)
      },
      {
        billNumber: '#INV-2026-0841',
        customerName: 'Murugan Plumbing Works (முருகன்)',
        customerPhone: '9789144301',
        items: [
          {
            product: prodMap['FIN-WIR-1.5-RD']._id,
            productName: prodMap['FIN-WIR-1.5-RD'].name,
            tamilName: prodMap['FIN-WIR-1.5-RD'].tamilName,
            sku: prodMap['FIN-WIR-1.5-RD'].sku,
            rackLocation: prodMap['FIN-WIR-1.5-RD'].rackLocation,
            unit: 'coil',
            quantity: 1,
            unitPrice: 1450.00,
            gstRate: 18,
            lineTotal: 1450.00
          }
        ],
        subTotal: 1228.81,
        totalGst: 221.19,
        discountAmt: 0,
        roundOff: 0,
        grandTotal: 1450.00,
        paymentMethod: 'cash',
        createdAt: new Date(now.getTime() - 80 * 60000)
      },
      {
        billNumber: '#INV-2026-0840',
        customerName: 'Dharapuram Panchayat Union',
        customerPhone: '9443000001',
        items: [
          {
            product: prodMap['SOL-LGT-20W']._id,
            productName: prodMap['SOL-LGT-20W'].name,
            tamilName: prodMap['SOL-LGT-20W'].tamilName,
            sku: prodMap['SOL-LGT-20W'].sku,
            rackLocation: prodMap['SOL-LGT-20W'].rackLocation,
            unit: 'unit',
            quantity: 5,
            unitPrice: 2400.00,
            gstRate: 5,
            lineTotal: 12000.00
          },
          {
            product: prodMap['SCR-SS-1.5X8']._id,
            productName: prodMap['SCR-SS-1.5X8'].name,
            tamilName: prodMap['SCR-SS-1.5X8'].tamilName,
            sku: prodMap['SCR-SS-1.5X8'].sku,
            rackLocation: prodMap['SCR-SS-1.5X8'].rackLocation,
            unit: 'box',
            quantity: 8,
            unitPrice: 95.00,
            gstRate: 18,
            lineTotal: 760.00
          }
        ],
        subTotal: 11000.00,
        totalGst: 1800.00,
        discountAmt: 0,
        roundOff: 0,
        grandTotal: 12800.00,
        paymentMethod: 'upi',
        createdAt: new Date(now.getTime() - 130 * 60000)
      },
      {
        billNumber: '#INV-2026-0839',
        customerName: 'Balaji Residence',
        customerPhone: '9150673040',
        items: [
          {
            product: prodMap['GM-MOD-SW-6A']._id,
            productName: prodMap['GM-MOD-SW-6A'].name,
            tamilName: prodMap['GM-MOD-SW-6A'].tamilName,
            sku: prodMap['GM-MOD-SW-6A'].sku,
            rackLocation: prodMap['GM-MOD-SW-6A'].rackLocation,
            unit: 'piece',
            quantity: 10,
            unitPrice: 34.00,
            gstRate: 18,
            lineTotal: 340.00
          }
        ],
        subTotal: 288.14,
        totalGst: 51.86,
        discountAmt: 0,
        roundOff: 0,
        grandTotal: 340.00,
        paymentMethod: 'cash',
        createdAt: new Date(now.getTime() - 180 * 60000)
      }
    ];

    const createdSales = await Sale.insertMany(sampleSales);

    console.log('Seeding audit movement ledger matching screen 4...');
    const auditLogs = [
      {
        product: prodMap['FIN-WIR-1.5-RD']._id,
        productName: prodMap['FIN-WIR-1.5-RD'].name,
        tamilName: prodMap['FIN-WIR-1.5-RD'].tamilName,
        sku: prodMap['FIN-WIR-1.5-RD'].sku,
        rackLocation: prodMap['FIN-WIR-1.5-RD'].rackLocation,
        unit: 'coil',
        changeType: 'sale',
        qtyChange: -12,
        prevStock: 26,
        newStock: 14,
        reasonCode: 'Direct Counter POS Bill',
        referenceId: '#INV-2026-0842',
        operator: 'Naveen [Staff]',
        note: 'Counter sale to Kumar Electrician | Cash Bill • Tax Inv: ₹14,280.00',
        createdAt: new Date(now.getTime() - 25 * 60000)
      },
      {
        product: prodMap['CRM-FAN-BLDC-28W']._id,
        productName: prodMap['CRM-FAN-BLDC-28W'].name,
        tamilName: prodMap['CRM-FAN-BLDC-28W'].tamilName,
        sku: prodMap['CRM-FAN-BLDC-28W'].sku,
        rackLocation: prodMap['CRM-FAN-BLDC-28W'].rackLocation,
        unit: 'unit',
        changeType: 'purchase',
        qtyChange: 25,
        prevStock: 9,
        newStock: 34,
        reasonCode: 'Direct Factory Consignment',
        referenceId: 'PO-9921',
        operator: 'Admin [Super]',
        note: 'Sri Ram Distributors, Trichy | LR #TR-8812 • Verified by Admin',
        createdAt: new Date(now.getTime() - 190 * 60000)
      },
      {
        product: prodMap['SCH-MCB-16A']._id,
        productName: prodMap['SCH-MCB-16A'].name,
        tamilName: prodMap['SCH-MCB-16A'].tamilName,
        sku: prodMap['SCH-MCB-16A'].sku,
        rackLocation: prodMap['SCH-MCB-16A'].rackLocation,
        unit: 'piece',
        changeType: 'sale',
        qtyChange: -4,
        prevStock: 8,
        newStock: 4,
        reasonCode: 'Contractor Account Dispatch',
        referenceId: '#INV-2026-0810',
        operator: 'Senthil [Billing]',
        note: 'Senthil Contractor [Kongu site] | Credit Ledger Posting #412',
        createdAt: new Date(now.getTime() - 18 * 3600000)
      },
      {
        product: prodMap['SUP-VAL-BAL-1IN']._id,
        productName: prodMap['SUP-VAL-BAL-1IN'].name,
        tamilName: prodMap['SUP-VAL-BAL-1IN'].tamilName,
        sku: prodMap['SUP-VAL-BAL-1IN'].sku,
        rackLocation: prodMap['SUP-VAL-BAL-1IN'].rackLocation,
        unit: 'piece',
        changeType: 'damaged',
        qtyChange: -1,
        prevStock: 4,
        newStock: 3,
        reasonCode: 'Scrap / Supplier Warranty Claim',
        referenceId: 'DAM-2026-004',
        financialLoss: 145.00,
        operator: 'Admin [Super]',
        note: 'Reason: Cracked Body / Thread Leak | Returned to Supreme Agent for Credit Note',
        createdAt: new Date(now.getTime() - 22 * 3600000)
      },
      {
        product: prodMap['SCR-SS-1.5X8']._id,
        productName: prodMap['SCR-SS-1.5X8'].name,
        tamilName: prodMap['SCR-SS-1.5X8'].tamilName,
        sku: prodMap['SCR-SS-1.5X8'].sku,
        rackLocation: prodMap['SCR-SS-1.5X8'].rackLocation,
        unit: 'box',
        changeType: 'sale',
        qtyChange: -2,
        prevStock: 37,
        newStock: 35,
        reasonCode: 'Retail Cash Ticket',
        referenceId: '#INV-2026-0795',
        operator: 'Naveen [Staff]',
        note: 'Balaji Residence carpentry work | UPI Paid ₹360.00',
        createdAt: new Date(now.getTime() - 28 * 3600000)
      }
    ];

    await StockLog.insertMany(auditLogs);

    console.log('✅ Seeding complete!');
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Sales: ${createdSales.length}`);
    console.log(`- Audit Logs: ${auditLogs.length}`);

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