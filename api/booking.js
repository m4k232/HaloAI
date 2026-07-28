export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    
    // Extract Vapi payload arguments (handles direct JSON body or Vapi toolCall structure)
    let toolArgs = body;
    if (body.message?.toolCalls?.[0]?.function?.arguments) {
      try {
        toolArgs = typeof body.message.toolCalls[0].function.arguments === 'string'
          ? JSON.parse(body.message.toolCalls[0].function.arguments)
          : body.message.toolCalls[0].function.arguments;
      } catch (e) {}
    }

    const action = toolArgs.action || body.action || 'create';
    const name = toolArgs.name || body.name || 'Klient AI';
    let phone = toolArgs.phone || body.phone || '';
    const service = toolArgs.service || body.service || 'Usługa podstawowa';
    const datetime = toolArgs.datetime || body.datetime || '';
    const language = toolArgs.language || body.language || 'pl';

    // 1. SMART PHONE NUMBER FALLBACK
    // If phone contains string variable 'customer.number' or is empty, extract real incoming caller ID
    const callerId = body.call?.customer?.number || 
                     body.message?.call?.customer?.number || 
                     body.customerNumber || 
                     '';

    if (!phone || String(phone).includes('customer.number') || String(phone).includes('call.customer')) {
      if (callerId) {
        phone = callerId;
      } else {
        phone = '+48 600 000 000'; // Default fallback
      }
    }

    // Clean phone format
    let formattedPhone = String(phone).trim();
    const digitsOnly = formattedPhone.replace(/\D/g, '');
    if (digitsOnly.length >= 7) {
      formattedPhone = (formattedPhone.startsWith('+') ? '+' : '') + digitsOnly;
    }

    // 2. SMART DATETIME FORMATTING
    let formattedDate = 'Nieokreślony czas';
    if (datetime) {
      const parsedDate = new Date(datetime);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toLocaleString('pl-PL', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } else {
        // Keep clean text (capitalizing first letter)
        const strDate = String(datetime).trim();
        formattedDate = strDate.charAt(0).toUpperCase() + strDate.slice(1);
      }
    }

    const bookingId = 'HALO-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();

    const results = {
      telegram: false,
      firestore: false,
      googleSheet: false
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const googleSheetWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    // 1. Save to Firestore via REST API (Zero-dependency)
    if (projectId) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/bookings?documentId=${bookingId}`;
        const firestoreDoc = {
          fields: {
            bookingId: { stringValue: bookingId },
            action: { stringValue: action.toUpperCase() },
            status: { stringValue: action === 'cancel' ? 'cancelled' : 'confirmed' },
            name: { stringValue: String(name) },
            phone: { stringValue: formattedPhone },
            service: { stringValue: String(service) },
            datetime: { stringValue: String(formattedDate) },
            language: { stringValue: String(language) },
            createdAt: { stringValue: createdAt }
          }
        };

        const fsRes = await fetch(firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestoreDoc)
        });

        if (fsRes.ok) results.firestore = true;
      } catch (fsErr) {
        console.error('Firestore REST API Error:', fsErr);
      }
    }

    // 2. Optional Sync to Google Sheets (if Webhook URL configured)
    if (googleSheetWebhook) {
      try {
        const sheetRes = await fetch(googleSheetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            action: action.toUpperCase(),
            name,
            phone: formattedPhone,
            service,
            datetime: formattedDate,
            createdAt
          })
        });
        if (sheetRes.ok) results.googleSheet = true;
      } catch (sheetErr) {
        console.error('Google Sheet Webhook Error:', sheetErr);
      }
    }

    // 3. Send Instant Telegram Notification
    if (botToken && chatId) {
      const actionTitle = action === 'cancel' ? '❌ ОТМЕНА ЗАПИСИ' : action === 'reschedule' ? '🔄 ПЕРЕНОС ЗАПИСИ' : '📅 НОВАЯ ЗАПИСЬ';
      const tgMessage = `${actionTitle} HALO AI! (${bookingId})\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${formattedPhone}\n✂️ *Услуга:* ${service}\n⏰ *Время:* ${formattedDate}\n🌐 *Язык:* ${language}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: tgMessage, parse_mode: 'Markdown' })
        });
        if (tgRes.ok) results.telegram = true;
      } catch (e) {
        console.error('Telegram API error:', e);
      }
    }

    // Response back to Vapi or Client
    return res.status(200).json({
      success: true,
      action,
      booking: { id: bookingId, name, phone: formattedPhone, service, datetime: formattedDate },
      integrations: results
    });

  } catch (err) {
    console.error('Server error in booking endpoint:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
