// Zero-dependency Firebase Admin API Helper for HaloAI Portal

export async function fetchBookingsFromFirestore() {
  try {
    const res = await fetch('/api/admin-bookings');
    if (!res.ok) throw new Error('Admin API request failed');
    const data = await res.json();
    return data.bookings || [];
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}
