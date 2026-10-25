import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, Loader2, Users } from 'lucide-react';
import { BACKEND_URL, authHeaders, AdminShell, Section, Field, ImagePicker, input, btnPrimary, btnSecondary, btnDanger } from './_adminShared';

const EMPTY = { name: '', role: '', bio: '', image: '', linkedin: '', order: 0, published: true };

const TeamAdmin = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    const r = await fetch(`${BACKEND_URL}/api/admin/team/members`, { headers: authHeaders() });
    if (r.status === 401) return navigate('/zb-panel-8x2k/login');
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }, [navigate]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const save = async () => {
    if (!form.name.trim() || !form.role.trim()) return alert('Name und Rolle sind Pflicht.');
    setSaving(true);
    const url = editing === 'new' ? `${BACKEND_URL}/api/admin/team/members` : `${BACKEND_URL}/api/admin/team/members/${editing}`;
    const method = editing === 'new' ? 'POST' : 'PATCH';
    const payload = { ...form };
    if (editing === 'new') { delete payload.id; delete payload.created_at; }
    const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
    if (r.ok) { setEditing(null); fetchItems(); } else alert('Fehler beim Speichern');
    setSaving(false);
  };
  const del = async (m) => {
    if (!window.confirm(`"${m.name}" wirklich löschen?`)) return;
    await fetch(`${BACKEND_URL}/api/admin/team/members/${m.id}`, { method: 'DELETE', headers: authHeaders() });
    fetchItems();
  };
  const togglePublish = async (m) => {
    await fetch(`${BACKEND_URL}/api/admin/team/members/${m.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ published: !m.published }) });
    fetchItems();
  };

  if (editing) return (
    <AdminShell title={editing === 'new' ? 'Neues Team-Mitglied' : 'Mitglied bearbeiten'} actions={
      <>
        <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}</button>
      </>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Section title="Profil">
          <Field label="Name *"><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Rolle *"><input style={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="z.B. Head of Development" /></Field>
          <Field label="Bio"><textarea style={{ ...input, minHeight: '100px' }} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={800} /></Field>
          <Field label="LinkedIn-URL"><input style={input} value={form.linkedin || ''} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Reihenfolge"><input type="number" style={input} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></Field>
            <Field label="Veröffentlicht">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Sichtbar</span>
              </label>
            </Field>
          </div>
        </Section>
        <Section title="Foto"><ImagePicker value={form.image} onChange={(v) => setForm({ ...form, image: v })} /></Section>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminShell>
  );

  return (
    <AdminShell title="Team verwalten" subtitle={`${items.length} Mitglieder`}
      actions={<button onClick={() => { setForm(EMPTY); setEditing('new'); }} style={btnPrimary} data-testid="btn-new-team"><Plus size={16} /> Neues Mitglied</button>}
    >
      {loading ? <div style={{ padding: '60px', textAlign: 'center' }}>Lädt…</div> :
        items.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <Users size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 700 }}>Keine Mitglieder</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {items.map((m) => (
              <div key={m.id} style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1/1', background: '#111' }}>
                  {m.image && <img src={m.image} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{m.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--accent-primary)', margin: '4px 0 10px', fontWeight: 600 }}>{m.role}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.bio}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setForm({ ...EMPTY, ...m }); setEditing(m.id); }} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px' }}><Edit2 size={12} /> Bearbeiten</button>
                    <button onClick={() => togglePublish(m)} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px' }}>{m.published ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                    <button onClick={() => del(m)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px', marginLeft: 'auto' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </AdminShell>
  );
};
export default TeamAdmin;
