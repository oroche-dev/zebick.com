import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, FileText, Download } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger, btnGhost, Field } from './_adminShared';

const STATUS = [
  { v: 'draft', label: 'Entwurf', color: '#888' },
  { v: 'sent', label: 'Gesendet', color: '#3B82F6' },
  { v: 'accepted', label: 'Angenommen', color: '#22C55E' },
  { v: 'rejected', label: 'Abgelehnt', color: '#EF4444' },
  { v: 'paid', label: 'Bezahlt', color: '#10B981' },
  { v: 'overdue', label: 'Überfällig', color: '#DC2626' },
];

const newDoc = (type = 'offer') => ({
  type, title: '', customer_id: '', customer_name: '', customer_email: '', customer_address: '',
  project_id: '', items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 19 }],
  discount_percent: 0, notes: '', status: 'draft', due_date: '', payment_terms: 'Zahlbar innerhalb 14 Tagen',
});

function calcTotals(items, discount = 0) {
  const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0);
  const dis = subtotal * (discount / 100);
  const net = subtotal - dis;
  let tax = 0;
  if (subtotal > 0) {
    items.forEach((it) => {
      const line = (it.quantity || 0) * (it.unit_price || 0);
      tax += line * (net / subtotal) * ((it.tax_rate || 19) / 100);
    });
  }
  return { subtotal, dis, net, tax, total: net + tax };
}

