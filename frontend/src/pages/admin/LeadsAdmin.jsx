import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Save, X, ArrowRight, Search, TrendingUp, Users, Target,
  Award, Mail, Phone, Building2, Briefcase, Tag, Calendar, CheckCircle, Sparkles,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger, btnGhost, Field } from './_adminShared';

const STATUS = [
  { v: 'new', label: 'Neu', color: '#FF6B00' },
  { v: 'contacted', label: 'Kontaktiert', color: '#FFA050' },
  { v: 'meeting_scheduled', label: 'Gespräch geplant', color: '#FFB464' },
  { v: 'offer_sent', label: 'Angebot gesendet', color: '#FF8C32' },
  { v: 'won', label: 'Gewonnen', color: '#2fa55d' },
  { v: 'lost', label: 'Verloren', color: '#d44343' },
];
const SOURCES = [
  { v: 'website', label: 'Website' },
  { v: 'chatbot', label: 'Chatbot' },
  { v: 'linkedin', label: 'LinkedIn' },
  { v: 'google_ads', label: 'Google Ads' },
  { v: 'referral', label: 'Empfehlung' },
  { v: 'seo', label: 'SEO' },
  { v: 'other', label: 'Sonstige' },
];

const empty = () => ({
  name: '', company: '', email: '', phone: '', service: '',
  budget: '', message: '', status: 'new', source: 'website',
  appointment_at: '', assigned_to: '', tags: [], notes: '',
});

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#9a9a9a' }}>
        {Icon && <Icon size={16} color="#FF6B00" />}
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ? '#FF6B00' : '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6a6a6a', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score >= 70 ? '#2fa55d' : score >= 40 ? '#FF6B00' : '#6a6a6a';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 6, background: '#1c1c1c', borderRadius: 0, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}</span>
    </div>
  );
}

