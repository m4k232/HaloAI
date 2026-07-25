import React, { useState, useEffect } from 'react';
import {
  Activity, Users, CheckCircle, XCircle, Clock, Search, LogOut, RefreshCw,
  Building2, Phone, Calendar, ArrowUpRight, ShieldCheck, Filter, Globe
} from 'lucide-react';
import { fetchBookingsFromFirestore } from '../firebase';
import { translations } from '../translations';

export default function Dashboard({ userSession, onLogout, lang, setLang }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeBusiness, setActiveBusiness] = useState('BarberShop Gentleman');

  const t = (translations[lang] || translations.pl).dashboard;

  const loadData = async () => {
    setLoading(true);
    const data = await fetchBookingsFromFirestore();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // KPI Computations
  const totalCalls = bookings.length;
  const confirmedCount = bookings.filter(b => b.action !== 'CANCELLED' && b.status !== 'cancelled').length;
  const cancelledCount = bookings.filter(b => b.action === 'CANCELLED' || b.status === 'cancelled').length;
  const savedHours = Math.round(confirmedCount * 0.25); // ~15 mins saved per booking

  // Filtering
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.phone || '').includes(searchTerm) ||
                          (b.service || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'CONFIRMED') {
      return matchesSearch && b.action !== 'CANCELLED' && b.status !== 'cancelled';
    }
    if (statusFilter === 'CANCELLED') {
      return matchesSearch && (b.action === 'CANCELLED' || b.status === 'cancelled');
    }
    return matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', paddingBottom: 60 }}>
      {/* Top Navbar */}
      <nav style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#fff', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem'
            }}>H</div>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#F5F5F7' }}>HaloAI</span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '6px 14px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.85rem'
          }}>
            <Building2 size={15} style={{ color: '#10b981' }} />
            <span>{activeBusiness}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Language Selector */}
          <div className="lang-selector">
            <Globe size={14} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="pl" style={{ background: '#0f172a', color: '#fff' }}>PL 🇵🇱</option>
              <option value="en" style={{ background: '#0f172a', color: '#fff' }}>EN 🇬🇧</option>
              <option value="ua" style={{ background: '#0f172a', color: '#fff' }}>UA 🇺🇦</option>
              <option value="ru" style={{ background: '#0f172a', color: '#fff' }}>RU 🇷🇺</option>
            </select>
          </div>

          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{userSession?.email || 'rvwshield@gmail.com'}</span>
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', gap: 8, borderRadius: 10 }}
          >
            <LogOut size={16} />
            {t.logout}
          </button>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {t.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={loadData}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.85rem', gap: 8, borderRadius: 10 }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {t.refresh}
          </button>
        </div>

        {/* KPI Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 32
        }}>
          {/* Total Calls */}
          <div className="glass-panel" style={{ padding: '24px 20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>{t.totalCalls}</span>
              <Activity size={20} style={{ color: '#818cf8' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>{totalCalls}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>{t.totalCallsNote}</div>
          </div>

          {/* Confirmed */}
          <div className="glass-panel" style={{ padding: '24px 20px', borderRadius: 18, border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>{t.confirmedVisits}</span>
              <CheckCircle size={20} style={{ color: '#34d399' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399' }}>{confirmedCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: 4 }}>{t.confirmedNote}</div>
          </div>

          {/* Cancelled */}
          <div className="glass-panel" style={{ padding: '24px 20px', borderRadius: 18, border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#fb7185', fontSize: '0.85rem', fontWeight: 600 }}>{t.cancelledVisits}</span>
              <XCircle size={20} style={{ color: '#fb7185' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fb7185' }}>{cancelledCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#e11d48', marginTop: 4 }}>{t.cancelledNote}</div>
          </div>

          {/* Saved Hours */}
          <div className="glass-panel" style={{ padding: '24px 20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>{t.savedTime}</span>
              <Clock size={20} style={{ color: '#fbbf24' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>{savedHours} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{t.hoursUnit}</span></div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>{t.savedTimeNote}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(15, 23, 42, 0.6)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: statusFilter === 'ALL' ? '#000000' : '#9ca3af'
              }}
            >
              {t.filterAll} ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('CONFIRMED')}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: statusFilter === 'CONFIRMED' ? '#10b981' : 'transparent',
                color: statusFilter === 'CONFIRMED' ? '#ffffff' : '#9ca3af'
              }}
            >
              {t.filterConfirmed} ({confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: statusFilter === 'CANCELLED' ? '#f43f5e' : 'transparent',
                color: statusFilter === 'CANCELLED' ? '#ffffff' : '#9ca3af'
              }}
            >
              {t.filterCancelled} ({cancelledCount})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 10,
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Live Bookings Table */}
        <div className="glass-panel" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>{t.colId}</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>{t.colClient}</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>{t.colPhone}</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>{t.colService}</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>{t.colDatetime}</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>{t.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto' }} />
                      Ładowanie rezerwacji...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      Brak rezerwacji spełniających kryteria wyszukiwania.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((item) => {
                    const isCancelled = item.action === 'CANCELLED' || item.status === 'cancelled';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#a1a1aa', fontWeight: 600 }}>
                          {item.id}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#ffffff' }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#38bdf8' }}>
                          <a href={`tel:${item.phone}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={14} />
                            {item.phone}
                          </a>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>
                          {item.service}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#fbbf24' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} />
                            {item.datetime}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {isCancelled ? (
                            <span style={{
                              background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)',
                              padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6
                            }}>
                              <XCircle size={13} />
                              {t.badgeCancelled}
                            </span>
                          ) : (
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6
                            }}>
                              <CheckCircle size={13} />
                              {t.badgeConfirmed}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
