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

    const results = {
      telegram: false,
      firestore: false
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    // 1. Try Firestore Database write if credentials are present
    if (projectId && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const adminModule = await import('firebase-admin');
        const admin = adminModule.default || adminModule;
        
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey
            })
          });
        }
        const db = admin.firestore();
        await db.collection('bookings').doc(bookingId).set({
          bookingId,
          action: action.toUpperCase(),
          status: action === 'cancel' ? 'cancelled' : 'confirmed',
          name,
          phone,
          service: service || 'Usługa podstawowa',
          datetime: datetime || createdAt,
          new_datetime: new_datetime || null,
          language: language || 'pl',
          notes: notes || '',
          createdAt
        }, { merge: true });
        results.firestore = true;
      } catch (dbErr) {
        console.error('Firestore Admin Error:', dbErr);
      }
    }

    // 2. Telegram Notification
    if (botToken && chatId) {
      const formattedDate = datetime ? new Date(datetime).toLocaleString('pl-PL') : 'Nieokreślony czas';
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
      booking: { id: bookingId, action, name, phone, service, datetime },
      integrations: results
    });

  } catch (err) {
    console.error('Server error in booking endpoint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
