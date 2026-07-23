export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, business, phone, email } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram environment variables are missing on Vercel');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const message = `🚀 *Новая заявка HaloAI!*\n\n👤 *Имя:* ${name}\n🏢 *Бизнес:* ${business || 'Не указан'}\n📞 *Телефон:* ${phone}\n✉️ *Email:* ${email || 'Не указан'}\n\n⏰ *Время:* ${new Date().toLocaleString('pl-PL')}`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', errorText);
      return res.status(500).json({ error: 'Failed to send Telegram message' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error sending lead:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
