import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Save, Plus, Trash2, Loader2, Star, Sparkles, Calculator, Layers, Building2, Image as ImageIcon,
} from 'lucide-react';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger } from './_adminShared';

const API = `${BACKEND_URL}/api`;

// ---- Default Pricing Tier ----
const newTier = () => ({ name: 'Neues Paket', price: 'ab 0€', tag: '', highlight: false, features: [''] });

const PricingEditor = ({ data, onChange }) => {
  const tiers = data.pricing || [];
  const setField = (field, val) => onChange({ ...data, [field]: val });
  const setTier = (i, patch) => {
    const next = [...tiers];
    next[i] = { ...next[i], ...patch };
    onChange({ ...data, pricing: next });
  };
  const addTier = () => onChange({ ...data, pricing: [...tiers, newTier()] });
  const delTier = (i) => onChange({ ...data, pricing: tiers.filter((_, j) => j !== i) });

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '14px', alignItems: 'center' }}>
        <label style={{ fontSize: '13px', color: '#9a9a9a', fontWeight: 600 }}>Sektion sichtbar?</label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={!!data.pricing_enabled}
            onChange={(e) => setField('pricing_enabled', e.target.checked)}
            data-testid="pricing-enabled-toggle"
            style={{ accentColor: '#FF6B00' }}
          />
          <span style={{ fontSize: '13px', color: '#e5e5e5' }}>Auf öffentlicher Service-Seite anzeigen</span>
        </label>
      </div>
      <div>
        <label style={{ fontSize: '13px', color: '#9a9a9a', fontWeight: 600, display: 'block', marginBottom: 6 }}>Überschrift</label>
        <input style={input} value={data.pricing_heading || ''} onChange={(e) => setField('pricing_heading', e.target.value)} data-testid="pricing-heading" />
      </div>
      <div>
        <label style={{ fontSize: '13px', color: '#9a9a9a', fontWeight: 600, display: 'block', marginBottom: 6 }}>Untertitel</label>
        <textarea style={{ ...input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={data.pricing_subtitle || ''} onChange={(e) => setField('pricing_subtitle', e.target.value)} data-testid="pricing-subtitle" />
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {tiers.map((t, i) => (
          <div key={i} data-testid={`pricing-tier-${i}`} style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Star size={14} color={t.highlight ? '#FF6B00' : '#444'} />
                <span style={{ fontSize: 12, color: '#666', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Paket {i + 1}</span>
              </div>
              <button onClick={() => delTier(i)} data-testid={`pricing-delete-${i}`} style={btnDanger}><Trash2 size={12} /> Löschen</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Paket-Name</label>
                <input style={input} value={t.name} onChange={(e) => setTier(i, { name: e.target.value })} data-testid={`pricing-name-${i}`} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Preis (Text)</label>
                <input style={input} value={t.price} onChange={(e) => setTier(i, { price: e.target.value })} data-testid={`pricing-price-${i}`} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Tag / Untertitel</label>
                <input style={input} value={t.tag || ''} onChange={(e) => setTier(i, { tag: e.target.value })} data-testid={`pricing-tag-${i}`} />
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '10px 12px', background: t.highlight ? 'rgba(255,107,0,0.1)' : '#0a0a0a', border: t.highlight ? '1px solid #FF6B00' : '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: t.highlight ? '#FF6B00' : '#9a9a9a' }}>
                <input type="checkbox" checked={!!t.highlight} onChange={(e) => setTier(i, { highlight: e.target.checked })} data-testid={`pricing-highlight-${i}`} style={{ accentColor: '#FF6B00' }} />
                Hervorheben
              </label>
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 6 }}>Features (1 pro Zeile)</label>
              <textarea
                style={{ ...input, minHeight: 100, fontFamily: 'inherit', resize: 'vertical' }}
                value={(t.features || []).join('\n')}
                onChange={(e) => setTier(i, { features: e.target.value.split('\n').map((x) => x.trim()).filter((x) => x.length > 0) })}
                data-testid={`pricing-features-${i}`}
              />
            </div>
          </div>
        ))}
        <button onClick={addTier} data-testid="pricing-add-tier" style={btnSecondary}><Plus size={14} /> Paket hinzufügen</button>
      </div>
    </div>
  );
};

// ---- Default Industry Item ----
const newIndustry = () => ({ icon: 'Building2', title: 'Neue Branche', tag: '', desc: 'Kurze Beschreibung.', img: '' });

