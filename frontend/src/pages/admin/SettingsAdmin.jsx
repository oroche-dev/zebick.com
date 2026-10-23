import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Upload, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, Field } from './_adminShared';

export default function SettingsAdmin() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/settings`, { headers: authHeaders() });
        setForm(res.data || {});
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const handleLogo = (file) => {
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) return alert('Logo max 1 MB');
    const r = new FileReader();
    r.onload = (e) => setForm((f) => ({ ...f, logo_url: e.target.result }));
    r.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { id, _id, created_at, updated_at, ...payload } = form;
      await axios.put(`${BACKEND_URL}/api/admin/settings`, payload, { headers: authHeaders() });
      setSavedMsg('✓ Gespeichert');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
    setSaving(false);
  };

  if (loading) return <AdminLayout title="Einstellungen"><div style={{ color: '#888' }}>Lädt…</div></AdminLayout>;

  return (
    <AdminLayout
      title="Einstellungen"
      actions={<>
        {savedMsg && <span style={{ color: '#22c55e', fontSize: 13, alignSelf: 'center' }}>{savedMsg}</span>}
        <button data-testid="settings-save-btn" onClick={save} disabled={saving} style={btnPrimary}><Save size={16} />{saving ? 'Speichert…' : 'Speichern'}</button>
      </>}
    >
      <div style={{ display: 'grid', gap: 20, maxWidth: 900 }}>
        <Section title="Firma">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="Firmenname"><input data-testid="settings-company" style={input} value={form.company_name || ''} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></Field>
            <Field label="Sprache"><select style={input} value={form.language || 'de'} onChange={(e) => setForm({ ...form, language: e.target.value })}><option value="de">Deutsch</option><option value="en">English</option></select></Field>
          </div>
          <Field label="Logo">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ width: 120, height: 80, background: '#000', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {form.logo_url ? <img src={form.logo_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <ImageIcon size={30} color="#444" />}
              </div>
              <label style={{ ...btnSecondary, display: 'inline-flex', cursor: 'pointer' }}>
                <Upload size={14} /> Logo hochladen
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogo(e.target.files[0])} />
              </label>
              {form.logo_url && <button onClick={() => setForm({ ...form, logo_url: '' })} style={btnSecondary}>Entfernen</button>}
            </div>
          </Field>
        </Section>

        <Section title="Farben">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Primärfarbe">
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="color" style={{ width: 50, height: 44, padding: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: 'transparent' }} value={form.primary_color || '#FF6B00'} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
                <input style={input} value={form.primary_color || '#FF6B00'} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </Field>
            <Field label="Sekundärfarbe">
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="color" style={{ width: 50, height: 44, padding: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: 'transparent' }} value={form.secondary_color || '#000000'} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
                <input style={input} value={form.secondary_color || ''} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Kontakt">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="E-Mail"><input style={input} value={form.contact_email || ''} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></Field>
            <Field label="Telefon"><input style={input} value={form.contact_phone || ''} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></Field>
            <Field label="WhatsApp-Link"><input style={input} value={form.whatsapp_link || ''} placeholder="https://wa.me/49..." onChange={(e) => setForm({ ...form, whatsapp_link: e.target.value })} /></Field>
          </div>
        </Section>

        <Section title="Social Media">
          <p style={{ color: '#888', fontSize: 12, margin: '0 0 14px', lineHeight: 1.6 }}>
            Diese Links erscheinen automatisch in <strong style={{ color: '#FF6B00' }}>allen E-Mail-Templates</strong> (Footer-Icons) und im <strong style={{ color: '#FF6B00' }}>Website-Footer</strong>. Leer lassen = wird ausgeblendet.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="LinkedIn"><input data-testid="settings-social-linkedin" style={input} placeholder="https://linkedin.com/company/zebick" value={form.social_linkedin || ''} onChange={(e) => setForm({ ...form, social_linkedin: e.target.value })} /></Field>
            <Field label="X / Twitter"><input data-testid="settings-social-twitter" style={input} placeholder="https://twitter.com/zebick" value={form.social_twitter || ''} onChange={(e) => setForm({ ...form, social_twitter: e.target.value })} /></Field>
            <Field label="Instagram"><input data-testid="settings-social-instagram" style={input} placeholder="https://instagram.com/zebick" value={form.social_instagram || ''} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} /></Field>
            <Field label="Facebook"><input data-testid="settings-social-facebook" style={input} placeholder="https://facebook.com/zebick" value={form.social_facebook || ''} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} /></Field>
            <Field label="YouTube"><input data-testid="settings-social-youtube" style={input} placeholder="https://youtube.com/@zebick" value={form.social_youtube || ''} onChange={(e) => setForm({ ...form, social_youtube: e.target.value })} /></Field>
            <Field label="TikTok"><input data-testid="settings-social-tiktok" style={input} placeholder="https://tiktok.com/@zebick" value={form.social_tiktok || ''} onChange={(e) => setForm({ ...form, social_tiktok: e.target.value })} /></Field>
            <Field label="GitHub"><input data-testid="settings-social-github" style={input} placeholder="https://github.com/zebick" value={form.social_github || ''} onChange={(e) => setForm({ ...form, social_github: e.target.value })} /></Field>
            <Field label="Xing"><input data-testid="settings-social-xing" style={input} placeholder="https://xing.com/profile/zebick" value={form.social_xing || ''} onChange={(e) => setForm({ ...form, social_xing: e.target.value })} /></Field>
          </div>
        </Section>

        <Section title="Rechtliches">
          <Field label="Impressum"><textarea style={{ ...input, minHeight: 100 }} value={form.impressum_text || ''} onChange={(e) => setForm({ ...form, impressum_text: e.target.value })} /></Field>
          <Field label="Datenschutz"><textarea style={{ ...input, minHeight: 100 }} value={form.datenschutz_text || ''} onChange={(e) => setForm({ ...form, datenschutz_text: e.target.value })} /></Field>
        </Section>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 22 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a9a9a', margin: '0 0 16px' }}>{title}</h2>
      {children}
    </div>
  );
}
