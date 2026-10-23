import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Save, Loader2, Search, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { BACKEND_URL, authHeaders, AdminShell, Section, Field, ImagePicker, input, btnPrimary, btnSecondary, btnGhost, btnDanger } from './_adminShared';

const CATEGORIES = ['Development', 'Cyber Security', 'Datenschutz', 'Design', 'Business', 'Tutorial'];
const EMPTY = {
  title: '', excerpt: '', content: '', author: '', category: 'Development',
  tags: [], cover_image: '', read_time: '5 min', slug: '', published: true, featured: false,
};

const BlogAdmin = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');

  const fetchPosts = useCallback(async () => {
    const r = await fetch(`${BACKEND_URL}/api/admin/blog/posts`, { headers: authHeaders() });
    if (r.status === 401) return navigate('/zb-panel-8x2k/login');
    if (r.ok) setPosts(await r.json());
    setLoading(false);
  }, [navigate]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = async (id) => {
    const r = await fetch(`${BACKEND_URL}/api/admin/blog/posts/${id}`, { headers: authHeaders() });
    if (r.ok) { setForm({ ...EMPTY, ...(await r.json()) }); setEditing(id); }
  };
  const del = async (p) => {
    if (!window.confirm(`Artikel "${p.title}" wirklich löschen?`)) return;
    await fetch(`${BACKEND_URL}/api/admin/blog/posts/${p.id}`, { method: 'DELETE', headers: authHeaders() });
    fetchPosts();
  };
  const toggle = async (p, key) => {
    await fetch(`${BACKEND_URL}/api/admin/blog/posts/${p.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ [key]: !p[key] }) });
    fetchPosts();
  };
  const save = async () => {
    if (!form.title.trim() || !form.excerpt.trim()) { alert('Titel und Excerpt sind Pflicht.'); return; }
    setSaving(true);
    const url = editing === 'new' ? `${BACKEND_URL}/api/admin/blog/posts` : `${BACKEND_URL}/api/admin/blog/posts/${editing}`;
    const method = editing === 'new' ? 'POST' : 'PATCH';
    const payload = { ...form };
    if (editing === 'new') { delete payload.id; delete payload.published_at; delete payload.updated_at; }
    const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
    if (r.ok) { setEditing(null); fetchPosts(); }
    else { const e = await r.json().catch(() => ({})); alert(`Fehler: ${e.detail || r.statusText}`); }
    setSaving(false);
  };

  const filtered = posts.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase()));

  if (editing) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={() => setEditing(null)} style={btnGhost}><ArrowLeft size={16} /> Zurück</button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
              <button onClick={save} disabled={saving} style={btnPrimary}>
                {saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}
              </button>
            </div>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px' }}>{editing === 'new' ? 'Neuer Blog-Artikel' : 'Artikel bearbeiten'}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Inhalt unterstützt Markdown (## Überschrift, **fett**, Listen, Code).</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <Section title="Grundinformationen">
              <Field label="Titel *"><input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label="Excerpt (Kurzbeschreibung) *" hint="Max 500 Zeichen">
                <textarea style={{ ...input, minHeight: '80px' }} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} maxLength={500} />
              </Field>
              <Field label="Autor"><input style={input} value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
              <Field label="Kategorie">
                <select style={input} value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Field label="Lesezeit"><input style={input} value={form.read_time || ''} onChange={(e) => setForm({ ...form, read_time: e.target.value })} placeholder="5 min" /></Field>
                <Field label="Slug (URL)" hint="auto, wenn leer"><input style={input} value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
              </div>
            </Section>

            <Section title="Titelbild">
              <ImagePicker value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} />
            </Section>
          </div>

          <Section title="Artikel-Inhalt (Markdown)">
            <textarea
              style={{ ...input, minHeight: '420px', fontFamily: 'monospace', fontSize: '13.5px', lineHeight: 1.6 }}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={`## Einleitung\n\nHier der Haupttext…\n\n### Unterpunkt\n\n- Liste\n- **fett**\n- _kursiv_`}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Tipp: `## Titel`, `**fett**`, `- Liste`, `[Link](url)`, `&gt; Zitat`, ``` Code-Block ``` 
            </div>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <Section title="Tags">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '28px', marginBottom: '10px' }}>
                {form.tags.map((t, i) => (
                  <span key={i} style={{ padding: '5px 10px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', color: 'var(--accent-primary)', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {t}
                    <button onClick={() => setForm({ ...form, tags: form.tags.filter((_, x) => x !== i) })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input style={input} value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) { setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput(''); } } }}
                  placeholder="Tag eingeben…" />
                <button onClick={() => { if (tagInput.trim()) { setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput(''); } }} style={btnSecondary}>Hinzufügen</button>
              </div>
            </Section>

            <Section title="Sichtbarkeit">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Veröffentlicht</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sichtbar im Blog</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Featured</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Groß oben angezeigt</div>
                </div>
              </label>
            </Section>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
            <button onClick={save} disabled={saving} style={btnPrimary}>
              {saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}
            </button>
          </div>
        </div>
        <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <AdminShell
      title="Blog verwalten"
      subtitle={`${posts.length} Artikel · ${posts.filter((p) => p.published).length} veröffentlicht`}
      actions={<button onClick={openNew} style={btnPrimary} data-testid="btn-new-post"><Plus size={16} /> Neuer Artikel</button>}
    >
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input placeholder="Artikel suchen…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...input, paddingLeft: '40px', maxWidth: '400px' }} />
      </div>

      {loading ? <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Lädt…</div> :
        filtered.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <FileText size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 700 }}>Noch keine Artikel</h3>
            <button onClick={openNew} style={btnPrimary}><Plus size={16} /> Ersten Artikel anlegen</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map((p) => (
              <div key={p.id} style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', background: '#111' }}>
                  {p.cover_image && <img src={p.cover_image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    {p.featured && <span style={{ padding: '3px 9px', background: 'rgba(255,107,0,0.9)', color: '#000', fontSize: '10px', fontWeight: 700, borderRadius: '999px' }}>FEATURED</span>}
                    {!p.published && <span style={{ padding: '3px 9px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '10px', fontWeight: 600, borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)' }}>Entwurf</span>}
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{p.category}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{p.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button onClick={() => openEdit(p.id)} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px' }}><Edit2 size={12} /> Bearbeiten</button>
                    <button onClick={() => toggle(p, 'published')} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px' }}>{p.published ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                    <button onClick={() => toggle(p, 'featured')} style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px', color: p.featured ? 'var(--accent-primary)' : 'var(--text-muted)' }}><Star size={12} fill={p.featured ? 'var(--accent-primary)' : 'none'} /></button>
                    <a href={`/blog`} target="_blank" rel="noreferrer" style={{ ...btnSecondary, padding: '6px 10px', fontSize: '11px', textDecoration: 'none' }}><ExternalLink size={12} /></a>
                    <button onClick={() => del(p)} style={{ ...btnDanger, padding: '6px 10px', fontSize: '11px', marginLeft: 'auto' }}><Trash2 size={12} /></button>
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

export default BlogAdmin;
