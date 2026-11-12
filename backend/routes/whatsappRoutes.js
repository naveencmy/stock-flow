const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const whatsappService = require('../services/whatsappService');
const saleService = require('../services/saleService');

// @desc    Get WhatsApp integration status & Open-WA connectivity
// @route   GET /api/whatsapp/status
router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const provider = process.env.WHATSAPP_PROVIDER || 'openwa';
    const openwaStatus = await whatsappService.checkOpenWaStatus();

    res.json({
      success: true,
      data: {
        configuredProvider: provider,
        openwa: openwaStatus,
        metaCloudConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN),
        webhookConfigured: Boolean(process.env.WHATSAPP_WEBHOOK_URL),
        timestamp: new Date().toISOString(),
      },
    });
  })
);

// @desc    Get live WhatsApp QR code for device linking
// @route   GET /api/whatsapp/qr
router.get(
  '/qr',
  asyncHandler(async (req, res) => {
    const qrResult = await whatsappService.getOpenWaQrCode();
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHtml && req.query.format !== 'json') {
      if (!qrResult.success || !qrResult.qrCode) {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta http-equiv="refresh" content="5">
            <title>WhatsApp Link QR - Nandhipriya Electricals</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: white; text-align: center; }
              .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 450px; }
              .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; margin-bottom: 1rem; background: #f59e0b; color: #000; }
              a { color: #38bdf8; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="badge">Status: ${qrResult.status || 'Loading...'}</div>
              <h2>WhatsApp Linking</h2>
              <p>${qrResult.reason || 'Waiting for QR code generation... Refreshing every 5 seconds.'}</p>
              <p><a href="http://localhost:2886" target="_blank">Open OpenWA Dashboard &rarr;</a></p>
            </div>
          </body>
          </html>
        `);
      }

      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="20">
          <title>Scan WhatsApp QR - Nandhipriya Electricals</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: white; text-align: center; padding: 1rem; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1.25rem; box-shadow: 0 20px 35px rgba(0,0,0,0.5); max-width: 480px; width: 100%; border: 1px solid #334155; }
            .logo { font-size: 1.25rem; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
            .subtitle { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem; }
            .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.8rem; background: #10b981; color: white; margin-bottom: 0.5rem; }
            .qr-wrap { background: white; padding: 1rem; border-radius: 1rem; display: inline-block; margin: 0.75rem 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .qr-img { width: 280px; height: 280px; display: block; }
            .steps { text-align: left; background: #0f172a; padding: 1rem 1.25rem; border-radius: 0.75rem; margin-top: 1rem; font-size: 0.85rem; color: #cbd5e1; }
            .steps ol { margin: 0; padding-left: 1.25rem; }
            .steps li { margin-bottom: 0.4rem; }
            .btn { display: inline-block; margin-top: 1.25rem; padding: 0.6rem 1.25rem; background: #2563eb; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; }
            .btn:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">⚡ NANDHIPRIYA ELECTRICALS</div>
            <div class="subtitle">WhatsApp Automated Invoice Link</div>
            <span class="status-badge">● QR Code Ready — Scan Now</span>
            <div class="qr-wrap">
              <img src="${qrResult.qrCode}" class="qr-img" alt="WhatsApp Link QR Code" />
            </div>
            <div class="steps">
              <strong>How to scan:</strong>
              <ol>
                <li>Open <strong>WhatsApp</strong> on your phone</li>
                <li>Tap <strong>Settings / Menu</strong> &rarr; <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Scan this QR code</li>
              </ol>
            </div>
            <a href="http://localhost:2886" class="btn" target="_blank">Open OpenWA Dashboard &rarr;</a>
          </div>
        </body>
        </html>
      `);
    }

    res.json(qrResult);
  })
);

// @desc    Send a test message via Open-WA
// @route   POST /api/whatsapp/test
router.post(
  '/test',
  asyncHandler(async (req, res) => {
    const { phone, message } = req.body;
    if (!phone) {
      res.status(400);
      throw new Error('Recipient phone number is required');
    }

    const testMessage =
      message ||
      `⚡ *NANDHIPRIYA ELECTRICALS*\nThis is a test notification from Open-WA integration.\nTime: ${new Date().toLocaleTimeString('en-IN')}`;

    const result = await whatsappService.sendOpenWaMessage(phone, testMessage);

    res.json({
      success: result.success,
      data: result,
      message: result.success
        ? `Test message sent via Open-WA to ${phone}`
        : `Open-WA dispatch failed: ${result.reason}`,
    });
  })
);

// @desc    Send bill invoice via Open-WA
// @route   POST /api/whatsapp/send-bill/:id
router.post(
  '/send-bill/:id',
  asyncHandler(async (req, res) => {
    const result = await saleService.sendWhatsAppForSale(req.params.id);

    res.json({
      success: result.success,
      data: result,
      message: result.success
        ? `Invoice auto-dispatched via Open-WA to +91 ${result.customerPhone}`
        : `Dispatch status: ${result.reason || 'client-side fallback required'}`,
    });
  })
);

module.exports = router;

