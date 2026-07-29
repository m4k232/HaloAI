// Serverless endpoint to manage B2B clients and fetch business config
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const projectId = process.env.FIREBASE_PROJECT_ID || 'haloai-7b69d';

  // GET: Fetch all registered B2B clients
  if (req.method === 'GET') {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clients`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(200).json({ success: true, clients: [] });
      }

      const data = await response.json();
      const documents = data.documents || [];

      const clients = documents.map(doc => {
        const fields = doc.fields || {};
        const pathParts = doc.name.split('/');
        return {
          id: pathParts[pathParts.length - 1],
          businessName: fields.businessName?.stringValue || 'Brak nazwy',
          assignedPhone: fields.assignedPhone?.stringValue || '',
          ownerEmail: fields.ownerEmail?.stringValue || '',
          address: fields.address?.stringValue || '',
          workingHours: fields.workingHours?.stringValue || '',
          googleCalendarId: fields.googleCalendarId?.stringValue || '',
          googleSheetId: fields.googleSheetId?.stringValue || '',
          telegramChatId: fields.telegramChatId?.stringValue || '',
          priceList: fields.priceList?.stringValue || '',
          createdAt: fields.createdAt?.stringValue || ''
        };
      });

      return res.status(200).json({ success: true, clients });
    } catch (err) {
      console.error('Error fetching clients:', err);
      return res.status(500).json({ error: 'Failed to fetch clients', message: err.message });
    }
  }

  // POST / PATCH: Add or update a B2B client using Firestore commit REST API (overwriting existing fields)
  if (req.method === 'POST' || req.method === 'PATCH') {
    try {
      const {
        clientId,
        businessName,
        assignedPhone,
        ownerEmail,
        address,
        workingHours,
        googleCalendarId,
        googleSheetId,
        telegramChatId,
        priceList
      } = req.body || {};

      const id = clientId || 'barbershop_gentleman';
      const commitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;

      const docName = `projects/${projectId}/databases/(default)/documents/clients/${id}`;

      // First delete existing doc if present, then insert updated doc
      const commitBody = {
        writes: [
          { delete: docName },
          {
            update: {
              name: docName,
              fields: {
                clientId: { stringValue: id },
                businessName: { stringValue: String(businessName || 'BarberShop Gentleman') },
                assignedPhone: { stringValue: String(assignedPhone || '+19382539583') },
                ownerEmail: { stringValue: String(ownerEmail || 'rvwshield@gmail.com') },
                address: { stringValue: String(address || 'ul. Marszałkowska 10, Warszawa') },
                workingHours: { stringValue: String(workingHours || 'Poniedziałek - Piątek: 09:00 - 20:00, Sobota: 10:00 - 16:00') },
                googleCalendarId: { stringValue: String(googleCalendarId || '') },
                googleSheetId: { stringValue: String(googleSheetId || '') },
                telegramChatId: { stringValue: String(telegramChatId || '') },
                priceList: { stringValue: String(priceList || 'Strzyżenie męskie klasyczne: 70 PLN (45 min), Strzyżenie brody: 50 PLN (30 min), Combo: 110 PLN (60 min)') },
                createdAt: { stringValue: new Date().toISOString() }
              }
            }
          }
        ]
      };

      const fsRes = await fetch(commitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commitBody)
      });

      if (!fsRes.ok) {
        const errText = await fsRes.text();
        console.error('Firestore client write error:', errText);
        return res.status(500).json({ error: 'Firestore write error', details: errText });
      }

      return res.status(200).json({
        success: true,
        message: 'Client updated successfully in Firestore',
        client: { id, businessName, assignedPhone, address, workingHours, priceList }
      });
    } catch (err) {
      console.error('Error saving client:', err);
      return res.status(500).json({ error: 'Failed to save client', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
