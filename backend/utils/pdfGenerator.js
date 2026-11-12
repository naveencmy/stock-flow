/**
 * PDF Invoice Generator using PDFKit
 * Generates clean, vector-rendered A4 GST Tax Invoices for Nandhipriya Electricals.
 */
const PDFDocument = require('pdfkit');

/**
 * Format currency amount for invoice.
 * @param {number} val
 * @returns {string}
 */
const formatInr = (val) => {
  const n = Number(val) || 0;
  return 'Rs. ' + n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Generate PDF buffer for a sale document.
 * @param {Object} sale - Populated sale document
 * @returns {Promise<Buffer>}
 */
const generateInvoicePdfBuffer = (sale) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36, // 0.5 inch margins
        info: {
          Title: `Invoice_${sale.billNumber || 'Bill'}`,
          Author: 'Nandhipriya Electricals',
          Subject: 'Tax Invoice',
        },
      });

      const buffers = [];
      doc.on('data', (data) => buffers.push(data));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2; // ~523 pt

      // ── Header Section ────────────────────────────────────────────────
      doc.rect(margin, margin, contentWidth, 75).fill('#0f172a');

      // Shop Name & Details
      doc.fillColor('#fbbf24').fontSize(16).font('Helvetica-Bold')
        .text('NANDHIPRIYA ELECTRICALS', margin + 16, margin + 12);

      doc.fillColor('#e2e8f0').fontSize(8.5).font('Helvetica')
        .text('Dealers in Finolex, Havells, Anchor, Crompton, PVC & Electrical Goods', margin + 16, margin + 32)
        .text('Pongandhurai, Dharapuram, Tiruppur - 638656 | Ph: +91 98421 56789', margin + 16, margin + 45);

      // Tax Invoice Badge
      doc.rect(pageWidth - margin - 120, margin + 12, 104, 22).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
        .text('TAX INVOICE', pageWidth - margin - 120, margin + 17, { width: 104, align: 'center' });

      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
        .text('GSTIN: 33AAAAA0000A1Z5', pageWidth - margin - 140, margin + 42, { width: 124, align: 'right' });

      // ── Customer & Bill Details Box ──────────────────────────────────
      let y = margin + 85;
      doc.rect(margin, y, contentWidth, 54).fill('#f8fafc');
      doc.rect(margin, y, contentWidth, 54).strokeColor('#e2e8f0').stroke();

      // Billed To (Left)
      doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
        .text('BILLED TO:', margin + 12, y + 8);
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold')
        .text(sale.customerName || 'Walk-in Customer', margin + 12, y + 20);
      doc.fillColor('#475569').fontSize(8).font('Helvetica')
        .text(`Phone: ${sale.customerPhone || 'N/A'}`, margin + 12, y + 34);

      // Invoice Details (Right)
      const rightColX = pageWidth - margin - 180;
      const dateStr = new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = new Date(sale.createdAt || Date.now()).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      doc.fillColor('#64748b').fontSize(8).font('Helvetica')
        .text('Invoice No:', rightColX, y + 8)
        .text('Date & Time:', rightColX, y + 21)
        .text('Payment Mode:', rightColX, y + 34);

      doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold')
        .text(sale.billNumber || 'N/A', rightColX + 70, y + 8, { align: 'right', width: 98 })
        .text(`${dateStr}, ${timeStr}`, rightColX + 50, y + 21, { align: 'right', width: 118 })
        .text((sale.paymentMethod || 'CASH').toUpperCase(), rightColX + 70, y + 34, { align: 'right', width: 98 });

      // ── Items Table ──────────────────────────────────────────────────
      y += 64;

      // Table Header
      const colSno = margin;
      const colDesc = margin + 30;
      const colQty = margin + 260;
      const colRate = margin + 320;
      const colGst = margin + 395;
      const colAmt = margin + 440;
      const tableWidth = contentWidth;

      doc.rect(margin, y, tableWidth, 20).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('#', colSno + 5, y + 6, { width: 20, align: 'center' });
      doc.text('ITEM DESCRIPTION', colDesc + 4, y + 6, { width: 220, align: 'left' });
      doc.text('QTY', colQty, y + 6, { width: 50, align: 'center' });
      doc.text('RATE', colRate, y + 6, { width: 70, align: 'right' });
      doc.text('GST', colGst, y + 6, { width: 40, align: 'center' });
      doc.text('AMOUNT', colAmt, y + 6, { width: 75, align: 'right' });

      y += 20;

      const items = sale.items || [];
      items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(margin, y, tableWidth, 22).fill(rowBg);
        doc.rect(margin, y, tableWidth, 22).strokeColor('#f1f5f9').stroke();

        const name = item.productName || item.product?.name || 'Item';
        const qty = item.quantity || 1;
        const unit = item.unit || item.product?.unit || '';
        const qtyText = `${qty} ${unit}`.trim();
        const rate = Number(item.unitPrice || 0);
        const gst = item.gstRate || 18;
        const lineTotal = Number(item.lineTotal || rate * qty);

        doc.fillColor('#64748b').fontSize(8).font('Helvetica')
          .text(String(index + 1), colSno + 5, y + 6, { width: 20, align: 'center' });

        doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold')
          .text(name, colDesc + 4, y + 6, { width: 220, ellipsis: true });

        doc.fillColor('#334155').fontSize(8).font('Helvetica')
          .text(qtyText, colQty, y + 6, { width: 50, align: 'center' })
          .text(formatInr(rate), colRate, y + 6, { width: 70, align: 'right' })
          .text(`${gst}%`, colGst, y + 6, { width: 40, align: 'center' });

        doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold')
          .text(formatInr(lineTotal), colAmt, y + 6, { width: 75, align: 'right' });

        y += 22;
      });

      // ── Totals & Summary Section ─────────────────────────────────────
      y += 6;
      doc.rect(margin, y, tableWidth, 1).fill('#cbd5e1');
      y += 8;

      const subTotal = Number(sale.subTotal ?? sale.subtotal ?? 0);
      const totalGst = Number(sale.totalGst ?? sale.totalTax ?? 0);
      const cgst = totalGst > 0 ? (totalGst / 2) : 0;
      const sgst = totalGst > 0 ? (totalGst / 2) : 0;
      const discount = Number(sale.discountAmt ?? sale.discount ?? 0);
      const grandTotal = Number(sale.grandTotal ?? 0);

      // Left Box: Terms & Conditions & Signatures
      const leftBoxWidth = 260;
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold')
        .text('TERMS & CONDITIONS:', margin, y);
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
        .text('1. Goods once sold will not be taken back without original invoice.', margin, y + 12)
        .text('2. Subject to Dharapuram Jurisdiction only.', margin, y + 22);

      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
        .text('Customer Signature', margin, y + 64);

      // Right Box: Financial Breakdown
      const totalsX = margin + 270;
      const totalsValX = margin + 380;
      const totalsValW = contentWidth - 380;

      let ty = y;
      doc.fillColor('#475569').fontSize(8.5).font('Helvetica')
        .text('Subtotal (Excl. Tax):', totalsX, ty);
      doc.fillColor('#0f172a').font('Helvetica-Bold')
        .text(formatInr(subTotal), totalsValX, ty, { width: totalsValW, align: 'right' });
      ty += 14;

      if (totalGst > 0) {
        doc.fillColor('#475569').fontSize(8).font('Helvetica')
          .text('CGST (50%):', totalsX, ty);
        doc.fillColor('#334155').font('Helvetica')
          .text(formatInr(cgst), totalsValX, ty, { width: totalsValW, align: 'right' });
        ty += 12;

        doc.fillColor('#475569').fontSize(8).font('Helvetica')
          .text('SGST (50%):', totalsX, ty);
        doc.fillColor('#334155').font('Helvetica')
          .text(formatInr(sgst), totalsValX, ty, { width: totalsValW, align: 'right' });
        ty += 12;
      }

      if (discount > 0) {
        doc.fillColor('#16a34a').fontSize(8.5).font('Helvetica-Bold')
          .text('Discount:', totalsX, ty);
        doc.fillColor('#16a34a')
          .text('- ' + formatInr(discount), totalsValX, ty, { width: totalsValW, align: 'right' });
        ty += 14;
      }

      // Net Total Box
      doc.rect(totalsX - 6, ty, contentWidth - 264, 24).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold')
        .text('NET TOTAL:', totalsX, ty + 6);
      doc.fillColor('#fbbf24').fontSize(11).font('Helvetica-Bold')
        .text(formatInr(grandTotal), totalsValX, ty + 6, { width: totalsValW, align: 'right' });

      // Signatory
      ty += 34;
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold')
        .text('For NANDHIPRIYA ELECTRICALS', totalsX, ty, { width: contentWidth - 270, align: 'right' });
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
        .text('Authorized Signatory', totalsX, ty + 24, { width: contentWidth - 270, align: 'right' });

      // ── Footer ───────────────────────────────────────────────────────
      const footerY = doc.page.height - 30;
      doc.rect(margin, footerY - 8, contentWidth, 0.5).fill('#cbd5e1');
      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
        .text('*** Thank you for your business! Visit NP Electricals again. ***', margin, footerY, {
          width: contentWidth,
          align: 'center',
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePdfBuffer,
  formatInr,
};

