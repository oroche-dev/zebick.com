import React, { useState } from 'react';
import { Globe, Mail, Phone, User, Zap, Send } from 'lucide-react';
import { toast } from 'sonner';
import { baseCard, inputStyle, labelStyle, submitLead } from './toolStyles';

const UrlAuditTool = ({ tool, intro, checks }) => {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = () => {
    if (!url) { toast.error('Bitte URL eingeben'); return; }
    if (!checks || checks.length === 0) { toast.error('Für dieses Tool sind noch keine Prüfpunkte konfiguriert.'); return; }
    setLoading(true);
    // Pseudo-Analyse (deterministische Heuristik aus der URL) – das echte Audit erfolgt durch unser Team
    setTimeout(() => {
      const seed = url.length + url.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const score = (i) => 45 + ((seed * (i + 1)) % 50);
      setResults(checks.map((c, i) => ({ ...c, score: score(i) })));
      setLoading(false);
    }, 800);
  };

  const overall = results && results.length
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;

  return (
    <div data-testid={`tool-${tool}`} style={{ ...baseCard, padding: '32px' }}>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>{intro}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'end', marginBottom: '24px' }} className="audit-form">
        <div>
          <label style={labelStyle}><Globe size={14} /> Ihre Domain</label>
          <input type="url" placeholder="https://ihre-website.de" value={url} onChange={(e) => setUrl(e.target.value)} data-testid={`${tool}-url`} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}><Mail size={14} /> E-Mail</label>
          <input type="email" placeholder="ihre@firma.de" value={email} onChange={(e) => setEmail(e.target.value)} data-testid={`${tool}-email`} style={inputStyle} />
        </div>
        <button onClick={analyze} disabled={loading} data-testid={`${tool}-analyze`} className="btn-primary" style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
          {loading ? 'Analysiere…' : <>Analysieren <Zap size={16} /></>}
        </button>
      </div>

      {results && (
        <div data-testid={`${tool}-results`}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '24px', padding: '24px',
            background: overall >= 80 ? 'rgba(16,185,129,0.08)' : overall >= 60 ? 'rgba(255,107,0,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${overall >= 80 ? 'rgba(16,185,129,0.3)' : overall >= 60 ? 'rgba(255,107,0,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 'var(--radius-lg)', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '52px', fontWeight: 900, color: overall >= 80 ? '#10B981' : overall >= 60 ? 'var(--accent-primary)' : '#EF4444' }}>{overall}</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Gesamtbewertung</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {overall >= 80 ? 'Sehr gut! Kleine Optimierungs-Hebel sind dennoch erkennbar.' : overall >= 60 ? 'Solide Basis – mit gezielten Maßnahmen lässt sich viel rausholen.' : 'Deutliches Verbesserungspotenzial. Wir helfen gerne dabei.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {results.map((r, i) => {
              const color = r.score >= 80 ? '#10B981' : r.score >= 60 ? 'var(--accent-primary)' : '#EF4444';
              return (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.name}</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color }}>{r.score}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${r.score}%`, height: '100%', background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', maxWidth: '400px' }}>
            <div>
              <label style={labelStyle}><User size={14} /> Vorname</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} data-testid={`${tool}-firstname`} style={inputStyle} placeholder="Max" />
            </div>
            <div>
              <label style={labelStyle}><User size={14} /> Nachname</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} data-testid={`${tool}-lastname`} style={inputStyle} placeholder="Mustermann" />
            </div>
          </div>
          <div style={{ marginBottom: '12px', maxWidth: '280px' }}>
            <label style={labelStyle}><Phone size={14} /> Telefon (optional)</label>
            <input type="tel" placeholder="+49 …" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid={`${tool}-phone`} style={inputStyle} />
          </div>
          <button
            onClick={() => {
              // The email input lives in the URL/Analysieren row above, not in a
              // <form> with this button, so native HTML5 validation never ran —
              // check the format explicitly before sending.
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error('Bitte eine gültige E-Mail-Adresse eingeben');
                return;
              }
              submitLead({
                tool,
                payload: { url, overall, results },
                email,
                phone,
                name: `${firstName} ${lastName}`.trim() || 'Audit-Lead',
                message: `Bitte senden Sie mir den detaillierten Bericht zu ${url}.`,
              });
            }}
            disabled={!email || !firstName}
            data-testid={`${tool}-send`}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', opacity: (!email || !firstName) ? 0.5 : 1 }}
          >
            Detaillierten Bericht per E-Mail anfordern <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UrlAuditTool;