export default function OffersAdmin() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const load = async () => {
    const [o, c, p] = await Promise.all([
      axios.get(`${BACKEND_URL}/api/admin/offers`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/customers?limit=500`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/projects-mgmt`, { headers: authHeaders() }),
    ]);
    setItems(o.data.offers || []);
    setCustomers(c.data.customers || []);
    setProjects(p.data.projects || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = (type) => { setEditing('new'); setForm(newDoc(type)); };
  const openEdit = (it) => { setEditing(it.id); setForm({ ...it }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.title) return alert('Titel nötig');
    setSaving(true);
    try {
      const payload = {
        ...form,
        discount_percent: parseFloat(form.discount_percent || 0),
        items: (form.items || []).map((it) => ({
          description: it.description || '',
          quantity: parseFloat(it.quantity || 0),
          unit_price: parseFloat(it.unit_price || 0),
          tax_rate: parseFloat(it.tax_rate || 19),
        })),
      };
      if (editing === 'new') {
        await axios.post(`${BACKEND_URL}/api/admin/offers`, payload, { headers: authHeaders() });
      } else {
        await axios.patch(`${BACKEND_URL}/api/admin/offers/${editing}`, payload, { headers: authHeaders() });
      }
      await load(); cancel();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Wirklich löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/offers/${id}`, { headers: authHeaders() });
    load();
  };

  const downloadPdf = async (id, number, type) => {
    const res = await axios.get(`${BACKEND_URL}/api/admin/offers/${id}/pdf`, { headers: authHeaders(), responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-${number}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filtered = typeFilter === 'all' ? items : items.filter((i) => i.type === typeFilter);
  const totals = form ? calcTotals(form.items || [], parseFloat(form.discount_percent || 0)) : null;

  return (
    <AdminLayout
      title="Angebote & Rechnungen"
      actions={<>
        <button data-testid="off-new-offer" onClick={() => openNew('offer')} style={btnPrimary}><Plus size={16} />Neues Angebot</button>
        <button data-testid="off-new-invoice" onClick={() => openNew('invoice')} style={btnSecondary}><Plus size={16} />Neue Rechnung</button>
      </>}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTypeFilter('all')} style={typeFilter === 'all' ? btnPrimary : btnSecondary}>Alle</button>
        <button onClick={() => setTypeFilter('offer')} style={typeFilter === 'offer' ? btnPrimary : btnSecondary}>Angebote</button>
        <button onClick={() => setTypeFilter('invoice')} style={typeFilter === 'invoice' ? btnPrimary : btnSecondary}>Rechnungen</button>
      </div>
      <div style={{ display: 'grid', gap: 10 }} data-testid="offers-list">
        {filtered.map((it) => {
          const st = STATUS.find((s) => s.v === it.status) || STATUS[0];
          return (
            <div key={it.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 14, display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <FileText size={20} color="#FF8C32" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}>{it.number}</span>
                  <span style={{ padding: '2px 8px', background: 'rgba(255,107,0,0.15)', color: '#FF8C32', borderRadius: 6, fontSize: 11 }}>{it.type === 'invoice' ? 'Rechnung' : 'Angebot'}</span>
                  <span style={{ padding: '2px 8px', background: st.color + '22', color: st.color, borderRadius: 6, fontSize: 11 }}>{st.label}</span>
                </div>
                <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{it.title}</div>
                <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                  {it.customer_name || '—'} · €{it.totals?.total?.toFixed(2) || '0.00'} {it.due_date ? `· fällig: ${it.due_date}` : ''}
                </div>
              </div>
              <button onClick={() => downloadPdf(it.id, it.number, it.type)} style={btnSecondary}><Download size={14} />PDF</button>
              <button onClick={() => openEdit(it)} style={btnSecondary}><Edit2 size={14} /></button>
              <button onClick={() => remove(it.id)} style={btnDanger}><Trash2 size={14} /></button>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Keine Dokumente.</div>}
      </div>

      {editing && form && (
        <div onClick={cancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', borderRadius: 16, padding: 24, width: 900, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{form.type === 'invoice' ? 'Rechnung' : 'Angebot'} {editing === 'new' ? 'erstellen' : 'bearbeiten'}</h2>
              <button onClick={cancel} style={btnGhost}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <Field label="Titel *"><input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label="Status">
                <select style={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Kunde">
                <select style={input} value={form.customer_id || ''} onChange={(e) => {
                  const c = customers.find((x) => x.id === e.target.value);
                  setForm({ ...form, customer_id: e.target.value, customer_name: c?.name || '', customer_email: c?.email || '', customer_address: c?.address || '' });
                }}>
                  <option value="">– manuell –</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Projekt (optional)">
                <select style={input} value={form.project_id || ''} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                  <option value="">–</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Kundenname"><input style={input} value={form.customer_name || ''} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></Field>
              <Field label="Kunden-E-Mail"><input style={input} value={form.customer_email || ''} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></Field>
            </div>
            <Field label="Adresse"><textarea style={{ ...input, minHeight: 60 }} value={form.customer_address || ''} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} /></Field>

            <h3 style={{ fontSize: 14, marginTop: 16, marginBottom: 8, color: '#FF8C32' }}>Posten</h3>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 0.6fr 1fr 0.7fr 0.4fr', gap: 6, fontSize: 11, color: '#888', padding: '0 4px' }}>
                <span>Beschreibung</span><span>Menge</span><span>Einzelpreis (€)</span><span>MwSt %</span><span></span>
              </div>
              {(form.items || []).map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 0.6fr 1fr 0.7fr 0.4fr', gap: 6 }}>
                  <input style={input} placeholder="Beschreibung" value={it.description || ''} onChange={(e) => { const a = [...form.items]; a[i] = { ...a[i], description: e.target.value }; setForm({ ...form, items: a }); }} />
                  <input style={input} type="number" value={it.quantity || ''} onChange={(e) => { const a = [...form.items]; a[i] = { ...a[i], quantity: e.target.value }; setForm({ ...form, items: a }); }} />
                  <input style={input} type="number" value={it.unit_price || ''} onChange={(e) => { const a = [...form.items]; a[i] = { ...a[i], unit_price: e.target.value }; setForm({ ...form, items: a }); }} />
                  <select style={input} value={it.tax_rate || 19} onChange={(e) => { const a = [...form.items]; a[i] = { ...a[i], tax_rate: e.target.value }; setForm({ ...form, items: a }); }}>
                    <option value={19}>19%</option><option value={7}>7%</option><option value={0}>0%</option>
                  </select>
                  <button onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })} style={btnDanger}><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0, tax_rate: 19 }] })} style={btnSecondary}><Plus size={14} />Position</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
              <Field label="Rabatt %"><input style={input} type="number" value={form.discount_percent || 0} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} /></Field>
              <Field label="Fällig am"><input style={input} type="date" value={form.due_date || ''} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
              <Field label="Zahlungsbedingungen"><input style={input} value={form.payment_terms || ''} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} /></Field>
            </div>

            <Field label="Hinweise"><textarea style={{ ...input, minHeight: 60 }} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>

            {totals && (
              <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 12, padding: 14, marginTop: 10, display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, fontSize: 13 }}>
                <span style={{ color: '#aaa' }}>Zwischensumme</span><span>€{totals.subtotal.toFixed(2)}</span>
                <span style={{ color: '#aaa' }}>Rabatt</span><span>-€{totals.dis.toFixed(2)}</span>
                <span style={{ color: '#aaa' }}>Netto</span><span>€{totals.net.toFixed(2)}</span>
                <span style={{ color: '#aaa' }}>MwSt</span><span>€{totals.tax.toFixed(2)}</span>
                <span style={{ color: '#FF8C32', fontWeight: 700 }}>Gesamt</span><span style={{ color: '#FF8C32', fontWeight: 700 }}>€{totals.total.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={cancel} style={btnSecondary}>Abbrechen</button>
              <button data-testid="off-save-btn" onClick={save} disabled={saving} style={btnPrimary}><Save size={14} />{saving ? 'Speichert…' : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
