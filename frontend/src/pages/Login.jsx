import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Globe } from 'lucide-react';
import { translations } from '../translations';

export default function Login({ onLoginSuccess, lang, setLang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (translations[lang] || translations.pl).login;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error(lang === 'pl' ? 'Wprowadź prawidłowy adres email.' : 'Please enter a valid email address.');
      }

      if (!password) {
        throw new Error(lang === 'pl' ? 'Wprowadź hasło dostępu.' : 'Please enter your password.');
      }

      // Send authentication request to Vercel Serverless API
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('haloai_user_session', JSON.stringify(data.session));
        setLoading(false);
        onLoginSuccess();
      } else {
        throw new Error(data.message || (lang === 'pl' ? 'Nieprawidłowy email lub hasło.' : 'Invalid email or password.'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || (lang === 'pl' ? 'Wystąpił błąd podczas logowania.' : 'An error occurred during login.'));
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%), #030712',
      color: '#fff',
      position: 'relative'
    }}>
      {/* Top Navbar with Language Selector */}
      <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
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
      </div>

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
            {t.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t.subtitle}
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
              {t.emailLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
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
              {t.passwordLabel}
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
            {loading ? t.verifying : t.button}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: '#6b7280' }}>
          {t.footerNote}
        </div>
      </div>
    </div>
  );
}
