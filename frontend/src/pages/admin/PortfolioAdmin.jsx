import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, X, Image as ImageIcon, Star, Eye, EyeOff,
  Upload, ArrowLeft, Save, Loader2, ExternalLink, Search, Grid3x3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EMPTY_PROJECT = {
  title: '',
  subtitle: '',
  slug: '',
  category: 'Webentwicklung',
  service_id: 'web-development',
  client: '',
  year: String(new Date().getFullYear()),
  duration: '',
  description: '',
  website_type: '',
  about_project: '',
  challenge: '',
  solution: '',
  outcome: '',
  process_steps: [],
  tags: [],
  tech_stack: [],
  tech_stack_detailed: [],
  metrics: [],
  cover_image: '',
  gallery: [],
  website_url: '',
  testimonial_quote: '',
  testimonial_author: '',
  testimonial_position: '',
  testimonial_rating: 5,
  testimonial_avatar: '',
  featured: false,
  published: true,
  order: 0,
};

const CATEGORIES = [
  'Webentwicklung',
  'App-Entwicklung',
  'Cyber Security',
  'UI/UX Design',
  'Gaming',
  'Chatbot & KI',
  'Server & Systeme',
  'Grafikdesign',
  'Marketing',
];

// Service-IDs müssen mit den Service-Seiten + Portfolio-Filter übereinstimmen
const SERVICE_IDS = [
  { id: 'web-development',  label: 'Webentwicklung' },
  { id: 'app-development',  label: 'App-Entwicklung' },
  { id: 'cyber-security',   label: 'Cyber Security' },
  { id: 'ui-ux',            label: 'UI/UX Design' },
  { id: 'gaming',           label: 'Gaming' },
  { id: 'chatbot',          label: 'Chatbot & KI' },
  { id: 'server',           label: 'Server & Systeme' },
  { id: 'graphic-design',   label: 'Grafikdesign' },
  { id: 'marketing',        label: 'Marketing & SEO' },
];

