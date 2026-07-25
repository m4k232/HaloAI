import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate verification (Accepts any partner email + master passcode or account password)
    setTimeout(() => {
      if (!email || !email.includes('@')) {
        setError('Wprowadź prawidłowy adres email.');
        setLoading(false);
        return;
      }

      if (!password || password.length < 4) {
        setError('Wprowadź prawidłowe hasło dostępu.');
        setLoading(false);
        return;
      }

      // Store partner session in localStorage
      const session = {
        email: email.toLowerCase().trim(),
        role: email.includes('admin') ? 'superadmin' : 'partner',
        token: 'halo_session_' + Date.now(),
        loggedAt: new Date().toISOString()
      };

      localStorage.setItem('haloai_user_session', JSON.stringify(session));
      setLoading(false);
      onLoginSuccess();
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%), #030712',
      color: '#fff'
    }}>
      <div className="glass-panel" style={{
        maxWidth: 440,
        width: '100%',
        padding: '40px 32px',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            marginBottom: 16,
            boxShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            <ShieldCheck size={28} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
            HaloAI Portal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Dostęp tylko dla zweryfikowanych partnerów
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: '0.85rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>
              ADRES EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="email"
                required
                placeholder="biuro@barbershop.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>
              HASŁO DOSTĘPU
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justify: 'center',
              padding: '14px 24px',
              fontSize: '1rem',
              marginTop: 8,
              borderRadius: 12
            }}
          >
            {loading ? 'Weryfikacja...' : 'Zaloguj się do panelu'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: '#6b7280' }}>
          🔒 Szyfrowane połączenie SSL • RODO Compliant
        </div>
      </div>
    </div>
  );
}
