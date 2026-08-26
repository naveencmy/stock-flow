const Sale = require('../models/Sale');

const generateBillNumber = async (session = null) => {
  const query = Sale.findOne().sort({ createdAt: -1 });
  if (session) query.session(session);
  const lastSale = await query;
  
  let lastNum = 0;
  if (lastSale && lastSale.billNumber) {
    const parts = lastSale.billNumber.split('-');
    const numPart = parts[parts.length - 1];
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      lastNum = parsed;
    }
  }

  const nextNum = (lastNum + 1).toString().padStart(5, '0');
  return `B-${nextNum}`;
};

module.exports = {
  generateBillNumber,
  getNextBillNumber: generateBillNumber
};
