import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, CheckSquare, Square, Paperclip, Upload } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger, btnGhost, Field } from './_adminShared';

const STATUS = [
  { v: 'planned', label: 'Geplant', color: '#3B82F6' },
  { v: 'in_progress', label: 'In Bearbeitung', color: '#F59E0B' },
  { v: 'review', label: 'Review', color: '#A78BFA' },
  { v: 'completed', label: 'Abgeschlossen', color: '#22C55E' },
  { v: 'on_hold', label: 'Pausiert', color: '#888' },
  { v: 'cancelled', label: 'Abgebrochen', color: '#EF4444' },
];
const PAYMENT = [
  { v: 'unpaid', label: 'Unbezahlt', color: '#EF4444' },
  { v: 'partial', label: 'Teilweise', color: '#F59E0B' },
  { v: 'paid', label: 'Bezahlt', color: '#22C55E' },
  { v: 'overdue', label: 'Überfällig', color: '#DC2626' },
];

export default function ProjectsMgmtAdmin() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = async () => {
    const [p, c, cat] = await Promise.all([
      axios.get(`${BACKEND_URL}/api/admin/projects-mgmt`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/customers?limit=500`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/categories`, { headers: authHeaders() }),
    ]);
    setProjects(p.data.projects || []);
    setCustomers(c.data.customers || []);
    setCats(cat.data.categories || []);
  };
  useEffect(() => { load(); }, []);

  const empty = () => ({
    name: '', customer_id: '', category_id: '', description: '',
    start_date: '', deadline: '', status: 'planned', payment_status: 'unpaid',
    budget: null, paid_amount: 0, notes: '', tasks: [], files: [], assigned_to: [],
  });

  const openNew = () => { setEditing('new'); setForm(empty()); };
  const openEdit = (p) => { setEditing(p.id); setForm({ ...empty(), ...p }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.name) return alert('Name nötig');
    setSaving(true);
    try {
      const payload = { ...form, budget: form.budget === '' || form.budget === null ? null : parseFloat(form.budget), paid_amount: parseFloat(form.paid_amount || 0) };
      if (editing === 'new') {
        await axios.post(`${BACKEND_URL}/api/admin/projects-mgmt`, payload, { headers: authHeaders() });
      } else {
        await axios.patch(`${BACKEND_URL}/api/admin/projects-mgmt/${editing}`, payload, { headers: authHeaders() });
      }
      await load(); cancel();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Projekt löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/projects-mgmt/${id}`, { headers: authHeaders() });
    load();
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return alert('Max 25 MB');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/uploads`, fd, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      const f = res.data;
      setForm((cur) => ({
        ...cur,
        files: [...(cur.files || []), { id: f.id, name: f.name, url: f.url, size: f.size, data_url: '' }],
      }));
    } catch (e) {
      alert('Upload fehlgeschlagen: ' + (e.response?.data?.detail || e.message));
    }
  };

  // Uploaded files require an Authorization header (the endpoint is no longer
  // public), so a plain <a href> can't be used — fetch as a blob and trigger
  // the download from that instead.
  const downloadFile = async (f) => {
    if (!f.url) {
      if (f.data_url) window.open(f.data_url, '_blank');
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}${f.url}`, { headers: authHeaders(), responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = f.name || 'datei';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert('Download fehlgeschlagen: ' + (e.response?.data?.detail || e.message));
    }
  };

  const custMap = Object.fromEntries(customers.map((c) => [c.id, c]));
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
  const filtered = filterStatus === 'all' ? projects : projects.filter((p) => p.status === filterStatus);

  return (
    <AdminLayout
      title="Projektverwaltung"
      actions={<button data-testid="prj-new-btn" onClick={openNew} style={btnPrimary}><Plus size={16} />Neues Projekt</button>}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilterStatus('all')} style={filterStatus === 'all' ? btnPrimary : btnSecondary}>Alle ({projects.length})</button>
        {STATUS.map((s) => (
          <button key={s.v} onClick={() => setFilterStatus(s.v)} style={filterStatus === s.v ? btnPrimary : btnSecondary}>
            {s.label} ({projects.filter((p) => p.status === s.v).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }} data-testid="projects-list">
        {filtered.map((p) => {
          const st = STATUS.find((x) => x.v === p.status) || STATUS[0];
          const pay = PAYMENT.find((x) => x.v === p.payment_status) || PAYMENT[0];
          const taskDone = (p.tasks || []).filter((t) => t.done).length;
          const taskTotal = (p.tasks || []).length;
          return (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: st.color + '22', color: st.color, fontSize: 11 }}>{st.label}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: pay.color + '22', color: pay.color, fontSize: 11 }}>{pay.label}</span>
                  </div>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 6 }}>
                    {p.customer_id && custMap[p.customer_id] ? `Kunde: ${custMap[p.customer_id].name} · ` : ''}
                    {p.category_id && catMap[p.category_id] ? `${catMap[p.category_id].name} · ` : ''}
                    {p.deadline ? `Deadline: ${p.deadline} · ` : ''}
                    {p.budget ? `Budget: €${p.budget} · ` : ''}
                    {taskTotal > 0 ? `Aufgaben: ${taskDone}/${taskTotal} · ` : ''}
                    {p.files?.length ? `📎 ${p.files.length} Dateien` : ''}
                  </div>
                  {p.description && <div style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>{p.description}</div>}
                </div>
                <button onClick={() => openEdit(p)} style={btnSecondary}><Edit2 size={14} />Öffnen</button>
                <button onClick={() => remove(p.id)} style={btnDanger}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Keine Projekte.</div>}
      </div>

      {editing && form && (
        <div onClick={cancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', borderRadius: 16, padding: 24, width: 800, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{editing === 'new' ? 'Neues Projekt' : 'Projekt bearbeiten'}</h2>
              <button onClick={cancel} style={btnGhost}><X size={18} /></button>
            </div>

            <Field label="Projektname *"><input data-testid="prj-input-name" style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Kunde">
                <select style={input} value={form.customer_id || ''} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">– kein Kunde –</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Kategorie">
                <select style={input} value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">–</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Beschreibung"><textarea style={{ ...input, minHeight: 70 }} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <Field label="Start"><input style={input} type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
              <Field label="Deadline"><input style={input} type="date" value={form.deadline || ''} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
              <Field label="Budget (€)"><input style={input} type="number" value={form.budget ?? ''} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
              <Field label="Bezahlt (€)"><input style={input} type="number" value={form.paid_amount ?? 0} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Status">
                <select style={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Zahlung">
                <select style={input} value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
                  {PAYMENT.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Aufgaben">
              {(form.tasks || []).map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <button onClick={() => { const a = [...form.tasks]; a[i] = { ...a[i], done: !a[i].done }; setForm({ ...form, tasks: a }); }} style={{ ...btnGhost, padding: 4 }}>
                    {t.done ? <CheckSquare size={18} color="#22c55e" /> : <Square size={18} color="#888" />}
                  </button>
                  <input style={{ ...input, textDecoration: t.done ? 'line-through' : 'none' }} value={t.title || ''} onChange={(e) => { const a = [...form.tasks]; a[i] = { ...a[i], title: e.target.value }; setForm({ ...form, tasks: a }); }} placeholder="Aufgabe" />
                  <input style={{ ...input, maxWidth: 120 }} type="date" value={t.due_date || ''} onChange={(e) => { const a = [...form.tasks]; a[i] = { ...a[i], due_date: e.target.value }; setForm({ ...form, tasks: a }); }} />
                  <button onClick={() => setForm({ ...form, tasks: form.tasks.filter((_, j) => j !== i) })} style={btnDanger}><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, tasks: [...(form.tasks || []), { title: '', done: false }] })} style={btnSecondary}><Plus size={14} />Aufgabe hinzufügen</button>
            </Field>

            <Field label="Dateien">
              {(form.files || []).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6 }}>
                  <Paperclip size={14} />
                  <button
                    type="button"
                    onClick={() => downloadFile(f)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#FF8C32', fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', fontFamily: 'inherit' }}
                  >{f.name}</button>
                  <button onClick={() => setForm({ ...form, files: form.files.filter((_, j) => j !== i) })} style={btnDanger}><Trash2 size={14} /></button>
                </div>
              ))}
              <label style={{ ...btnSecondary, display: 'inline-flex', cursor: 'pointer' }}>
                <Upload size={14} /> Datei hochladen
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
              </label>
            </Field>

            <Field label="Notizen"><textarea style={{ ...input, minHeight: 100 }} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={cancel} style={btnSecondary}>Abbrechen</button>
              <button data-testid="prj-save-btn" onClick={save} disabled={saving} style={btnPrimary}><Save size={14} />{saving ? 'Speichert…' : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
