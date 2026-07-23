import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, PhoneCall, CheckCircle2, User, Sparkles } from 'lucide-react';

export default function CallSimulator({ t }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const transcriptBoxRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= t.dialog.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, t.dialog.length]);

  // Autoscroll ONLY the transcript container internally (never scroll the main window)
  useEffect(() => {
    if (transcriptBoxRef.current && activeStep > 0) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [activeStep]);

  const togglePlay = () => {
    if (!isPlaying && activeStep >= t.dialog.length - 1) {
      setActiveStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass-panel simulator-card">
      <div className="simulator-header">
        <div className="sim-info">
          <div className="sim-avatar">
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', textAlign: 'left' }}>
              BarberShop Gentleman ✂️
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
              {t.callerName} • {t.service}
            </div>
          </div>
        </div>
        <div className="sim-status-badge">
          <div className="sim-pulse-dot"></div>
          {t.status}
        </div>
      </div>

      <div className="audio-controls">
        <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? t.pauseButton : t.playButton}>
          {isPlaying ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: 3 }} />}
        </button>

        <div className="waveform-container">
          {[40, 75, 30, 90, 50, 80, 45, 100, 60, 85, 40, 70, 95, 30, 65, 80, 50, 90, 40, 75].map((height, i) => (
            <div
              key={i}
              className={`wave-bar ${isPlaying ? 'active' : ''}`}
              style={{
                height: isPlaying ? undefined : `${height}%`,
                animationDelay: `${(i % 5) * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: 12, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        {t.transcriptTitle}
      </div>

      <div className="transcript-box" ref={transcriptBoxRef}>
        {t.dialog.slice(0, activeStep + 1).map((item, idx) => (
          <div key={idx} className={`chat-bubble ${item.speaker === 'AI' ? 'ai' : 'client'}`}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: item.speaker === 'AI' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
              {item.speaker === 'AI' ? '🤖 HaloAI Receptionist' : '👤 Klient'}
            </div>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
