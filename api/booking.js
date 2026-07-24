export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { action = 'create', name, phone, service, datetime, new_datetime, language, notes } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ error: 'Missing required fields: name, phone' });
    }

    const bookingId = 'HALO-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();

    // Safely format datetime (handles ISO dates, raw text like "понедельник 15:00", etc.)
    let formattedDate = 'Nieokreślony czas';
    if (datetime) {
      const parsedDate = new Date(datetime);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toLocaleString('pl-PL', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } else {
        formattedDate = String(datetime);
      }
    }

    const results = {
      telegram: false,
      firestore: false
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    // 1. Save to Firestore via REST API (Zero-dependency, 100% reliable on Vercel)
    if (projectId) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/bookings?documentId=${bookingId}`;
        const firestoreDoc = {
          fields: {
            bookingId: { stringValue: bookingId },
            action: { stringValue: action.toUpperCase() },
            status: { stringValue: action === 'cancel' ? 'cancelled' : 'confirmed' },
            name: { stringValue: String(name) },
            phone: { stringValue: String(phone) },
            service: { stringValue: String(service || 'Usługa podstawowa') },
            datetime: { stringValue: String(formattedDate) },
            language: { stringValue: String(language || 'pl') },
            createdAt: { stringValue: createdAt }
          }
        };

        const fsRes = await fetch(firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestoreDoc)
        });

        if (fsRes.ok) {
          results.firestore = true;
        } else {
          console.error('Firestore REST API response:', await fsRes.text());
        }
      } catch (fsErr) {
        console.error('Firestore REST API Error:', fsErr);
      }
    }

    // 2. Send Telegram Notification
    if (botToken && chatId) {
      const actionTitle = action === 'cancel' ? '❌ ОТМЕНА ЗАПИСИ' : action === 'reschedule' ? '🔄 ПЕРЕНОС ЗАПИСИ' : '📅 НОВАЯ ЗАПИСЬ';
      const tgMessage = `${actionTitle} HALO AI! (${bookingId})\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${phone}\n✂️ *Услуга:* ${service || 'Стандартная запись'}\n⏰ *Время:* ${formattedDate}\n🌐 *Язык:* ${language || 'pl'}`;

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

    return res.status(200).json({
      success: true,
      action,
      booking: { id: bookingId, name, phone, service: service || 'Usługa podstawowa', datetime: formattedDate },
      integrations: results
    });

  } catch (err) {
    console.error('Server error in booking endpoint:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