const PortfolioAdmin = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | projectId
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portfolio/projects`, { headers: authHeaders() });
      if (res.status === 401) {
        navigate('/zb-panel-8x2k/login');
        return;
      }
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const startEdit = async (pid) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portfolio/projects/${pid}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Coalesce any null/undefined string fields to '' so controlled inputs don't warn
        const sanitized = Object.fromEntries(
          Object.entries({ ...EMPTY_PROJECT, ...data }).map(([k, v]) => [k, v === null ? (Array.isArray(EMPTY_PROJECT[k]) ? [] : (typeof EMPTY_PROJECT[k] === 'string' ? '' : v)) : v])
        );
        setForm(sanitized);
        setEditing(pid);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (pid, title) => {
    if (!window.confirm(`Projekt "${title}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portfolio/projects/${pid}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (res.ok) {
        await fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePublished = async (p) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/portfolio/projects/${p.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ published: !p.published }),
      });
      await fetchProjects();
    } catch (e) { console.error(e); }
  };

  const toggleFeatured = async (p) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/portfolio/projects/${p.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ featured: !p.featured }),
      });
      await fetchProjects();
    } catch (e) { console.error(e); }
  };

  const saveForm = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      alert('Titel, Beschreibung und Kategorie sind Pflichtfelder.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      // remove server-only fields when creating
      if (editing === 'new') {
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;
      }
      const url = editing === 'new'
        ? `${BACKEND_URL}/api/admin/portfolio/projects`
        : `${BACKEND_URL}/api/admin/portfolio/projects/${editing}`;
      const method = editing === 'new' ? 'POST' : 'PATCH';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      if (res.ok) {
        setEditing(null);
        await fetchProjects();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Fehler: ${err.detail || res.statusText}`);
      }
    } catch (e) {
      alert(`Netzwerkfehler: ${e.message}`);
    }
    setSaving(false);
  };

  const handleFile = async (file, callback) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('Datei zu groß (max 25 MB). Bitte komprimieren oder URL verwenden.');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || res.statusText);
      const data = await res.json();
      callback(data.url);
    } catch (e) {
      alert('Upload fehlgeschlagen: ' + e.message);
    }
  };

  const filtered = projects.filter((p) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t) || (p.client || '').toLowerCase().includes(t);
  });

  // ========== EDITOR ==========
  if (editing) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <button onClick={() => setEditing(null)} style={btnGhost}>
              <ArrowLeft size={16} /> Zurück zur Liste
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
              <button onClick={saveForm} disabled={saving} style={btnPrimary}>
                {saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {editing === 'new' ? 'Neues Projekt' : 'Projekt bearbeiten'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Alle Inhalte werden auf der öffentlichen Portfolio-Seite angezeigt.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Grundinfos */}
            <Section title="Grundinformationen">
              <Field label="Titel *">
                <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. FinTech Dashboard" />
              </Field>
              <Field label="Untertitel">
                <input style={input} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="KI-gestützte Finanz-Analysen" />
              </Field>
              <Field label="Slug (URL)" hint="wird automatisch generiert, wenn leer">
                <input style={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="fintech-dashboard" />
              </Field>
              <Field label="Kategorie *">
                <select style={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Service-Zuordnung" hint="Bestimmt, auf welcher Service-Seite das Projekt als Beispiel erscheint">
                <select style={input} value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
                  {SERVICE_IDS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Kunde">
                <input style={input} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Musterfirma GmbH" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Jahr">
                  <input style={input} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2025" />
                </Field>
                <Field label="Dauer">
                  <input style={input} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="6 Monate" />
                </Field>
              </div>
              <Field label="🔗 Website-URL (Link zum Live-Projekt)" hint="Bei Klick auf das Projekt auf der Website öffnet sich diese URL in einem neuen Tab. Leer lassen für interne Detail-Seite.">
                <input
                  style={{ ...input, ...(form.website_url ? { borderColor: 'rgba(255, 107, 0, 0.5)' } : {}) }}
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  placeholder="https://kunden-website.de"
                  type="url"
                />
                {form.website_url && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a href={form.website_url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '12px', color: '#FF6B00', textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                      <ExternalLink size={12} /> URL testen
                    </a>
                  </div>
                )}
              </Field>
            </Section>

            {/* Beschreibungen */}
            <Section title="Beschreibungen">
              <Field label="Kurzbeschreibung *" hint="Max. 600 Zeichen, wird auf der Übersichtsseite angezeigt">
                <textarea style={{ ...input, minHeight: '80px' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={600} />
              </Field>
              <Field label="Website-Typ" hint="z.B. 'E-Commerce Plattform', 'Corporate Website', 'SaaS-Dashboard'">
                <input style={input} value={form.website_type} onChange={(e) => setForm({ ...form, website_type: e.target.value })} placeholder="E-Commerce Plattform" />
              </Field>
              <Field label="Über das Projekt (ausführlich)" hint="Wird im 'Über das Projekt'-Bereich auf der Detailseite angezeigt. Erkläre was für eine Website das ist und was sie kann.">
                <textarea style={{ ...input, minHeight: '120px' }} value={form.about_project} onChange={(e) => setForm({ ...form, about_project: e.target.value })} placeholder="Diese Website ist..." maxLength={2000} />
              </Field>
              <Field label="Die Herausforderung">
                <textarea style={{ ...input, minHeight: '90px' }} value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} />
              </Field>
              <Field label="Unsere Lösung">
                <textarea style={{ ...input, minHeight: '90px' }} value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} />
              </Field>
              <Field label="Das Ergebnis">
                <textarea style={{ ...input, minHeight: '90px' }} value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} />
              </Field>
            </Section>
          </div>

          {/* ===== VORGANG / PROCESS STEPS ===== */}
          <div style={{ marginTop: '24px' }}>
            <Section title="🔄 Vorgang / Projekt-Prozess">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Zeige Schritt für Schritt, wie das Projekt umgesetzt wurde (z.B. Analyse → Design → Entwicklung → Launch).
              </p>
              {form.process_steps.map((s, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '10px', marginBottom: '12px', alignItems: 'start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 107, 0, 0.15)', border: '1px solid rgba(255, 107, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B00', fontWeight: 700, marginTop: '4px' }}>
                    {idx + 1}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input style={input} placeholder="Schritt-Titel (z.B. Analyse & Konzept)" value={s.title} onChange={(e) => {
                      const copy = [...form.process_steps]; copy[idx] = { ...copy[idx], title: e.target.value }; setForm({ ...form, process_steps: copy });
                    }} />
                    <textarea style={{ ...input, minHeight: '60px' }} placeholder="Was wurde in diesem Schritt gemacht?" value={s.description} onChange={(e) => {
                      const copy = [...form.process_steps]; copy[idx] = { ...copy[idx], description: e.target.value }; setForm({ ...form, process_steps: copy });
                    }} />
                  </div>
                  <button onClick={() => setForm({ ...form, process_steps: form.process_steps.filter((_, i) => i !== idx) })} style={btnIcon} aria-label="Entfernen">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, process_steps: [...form.process_steps, { title: '', description: '', icon: '' }] })} style={btnSecondary} data-testid="btn-add-process-step">
                <Plus size={14} /> Vorgangsschritt hinzufügen
              </button>
            </Section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
            {/* Bilder */}
            <Section title="📸 Titelbild / Screenshot" >
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                Wird als Vorschau auf der Portfolio-Seite und auf den Service-Seiten angezeigt.
                Empfohlen: Screenshot der Website oder hochwertiges Hero-Bild (mind. 1200×800px).
              </p>
              <ImageInput value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} onFile={(f) => handleFile(f, (v) => setForm({ ...form, cover_image: v }))} />
            </Section>

            {/* Tags, Tech, Metrics */}
            <Section title="Tags & Tech-Stack">
              <Field label="Tags (kurze Schlagworte)">
                <TagEditor items={form.tags} onAdd={(v) => setForm({ ...form, tags: [...form.tags, v] })} onRemove={(i) => setForm({ ...form, tags: form.tags.filter((_, idx) => idx !== i) })} input={tagInput} setInput={setTagInput} placeholder="z.B. React" />
              </Field>
              <Field label="Tech-Stack (Schnell-Eingabe)" hint="Einfache Tags ohne Logos – schnelle Übersicht">
                <TagEditor items={form.tech_stack} onAdd={(v) => setForm({ ...form, tech_stack: [...form.tech_stack, v] })} onRemove={(i) => setForm({ ...form, tech_stack: form.tech_stack.filter((_, idx) => idx !== i) })} input={techInput} setInput={setTechInput} placeholder="z.B. PostgreSQL 16" />
              </Field>
            </Section>
          </div>

          {/* ===== TECH STACK WITH LOGOS ===== */}
          <div style={{ marginTop: '24px' }}>
            <Section title="🛠️ Tech-Stack mit Logos (Premium-Darstellung)">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Hier kannst du jede Technologie mit Logo eintragen. Logo-URL leer lassen, um automatisch von <code style={{ color: '#FF6B00' }}>simpleicons</code> zu laden (Slug = Tech-Name in Kleinbuchstaben, z.B. &quot;react&quot;).
              </p>
              {form.tech_stack_detailed.map((t, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', background: '#fff', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    {(() => {
                      const src = t.logo || (t.name ? `https://cdn.simpleicons.org/${t.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '');
                      return src ? <img src={src} alt={t.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} /> : <ImageIcon size={20} color="#999" />;
                    })()}
                  </div>
                  <input style={input} placeholder="Tech-Name (z.B. React)" value={t.name} onChange={(e) => {
                    const copy = [...form.tech_stack_detailed]; copy[idx] = { ...copy[idx], name: e.target.value }; setForm({ ...form, tech_stack_detailed: copy });
                  }} />
                  <input style={input} placeholder="Logo-URL (optional – sonst automatisch)" value={t.logo || ''} onChange={(e) => {
                    const copy = [...form.tech_stack_detailed]; copy[idx] = { ...copy[idx], logo: e.target.value }; setForm({ ...form, tech_stack_detailed: copy });
                  }} />
                  <button onClick={() => setForm({ ...form, tech_stack_detailed: form.tech_stack_detailed.filter((_, i) => i !== idx) })} style={btnIcon} aria-label="Entfernen">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, tech_stack_detailed: [...form.tech_stack_detailed, { name: '', logo: '' }] })} style={btnSecondary} data-testid="btn-add-tech-logo">
                <Plus size={14} /> Technologie mit Logo hinzufügen
              </button>
            </Section>
          </div>

          {/* Metrics */}
          <div style={{ marginTop: '24px' }}>
            <Section title="Ergebnis-Metriken">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Zahlen, die den Erfolg zeigen (z.B. &quot;+150% Conversion&quot;, &quot;3x schneller&quot;).
              </p>
              {form.metrics.map((m, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input style={input} placeholder="Wert (z.B. +150%)" value={m.value} onChange={(e) => {
                    const copy = [...form.metrics]; copy[idx] = { ...copy[idx], value: e.target.value }; setForm({ ...form, metrics: copy });
                  }} />
                  <input style={input} placeholder="Label (z.B. Conversion-Steigerung)" value={m.label} onChange={(e) => {
                    const copy = [...form.metrics]; copy[idx] = { ...copy[idx], label: e.target.value }; setForm({ ...form, metrics: copy });
                  }} />
                  <button onClick={() => setForm({ ...form, metrics: form.metrics.filter((_, i) => i !== idx) })} style={btnIcon} aria-label="Entfernen">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, metrics: [...form.metrics, { label: '', value: '' }] })} style={btnSecondary}>
                <Plus size={14} /> Metrik hinzufügen
              </button>
            </Section>
          </div>

          {/* Gallery */}
          <div style={{ marginTop: '24px' }}>
            <Section title="Galerie (weitere Bilder)">
              {form.gallery.map((img, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '50px', background: '#111', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                    {img && <img src={img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <input style={input} value={img} onChange={(e) => {
                    const copy = [...form.gallery]; copy[idx] = e.target.value; setForm({ ...form, gallery: copy });
                  }} placeholder="Bild-URL" />
                  <button onClick={() => setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== idx) })} style={btnIcon}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setForm({ ...form, gallery: [...form.gallery, ''] })} style={btnSecondary}>
                  <Plus size={14} /> URL hinzufügen
                </button>
                <label style={{ ...btnSecondary, cursor: 'pointer' }}>
                  <Upload size={14} /> Datei hochladen
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0], (v) => setForm({ ...form, gallery: [...form.gallery, v] }))} />
                </label>
              </div>
            </Section>
          </div>

          {/* Testimonial & flags */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
            <Section title="⭐ Kunden-Bewertung (für dieses Projekt)">
              <Field label="Bewertung (Sterne)">
                <select style={input} value={form.testimonial_rating || 5} onChange={(e) => setForm({ ...form, testimonial_rating: parseInt(e.target.value) })}>
                  <option value="5">★★★★★ (5 Sterne)</option>
                  <option value="4">★★★★☆ (4 Sterne)</option>
                  <option value="3">★★★☆☆ (3 Sterne)</option>
                  <option value="2">★★☆☆☆ (2 Sterne)</option>
                  <option value="1">★☆☆☆☆ (1 Stern)</option>
                </select>
              </Field>
              <Field label="Zitat (was der Kunde sagt)">
                <textarea style={{ ...input, minHeight: '90px' }} value={form.testimonial_quote} onChange={(e) => setForm({ ...form, testimonial_quote: e.target.value })} placeholder="Die Zusammenarbeit mit Zebick war..." />
              </Field>
              <Field label="Name des Kunden">
                <input style={input} value={form.testimonial_author} onChange={(e) => setForm({ ...form, testimonial_author: e.target.value })} placeholder="Max Mustermann" />
              </Field>
              <Field label="Position / Firma">
                <input style={input} value={form.testimonial_position} onChange={(e) => setForm({ ...form, testimonial_position: e.target.value })} placeholder="CTO – Musterfirma GmbH" />
              </Field>
              <Field label="Avatar / Foto-URL (optional)">
                <input style={input} value={form.testimonial_avatar} onChange={(e) => setForm({ ...form, testimonial_avatar: e.target.value })} placeholder="https://..." />
              </Field>
            </Section>

            <Section title="Sichtbarkeit">
              <label style={toggleLabel}>
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Veröffentlicht</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sichtbar auf der öffentlichen Portfolio-Seite</div>
                </div>
              </label>
              <label style={toggleLabel}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Featured</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wird im Spotlight-Bereich oben angezeigt</div>
                </div>
              </label>
              <Field label="Sortier-Reihenfolge">
                <input type="number" style={input} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </Field>
            </Section>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
            <button onClick={saveForm} disabled={saving} style={btnPrimary}>
              {saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}
            </button>
          </div>
        </div>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ========== LIST ==========
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <button onClick={() => navigate('/zb-panel-8x2k')} style={{ ...btnGhost, marginBottom: '12px' }}>
              <ArrowLeft size={14} /> Dashboard
            </button>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Portfolio verwalten
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
              {projects.length} Projekte · {projects.filter((p) => p.published).length} veröffentlicht · {projects.filter((p) => p.featured).length} featured
            </p>
          </div>
          <button onClick={() => { setForm(EMPTY_PROJECT); setEditing('new'); }} style={btnPrimary} data-testid="btn-new-project">
            <Plus size={16} /> Neues Projekt
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Projekte durchsuchen…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...input, paddingLeft: '40px', maxWidth: '400px' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Lädt…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <Grid3x3 size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 700 }}>
              {projects.length === 0 ? 'Noch keine Projekte' : 'Keine Treffer'}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              {projects.length === 0 ? 'Legen Sie Ihr erstes Projekt an.' : 'Versuchen Sie einen anderen Suchbegriff.'}
            </p>
            {projects.length === 0 && (
              <button onClick={() => { setForm(EMPTY_PROJECT); setEditing('new'); }} style={btnPrimary}>
                <Plus size={16} /> Erstes Projekt anlegen
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map((p) => (
              <div key={p.id} style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', background: '#111' }}>
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    {p.featured && (
                      <div style={{ padding: '4px 10px', background: 'rgba(255,107,0,0.9)', color: '#000', fontSize: '11px', fontWeight: 700, borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={10} /> Featured
                      </div>
                    )}
                    {!p.published && (
                      <div style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', fontWeight: 600, borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        Entwurf
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    {p.category}{p.year ? ` · ${p.year}` : ''}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.01em' }}>{p.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => startEdit(p.id)} style={btnAction}>
                      <Edit2 size={13} /> Bearbeiten
                    </button>
                    <button onClick={() => togglePublished(p)} style={btnAction} title={p.published ? 'Verbergen' : 'Veröffentlichen'}>
                      {p.published ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={() => toggleFeatured(p)} style={{ ...btnAction, color: p.featured ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      <Star size={13} fill={p.featured ? 'var(--accent-primary)' : 'none'} />
                    </button>
                    <a href={`/portfolio/${p.slug}`} target="_blank" rel="noreferrer" style={btnAction} title="Öffnen">
                      <ExternalLink size={13} />
                    </a>
                    <button onClick={() => handleDelete(p.id, p.title)} style={{ ...btnAction, color: '#ff6b6b', marginLeft: 'auto' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============ Small components ============

const Section = ({ title, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)', padding: '24px',
  }}>
    <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{title}</h2>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.02em' }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{hint}</div>}
  </div>
);

const ImageInput = ({ value, onChange, onFile }) => (
  <>
    <div style={{ aspectRatio: '16/10', background: '#111', borderRadius: 'var(--radius-md)', marginBottom: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {value ? <img src={value} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={40} color="var(--text-muted)" />}
    </div>
    <input style={input} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Bild-URL eingeben…" />
    <div style={{ marginTop: '10px' }}>
      <label style={{ ...btnSecondary, cursor: 'pointer', display: 'inline-flex' }}>
        <Upload size={14} /> Datei hochladen (max 4 MB)
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files[0])} />
      </label>
    </div>
  </>
);

const TagEditor = ({ items, onAdd, onRemove, input: inp, setInput, placeholder }) => {
  const add = () => {
    const v = inp.trim();
    if (!v) return;
    onAdd(v);
    setInput('');
  };
  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', minHeight: '32px' }}>
        {items.map((t, idx) => (
          <span key={idx} style={{ padding: '6px 12px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', color: 'var(--accent-primary)', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {t}
            <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={input} value={inp} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder={placeholder} />
        <button onClick={add} style={btnSecondary}>Hinzufügen</button>
      </div>
    </>
  );
};

// ============ styles ============
const input = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  color: '#fff', fontSize: '14px', fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.2s',
};
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '11px 20px', background: 'var(--accent-primary)', color: '#000',
  border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s',
};
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 12px', background: 'transparent', color: 'var(--text-muted)',
  border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
};
const btnIcon = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '36px', height: '38px',
  background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
};
const btnAction = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '7px 11px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  textDecoration: 'none',
};
const toggleLabel = {
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '12px', background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  cursor: 'pointer', marginBottom: '10px',
};

export default PortfolioAdmin;
