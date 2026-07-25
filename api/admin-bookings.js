export default async function handler(req, res) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'haloai-7b69d';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/bookings`;

    const response = await fetch(firestoreUrl);
    if (!response.ok) {
      console.error('Firestore GET error:', await response.text());
      return res.status(200).json({ success: true, bookings: [] });
    }

    const data = await response.json();
    const docs = (data.documents || []).map(doc => {
      const fields = doc.fields || {};
      return {
        id: fields.bookingId?.stringValue || doc.name.split('/').pop(),
        name: fields.name?.stringValue || 'Brak imienia',
        phone: fields.phone?.stringValue || 'Brak telefonu',
        service: fields.service?.stringValue || 'Usługa podstawowa',
        datetime: fields.datetime?.stringValue || 'Nieokreślony czas',
        status: fields.status?.stringValue || 'confirmed',
        action: fields.action?.stringValue || 'CREATED',
        createdAt: fields.createdAt?.stringValue || new Date().toISOString()
      };
    });

    // Sort by createdAt descending
    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, bookings: docs });
  } catch (err) {
    console.error('Error in admin-bookings API:', err);
    return res.status(500).json({ error: 'Internal server error', bookings: [] });
  }
}
