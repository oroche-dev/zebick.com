import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, RefreshCw, ArrowLeft, Trophy, Mail, MousePointerClick, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StatCard = ({ label, value, color, icon: Icon, hint }) => (
  <div style={{
    background: `linear-gradient(135deg, ${color}1A 0%, ${color}08 100%)`,
    border: `1px solid ${color}40`,
    borderRadius: 16, padding: 24,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <Icon size={22} color={color} />
      <span style={{ color: '#999', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
    </div>
    <div style={{ fontSize: 34, fontWeight: 800, color }}>{value}</div>
    {hint && <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>{hint}</div>}
  </div>
);

const VariantCard = ({ v, isWinner }) => {
  const color = v.variant === 'A' ? '#FF6B00' : '#3B82F6';
  return (
    <div
      data-testid={`variant-card-${v.variant}`}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `2px solid ${isWinner ? color : color + '30'}`,
        borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden',
        boxShadow: isWinner ? `0 0 60px ${color}30` : 'none',
      }}
    >
      {isWinner && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: color, color: '#000', padding: '6px 12px', borderRadius: 999,
          fontSize: 11, fontWeight: 800, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Trophy size={13} /> GEWINNER
        </div>
      )}
      <div style={{ fontSize: 64, fontWeight: 900, color, lineHeight: 1, letterSpacing: -2 }}>{v.variant}</div>
      <div style={{ color: '#aaa', fontSize: 13, marginBottom: 18, marginTop: 6 }}>
        {v.variant === 'A' ? 'Premium · Festpreis' : 'Schnell · Agil · Ergebnisorientiert'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <StatRow label="Versendet" value={v.sent} color={color} />
        <StatRow label="Geöffnet" value={v.opened} color={color} suffix={pct(v.opened, v.sent)} />
        <StatRow label="Geklickt" value={v.clicked} color={color} suffix={pct(v.clicked, v.sent)} />
        <StatRow
          label="Angenommen"
          value={v.accepted}
          color={color}
          suffix={pct(v.accepted, v.sent)}
          highlight
        />
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color, suffix, highlight }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px',
    background: highlight ? `${color}25` : 'rgba(0,0,0,0.3)',
    border: highlight ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.05)',
    borderRadius: 10,
  }}>
    <span style={{ color: highlight ? color : '#aaa', fontSize: 14, fontWeight: highlight ? 700 : 500 }}>{label}</span>
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: highlight ? color : '#fff' }}>{value}</span>
      {suffix && <span style={{ fontSize: 12, color: '#888' }}>{suffix}</span>}
    </div>
  </div>
);

const pct = (n, d) => (d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '0%');

export default function OfferABStats() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const r = await axios.get(`${BACKEND_URL}/api/admin/offer-ab/stats`, { headers });
      setData(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const variants = data?.variants || [];
  const totals = data?.totals || { sent: 0, opened: 0, clicked: 0, accepted: 0 };
  const winner = data?.winner || null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 data-testid="ab-stats-title" style={{
              fontSize: 36, fontWeight: 800, marginBottom: 8,
              background: 'linear-gradient(135deg, #fff 0%, #999 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Angebots-A/B-Test
            </h1>
            <p style={{ color: '#888', fontSize: 15 }}>
              Performance-Vergleich zwischen Angebots-Varianten A und B
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/zb-panel-8x2k/dashboard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              <ArrowLeft size={16} /> Dashboard
            </button>
            <button data-testid="ab-refresh-btn" onClick={fetchStats}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'linear-gradient(135deg, #FF6B00, #FF8C32)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>
              <RefreshCw size={16} /> Aktualisieren
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 60 }}>Lädt Statistiken…</div>
        ) : !data || totals.sent === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 16, padding: 60, textAlign: 'center', color: '#aaa' }}>
            <TrendingUp size={40} color="#555" style={{ marginBottom: 14 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ddd', marginBottom: 8 }}>Noch keine A/B-Angebote versendet</div>
            <div style={{ fontSize: 14, color: '#888' }}>
              Öffne einen Kontakt, wähle <strong style={{ color: '#FF6B00' }}>„Angebot (A/B-Test)"</strong> und sende — die Statistik erscheint hier automatisch.
            </div>
          </div>
        ) : (
          <>
            {/* Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
              <StatCard label="Versendet" value={totals.sent} color="#8B5CF6" icon={Mail} />
              <StatCard label="Geöffnet" value={totals.opened} color="#10B981" icon={Mail} hint={pct(totals.opened, totals.sent) + ' Öffnungsrate'} />
              <StatCard label="Geklickt" value={totals.clicked} color="#3B82F6" icon={MousePointerClick} hint={pct(totals.clicked, totals.sent) + ' CTR'} />
              <StatCard label="Angenommen" value={totals.accepted} color="#FF6B00" icon={CheckCircle} hint={pct(totals.accepted, totals.sent) + ' Conversion'} />
            </div>

            {/* Variants */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 36 }}>
              {variants.map((v) => (
                <VariantCard key={v.variant} v={v} isWinner={winner === v.variant && v.sent > 0} />
              ))}
            </div>

            {/* Rotation / meta */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, color: '#999', fontSize: 13, lineHeight: 1.7 }}>
              <strong style={{ color: '#ddd' }}>So funktioniert der Test:</strong> Beim Senden von „Angebot (A/B-Test)" wird automatisch zwischen Variante A (Premium-Fokus) und Variante B (Agile/schnell) rotiert.
              Jede E-Mail bekommt einen eindeutigen Tracking-Link — bei Klick/Öffnung/Annahme wird der Erfolg hier gezählt. Nächste Rotation: <strong style={{ color: '#FF6B00' }}>{data?.next_variant || '—'}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
