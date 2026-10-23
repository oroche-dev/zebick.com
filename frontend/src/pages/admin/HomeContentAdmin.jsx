import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { BACKEND_URL, authHeaders, AdminShell, Section, Field, input, btnPrimary, btnSecondary } from './_adminShared';

const FIELDS = [
  { section: 'Hero-Bereich', items: [
    { key: 'hero_badge', label: 'Badge-Text', hint: 'Kleiner Text über dem Titel' },
    { key: 'hero_title_line1', label: 'Titel Zeile 1' },
    { key: 'hero_title_line2', label: 'Titel Zeile 2 (Orange)' },
    { key: 'hero_description', label: 'Beschreibung', type: 'textarea' },
    { key: 'hero_cta_primary', label: 'Haupt-Button Text' },
    { key: 'hero_cta_secondary', label: 'Sekundär-Button Text' },
  ]},
  { section: 'Statistiken', items: [
    { key: 'stats_projects', label: 'Projekte' },
    { key: 'stats_clients', label: 'Kunden' },
    { key: 'stats_years', label: 'Jahre' },
    { key: 'stats_countries', label: 'Länder' },
  ]},
  { section: 'Call-to-Action (unten)', items: [
    { key: 'cta_title', label: 'CTA-Titel' },
    { key: 'cta_description', label: 'CTA-Beschreibung', type: 'textarea' },
    { key: 'cta_button', label: 'CTA-Button-Text' },
  ]},
];

const HomeContentAdmin = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${BACKEND_URL}/api/admin/content/home`, { headers: authHeaders() });
      if (r.status === 401) return navigate('/zb-panel-8x2k/login');
      if (r.ok) setContent(await r.json());
      setLoading(false);
    })();
  }, [navigate]);

  const save = async () => {
    setSaving(true); setSaved(false);
    const r = await fetch(`${BACKEND_URL}/api/admin/content/home`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(content) });
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else alert('Fehler beim Speichern');
    setSaving(false);
  };

  return (
    <AdminShell
      title="Home-Inhalt bearbeiten"
      subtitle="Hero, Stats und CTA-Texte der Startseite anpassen"
      actions={
        <>
          {saved && <span style={{ color: 'var(--accent-primary)', fontSize: '13px', alignSelf: 'center' }}>✓ Gespeichert</span>}
          <button onClick={save} disabled={saving || loading} style={btnPrimary}>
            {saving ? <><Loader2 size={16} className="spin" /> Speichert…</> : <><Save size={16} /> Speichern</>}
          </button>
        </>
      }
    >
      {loading ? <div style={{ padding: '60px', textAlign: 'center' }}>Lädt…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {FIELDS.map((sec) => (
            <Section key={sec.section} title={sec.section}>
              {sec.items.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  {f.type === 'textarea' ? (
                    <textarea style={{ ...input, minHeight: '80px' }} value={content[f.key] || ''} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} />
                  ) : (
                    <input style={input} value={content[f.key] || ''} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} />
                  )}
                </Field>
              ))}
            </Section>
          ))}
        </div>
      )}
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminShell>
  );
};
export default HomeContentAdmin;