const IndustriesEditor = ({ data, onChange }) => {
  const items = data.industries || [];
  const setField = (field, val) => onChange({ ...data, [field]: val });
  const setItem = (i, patch) => {
    const next = [...items]; next[i] = { ...next[i], ...patch };
    onChange({ ...data, industries: next });
  };
  const addItem = () => onChange({ ...data, industries: [...items, newIndustry()] });
  const delItem = (i) => onChange({ ...data, industries: items.filter((_, j) => j !== i) });

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '14px', alignItems: 'center' }}>
        <label style={{ fontSize: '13px', color: '#9a9a9a', fontWeight: 600 }}>Sektion sichtbar?</label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={!!data.industries_enabled}
            onChange={(e) => setField('industries_enabled', e.target.checked)}
            data-testid="industries-enabled-toggle"
            style={{ accentColor: '#FF6B00' }}
          />
          <span style={{ fontSize: '13px', color: '#e5e5e5' }}>Auf öffentlicher Service-Seite anzeigen</span>
        </label>
      </div>
      <div>
        <label style={{ fontSize: '13px', color: '#9a9a9a', fontWeight: 600, display: 'block', marginBottom: 6 }}>Überschrift</label>
        <input style={input} value={data.industries_heading || ''} onChange={(e) => setField('industries_heading', e.target.value)} data-testid="industries-heading" />
      </div>
      <div>
        <label style={{ fontSize: '13px', color: '#9a9a9a', fontWeight: 600, display: 'block', marginBottom: 6 }}>Untertitel</label>
        <textarea style={{ ...input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={data.industries_subtitle || ''} onChange={(e) => setField('industries_subtitle', e.target.value)} data-testid="industries-subtitle" />
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((c, i) => (
          <div key={i} data-testid={`industry-item-${i}`} style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={14} color="#FF6B00" />
                <span style={{ fontSize: 12, color: '#666', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Branche {i + 1}</span>
              </div>
              <button onClick={() => delItem(i)} data-testid={`industry-delete-${i}`} style={btnDanger}><Trash2 size={12} /> Löschen</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Titel</label>
                <input style={input} value={c.title || ''} onChange={(e) => setItem(i, { title: e.target.value })} data-testid={`industry-title-${i}`} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Tag / Badge</label>
                <input style={input} value={c.tag || ''} onChange={(e) => setItem(i, { tag: e.target.value })} data-testid={`industry-tag-${i}`} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }} title="Lucide-Icon-Name (z.B. Landmark, HeartPulse, ShoppingBag)">Icon (Lucide-Name)</label>
                <input style={input} value={c.icon || ''} onChange={(e) => setItem(i, { icon: e.target.value })} data-testid={`industry-icon-${i}`} placeholder="z.B. Landmark" />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Beschreibung</label>
              <textarea
                style={{ ...input, minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                value={c.desc || ''}
                onChange={(e) => setItem(i, { desc: e.target.value })}
                data-testid={`industry-desc-${i}`}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <ImageIcon size={11} /> Bild-URL (Unsplash etc.)
              </label>
              <input style={input} value={c.img || ''} onChange={(e) => setItem(i, { img: e.target.value })} data-testid={`industry-img-${i}`} placeholder="https://images.unsplash.com/..." />
            </div>
          </div>
        ))}
        <button onClick={addItem} data-testid="industry-add" style={btnSecondary}><Plus size={14} /> Branche hinzufügen</button>
      </div>
      <div style={{ padding: 12, background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 6, fontSize: 12, color: '#cfcfcf', lineHeight: 1.6 }}>
        <strong style={{ color: '#FF6B00' }}>Tipp:</strong> Verfügbare Icons: alle <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B00' }}>Lucide-Icon-Namen</a> (z. B. <code>Landmark</code>, <code>HeartPulse</code>, <code>ShoppingBag</code>, <code>Factory</code>, <code>Building2</code>, <code>Briefcase</code>). Bei unbekannten Namen wird <code>Building2</code> als Fallback verwendet.
      </div>
    </div>
  );
};

const ToolsEditor = ({ data, onChange }) => {
  const tools = data.tools || [];
  const setTool = (i, patch) => {
    const next = [...tools]; next[i] = { ...next[i], ...patch };
    onChange({ ...data, tools: next });
  };
  const base = data.calculator_base || {};
  const feats = data.calculator_features || {};
  const setBase = (k, v) => onChange({ ...data, calculator_base: { ...base, [k]: +v || 0 } });
  const setFeat = (k, v) => onChange({ ...data, calculator_features: { ...feats, [k]: +v || 0 } });

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#e5e5e5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} color="#FF6B00" /> Tool-Kacheln (Titel & Beschreibung)
        </h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {tools.map((t, i) => (
            <div key={t.id || i} style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{t.id}</div>
              <input style={{ ...input, marginBottom: 8 }} value={t.title || ''} onChange={(e) => setTool(i, { title: e.target.value })} placeholder="Titel" data-testid={`tool-title-${t.id}`} />
              <textarea style={{ ...input, minHeight: 50, fontFamily: 'inherit', resize: 'vertical' }} value={t.desc || ''} onChange={(e) => setTool(i, { desc: e.target.value })} placeholder="Beschreibung" data-testid={`tool-desc-${t.id}`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#e5e5e5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={14} color="#FF6B00" /> Kostenrechner – Basispreise (€)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 10 }}>
          {Object.entries(base).map(([k, v]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4, textTransform: 'capitalize' }}>{k}</label>
              <input type="number" style={input} value={v} onChange={(e) => setBase(k, e.target.value)} data-testid={`calc-base-${k}`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#e5e5e5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={14} color="#FF6B00" /> Kostenrechner – Feature-Aufpreise (€)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 10 }}>
          {Object.entries(feats).map(([k, v]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 4, textTransform: 'capitalize' }}>{k}</label>
              <input type="number" style={input} value={v} onChange={(e) => setFeat(k, e.target.value)} data-testid={`calc-feat-${k}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ServicePricingAdmin() {
  const [list, setList] = useState([]);
  const [slug, setSlug] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const slugRef = useRef(slug);
  slugRef.current = slug;

  const loadList = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/admin/service-pages`, { headers: authHeaders() });
      const rows = r.data.service_pages || [];
      setList(rows);
      if (rows.length && !slugRef.current) setSlug(rows[0].slug);
    } catch (e) {
      toast.error('Konnte Service-Seiten nicht laden');
    }
  }, []);

  const loadDetail = useCallback(async (s) => {
    if (!s) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/admin/service-pages/${s}`, { headers: authHeaders() });
      setData(r.data);
    } catch (e) {
      toast.error('Konnte Service-Seite nicht laden');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadDetail(slug); }, [slug, loadDetail]);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const payload = {
        pricing: data.pricing || [],
        pricing_enabled: !!data.pricing_enabled,
        pricing_heading: data.pricing_heading,
        pricing_subtitle: data.pricing_subtitle,
        industries: data.industries || [],
        industries_enabled: !!data.industries_enabled,
        industries_heading: data.industries_heading,
        industries_subtitle: data.industries_subtitle,
      };
      if (slug === 'tools') {
        payload.tools = data.tools;
        payload.calculator_base = data.calculator_base;
        payload.calculator_features = data.calculator_features;
      }
      await axios.put(`${API}/admin/service-pages/${slug}`, payload, { headers: authHeaders() });
      toast.success('Gespeichert!', { id: 'save-toast' });
      // Add a hidden DOM marker for test automation:
      document.dispatchEvent(new CustomEvent('service-pricing-saved'));
    } catch (e) {
      const detail = e?.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="service-pricing-admin" style={{ padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>Service-Preise & Tools</h1>
          <p style={{ color: '#9a9a9a', marginTop: 6, fontSize: 14 }}>Pricing pro Service-Seite + Tools-Inhalte verwalten.</p>
        </div>
        <button onClick={handleSave} disabled={saving || !data} style={btnPrimary} data-testid="save-button">
          {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }} data-testid="slug-tabs">
          {list.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSlug(s.slug)}
              data-testid={`slug-tab-${s.slug}`}
              style={{
                padding: '10px 16px', borderRadius: 6,
                background: slug === s.slug ? '#FF6B00' : '#161616',
                color: slug === s.slug ? '#000' : '#e5e5e5',
                border: slug === s.slug ? '1px solid #FF6B00' : '1px solid #2a2a2a',
                fontSize: 13, fontWeight: slug === s.slug ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 12px' }} />
            Lädt…
          </div>
        ) : (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: 24 }}>
            <PricingEditor data={data} onChange={setData} />
            <div style={{ marginTop: 30, paddingTop: 30, borderTop: '1px solid #222' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} color="#FF6B00" /> Branchen-Sektion (&bdquo;Sicherheit für jede Branche&ldquo;)
              </h2>
              <p style={{ color: '#9a9a9a', fontSize: 12, margin: '0 0 18px' }}>
                Bild-Kacheln mit Icon, Tag, Titel und Beschreibung &ndash; wird unterhalb von &bdquo;Leistungen&ldquo; / &bdquo;Prozess&ldquo; auf der Service-Seite angezeigt.
              </p>
              <IndustriesEditor data={data} onChange={setData} />
            </div>
            {slug === 'tools' && (
              <div style={{ marginTop: 30, paddingTop: 30, borderTop: '1px solid #222' }}>
                <ToolsEditor data={data} onChange={setData} />
              </div>
            )}
          </div>
        )}
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
