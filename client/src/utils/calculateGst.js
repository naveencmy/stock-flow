export const calculateGst = (lineTotal, gstRate = 18) => {
  const total = Number(lineTotal) || 0;
  const rate = Number(gstRate) || 0;
  const totalGst = (total * rate) / 100;
  
  return {
    cgst: rate === 18 ? totalGst / 2 : 0,
    sgst: rate === 18 ? totalGst / 2 : 0,
    igst: rate !== 18 ? totalGst : 0,
    cgstRate: rate === 18 ? 9 : 0,
    sgstRate: rate === 18 ? 9 : 0,
    igstRate: rate !== 18 ? rate : 0,
    totalGst,
    grandTotal: total + totalGst
  };
};

export default calculateGst;
