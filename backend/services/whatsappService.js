/**
 * ============================================================================
 * WHATSAPP AUTOMATION SERVICE — OPENWA (rmyndharis/OpenWA) & MULTI-PROVIDER
 * ============================================================================
 * Fully integrates with rmyndharis/OpenWA:
 *   - Dashboard: http://localhost:2886
 *   - REST API:  http://localhost:2785 or via dashboard proxy at http://localhost:2886/api
 *   - Auto-discovers active connected WhatsApp sessions
 *   - Sends formatted retail invoices automatically on bill checkout
 * ============================================================================
 */

/**
 * Format clean Nandhipriya Electricals retail invoice text.
 * @param {Object} sale - Populated sale document
 * @returns {string} Formatted WhatsApp message string
 */
const formatBillMessage = (sale) => {
  if (!sale) return '';

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
    year: 'numeric',
  });
  const timeStr = new Date(sale.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
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
 * Format short, elegant WhatsApp message accompanying the PDF invoice attachment.
 * @param {Object} sale - Populated sale document
 * @returns {string} Short message string
 */
const formatShortBillMessage = (sale) => {
  if (!sale) return '';
  const customer = sale.customerName && sale.customerName.trim() ? sale.customerName.trim() : 'Valued Customer';
  const billNum = sale.billNumber || 'N/A';
  const grandTotal = Number(sale.grandTotal ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const items = sale.items || [];
  const itemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return `⚡ *NANDHIPRIYA ELECTRICALS*
*Tax Invoice / Cash Receipt*
━━━━━━━━━━━━━━━━━━━━
Dear *${customer}*,
Thank you for your purchase (${itemsCount} items)!
📄 *Bill No:* ${billNum}
💵 *Amount Paid:* ₹${grandTotal} (${(sale.paymentMethod || 'cash').toUpperCase()})
📎 Detailed Tax Invoice PDF attached below.
━━━━━━━━━━━━━━━━━━━━
📍 Pongandhurai, Dharapuram
📞 Support: +91 98421 56789`;
};

/**
 * Format phone to standard digits with Indian country code (91).
 * @param {string} phone 
 * @returns {string} e.g. "919876543210"
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
};

/**
 * Get candidate URLs for rmyndharis/OpenWA.
 * Prioritizes the user-specified OPENWA_API_URL, then localhost:2886 (Dashboard/Vite Proxy),
 * then localhost:2785 (OpenWA NestJS Core API).
 */
const getCandidateOpenWaUrls = () => {
  const configured = (process.env.OPENWA_API_URL || 'http://localhost:2886').replace(/\/+$/, '');
  const set = new Set([
    configured,
    'http://localhost:2886',
    'http://localhost:2785',
    'http://127.0.0.1:2886',
    'http://127.0.0.1:2785',
  ]);
  return Array.from(set);
};

/**
 * Build request headers including optional X-API-Key.
 */
const buildHeaders = () => {
  const apiKey = process.env.OPENWA_API_KEY || '';
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
};

/**
 * Discover the active/working OpenWA backend URL and sessions.
 * Queries /api/sessions across candidates to identify the live gateway.
 */
const discoverOpenWaInstance = async () => {
  const candidates = getCandidateOpenWaUrls();
  const headers = buildHeaders();

  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/api/sessions`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const payload = await res.json().catch(() => null);
        const sessions = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        // Look for connected/ready session
        const connectedSession = sessions.find((s) => {
          const status = String(s.status || s.state || '').toUpperCase();
          return ['CONNECTED', 'READY', 'WORKING', 'AUTHENTICATED', 'ONLINE'].includes(status);
        });

        return {
          online: true,
          apiUrl: url,
          dashboardUrl: 'http://localhost:2886',
          sessions,
          activeSessionId: connectedSession?.id || sessions[0]?.id || process.env.OPENWA_SESSION_ID || 'default',
          activeSession: connectedSession || sessions[0] || null,
        };
      }
    } catch {
      // Continue to next candidate
    }
  }

  return {
    online: false,
    apiUrl: candidates[0],
    dashboardUrl: 'http://localhost:2886',
    sessions: [],
    activeSessionId: process.env.OPENWA_SESSION_ID || null,
    activeSession: null,
  };
};

/**
 * Send WhatsApp text via rmyndharis/OpenWA.
 *
 * Endpoint: POST /api/sessions/{sessionId}/messages/send-text
 * Body: { "chatId": "919876543210@c.us", "text": "..." }
 *
 * @param {string} recipientPhone - 10-digit mobile
 * @param {string} messageText - Formatted invoice
 * @returns {Promise<Object>}
 */
const sendOpenWaMessage = async (recipientPhone, messageText) => {
  const discovery = await discoverOpenWaInstance();
  const cleanPhone = formatPhoneNumber(recipientPhone);
  const chatId = `${cleanPhone}@c.us`;

  if (!discovery.online) {
    return {
      success: false,
      provider: 'openwa',
      reason: `OpenWA server is not responding at ${discovery.apiUrl}. Please start OpenWA (Dashboard: ${discovery.dashboardUrl}).`,
    };
  }

  const sessionId = process.env.OPENWA_SESSION_ID || discovery.activeSessionId;
  if (!sessionId) {
    return {
      success: false,
      provider: 'openwa',
      reason: `No active WhatsApp session found. Open the dashboard at ${discovery.dashboardUrl} and scan the QR code to create a session.`,
    };
  }

  const headers = buildHeaders();

  // Attempt 1: Standard rmyndharis/OpenWA REST API endpoint
  try {
    const sendUrl = `${discovery.apiUrl}/api/sessions/${sessionId}/messages/send-text`;
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chatId,
        text: messageText,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        provider: 'openwa',
        sessionId,
        recipient: cleanPhone,
        data,
      };
    }

    // If 404, try legacy /sendText or plain /messages
    if (response.status === 404) {
      const altUrl = `${discovery.apiUrl}/api/sessions/${sessionId}/messages`;
      const altRes = await fetch(altUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ chatId, text: messageText }),
        signal: AbortSignal.timeout(10000),
      });

      if (altRes.ok) {
        const altData = await altRes.json().catch(() => ({}));
        return {
          success: true,
          provider: 'openwa',
          sessionId,
          recipient: cleanPhone,
          data: altData,
        };
      }
    }

    const errBody = await response.text().catch(() => '');
    return {
      success: false,
      provider: 'openwa',
      reason: `OpenWA returned HTTP ${response.status}: ${errBody || 'Failed to send message'}`,
    };
  } catch (err) {
    return {
      success: false,
      provider: 'openwa',
      reason: `OpenWA dispatch error: ${err.message}`,
    };
  }
};

/**
 * Send WhatsApp PDF invoice document via rmyndharis/OpenWA.
 *
 * Endpoint: POST /api/sessions/{sessionId}/messages/send-document
 * Body: { "chatId": "...", "base64": "...", "mimetype": "application/pdf", "filename": "...", "caption": "..." }
 *
 * @param {string} recipientPhone - 10-digit mobile
 * @param {string} base64Pdf - Base64 encoded PDF string
 * @param {string} filename - e.g. "Invoice_B-00002.pdf"
 * @param {string} caption - Short accompanying message
 * @returns {Promise<Object>}
 */
const sendOpenWaDocument = async (recipientPhone, base64Pdf, filename, caption) => {
  const discovery = await discoverOpenWaInstance();
  const cleanPhone = formatPhoneNumber(recipientPhone);
  const chatId = `${cleanPhone}@c.us`;

  if (!discovery.online) {
    return {
      success: false,
      provider: 'openwa',
      reason: `OpenWA server is not responding at ${discovery.apiUrl}.`,
    };
  }

  const sessionId = process.env.OPENWA_SESSION_ID || discovery.activeSessionId;
  if (!sessionId) {
    return {
      success: false,
      provider: 'openwa',
      reason: `No active WhatsApp session found.`,
    };
  }

  const headers = buildHeaders();

  try {
    const sendUrl = `${discovery.apiUrl}/api/sessions/${sessionId}/messages/send-document`;
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chatId,
        base64: base64Pdf,
        mimetype: 'application/pdf',
        filename: filename || 'Invoice.pdf',
        caption: caption || '',
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        provider: 'openwa',
        sessionId,
        recipient: cleanPhone,
        hasDocument: true,
        filename,
        data,
      };
    }

    const errBody = await response.text().catch(() => '');
    return {
      success: false,
      provider: 'openwa',
      reason: `OpenWA returned HTTP ${response.status}: ${errBody || 'Failed to send document'}`,
    };
  } catch (err) {
    return {
      success: false,
      provider: 'openwa',
      reason: `OpenWA document dispatch error: ${err.message}`,
    };
  }
};

/**
 * Check OpenWA health and status.
 */
const checkOpenWaStatus = async () => {
  const discovery = await discoverOpenWaInstance();
  const sessionStatus = discovery.activeSession?.status || (discovery.online ? 'NO_SESSION' : 'OFFLINE');
  let guidance = 'OpenWA offline. Access dashboard at ' + discovery.dashboardUrl;

  if (discovery.online) {
    if (['WORKING', 'READY', 'CONNECTED', 'AUTHENTICATED'].includes(String(sessionStatus).toUpperCase())) {
      guidance = 'OpenWA is connected and actively sending bills!';
    } else if (String(sessionStatus).toUpperCase() === 'QR_READY') {
      guidance = 'WhatsApp QR ready! Scan at http://localhost:5000/api/whatsapp/qr or http://localhost:2886';
    } else {
      guidance = `OpenWA session status: ${sessionStatus}. Open dashboard at ${discovery.dashboardUrl} to start.`;
    }
  }

  return {
    online: discovery.online,
    provider: 'openwa (rmyndharis/OpenWA)',
    dashboardUrl: discovery.dashboardUrl,
    apiUrl: discovery.apiUrl,
    activeSessionId: discovery.activeSessionId,
    activeSessionStatus: sessionStatus,
    sessions: discovery.sessions,
    guidance,
  };
};

/**
 * Fetch live QR code for the active session from OpenWA.
 */
const getOpenWaQrCode = async () => {
  const discovery = await discoverOpenWaInstance();
  if (!discovery.online) {
    return { success: false, reason: 'OpenWA server is offline' };
  }

  const sessionId = process.env.OPENWA_SESSION_ID || discovery.activeSessionId;
  if (!sessionId) {
    return { success: false, reason: 'No active WhatsApp session configured' };
  }

  const headers = buildHeaders();
  try {
    let res = await fetch(`${discovery.apiUrl}/api/sessions/${sessionId}/qr`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(6000),
    });

    let data = res.ok ? await res.json().catch(() => ({})) : {};

    // If QR is missing or expired, attempt to auto-start session to regenerate QR
    if (!data.qrCode) {
      await fetch(`${discovery.apiUrl}/api/sessions/${sessionId}/start`, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);

      // Wait 2s for engine to produce QR
      await new Promise((resolve) => setTimeout(resolve, 2000));

      res = await fetch(`${discovery.apiUrl}/api/sessions/${sessionId}/qr`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(6000),
      });
      data = res.ok ? await res.json().catch(() => ({})) : {};
    }

    return {
      success: Boolean(data.qrCode),
      sessionId,
      status: data.status,
      qrCode: data.qrCode,
      dashboardUrl: discovery.dashboardUrl,
    };
  } catch (err) {
    return {
      success: false,
      sessionId,
      reason: `Failed to fetch QR code: ${err.message}`,
    };
  }
};

/**
 * Meta WhatsApp Cloud API (Fallback option)
 */
const sendMetaCloudMessage = async (recipientPhone, messageText) => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return { success: false, reason: 'missing_meta_cloud_credentials' };
  }

  const cleanDigits = formatPhoneNumber(recipientPhone);
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanDigits,
        type: 'text',
        text: { preview_url: false, body: messageText },
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, provider: 'meta_cloud', reason: data.error?.message || 'meta_error' };
    }

    return { success: true, provider: 'meta_cloud', messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, provider: 'meta_cloud', reason: err.message };
  }
};

const { generateInvoicePdfBuffer } = require('../utils/pdfGenerator');

/**
 * Dispatch automated bill notification based on active configuration.
 * Sends a short message AND the Tax Invoice PDF file attachment via Open-WA.
 * Non-blocking: will never crash the calling function.
 *
 * @param {Object} sale - Populated sale document
 * @returns {Promise<Object>}
 */
const sendBillNotification = async (sale) => {
  if (!sale || !sale.customerPhone) {
    return { success: false, reason: 'no_customer_phone' };
  }

  const provider = (process.env.WHATSAPP_PROVIDER || 'openwa').toLowerCase();
  const shortMessage = formatShortBillMessage(sale);
  const detailedTextMessage = formatBillMessage(sale);

  // 1. Open-WA Provider (Primary default)
  if (provider === 'openwa') {
    // Generate PDF invoice buffer
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePdfBuffer(sale);
    } catch (pdfErr) {
      console.warn(`[WhatsApp Service] PDF invoice generation failed: ${pdfErr.message}`);
    }

    // Try sending PDF document with the short message caption
    if (pdfBuffer) {
      const filename = `Invoice_${sale.billNumber || 'Bill'}.pdf`;
      const docResult = await sendOpenWaDocument(
        sale.customerPhone,
        pdfBuffer.toString('base64'),
        filename,
        shortMessage
      );

      if (docResult.success) {
        return docResult;
      }
      console.warn(`[WhatsApp Service] Open-WA doc dispatch failed: ${docResult.reason}, falling back to text`);
    }

    // Fallback: send text message if PDF document send failed
    const openwaResult = await sendOpenWaMessage(sale.customerPhone, detailedTextMessage);
    if (openwaResult.success) {
      return openwaResult;
    }
    console.warn(`[WhatsApp Service] Open-WA auto-dispatch: ${openwaResult.reason}`);
    return openwaResult;
  }

  // 2. Meta Cloud API
  if (process.env.WHATSAPP_ENABLED === 'true' && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return await sendMetaCloudMessage(sale.customerPhone, detailedTextMessage);
  }

  // 3. Webhook Automation
  if (process.env.WHATSAPP_ENABLED === 'true' && process.env.WHATSAPP_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: formatPhoneNumber(sale.customerPhone),
          phone: sale.customerPhone,
          billNumber: sale.billNumber,
          customerName: sale.customerName,
          grandTotal: sale.grandTotal,
          date: sale.createdAt,
          message: detailedTextMessage,
          shortMessage,
          sale,
        }),
        signal: AbortSignal.timeout(10000),
      });

      return { success: res.ok, provider: 'webhook' };
    } catch (err) {
      return { success: false, provider: 'webhook', reason: err.message };
    }
  }

  return {
    success: false,
    reason: 'server_provider_not_configured',
    message: 'Backend Open-WA or Cloud API not configured. Client-side auto-dispatch will handle messaging.',
  };
};

module.exports = {
  formatBillMessage,
  formatShortBillMessage,
  formatPhoneNumber,
  discoverOpenWaInstance,
  sendOpenWaMessage,
  sendOpenWaDocument,
  checkOpenWaStatus,
  getOpenWaQrCode,
  sendBillNotification,
};
