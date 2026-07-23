export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { action = 'create', name, phone, service, datetime, new_datetime, language, notes } = req.body || {};

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields: name, phone'
      });
    }

    const bookingId = 'HALO-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();

    const results = {
      telegram: false,
      google_sheets: false,
      google_calendar: false
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const calendarWebhookUrl = process.env.GOOGLE_CALENDAR_WEBHOOK_URL;

    // --- 1. ACTION: CANCEL BOOKING ---
    if (action === 'cancel') {
      const cancelDate = datetime ? new Date(datetime).toLocaleString('pl-PL') : 'Указанный день';
      const tgMessage = `❌ *ОТМЕНА ЗАПИСИ HALO AI!*\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${phone}\n⏰ *Отмененное время:* ${cancelDate}\n📝 *Причина:* Отмена по просьбе клиента во время звонка.`;

      if (botToken && chatId) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: tgMessage, parse_mode: 'Markdown' })
          });
          if (tgRes.ok) results.telegram = true;
        } catch (e) { console.error('Telegram cancel error:', e); }
      }

      if (sheetsWebhookUrl) {
        try {
          await fetch(sheetsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'CANCEL', name, phone, datetime: cancelDate, updatedAt: createdAt })
          });
          results.google_sheets = true;
        } catch (e) { console.error('Sheets cancel error:', e); }
      }

      return res.status(200).json({
        success: true,
        action: 'cancelled',
        message: `Wizyta dla ${name} została pomyślnie odwołana.`,
        integrations: results
      });
    }

    // --- 2. ACTION: RESCHEDULE BOOKING ---
    if (action === 'reschedule') {
      const oldDate = datetime ? new Date(datetime).toLocaleString('pl-PL') : 'Предыдущее время';
      const newDate = new_datetime ? new Date(new_datetime).toLocaleString('pl-PL') : 'Новое время';
      const tgMessage = `🔄 *ПЕРENOC ЗАПИСИ HALO AI!*\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${phone}\n✂️ *Услуга:* ${service || 'Услуга'}\n❌ *Было:* ${oldDate}\n✅ *Стало:* ${newDate}`;

      if (botToken && chatId) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: tgMessage, parse_mode: 'Markdown' })
          });
          if (tgRes.ok) results.telegram = true;
        } catch (e) { console.error('Telegram reschedule error:', e); }
      }

      return res.status(200).json({
        success: true,
        action: 'rescheduled',
        message: `Wizyta dla ${name} została przeniesiona na ${newDate}.`,
        integrations: results
      });
    }

    // --- 3. ACTION: CREATE NEW BOOKING (DEFAULT) ---
    const formattedDate = datetime ? new Date(datetime).toLocaleString('pl-PL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Nieokreślony czas';

    if (botToken && chatId) {
      const tgMessage = `📅 *НОВАЯ ЗАПИСЬ HALO AI!* (${bookingId})\n\n👤 *Клиент:* ${name}\n📞 *Телефон:* ${phone}\n✂️ *Услуга:* ${service || 'Стандартная запись'}\n⏰ *Дата и время:* ${formattedDate}\n🌐 *Язык:* ${language || 'pl'}\n📝 *Заметки:* ${notes || 'Нет'}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: tgMessage, parse_mode: 'Markdown' })
        });
        if (tgRes.ok) results.telegram = true;
      } catch (e) { console.error('Telegram booking error:', e); }
    }

    if (sheetsWebhookUrl) {
      try {
        await fetch(sheetsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CREATE', bookingId, name, phone, service, datetime: formattedDate, createdAt })
        });
        results.google_sheets = true;
      } catch (e) { console.error('Sheets booking error:', e); }
    }

    return res.status(200).json({
      success: true,
      action: 'created',
      message: 'Booking successfully created',
      booking: {
        id: bookingId,
        name,
        phone,
        service: service || 'Usługa podstawowa',
        datetime: formattedDate,
        raw_datetime: datetime
      },
      integrations: results
    });

  } catch (error) {
    console.error('Server error processing booking action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
