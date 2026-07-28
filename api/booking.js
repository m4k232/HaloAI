import crypto from 'crypto';

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Generate Google Access Token using Service Account JWT
async function getGoogleAccessToken() {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) return null;

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const signInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    const signature = base64url(signer.sign(privateKey));
    const jwt = `${signInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('Google Access Token Error:', err);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    
    // Extract Vapi payload arguments
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

    // 1. SMART CALLER ID EXTRACTION
    const callerId = body.call?.customer?.number || 
                     body.message?.call?.customer?.number || 
                     body.customerNumber || 
                     '';

    if (!phone || String(phone).includes('customer.number') || String(phone).includes('call.customer')) {
      if (callerId) {
        phone = callerId;
      } else {
        phone = '+48 600 000 000';
      }
    }

    let formattedPhone = String(phone).trim();
    const digitsOnly = formattedPhone.replace(/\D/g, '');
    if (digitsOnly.length >= 7) {
      formattedPhone = (formattedPhone.startsWith('+') ? '+' : '') + digitsOnly;
    }

    // 2. SMART DATETIME FORMATTING
    let formattedDate = 'Nieokreślony czas';
    let isoStartDate = null;
    if (datetime) {
      const parsedDate = new Date(datetime);
      if (!isNaN(parsedDate.getTime())) {
        isoStartDate = parsedDate;
        formattedDate = parsedDate.toLocaleString('pl-PL', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } else {
        const strDate = String(datetime).trim();
        formattedDate = strDate.charAt(0).toUpperCase() + strDate.slice(1);
      }
    }

    const bookingId = 'HALO-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();

    const results = {
      telegram: false,
      firestore: false,
      googleCalendar: false,
      googleSheet: false
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const projectId = process.env.FIREBASE_PROJECT_ID || 'haloai-7b69d';
    const googleSheetWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    // 3. MULTI-TENANT CLIENT LOOKUP (Fetch client metadata from Firestore 'clients' collection)
    let clientMeta = {
      businessName: 'BarberShop Gentleman',
      googleCalendarId: process.env.GOOGLE_CALENDAR_ID || '',
      googleSheetId: process.env.GOOGLE_SHEET_ID || '',
      telegramChatId: chatId
    };

    try {
      const clientsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clients`;
      const cRes = await fetch(clientsUrl);
      if (cRes.ok) {
        const cData = await cRes.json();
        const docs = cData.documents || [];
        const found = docs.find(doc => {
          const f = doc.fields || {};
          return f.assignedPhone?.stringValue === body.call?.phoneNumber || f.assignedPhone?.stringValue === '+19382539583';
        });

        if (found) {
          const f = found.fields;
          clientMeta.businessName = f.businessName?.stringValue || clientMeta.businessName;
          clientMeta.googleCalendarId = f.googleCalendarId?.stringValue || clientMeta.googleCalendarId;
          clientMeta.googleSheetId = f.googleSheetId?.stringValue || clientMeta.googleSheetId;
          clientMeta.telegramChatId = f.telegramChatId?.stringValue || clientMeta.telegramChatId;
        }
      }
    } catch (cErr) {
      console.error('Client lookup error:', cErr);
    }

    // 4. Save to Firestore 'bookings' collection
    if (projectId) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/bookings?documentId=${bookingId}`;
        const firestoreDoc = {
          fields: {
            bookingId: { stringValue: bookingId },
            action: { stringValue: action.toUpperCase() },
            status: { stringValue: action === 'cancel' ? 'cancelled' : 'confirmed' },
            businessName: { stringValue: clientMeta.businessName },
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

    // 5. Google Calendar Integration via Google API
    if (clientMeta.googleCalendarId) {
      try {
        const accessToken = await getGoogleAccessToken();
        if (accessToken) {
          const startIso = isoStartDate ? isoStartDate.toISOString() : new Date(Date.now() + 86400000).toISOString();
          const endIso = isoStartDate ? new Date(isoStartDate.getTime() + 45 * 60000).toISOString() : new Date(Date.now() + 86400000 + 45 * 60000).toISOString();

          const calEvent = {
            summary: `✂️ ${service} — ${name}`,
            description: `HaloAI Booking (${bookingId})\nKlient: ${name}\nTelefon: ${formattedPhone}\nUsługa: ${service}\nFirma: ${clientMeta.businessName}`,
            start: { dateTime: startIso },
            end: { dateTime: endIso }
          };

          const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(clientMeta.googleCalendarId)}/events`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(calEvent)
          });

          if (calRes.ok) results.googleCalendar = true;
          else console.error('Google Calendar API Error:', await calRes.text());
        }
      } catch (calErr) {
        console.error('Calendar integration error:', calErr);
      }
    }

    // 6. Google Sheets Integration via Webhook
    if (googleSheetWebhook) {
      try {
        const sheetRes = await fetch(googleSheetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            action: action.toUpperCase(),
            businessName: clientMeta.businessName,
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

    // 7. Send Telegram Notification
    const targetChatId = clientMeta.telegramChatId || chatId;
    if (botToken && targetChatId) {
      const actionTitle = action === 'cancel' ? '❌ ОТМЕНА ЗАПИСИ' : action === 'reschedule' ? '🔄 ПЕРЕНОС ЗАПИСИ' : '📅 НОВАЯ ЗАПИСЬ';
      const tgMessage = `${actionTitle} HALO AI! (${bookingId})\n🏢 *Фарма:* ${clientMeta.businessName}\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${formattedPhone}\n✂️ *Услуга:* ${service}\n⏰ *Время:* ${formattedDate}\n🌐 *Язык:* ${language}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: targetChatId, text: tgMessage, parse_mode: 'Markdown' })
        });
        if (tgRes.ok) results.telegram = true;
      } catch (e) {
        console.error('Telegram API error:', e);
      }
    }

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
