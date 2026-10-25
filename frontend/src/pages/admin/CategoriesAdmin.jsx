import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Save, X, Image as ImageIcon, Upload } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger, btnGhost, Field } from './_adminShared';

const ICON_OPTIONS = [
  'Code','Smartphone','Shield','Palette','Gamepad2','Bot','Server','TrendingUp','PenTool',
  'Database','Cloud','Globe','Cpu','Layers','Box','Briefcase','Award','Star','Zap','Sparkles',
];

export default function CategoriesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/categories`, { headers: authHeaders() });
      setItems(res.data.categories || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing('new');
    setForm({ name: '', slug: '', description: '', icon: 'Code', color: '#FF6B00', image: '', order: items.length, is_active: true });
  };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form?.name) return alert('Name fehlt');
    setSaving(true);
    try {
      if (editing === 'new') {
        await axios.post(`${BACKEND_URL}/api/admin/categories`, form, { headers: authHeaders() });
      } else {
        await axios.patch(`${BACKEND_URL}/api/admin/categories/${editing}`, form, { headers: authHeaders() });
      }
      await load(); cancel();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
    setSaving(false);
  };

  const removeCat = async (id) => {
    if (!window.confirm('Kategorie wirklich löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/categories/${id}`, { headers: authHeaders() });
    load();
  };

  const reorder = async (id, dir) => {
    const idx = items.findIndex((i) => i.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    const next = [...items];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setItems(next);
    await axios.post(`${BACKEND_URL}/api/admin/categories/reorder`, { order: next.map((i) => i.id) }, { headers: authHeaders() });
  };

  const toggleActive = async (c) => {
    await axios.patch(`${BACKEND_URL}/api/admin/categories/${c.id}`, { ...c, is_active: !c.is_active }, { headers: authHeaders() });
    load();
  };

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('Max 2 MB');
    const r = new FileReader();
    r.onload = (e) => setForm((f) => ({ ...f, image: e.target.result }));
    r.readAsDataURL(file);
  };

  return (
    <AdminLayout
      title="Kategorien"
      actions={<button data-testid="cat-new-btn" onClick={openNew} style={btnPrimary}><Plus size={16} />Neue Kategorie</button>}
    >
      {loading && <div style={{ color: '#888' }}>Lädt…</div>}
      <div data-testid="categories-list" style={{ display: 'grid', gap: 10 }}>
        {items.map((c, idx) => (
          <div key={c.id} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 16, display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button data-testid={`cat-up-${c.id}`} onClick={() => reorder(c.id, -1)} disabled={idx === 0} style={{ ...btnGhost, padding: 4 }}><ChevronUp size={16} /></button>
              <button data-testid={`cat-down-${c.id}`} onClick={() => reorder(c.id, 1)} disabled={idx === items.length - 1} style={{ ...btnGhost, padding: 4 }}><ChevronDown size={16} /></button>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: (c.color || '#FF6B00') + '22',
              border: `1px solid ${(c.color || '#FF6B00')}44`, display: 'grid', placeItems: 'center',
              overflow: 'hidden',
            }}>
              {c.image ? <img src={c.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color={c.color || '#FF6B00'} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <div style={{ color: '#888', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || '—'}</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>slug: {c.slug} · icon: {c.icon || '—'}</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.is_active ? '#22c55e' : '#ef4444', cursor: 'pointer' }}>
              <input data-testid={`cat-active-${c.id}`} type="checkbox" checked={c.is_active} onChange={() => toggleActive(c)} />
              {c.is_active ? 'Aktiv' : 'Inaktiv'}
            </label>
            <button data-testid={`cat-edit-${c.id}`} onClick={() => openEdit(c)} style={btnSecondary}><Edit2 size={14} />Bearbeiten</button>
            <button data-testid={`cat-del-${c.id}`} onClick={() => removeCat(c.id)} style={btnDanger}><Trash2 size={14} />Löschen</button>
          </div>
        ))}
        {!loading && items.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Keine Kategorien — füge die erste hinzu.</div>}
      </div>

      {editing && form && (
        <div onClick={cancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', borderRadius: 16, padding: 24, width: 560, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{editing === 'new' ? 'Neue Kategorie' : 'Kategorie bearbeiten'}</h2>
              <button onClick={cancel} style={btnGhost}><X size={18} /></button>
            </div>
            <Field label="Name *"><input data-testid="cat-input-name" style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Beschreibung"><textarea style={{ ...input, minHeight: 80 }} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Icon (Lucide)">
                <select style={input} value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                  {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Akzent-Farbe"><input style={input} type="text" value={form.color || ''} placeholder="#FF6B00" onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
            </div>
            <Field label="Bild (optional)">
              <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                {form.image ? <img src={form.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={36} color="#444" />}
              </div>
              <label style={{ ...btnSecondary, display: 'inline-flex', cursor: 'pointer' }}>
                <Upload size={14} /> Datei hochladen
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImage(e.target.files[0])} />
              </label>
              {form.image && <button onClick={() => setForm({ ...form, image: '' })} style={{ ...btnGhost, marginLeft: 8 }}>Entfernen</button>}
            </Field>
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
              <button data-testid="cat-save-btn" onClick={save} disabled={saving} style={btnPrimary}><Save size={14} />{saving ? 'Speichert…' : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
