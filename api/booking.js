export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { name, phone, service, datetime, language, notes } = req.body || {};

    // Validation
    if (!name || !phone || !datetime) {
      return res.status(400).json({
        error: 'Missing required booking fields: name, phone, datetime'
      });
    }

    const bookingId = 'HALO-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();
    const formattedDate = new Date(datetime).toLocaleString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const results = {
      telegram: false,
      google_sheets: false,
      google_calendar: false
    };

    // 1. Send Telegram Notification (if bot token configured)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const tgMessage = `📅 *НОВАЯ ЗАПИСЬ HALO AI!* (${bookingId})\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${phone}\n✂️ *Услуга:* ${service || 'Стандартная запись'}\n⏰ *Дата и время:* ${formattedDate}\n🌐 *Язык:* ${language || 'pl'}\n📝 *Заметки:* ${notes || 'Нет'}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgMessage,
            parse_mode: 'Markdown'
          })
        });
        if (tgRes.ok) results.telegram = true;
      } catch (err) {
        console.error('Telegram notification error:', err);
      }
    }

    // 2. Google Sheets Integration (via Webhook / Google Apps Script URL if configured)
    const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetsWebhookUrl) {
      try {
        const sheetRes = await fetch(sheetsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            name,
            phone,
            service,
            datetime: formattedDate,
            language,
            createdAt
          })
        });
        if (sheetRes.ok) results.google_sheets = true;
      } catch (err) {
        console.error('Google Sheets webhook error:', err);
      }
    }

    // 3. Google Calendar API / Webhook Integration
    const calendarWebhookUrl = process.env.GOOGLE_CALENDAR_WEBHOOK_URL;
    if (calendarWebhookUrl) {
      try {
        const calRes = await fetch(calendarWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: `${name} - ${service || 'Wizyta HaloAI'}`,
            description: `Rezerwacja HaloAI.\nTelefon: ${phone}\nUwagi: ${notes || 'Brak'}`,
            start: { dateTime: new Date(datetime).toISOString() },
            end: { dateTime: new Date(new Date(datetime).getTime() + 45 * 60000).toISOString() }
          })
        });
        if (calRes.ok) results.google_calendar = true;
      } catch (err) {
        console.error('Google Calendar webhook error:', err);
      }
    }

    // Return success JSON payload
    return res.status(200).json({
      success: true,
      message: 'Booking successfully created',
      booking: {
        id: bookingId,
        name,
        phone,
        service: service || 'Usługa podstawowa',
        datetime: formattedDate,
        raw_datetime: datetime,
        language: language || 'pl',
        notes: notes || ''
      },
      integrations: results
    });

  } catch (error) {
    console.error('Server error processing booking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
