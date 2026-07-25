// Zero-dependency Firebase REST API Helper for HaloAI Portal
const PROJECT_ID = 'haloai-7b69d';

export async function fetchBookingsFromFirestore() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/bookings`);
    if (!res.ok) throw new Error('Firestore REST request failed');
    const data = await res.json();
    
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
    return docs;
  } catch (err) {
    console.error('Error fetching Firestore bookings:', err);
    return [];
  }
}
