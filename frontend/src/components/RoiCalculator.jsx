import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function RoiCalculator({ t }) {
  const [missedCalls, setMissedCalls] = useState(3);
  const [avgOrderValue, setAvgOrderValue] = useState(80);

  const daysInMonth = 22; // working days
  const lostMonthly = missedCalls * avgOrderValue * daysInMonth;
  const haloAiCost = 149;
  const netSavings = Math.max(0, lostMonthly - haloAiCost);

  return (
    <div className="glass-panel roi-card">
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div className="tag-label">{t.tag}</div>
        <h2 className="section-title">{t.title}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Slider 1: Missed Calls */}
        <div className="slider-group" style={{ margin: 0 }}>
          <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.sliderLabel}</span>
            <span className="slider-val" style={{ fontWeight: 700, color: '#fff' }}>{missedCalls} {t.callsCount}</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={missedCalls}
            onChange={(e) => setMissedCalls(parseInt(e.target.value))}
            className="custom-range"
          />
        </div>

        {/* Slider 2: Average Order Value */}
        <div className="slider-group" style={{ margin: 0 }}>
          <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.avgCheckLabel}</span>
            <span className="slider-val" style={{ fontWeight: 700, color: '#fff' }}>{avgOrderValue} PLN</span>
          </div>
          <input
            type="range"
            min="30"
            max="300"
            step="10"
            value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(parseInt(e.target.value))}
            className="custom-range"
          />
        </div>
      </div>

      {/* Formula hint */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
        🧮 {t.formulaNote} ({missedCalls} × {avgOrderValue} PLN × 22 раб. дня = {lostMonthly.toLocaleString()} PLN)
      </div>

      <div className="roi-results-grid">
        <div className="roi-res-box">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            {t.lostMonthly}
          </div>
          <div className="roi-res-num red">
            -{lostMonthly.toLocaleString()} PLN {t.perMonth}
          </div>
        </div>

        <div className="roi-res-box highlight">
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: 6 }}>
            {t.savings}
          </div>
          <div className="roi-res-num green">
            +{netSavings.toLocaleString()} PLN {t.perMonth}
          </div>
        </div>
      </div>
    </div>
  );
}