export default function LeadsAdmin() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/leads/dashboard`, { headers: authHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/leads?limit=500`, { headers: authHeaders() }),
      ]);
      setStats(s.data);
      setLeads(l.data.leads || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let r = leads;
    if (filterStatus !== 'all') r = r.filter((x) => x.status === filterStatus);
    if (filterSource !== 'all') r = r.filter((x) => x.source === filterSource);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        (x.name || '').toLowerCase().includes(q) ||
        (x.email || '').toLowerCase().includes(q) ||
        (x.company || '').toLowerCase().includes(q)
      );
    }
    if (minScore > 0) r = r.filter((x) => (x.score || 0) >= minScore);
    return r;
  }, [leads, filterStatus, filterSource, search, minScore]);

  const openNew = () => { setEditing('new'); setForm(empty()); };
  const openEdit = (l) => { setEditing(l.id); setForm({ ...empty(), ...l, budget: l.budget ?? '' }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.name || !form.email) return alert('Name & E-Mail nötig');
    setSaving(true);
    try {
      const payload = { ...form, budget: form.budget === '' || form.budget === null ? null : parseFloat(form.budget) };
      if (editing === 'new') {
        await axios.post(`${BACKEND_URL}/api/admin/leads`, payload, { headers: authHeaders() });
      } else {
        await axios.patch(`${BACKEND_URL}/api/admin/leads/${editing}`, payload, { headers: authHeaders() });
      }
      await load(); cancel();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Lead löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/leads/${id}`, { headers: authHeaders() });
    load();
  };

  const convertToCustomer = async (id) => {
    if (!window.confirm('Lead in Kunden umwandeln und Status auf "Gewonnen" setzen?')) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/leads/${id}/convert-to-customer`, {}, { headers: authHeaders() });
      load();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
  };

  const advanceStatus = async (lead) => {
    const order = STATUS.filter((s) => s.v !== 'lost').map((s) => s.v);
    const idx = order.indexOf(lead.status);
    const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    if (!next) return;
    try {
      await axios.patch(`${BACKEND_URL}/api/admin/leads/${lead.id}`, { ...lead, status: next, budget: lead.budget ?? null }, { headers: authHeaders() });
      load();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
  };

  return (
    <AdminLayout
      title="Leads"
      actions={<button data-testid="lead-new-btn" onClick={openNew} style={btnPrimary}><Plus size={16} />Neuer Lead</button>}
    >
      {/* Dashboard KPIs */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          <StatCard label="Gesamt" value={stats.total} icon={Users} />
          <StatCard label="Neue Leads" value={stats.new} icon={Sparkles} sub="Noch nicht kontaktiert" />
          <StatCard label="Qualifiziert" value={stats.qualified} icon={Target} accent sub="Score ≥ 50 oder Termin/Angebot" />
          <StatCard label="Kunden geworden" value={stats.won} icon={Award} sub="Status: Gewonnen" />
          <StatCard label="Conversion-Rate" value={`${stats.conversion_rate}%`} icon={TrendingUp} accent sub="Gewonnen / Gesamt" />
          <StatCard label="Ø Lead-Score" value={stats.avg_score} icon={CheckCircle} />
        </div>
      )}

      {/* Source Breakdown */}
      {stats && (
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9a9a9a', marginBottom: 14 }}>Lead-Quellen</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            {SOURCES.map((s) => {
              const count = stats.by_source[s.v] || 0;
              const max = Math.max(1, ...Object.values(stats.by_source));
              return (
                <div key={s.v} style={{ padding: 10, background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: count > 0 ? '#FF6B00' : '#6a6a6a' }}>{count}</div>
                  <div style={{ height: 4, background: '#1c1c1c', marginTop: 6 }}>
                    <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: '#FF6B00' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} color="#6a6a6a" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            data-testid="lead-search"
            placeholder="Name, E-Mail oder Firma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...input, paddingLeft: 34 }}
          />
        </div>
        <select style={{ ...input, maxWidth: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} data-testid="lead-filter-status">
          <option value="all">Alle Status</option>
          {STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
        <select style={{ ...input, maxWidth: 160 }} value={filterSource} onChange={(e) => setFilterSource(e.target.value)} data-testid="lead-filter-source">
          <option value="all">Alle Quellen</option>
          {SOURCES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a9a9a', fontSize: 12 }}>
          Min. Score
          <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(parseInt(e.target.value))} style={{ width: 100 }} />
          <span style={{ color: '#FF6B00', fontWeight: 700, width: 30 }}>{minScore}</span>
        </div>
      </div>

      {/* Lead list */}
      {loading && <div style={{ color: '#9a9a9a' }}>Lädt…</div>}
      <div style={{ display: 'grid', gap: 8 }} data-testid="leads-list">
        {filtered.map((l) => {
          const st = STATUS.find((x) => x.v === l.status) || STATUS[0];
          const src = SOURCES.find((x) => x.v === l.source) || SOURCES[0];
          return (
            <div key={l.id} style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 14, display: 'grid', gridTemplateColumns: '1.5fr 1fr auto auto auto', gap: 12, alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{l.name}</span>
                  {l.company && <span style={{ color: '#9a9a9a', fontSize: 12 }}>· {l.company}</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, color: '#9a9a9a', fontSize: 11, flexWrap: 'wrap' }}>
                  <span><Mail size={11} style={{ display: 'inline', marginRight: 4 }} />{l.email}</span>
                  {l.phone && <span><Phone size={11} style={{ display: 'inline', marginRight: 4 }} />{l.phone}</span>}
                  {l.service && <span><Briefcase size={11} style={{ display: 'inline', marginRight: 4 }} />{l.service}</span>}
                  {l.budget && <span style={{ color: '#FF6B00', fontWeight: 600 }}>€{Number(l.budget).toLocaleString('de-DE')}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <ScoreBar score={l.score || 0} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ padding: '2px 8px', background: st.color + '22', color: st.color, borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st.label}</span>
                  <span style={{ padding: '2px 8px', background: '#1c1c1c', color: '#9a9a9a', borderRadius: 4, fontSize: 10 }}>{src.label}</span>
                </div>
              </div>
              {l.status !== 'won' && l.status !== 'lost' && (
                <button data-testid={`lead-advance-${l.id}`} onClick={() => advanceStatus(l)} style={btnSecondary} title="Status weiterschalten">
                  <ArrowRight size={14} />
                </button>
              )}
              {l.status !== 'won' && (
                <button data-testid={`lead-convert-${l.id}`} onClick={() => convertToCustomer(l.id)} style={btnPrimary} title="In Kunden umwandeln">
                  <Award size={14} />
                </button>
              )}
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => openEdit(l)} style={btnSecondary}><Edit2 size={14} /></button>
                <button onClick={() => remove(l.id)} style={btnDanger}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && <div style={{ color: '#9a9a9a', textAlign: 'center', padding: 30 }}>Keine Leads gefunden.</div>}
      </div>

      {/* Modal */}
      {editing && form && (
        <div onClick={cancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', borderRadius: 8, padding: 24, width: 700, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>{editing === 'new' ? 'Neuer Lead' : 'Lead bearbeiten'}</h2>
              <button onClick={cancel} style={btnGhost}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Name *"><input data-testid="lead-input-name" style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Firma"><input style={input} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
              <Field label="E-Mail *"><input data-testid="lead-input-email" style={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Telefon"><input style={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Dienstleistung"><input style={input} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="z. B. Webentwicklung" /></Field>
              <Field label="Budget (€)"><input style={input} type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
              <Field label="Status">
                <select style={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Quelle">
                <select style={input} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  {SOURCES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Termin"><input style={input} type="datetime-local" value={form.appointment_at} onChange={(e) => setForm({ ...form, appointment_at: e.target.value })} /></Field>
              <Field label="Zuständig"><input style={input} value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="Name/E-Mail" /></Field>
            </div>
            <Field label="Nachricht"><textarea style={{ ...input, minHeight: 70 }} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
            <Field label="Interne Notizen"><textarea style={{ ...input, minHeight: 80 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Field label="Tags (Komma-getrennt)">
              <input style={input} value={(form.tags || []).join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </Field>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={cancel} style={btnSecondary}>Abbrechen</button>
              <button data-testid="lead-save-btn" onClick={save} disabled={saving} style={btnPrimary}><Save size={14} />{saving ? 'Speichert…' : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
