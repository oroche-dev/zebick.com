import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, Compass, Flame, Crown, Medal, Star, Shield, Bot, Brain, Zap, X, Gift } from 'lucide-react';

const ICON_MAP = {
  Trophy, Sparkles, Compass, Flame, Crown, Medal, Star, Shield, Bot, Brain, Zap, Gift,
};

export default function AchievementToast({ achievements, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [achievements]);

  if (!achievements || achievements.length === 0 || !visible) return null;

  const close = () => { setVisible(false); if (onClose) onClose(); };

  return (
    <div
      data-testid="achievement-toast"
      style={{
        position: 'fixed', top: 96, right: 20, zIndex: 2000,
        display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360,
      }}
    >
      {achievements.map((a, i) => {
        const Icon = ICON_MAP[a.icon] || Trophy;
        const hasReward = !!a.reward_code_id || !!a.reward?.code;
        return (
          <div
            key={a.id || i}
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,0,0.18), rgba(20,20,20,0.95))',
              border: '1px solid rgba(255,107,0,0.4)',
              borderRadius: 12, padding: 14,
              backdropFilter: 'blur(14px)',
              animation: 'achSlideIn 350ms ease-out',
              boxShadow: '0 12px 40px rgba(255,107,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,107,0,0.22)', display: 'grid', placeItems: 'center',
                border: '1px solid rgba(255,107,0,0.45)',
              }}>
                <Icon size={22} color="#FF6B00" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#FF6B00', letterSpacing: '0.1em', marginBottom: 2 }}>
                  ACHIEVEMENT FREIGESCHALTET
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  {a.title}
                </div>
                <div style={{ color: '#bbb', fontSize: 12, lineHeight: 1.4 }}>
                  {a.description}
                </div>
                {a.xp > 0 && (
                  <div style={{ color: '#FFD166', fontSize: 11, fontWeight: 700, marginTop: 6 }}>
                    +{a.xp} XP
                  </div>
                )}
                {hasReward && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px', borderRadius: 6,
                    background: 'rgba(255,209,102,0.16)',
                    border: '1px solid rgba(255,209,102,0.4)',
                    color: '#FFD166', fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Gift size={12} />
                    Belohnung freigeschaltet — siehe Profil
                  </div>
                )}
              </div>
              <button
                onClick={close}
                aria-label="Schließen"
                style={{ background: 'transparent', border: 0, color: '#777', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes achSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
