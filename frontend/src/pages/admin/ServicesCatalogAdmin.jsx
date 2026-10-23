import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger, btnGhost, Field } from './_adminShared';

const emptyService = (cid = '') => ({
  category_id: cid, title: '', description: '',
  price_from: null, duration: '', image: '', icon: '',
  benefits: [], faqs: [], cta_label: '', cta_url: '',
  order: 0, is_active: true,
});

export default function ServicesCatalogAdmin() {
  const [cats, setCats] = useState([]);
  const [services, setServices] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [c, s] = await Promise.all([
      axios.get(`${BACKEND_URL}/api/admin/categories`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/services`, { headers: authHeaders() }),
    ]);
    setCats(c.data.categories || []);
    setServices(s.data.services || []);
  };
  useEffect(() => { load(); }, []);

  const filtered = activeCat === 'all' ? services : services.filter((s) => s.category_id === activeCat);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('Max 2 MB');
    const r = new FileReader();
    r.onload = (e) => setForm((f) => ({ ...f, image: e.target.result }));
    r.readAsDataURL(file);
  };

  const openNew = () => {
    if (cats.length === 0) return alert('Bitte zuerst Kategorie anlegen');
    setEditing('new');
    setForm(emptyService(activeCat === 'all' ? cats[0].id : activeCat));
  };
  const openEdit = (s) => { setEditing(s.id); setForm({ ...s, benefits: s.benefits || [], faqs: s.faqs || [] }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.title || !form.category_id) return alert('Titel & Kategorie nötig');
    setSaving(true);
    try {
      const payload = { ...form, price_from: form.price_from === '' ? null : (form.price_from === null ? null : parseFloat(form.price_from)) };
      if (editing === 'new') {
        await axios.post(`${BACKEND_URL}/api/admin/services`, payload, { headers: authHeaders() });
      } else {
        await axios.patch(`${BACKEND_URL}/api/admin/services/${editing}`, payload, { headers: authHeaders() });
      }
      await load(); cancel();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
    setSaving(false);
  };

  const removeSrv = async (id) => {
    if (!window.confirm('Service löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/services/${id}`, { headers: authHeaders() });
    load();
  };

  return (
    <AdminLayout
      title="Services & Leistungen"
      actions={<button data-testid="srv-new-btn" onClick={openNew} style={btnPrimary}><Plus size={16} />Neue Leistung</button>}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button data-testid="srv-filter-all" onClick={() => setActiveCat('all')} style={activeCat === 'all' ? btnPrimary : btnSecondary}>Alle ({services.length})</button>
        {cats.map((c) => (
          <button key={c.id} data-testid={`srv-filter-${c.slug}`} onClick={() => setActiveCat(c.id)} style={activeCat === c.id ? btnPrimary : btnSecondary}>
            {c.name} ({services.filter((s) => s.category_id === c.id).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }} data-testid="services-list">
        {filtered.map((s) => (
          <div key={s.id} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 14, display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 10, background: '#000', overflow: 'hidden', flexShrink: 0 }}>
              {s.image ? <img src={s.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</span>
                <span style={{ padding: '2px 8px', background: 'rgba(255,107,0,0.15)', color: '#FF8C32', fontSize: 11, borderRadius: 6 }}>{catMap[s.category_id]?.name || '—'}</span>
                {!s.is_active && <span style={{ color: '#ef4444', fontSize: 11 }}>Inaktiv</span>}
              </div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description || '—'}</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                {s.price_from ? `ab €${s.price_from}` : ''} {s.duration ? `· ${s.duration}` : ''} {s.benefits?.length ? `· ${s.benefits.length} Vorteile` : ''} {s.faqs?.length ? `· ${s.faqs.length} FAQs` : ''}
              </div>
            </div>
            <button data-testid={`srv-edit-${s.id}`} onClick={() => openEdit(s)} style={btnSecondary}><Edit2 size={14} />Bearbeiten</button>
            <button data-testid={`srv-del-${s.id}`} onClick={() => removeSrv(s.id)} style={btnDanger}><Trash2 size={14} /></button>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Keine Services in dieser Kategorie.</div>}
      </div>

      {editing && form && (
        <div onClick={cancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', borderRadius: 16, padding: 24, width: 700, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{editing === 'new' ? 'Neue Leistung' : 'Leistung bearbeiten'}</h2>
              <button onClick={cancel} style={btnGhost}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <Field label="Titel *"><input data-testid="srv-input-title" style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label="Kategorie *">
                <select style={input} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Beschreibung"><textarea style={{ ...input, minHeight: 80 }} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Preis ab (€)"><input style={input} type="number" value={form.price_from ?? ''} onChange={(e) => setForm({ ...form, price_from: e.target.value })} /></Field>
              <Field label="Dauer"><input style={input} value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="z. B. 4-6 Wochen" /></Field>
            </div>
            <Field label="Bild">
              <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                {form.image ? <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={36} color="#444" />}
              </div>
              <label style={{ ...btnSecondary, display: 'inline-flex', cursor: 'pointer' }}>
                <Upload size={14} /> Datei hochladen
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImage(e.target.files[0])} />
              </label>
            </Field>

            <Field label="Vorteile">
              {(form.benefits || []).map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input style={input} value={b} onChange={(e) => { const a = [...form.benefits]; a[i] = e.target.value; setForm({ ...form, benefits: a }); }} />
                  <button onClick={() => setForm({ ...form, benefits: form.benefits.filter((_, j) => j !== i) })} style={btnDanger}><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, benefits: [...(form.benefits || []), ''] })} style={btnSecondary}><Plus size={14} />Vorteil hinzufügen</button>
            </Field>

            <Field label="FAQ">
              {(form.faqs || []).map((f, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                  <input style={{ ...input, marginBottom: 6 }} placeholder="Frage" value={f.question || ''} onChange={(e) => { const a = [...form.faqs]; a[i] = { ...a[i], question: e.target.value }; setForm({ ...form, faqs: a }); }} />
                  <textarea style={{ ...input, minHeight: 50 }} placeholder="Antwort" value={f.answer || ''} onChange={(e) => { const a = [...form.faqs]; a[i] = { ...a[i], answer: e.target.value }; setForm({ ...form, faqs: a }); }} />
                  <button onClick={() => setForm({ ...form, faqs: form.faqs.filter((_, j) => j !== i) })} style={{ ...btnDanger, marginTop: 6 }}><Trash2 size={14} />Entfernen</button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, faqs: [...(form.faqs || []), { question: '', answer: '' }] })} style={btnSecondary}><Plus size={14} />FAQ hinzufügen</button>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="CTA Label"><input style={input} value={form.cta_label || ''} placeholder="z. B. Jetzt anfragen" onChange={(e) => setForm({ ...form, cta_label: e.target.value })} /></Field>
              <Field label="CTA URL"><input style={input} value={form.cta_url || ''} placeholder="/contact" onChange={(e) => setForm({ ...form, cta_url: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Reihenfolge"><input style={input} type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value || '0') })} /></Field>
              <Field label="Status">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 11, color: '#ccc', fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Aktiv
                </label>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={cancel} style={btnSecondary}>Abbrechen</button>
              <button data-testid="srv-save-btn" onClick={save} disabled={saving} style={btnPrimary}><Save size={14} />{saving ? 'Speichert…' : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
