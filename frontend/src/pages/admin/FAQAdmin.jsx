import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, Loader2, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { BACKEND_URL, authHeaders, AdminShell, Section, Field, input, btnPrimary, btnSecondary, btnDanger } from './_adminShared';

const EMPTY = { question: '', answer: '', category: 'Allgemein', order: 0, published: true };

const FAQAdmin = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    const r = await fetch(`${BACKEND_URL}/api/admin/faq/items`, { headers: authHeaders() });
    if (r.status === 401) return navigate('/zb-panel-8x2k/login');
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }, [navigate]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return alert('Frage und Antwort sind Pflicht.');
    setSaving(true);
    const url = editing === 'new' ? `${BACKEND_URL}/api/admin/faq/items` : `${BACKEND_URL}/api/admin/faq/items/${editing}`;
    const method = editing === 'new' ? 'POST' : 'PATCH';
    const payload = { ...form };
    if (editing === 'new') { delete payload.id; delete payload.created_at; }
    const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
    if (r.ok) { setEditing(null); fetchItems(); } else alert('Fehler beim Speichern');
    setSaving(false);
  };
  const del = async (f) => {
    if (!window.confirm('Wirklich löschen?')) return;
    await fetch(`${BACKEND_URL}/api/admin/faq/items/${f.id}`, { method: 'DELETE', headers: authHeaders() });
    fetchItems();
  };
  const toggle = async (f) => {
    await fetch(`${BACKEND_URL}/api/admin/faq/items/${f.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ published: !f.published }) });
    fetchItems();
  };

  if (editing) return (
    <AdminShell title={editing === 'new' ? 'Neue FAQ' : 'FAQ bearbeiten'} actions={
      <>
        <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}</button>
      </>
    }>
      <Section title="Frage &amp; Antwort">
        <Field label="Frage *"><input style={input} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></Field>
        <Field label="Antwort *" hint="Zeilenumbrüche sind erlaubt"><textarea style={{ ...input, minHeight: '140px' }} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} maxLength={4000} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <Field label="Kategorie"><input style={input} value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Reihenfolge"><input type="number" style={input} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></Field>
          <Field label="Veröffentlicht">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <span style={{ fontSize: '13px' }}>Sichtbar</span>
            </label>
          </Field>
        </div>
      </Section>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminShell>
  );

  return (
    <AdminShell title="FAQ verwalten" subtitle={`${items.length} Fragen`}
      actions={<button onClick={() => { setForm(EMPTY); setEditing('new'); }} style={btnPrimary} data-testid="btn-new-faq"><Plus size={16} /> Neue Frage</button>}>
      {loading ? <div style={{ padding: '60px', textAlign: 'center' }}>Lädt…</div> :
        items.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <HelpCircle size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Noch keine FAQ</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((f) => (
              <div key={f.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {f.category && <div style={{ fontSize: '10px', color: 'var(--accent-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>{f.category}</div>}
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>{f.question}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line' }}>{f.answer}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => { setForm({ ...EMPTY, ...f }); setEditing(f.id); }} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px' }}><Edit2 size={12} /></button>
                    <button onClick={() => toggle(f)} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px' }}>{f.published ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                    <button onClick={() => del(f)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px' }}><Trash2 size={12} /></button>
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
export default FAQAdmin;
