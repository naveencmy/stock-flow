// Initial seed data for NP Electricals (Nandhipriya Electricals)
export const initialCategories = [
  'Wires & Cables',
  'Lighting & LEDs',
  'Switches & Sockets',
  'Fans & Appliances',
  'MCBs & Distribution',
  'Conduits & Fittings',
  'Accessories'
];

export const initialProducts = [
  {
    _id: 'prod-001',
    name: 'Finolex 1.5 sq mm FR PVC Insulated Copper Wire (Red 90m)',
    category: 'Wires & Cables',
    brand: 'Finolex',
    unit: 'coil',
    unitPrice: 1850,
    stockQty: 24,
    reorderLevel: 5,
    gstRate: 18,
    barcode: '890123456001',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    _id: 'prod-002',
    name: 'Finolex 2.5 sq mm FR PVC Insulated Copper Wire (Blue 90m)',
    category: 'Wires & Cables',
    brand: 'Finolex',
    unit: 'coil',
    unitPrice: 2850,
    stockQty: 18,
    reorderLevel: 5,
    gstRate: 18,
    barcode: '890123456002',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
  },
  {
    _id: 'prod-003',
    name: 'Havells 20W LED Cool Day Light Batten',
    category: 'Lighting & LEDs',
    brand: 'Havells',
    unit: 'piece',
    unitPrice: 240,
    stockQty: 42,
    reorderLevel: 10,
    gstRate: 18,
    barcode: '890123456003',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    _id: 'prod-004',
    name: 'Philips 9W B22 LED Bulb Cool White',
    category: 'Lighting & LEDs',
    brand: 'Philips',
    unit: 'piece',
    unitPrice: 95,
    stockQty: 4,
    reorderLevel: 15,
    gstRate: 18,
    barcode: '890123456004',
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString()
  },
  {
    _id: 'prod-005',
    name: 'Anchor Roma 6A 1-Way Modular Switch (White)',
    category: 'Switches & Sockets',
    brand: 'Anchor by Panasonic',
    unit: 'piece',
    unitPrice: 32,
    stockQty: 120,
    reorderLevel: 20,
    gstRate: 18,
    barcode: '890123456005',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    _id: 'prod-006',
    name: 'Anchor Roma 16A 6-Pin Universal Socket',
    category: 'Switches & Sockets',
    brand: 'Anchor by Panasonic',
    unit: 'piece',
    unitPrice: 110,
    stockQty: 6,
    reorderLevel: 10,
    gstRate: 18,
    barcode: '890123456006',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    _id: 'prod-007',
    name: 'Crompton Hill Briz 1200mm High Speed Ceiling Fan (Brown)',
    category: 'Fans & Appliances',
    brand: 'Crompton',
    unit: 'piece',
    unitPrice: 1650,
    stockQty: 12,
    reorderLevel: 3,
    gstRate: 18,
    barcode: '890123456007',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    _id: 'prod-008',
    name: 'Schneider Electric Easy9 32A Double Pole MCB',
    category: 'MCBs & Distribution',
    brand: 'Schneider',
    unit: 'piece',
    unitPrice: 420,
    stockQty: 8,
    reorderLevel: 4,
    gstRate: 18,
    barcode: '890123456008',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    _id: 'prod-009',
    name: 'Polycab 20mm Medium Duty PVC Conduit Pipe (3m)',
    category: 'Conduits & Fittings',
    brand: 'Polycab',
    unit: 'piece',
    unitPrice: 65,
    stockQty: 2,
    reorderLevel: 25,
    gstRate: 18,
    barcode: '890123456009',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    _id: 'prod-010',
    name: 'Goldmedal Curve Modular Surface Gang Box (8 Module)',
    category: 'Accessories',
    brand: 'Goldmedal',
    unit: 'piece',
    unitPrice: 145,
    stockQty: 25,
    reorderLevel: 5,
    gstRate: 18,
    barcode: '890123456010',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    _id: 'prod-011',
    name: 'GM 3 Pin Multi Plug Adapter with Spike Guard Indicator',
    category: 'Accessories',
    brand: 'GM Modular',
    unit: 'piece',
    unitPrice: 180,
    stockQty: 3,
    reorderLevel: 8,
    gstRate: 18,
    barcode: '890123456011',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    _id: 'prod-012',
    name: 'L&T Tripper 16A Single Pole C-Curve MCB',
    category: 'MCBs & Distribution',
    brand: 'L&T',
    unit: 'piece',
    unitPrice: 160,
    stockQty: 30,
    reorderLevel: 10,
    gstRate: 18,
    barcode: '890123456012',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const initialSales = [
  {
    _id: 'sale-1001',
    billNumber: 'NP-20260824-001',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    customerName: 'Muthusamy K (Electrician)',
    customerPhone: '9842156789',
    paymentMethod: 'Cash',
    items: [
      {
        productId: 'prod-001',
        productName: 'Finolex 1.5 sq mm FR PVC Insulated Copper Wire (Red 90m)',
        quantity: 2,
        unitPrice: 1850,
        gstRate: 18,
        lineTotal: 3700
      },
      {
        productId: 'prod-005',
        productName: 'Anchor Roma 6A 1-Way Modular Switch (White)',
        quantity: 12,
        unitPrice: 32,
        gstRate: 18,
        lineTotal: 384
      }
    ],
    subtotal: 4084,
    cgst: 367.56,
    sgst: 367.56,
    igst: 0,
    totalGst: 735.12,
    discount: 50,
    grandTotal: 4769.12
  },
  {
    _id: 'sale-1002',
    billNumber: 'NP-20260825-002',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    customerName: 'Praveen Kumar',
    customerPhone: '9443211234',
    paymentMethod: 'UPI',
    items: [
      {
        productId: 'prod-007',
        productName: 'Crompton Hill Briz 1200mm High Speed Ceiling Fan (Brown)',
        quantity: 1,
        unitPrice: 1650,
        gstRate: 18,
        lineTotal: 1650
      },
      {
        productId: 'prod-003',
        productName: 'Havells 20W LED Cool Day Light Batten',
        quantity: 2,
        unitPrice: 240,
        gstRate: 18,
        lineTotal: 480
      }
    ],
    subtotal: 2130,
    cgst: 191.70,
    sgst: 191.70,
    igst: 0,
    totalGst: 383.40,
    discount: 0,
    grandTotal: 2513.40
  },
  {
    _id: 'sale-1003',
    billNumber: 'NP-20260826-003',
    createdAt: new Date().toISOString(),
    customerName: 'Walk-in Customer',
    customerPhone: '9894000123',
    paymentMethod: 'Cash',
    items: [
      {
        productId: 'prod-004',
        productName: 'Philips 9W B22 LED Bulb Cool White',
        quantity: 3,
        unitPrice: 95,
        gstRate: 18,
        lineTotal: 285
      },
      {
        productId: 'prod-006',
        productName: 'Anchor Roma 16A 6-Pin Universal Socket',
        quantity: 2,
        unitPrice: 110,
        gstRate: 18,
        lineTotal: 220
      }
    ],
    subtotal: 505,
    cgst: 45.45,
    sgst: 45.45,
    igst: 0,
    totalGst: 90.90,
    discount: 0,
    grandTotal: 595.90
  }
];

export const initialStockLogs = [
  {
    _id: 'log-001',
    productId: 'prod-001',
    productName: 'Finolex 1.5 sq mm FR PVC Insulated Copper Wire (Red 90m)',
    changeType: 'purchase',
    changeQty: 30,
    balanceQty: 30,
    reference: 'PO-8821',
    notes: 'Initial stock intake from Finolex distributor',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    _id: 'log-002',
    productId: 'prod-001',
    productName: 'Finolex 1.5 sq mm FR PVC Insulated Copper Wire (Red 90m)',
    changeType: 'sale',
    changeQty: -2,
    balanceQty: 24,
    reference: 'NP-20260824-001',
    notes: 'Billed to Muthusamy K (Electrician)',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: 'log-003',
    productId: 'prod-004',
    productName: 'Philips 9W B22 LED Bulb Cool White',
    changeType: 'adjustment',
    changeQty: -1,
    balanceQty: 4,
    reference: 'ADJ-004',
    notes: 'Damaged in display shelf',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    _id: 'log-004',
    productId: 'prod-009',
    productName: 'Polycab 20mm Medium Duty PVC Conduit Pipe (3m)',
    changeType: 'sale',
    changeQty: -18,
    balanceQty: 2,
    reference: 'NP-20260820-008',
    notes: 'Building wiring contract sale',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    _id: 'log-005',
    productId: 'prod-007',
    productName: 'Crompton Hill Briz 1200mm High Speed Ceiling Fan (Brown)',
    changeType: 'return',
    changeQty: 1,
    balanceQty: 12,
    reference: 'RET-001',
    notes: 'Customer returned color variation exchange',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const generate30DayRevenue = () => {
  const result = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    
    // Simulate realistic daily revenue with peaks on weekends
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 6500 : 3800;
    const randomVar = Math.floor(Math.sin(i * 0.8) * 1800 + Math.random() * 1200);
    const revenue = Math.max(1200, base + randomVar);
    const billsCount = Math.floor(revenue / 650) + 1;

    result.push({
      date: dayLabel,
      fullDate: d.toISOString().split('T')[0],
      revenue: Math.round(revenue),
      bills: billsCount
    });
  }
  return result;
};
