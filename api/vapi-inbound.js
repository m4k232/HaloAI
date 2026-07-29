// Vapi Inbound Assistant Request Handler (Dynamic Prompt Injection from Firestore)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const message = body.message || {};
    const call = message.call || body.call || {};
    const calledPhoneNumber = call.phoneNumber || body.phoneNumber || '+19382539583';

    const projectId = process.env.FIREBASE_PROJECT_ID || 'haloai-7b69d';

    // 1. DEFAULT FALLBACK VALUES
    let businessConfig = {
      businessName: 'BarberShop Gentleman',
      address: 'ul. Marszałkowska 10, Warszawa',
      workingHours: 'Poniedziałek - Piątek: 09:00 - 20:00, Sobota: 10:00 - 16:00',
      priceList: 'Strzyżenie męskie klasyczne: 70 PLN, Strzyżenie brody: 50 PLN, Combo: 110 PLN, Dziecięce: 60 PLN'
    };

    // 2. FETCH REAL BUSINESS DATA FROM FIRESTORE 'clients' COLLECTION
    try {
      const clientsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clients`;
      const cRes = await fetch(clientsUrl);
      if (cRes.ok) {
        const cData = await cRes.json();
        const docs = cData.documents || [];
        const found = docs.find(doc => {
          const f = doc.fields || {};
          return f.assignedPhone?.stringValue === calledPhoneNumber || f.assignedPhone?.stringValue === '+19382539583';
        });

        if (found) {
          const f = found.fields;
          businessConfig.businessName = f.businessName?.stringValue || businessConfig.businessName;
          businessConfig.address = f.address?.stringValue || businessConfig.address;
          businessConfig.workingHours = f.workingHours?.stringValue || businessConfig.workingHours;
          businessConfig.priceList = f.priceList?.stringValue || businessConfig.priceList;
        }
      }
    } catch (cErr) {
      console.error('Error reading Firestore client config:', cErr);
    }

    // 3. CONSTRUCT DYNAMIC DYNAMICALLY INJECTED SYSTEM PROMPT
    const dynamicSystemPrompt = `# HALO AI - DYNAMIC VOICE ASSISTANT

You are a warm, polite, and ultra-efficient Voice AI Receptionist representing "${businessConfig.businessName}".
Your job is to answer questions about services/prices and book appointments.

[CORE RULES]
- Keep all responses short (under 20 words). Speak naturally like a real human receptionist.
- Ask ONLY ONE question at a time.
- Start by detecting the caller's language and respond 100% in their language (Polish, Russian, Ukrainian, English, German, etc.).
- If speaking Russian or Ukrainian, ALWAYS write in pure Cyrillic script. Never use Latin transliteration.

[LIVE FIRESTORE BUSINESS INFO & PRICES]
- Salon Name: ${businessConfig.businessName}
- Address: ${businessConfig.address}
- Hours: ${businessConfig.workingHours}
- Services & Price List: ${businessConfig.priceList}

[COLLECTING BOOKING DATA]
You need 4 pieces of information to complete a booking:
1. \`service\` (Which service they want)
2. \`datetime\` (Date and time)
3. \`name\` (Client name)
4. \`phone\` (Phone number)

[PHONE NUMBER RULE]
- You automatically have access to the caller's line \`call.customer.number\`.
- When asking for the phone number, state: "Provide your phone number or say 'this number' to use the line you are calling from."
- If the caller says "this number", "na ten numer", "на этот номер", or indicates using their current line, set \`phone\` to \`call.customer.number\`!

[BOOKING EXECUTION]
- The EXACT MOMENT you have all 4 items (\`service\`, \`datetime\`, \`name\`, \`phone\`), IMMEDIATELY call the \`create_booking\` tool.
- After \`create_booking\` finishes executing, say: "Dziękuję! Wizyta została pomyślnie zarezerwowana. Do zobaczenia!" (or equivalent in caller's language) and END THE CALL.
`;

    // 4. RETURN DYNAMIC ASSISTANT OVERRIDE TO VAPI
    return res.status(200).json({
      assistant: {
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: dynamicSystemPrompt
            }
          ]
        }
      }
    });

  } catch (err) {
    console.error('Error in vapi-inbound handler:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
