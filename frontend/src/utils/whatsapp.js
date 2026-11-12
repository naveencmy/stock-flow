import toast from 'react-hot-toast';

/**
 * ============================================================================
 * WHATSAPP BILL AUTOMATION UTILITY
 * ============================================================================
 * Formats a clean, professional retail invoice message and dispatches it via
 * the official WhatsApp Web / App API with the customer's phone number pre-filled.
 * 
 * 100% Free, Official, Zero setup, Zero ban risk.
 * ============================================================================
 */

/**
 * Format the standard Nandhipriya Electricals retail invoice message text.
 * @param {Object} sale - The sale document
 * @returns {string} Formatted WhatsApp message
 */
export const formatWhatsAppBillMessage = (sale) => {
  if (!sale) return '';

  // Format line items list
  const itemsText = (sale.items || [])
    .map((item, index) => {
      const name = item.productName || item.product?.name || 'Item';
      const qty = item.quantity || 1;
      const unit = item.unit || item.product?.unit || 'pcs';
      const lineTotal = Number(item.lineTotal || (item.unitPrice * qty) || 0).toFixed(2);
      return `${index + 1}. *${name}* (${qty} ${unit}) - ₹${lineTotal}`;
    })
    .join('\n');

  const subTotal = Number(sale.subTotal ?? sale.subtotal ?? 0).toFixed(2);
  const totalGst = Number(sale.totalGst ?? sale.totalTax ?? 0).toFixed(2);
  const discount = Number(sale.discountAmt ?? sale.discount ?? 0);
  const grandTotal = Number(sale.grandTotal ?? 0).toFixed(2);
  const dateStr = new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = new Date(sale.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `⚡ *NANDHIPRIYA ELECTRICALS*
*Tax Invoice / Cash Receipt*
━━━━━━━━━━━━━━━━━━━━
📄 *Bill No:* ${sale.billNumber || 'N/A'}
📅 *Date:* ${dateStr} ${timeStr}
👤 *Customer:* ${sale.customerName || 'Valued Customer'}
━━━━━━━━━━━━━━━━━━━━
*PURCHASED ITEMS:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* ₹${subTotal}
📊 *GST:* ₹${totalGst}
${discount > 0 ? `🏷️ *Discount:* ₹${discount.toFixed(2)}\n` : ''}💵 *GRAND TOTAL: ₹${grandTotal}*
💳 *Payment Mode:* ${(sale.paymentMethod || 'cash').toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
_Thank you for your purchase!_
📍 Pongandhurai, Dharapuram
📞 Support: +91 94432 11234`;
};

/**
 * Automatically open WhatsApp Web / App to send bill to the customer.
 * @param {Object} sale - The sale document
 * @param {boolean} notifyIfNotProvided - Show toast warning if customer has no phone
 * @returns {boolean} true if WhatsApp window opened, false otherwise
 */
export const sendWhatsAppBill = (sale, notifyIfNotProvided = true) => {
  if (!sale) return false;

  const rawPhone = sale.customerPhone ? String(sale.customerPhone).replace(/\D/g, '') : '';
  if (!rawPhone) {
    if (notifyIfNotProvided) {
      toast.error('No customer phone number provided for this invoice');
    }
    return false;
  }

  // Ensure Indian mobile numbers (10 digits) include the 91 country code
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const message = formatWhatsAppBillMessage(sale);
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Browser popup blocker intercepted the new tab
      toast('Popup blocked by browser. Click "WhatsApp" in the invoice modal to open!', {
        icon: '📱',
        duration: 6000,
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to open WhatsApp window', err);
    return false;
  }
};

export default sendWhatsAppBill;
