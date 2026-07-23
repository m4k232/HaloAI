import React, { useState, useEffect } from 'react';
import { translations } from './translations';
import CallSimulator from './components/CallSimulator';
import RoiCalculator from './components/RoiCalculator';
import LeadForm from './components/LeadForm';
import { Activity, Sparkles, Check, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('pl');

  // Auto-detect browser language on load
  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage || '';
    if (userLang.startsWith('uk') || userLang.startsWith('ua')) {
      setLang('ua');
    } else if (userLang.startsWith('ru')) {
      setLang('ru');
    } else if (userLang.startsWith('en')) {
      setLang('en');
    } else {
      setLang('pl');
    }
  }, []);

  const t = translations[lang] || translations.pl;

  return (
    <div className="app-container">
      {/* Solid Blur Navbar */}
      <nav className="navbar">
        <a href="#" className="brand-logo" style={{ gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>
            <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.9" />
            <circle cx="12" cy="12" r="5" stroke="#a1a1aa" strokeWidth="2" strokeOpacity="0.7" />
          </svg>
          <span style={{ color: '#F5F5F7' }}>HaloAI</span>
        </a>

        <ul className="nav-links">
          <li><a href="#features" className="nav-link">{t.nav.features}</a></li>
          <li><a href="#roi" className="nav-link">{t.nav.simulator}</a></li>
          <li><a href="#pricing" className="nav-link">{t.nav.pricing}</a></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

          <a href="#contact-form" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            {t.nav.cta}
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section container scale-up-fade">
        <div className="pill-badge fade-in-up">
          <Sparkles size={14} />
          {t.hero.pill}
        </div>

        <h1 className="hero-title fade-in-up delay-1">
          {t.hero.titleStart}<br />
          <span className="text-gradient">{t.hero.titleGradient}</span>
        </h1>

        <p className="hero-subtitle fade-in-up delay-2">
          {t.hero.subtitle}
        </p>

        <div className="hero-cta-group fade-in-up delay-3">
          <a href="#contact-form" className="btn-primary">
            {t.hero.ctaPrimary}
            <ArrowRight size={18} />
          </a>
          <a href="#simulator" className="btn-secondary">
            {t.hero.ctaSecondary}
          </a>
        </div>

        <div className="stats-grid fade-in-up delay-4">
          <div className="glass-panel stat-card">
            <div className="stat-value">{t.hero.stat1Val}</div>
            <div className="stat-label">{t.hero.stat1Text}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-value">{t.hero.stat2Val}</div>
            <div className="stat-label">{t.hero.stat2Text}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-value">{t.hero.stat3Val}</div>
            <div className="stat-label">{t.hero.stat3Text}</div>
          </div>
        </div>
      </section>

      {/* Interactive Barbershop Call Simulator */}
      <section className="simulator-section container scale-up-fade" id="simulator">
        <div className="section-header">
          <div className="tag-label">{t.simulator.tag}</div>
          <h2 className="section-title">{t.simulator.title}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{t.simulator.subtitle}</p>
        </div>
        <CallSimulator t={t.simulator} />
      </section>

      {/* Multilingual AI Section */}
      {t.multilingual && (
        <section className="steps-section container scale-up-fade" id="multilingual">
          <div className="section-header">
            <div className="tag-label">{t.multilingual.tag}</div>
            <h2 className="section-title">{t.multilingual.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, maxWidth: 680, margin: '8px auto 0 auto' }}>
              {t.multilingual.subtitle}
            </p>
          </div>

          <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="glass-panel step-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="step-title" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>{t.multilingual.card1Title}</div>
              <div className="step-desc" style={{ fontSize: '0.85rem' }}>{t.multilingual.card1Desc}</div>
            </div>
            <div className="glass-panel step-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="step-title" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>{t.multilingual.card2Title}</div>
              <div className="step-desc" style={{ fontSize: '0.85rem' }}>{t.multilingual.card2Desc}</div>
            </div>
            <div className="glass-panel step-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="step-title" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>{t.multilingual.card3Title}</div>
              <div className="step-desc" style={{ fontSize: '0.85rem' }}>{t.multilingual.card3Desc}</div>
            </div>
            <div className="glass-panel step-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="step-title" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>{t.multilingual.card4Title}</div>
              <div className="step-desc" style={{ fontSize: '0.85rem' }}>{t.multilingual.card4Desc}</div>
            </div>
          </div>
        </section>
      )}

      {/* ROI Calculator Section */}
      <section className="roi-section container scale-up-fade" id="roi">
        <RoiCalculator t={t.roi} />
      </section>

      {/* 3 Simple Steps */}
      <section className="steps-section container scale-up-fade" id="features">
        <div className="section-header">
          <div className="tag-label">{t.steps.tag}</div>
          <h2 className="section-title">{t.steps.title}</h2>
        </div>

        <div className="steps-grid">
          <div className="glass-panel step-card">
            <div className="step-num">{t.steps.step1Num}</div>
            <div className="step-title">{t.steps.step1Title}</div>
            <div className="step-desc">{t.steps.step1Desc}</div>
          </div>
          <div className="glass-panel step-card">
            <div className="step-num">{t.steps.step2Num}</div>
            <div className="step-title">{t.steps.step2Title}</div>
            <div className="step-desc">{t.steps.step2Desc}</div>
          </div>
          <div className="glass-panel step-card">
            <div className="step-num">{t.steps.step3Num}</div>
            <div className="step-title">{t.steps.step3Title}</div>
            <div className="step-desc">{t.steps.step3Desc}</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section container scale-up-fade" id="pricing">
        <div className="section-header">
          <div className="tag-label">{t.pricing.tag}</div>
          <h2 className="section-title">{t.pricing.title}</h2>
        </div>

        <div className="glass-panel pricing-card">
          <div className="popular-badge">{t.pricing.badge}</div>
          <div className="pricing-price">{t.pricing.price}</div>
          <div className="pricing-period">{t.pricing.period}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.pricing.setupFee}</p>

          <ul className="pricing-features">
            {t.pricing.features.map((feat, idx) => (
              <li key={idx} className="pricing-feature-item">
                <Check size={18} className="check-icon" />
                {feat}
              </li>
            ))}
          </ul>

          <a href="#contact-form" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px 24px', fontSize: '1.05rem' }}>
            {t.pricing.cta}
          </a>
        </div>
      </section>

      {/* Lead Capture Form Section */}
      <section className="form-section container scale-up-fade">
        <LeadForm t={t.form} />
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p style={{ marginBottom: 8 }}>{t.footer.rights}</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.footer.rodo}</p>
        </div>
      </footer>
    </div>
  );
}
