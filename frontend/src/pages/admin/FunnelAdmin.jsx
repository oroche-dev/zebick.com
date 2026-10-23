import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, Mail, Phone, Building, ArrowRight, Loader2, UserPlus, Activity as ActivityIcon } from 'lucide-react';
import { AdminShell, Section, input, btnPrimary, btnSecondary, btnGhost, authHeaders, BACKEND_URL } from './_adminShared';

const STAGES = [
  { key: 'new', label: 'Neue Anfrage', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'contacted', label: 'Kontaktiert', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'offer_sent', label: 'Angebot gesendet', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { key: 'won', label: 'Gewonnen', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { key: 'lost', label: 'Verloren', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
];

const eur = (n) => `€${Number(n || 0).toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;

const FunnelAdmin = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [dealValue, setDealValue] = useState('');
  const [notes, setNotes] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [o, c] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/funnel/overview`, { headers: authHeaders() }),
        axios.get(`${BACKEND_URL}/api/contact/submissions?status=all&limit=1000`, { headers: authHeaders() }),
      ]);
      setOverview(o.data);
      setContacts(c.data.submissions || []);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) navigate('/zb-panel-8x2k/login');
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { navigate('/zb-panel-8x2k/login'); return; }
    fetchAll();
  }, [fetchAll, navigate]);

  const updateContact = async (id, body) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/admin/contact/${id}`, body, { headers: authHeaders() });
      await fetchAll();
      if (selected?.id === id) {
        const updated = contacts.find((x) => x.id === id);
        if (updated) setSelected({ ...updated, ...body });
      }
    } catch (e) {
      alert(e.response?.data?.detail || 'Fehler');
    }
  };

  const moveStage = (contact, newStage) => updateContact(contact.id, { status: newStage });

  const convertToCustomer = async (contact) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/customers/from-contact/${contact.id}`, {}, { headers: authHeaders() });
      alert(`Kunde angelegt: ${res.data.name}`);
      fetchAll();
    } catch (e) {
      alert(e.response?.data?.detail || 'Fehler');
    }
  };

  const saveDealAndNotes = async () => {
    if (!selected) return;
    const body = {};
    if (dealValue !== '') body.deal_value = parseFloat(dealValue);
    if (notes !== '') body.notes = notes;
    if (Object.keys(body).length === 0) return;
    await updateContact(selected.id, body);
  };

  const byStage = (stage) => contacts.filter((c) => (c.status || 'new') === stage);

  return (
    <AdminShell
      title="Sales-Funnel & Pipeline"
      subtitle="Verfolge Leads vom Erstkontakt bis zum Abschluss — Drag & Drop ersetzt durch ein-Klick-Stage-Wechsel."
      actions={
        <button onClick={fetchAll} style={btnSecondary} data-testid="funnel-refresh">Aktualisieren</button>
      }
    >
      {/* KPI bar */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <KPI label="Anfragen gesamt" value={overview.total_requests} icon={<TrendingUp size={16} />} color="#FF8C32" />
          <KPI label="Pipeline (offen)" value={eur(overview.total_pipeline_value)} color="#a78bfa" />
          <KPI label="Gewonnen €" value={eur(overview.total_won_value)} color="#22c55e" />
          <KPI label="Conversion" value={`${overview.conversion_rate}%`} color="#3b82f6" />
        </div>
      )}

      {/* Pipeline columns */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))', gap: '12px',
        overflowX: 'auto', paddingBottom: '8px',
      }} data-testid="funnel-board">
        {STAGES.map((stage) => {
          const items = byStage(stage.key);
          const stageData = overview?.stages?.find((s) => s.key === stage.key);
          return (
            <div key={stage.key} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
              borderRadius: '12px', padding: '12px', minHeight: '300px',
            }} data-testid={`funnel-col-${stage.key}`}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '12px', paddingBottom: '10px',
                borderBottom: `2px solid ${stage.color}`,
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{eur(stageData?.value)}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '99px', background: stage.bg, color: stage.color, fontWeight: 700, fontSize: '12px' }}>{items.length}</span>
              </div>

              {items.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Leer</div>
              ) : items.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setSelected(c); setDealValue(c.deal_value || ''); setNotes(c.notes || ''); }}
                  style={{
                    background: '#0f0f0f', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', padding: '10px', marginBottom: '8px', cursor: 'pointer',
                  }}
                  data-testid={`funnel-card-${c.id}`}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.service || 'Allgemein'}</div>
                  {c.budget && <div style={{ fontSize: '11px', color: '#FF8C32', marginTop: '4px' }}>{c.budget}</div>}
                  {c.deal_value && <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px', fontWeight: 700 }}>{eur(c.deal_value)}</div>}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {STAGES.filter((s) => s.key !== stage.key).map((s) => (
                      <button
                        key={s.key}
                        onClick={(e) => { e.stopPropagation(); moveStage(c, s.key); }}
                        style={{
                          fontSize: '10px', padding: '3px 7px', borderRadius: '4px',
                          background: s.bg, color: s.color, border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                        title={`→ ${s.label}`}
                        data-testid={`funnel-move-${c.id}-${s.key}`}
                      >→ {s.label.split(' ')[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spin" /> Lade…
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#0a0a0a', borderLeft: '1px solid var(--border-subtle)',
            width: '480px', maxWidth: '100vw', height: '100vh', overflow: 'auto', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{selected.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
                  {new Date(selected.submitted_at).toLocaleString('de-DE')}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={btnGhost}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
              <div><Mail size={12} style={{ display: 'inline', marginRight: 6 }} />{selected.email}</div>
              {selected.phone && <div><Phone size={12} style={{ display: 'inline', marginRight: 6 }} />{selected.phone}</div>}
              {selected.company && <div><Building size={12} style={{ display: 'inline', marginRight: 6 }} />{selected.company}</div>}
              <div style={{ color: 'var(--text-muted)' }}>Service: {selected.service || '-'} • Budget: {selected.budget || '-'}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
              {selected.message}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal-Wert (€)</label>
              <input type="number" style={input} value={dealValue} onChange={(e) => setDealValue(e.target.value)} placeholder="z.B. 15000" data-testid="funnel-deal-value" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interne Notizen</label>
              <textarea style={{ ...input, minHeight: '80px', resize: 'vertical' }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="…" data-testid="funnel-notes" />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button onClick={saveDealAndNotes} style={btnPrimary} data-testid="funnel-save-deal">Speichern</button>
              <button onClick={() => convertToCustomer(selected)} style={btnSecondary} data-testid="funnel-convert-customer">
                <UserPlus size={14} /> → Kunde
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 700 }}>Stage wechseln</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => moveStage(selected, s.key)}
                  style={{
                    padding: '8px 14px', borderRadius: '6px',
                    background: selected.status === s.key ? s.color : s.bg,
                    color: selected.status === s.key ? '#000' : s.color,
                    border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                    fontFamily: 'inherit',
                  }}
                >{s.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
};

const KPI = ({ label, value, color, icon }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
    borderRadius: '12px', padding: '16px',
  }}>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {icon}{label}
    </div>
    <div style={{ fontSize: '24px', fontWeight: 800, color: color || '#fff' }}>{value}</div>
  </div>
);

export default FunnelAdmin;
