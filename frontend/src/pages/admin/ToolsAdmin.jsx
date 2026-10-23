import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, Loader2, Edit3, Copy, X, ChevronDown, ChevronUp,
  Sparkles, Calculator, Search, Shield, BrainCircuit, Calendar, ArrowLeft,
  Filter, AlertTriangle, Tag, Download, Upload, History, RotateCcw,
} from 'lucide-react';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnGhost, btnDanger } from './_adminShared';

const API = `${BACKEND_URL}/api`;

const SERVICE_OPTS = [
  { id: 'general',            name: 'Universell' },
  { id: 'web-development',    name: 'Webentwicklung' },
  { id: 'app-development',    name: 'App-Entwicklung' },
  { id: 'cyber-security',     name: 'Cyber Security' },
  { id: 'ui-ux',              name: 'UI/UX Design' },
  { id: 'gaming',             name: 'Gaming' },
  { id: 'chatbot',            name: 'Chatbot / KI' },
  { id: 'server',             name: 'Cloud / DevOps' },
  { id: 'marketing',          name: 'Marketing / SEO' },
  { id: 'graphic-design',     name: 'Grafikdesign' },
  { id: 'automation-ki',      name: 'Automatisierung & KI' },
];

const TYPE_OPTS = [
  { id: 'advisor',    name: 'Projekt-Berater (Fragen)', icon: BrainCircuit },
  { id: 'calculator', name: 'Kostenrechner',            icon: Calculator },
  { id: 'audit',      name: 'Audit / Check (URL)',      icon: Search },
  { id: 'dsgvo',      name: 'DSGVO-Check',              icon: Shield },
  { id: 'booking',    name: 'Terminbuchung',            icon: Calendar },
];

const ICON_SUGGESTIONS = [
  'Sparkles', 'BrainCircuit', 'Calculator', 'Search', 'Shield', 'Calendar', 'Globe',
  'Code', 'Smartphone', 'Palette', 'Gamepad2', 'Bot', 'Server', 'TrendingUp', 'PenTool',
  'Workflow', 'Cloud', 'Lock', 'Target', 'MessageSquare', 'Activity', 'Award', 'Layout',
];

const blankTool = (service_id = 'general') => ({
  id: null,
  slug: '',
  service_id,
  type: 'advisor',
  title: 'Neuer Berater',
  description: '',
  icon: 'Sparkles',
  enabled: true,
  featured: false,
  order: 99,
  pricing_enabled: false,
  pricing_price: 'Kostenlos',
  pricing_label: '',
  pricing_features: [],
  questions: [{ key: 'goal', q: 'Was ist Ihr Hauptziel?', options: [{ v: 'a', l: 'Option A', icon: 'Target' }, { v: 'b', l: 'Option B', icon: 'TrendingUp' }] }],
  recommendations: { a: 'Empfehlung A …', b: 'Empfehlung B …', _default: 'Standard-Empfehlung …' },
  calc_base: {},
  calc_features: {},
  audit_intro: '',
  audit_checks: [],
});

const labelStyle = { display: 'block', fontSize: 11, color: '#9a9a9a', marginBottom: 5, fontWeight: 600 };
const sectionTitle = { fontSize: 12, fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, marginTop: 24 };

export default function ToolsAdmin() {
  const [tools, setTools] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/admin/tools`, { headers: authHeaders() });
      setTools(r.data || []);
    } catch (e) {
      toast.error('Tools konnten nicht geladen werden');
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(
    () => filter === 'all' ? tools : tools.filter((t) => t.service_id === filter),
    [tools, filter]
  );

  const startEdit = (tool) => {
    setEditingId(tool.id);
    setEditData(JSON.parse(JSON.stringify(tool)));
  };

  const startCreate = () => {
    setEditingId('new');
    setEditData(blankTool(filter !== 'all' ? filter : 'general'));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const duplicateTool = (tool) => {
    const copy = JSON.parse(JSON.stringify(tool));
    copy.id = null;
    copy.slug = `${tool.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    copy.title = `${tool.title} (Kopie)`;
    setEditingId('new');
    setEditData(copy);
  };

  const handleSave = async () => {
    if (!editData) return;
    if (!editData.slug.trim() || !editData.title.trim()) {
      toast.error('Slug und Titel sind Pflicht');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...editData };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.updated_by;
      if (editingId === 'new') {
        await axios.post(`${API}/admin/tools`, payload, { headers: authHeaders() });
        toast.success('Tool angelegt');
      } else {
        await axios.put(`${API}/admin/tools/${editingId}`, payload, { headers: authHeaders() });
        toast.success('Gespeichert');
      }
      cancelEdit();
      await loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/admin/tools/${id}`, { headers: authHeaders() });
      toast.success('Tool gelöscht');
      setConfirmDel(null);
      await loadAll();
      if (editingId === id) cancelEdit();
    } catch (e) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Wirklich alle Tools zurücksetzen? Eigene Tools werden gelöscht!')) return;
    try {
      const r = await axios.post(`${API}/admin/tools/reseed`, {}, { headers: authHeaders() });
      toast.success(`${r.data?.reseeded || 0} Tools zurückgesetzt`);
      await loadAll();
    } catch {
      toast.error('Fehler beim Reseed');
    }
  };

  const handleExport = async () => {
    try {
      const r = await axios.get(`${API}/admin/tools/export`, { headers: authHeaders() });
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zebick-tools-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${r.data?.count || 0} Tools exportiert`);
    } catch {
      toast.error('Export fehlgeschlagen');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // Accept either {tools:[...]} (our export) or a bare array
      const tools = Array.isArray(parsed) ? parsed : (parsed.tools || []);
      if (!Array.isArray(tools) || tools.length === 0) {
        toast.error('Keine Tools in der Datei gefunden');
        setImporting(false);
        return;
      }
      const replace = window.confirm(
        `${tools.length} Tools importieren.\n\nOK = ALLE bestehenden Tools ersetzen (voller Restore)\nAbbrechen = nur zusammenführen (bestehende per Slug aktualisieren)`
      );
      const r = await axios.post(`${API}/admin/tools/import`, { tools, replace }, { headers: authHeaders() });
      const d = r.data || {};
      toast.success(`Import: ${d.created || 0} neu, ${d.updated || 0} aktualisiert${d.skipped ? `, ${d.skipped} übersprungen` : ''}`);
      await loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Import fehlgeschlagen (ungültige JSON-Datei?)');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div data-testid="tools-admin" style={{ padding: '32px 28px', maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Tools & Projekt-Berater</h1>
          <p style={{ color: '#9a9a9a', marginTop: 6, fontSize: 14 }}>
            Verwalten Sie alle Tools auf /kostenlose-analyse und die Service-Berater. Fragen, Empfehlungen, Preise & Icons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={startCreate} style={btnPrimary} data-testid="btn-new-tool">
            <Plus size={14} /> Neues Tool
          </button>
          <button onClick={handleExport} style={btnSecondary} data-testid="btn-export-tools">
            <Download size={14} /> Exportieren
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={importing} style={btnSecondary} data-testid="btn-import-tools">
            {importing ? <Loader2 size={14} className="spin" /> : <Upload size={14} />} Importieren
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
            data-testid="import-file-input"
          />
          <button onClick={handleReseed} style={btnSecondary} data-testid="btn-reseed">
            <AlertTriangle size={14} /> Reseed (zurücksetzen)
          </button>
        </div>
      </div>

      {/* Service Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18, alignItems: 'center' }}>
        <Filter size={13} color="#FF6B00" />
        <button onClick={() => setFilter('all')} style={pillStyle(filter === 'all')}>Alle ({tools.length})</button>
        {SERVICE_OPTS.map((s) => {
          const n = tools.filter((t) => t.service_id === s.id).length;
          if (n === 0) return null;
          return (
            <button key={s.id} onClick={() => setFilter(s.id)} style={pillStyle(filter === s.id)}>
              {s.name} ({n})
            </button>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingId && editData && (
        <ToolEditor
          data={editData}
          setData={setEditData}
          onSave={handleSave}
          onCancel={cancelEdit}
          saving={saving}
          isNew={editingId === 'new'}
          toolId={editingId}
          onRestored={loadAll}
        />
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#777' }}>
          <Loader2 size={20} className="spin" style={{ margin: '0 auto 10px' }} /> Lädt…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#777', background: '#111', border: '1px solid #222', borderRadius: 10 }}>
          Keine Tools in dieser Kategorie.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }} data-testid="tools-list">
          {filtered.map((t) => (
            <div key={t.id} data-testid={`tool-row-${t.slug}`} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: 18, position: 'relative' }}>
              {t.featured && (
                <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, padding: '3px 8px', background: '#FF6B00', color: '#000', borderRadius: 999, fontWeight: 800, letterSpacing: '0.08em' }}>
                  FEATURED
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} color="#FF6B00" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: '#FF6B00', fontFamily: 'JetBrains Mono, monospace' }}>{t.slug}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#9a9a9a', lineHeight: 1.5, marginBottom: 10, minHeight: 36 }}>
                {t.description}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                <span style={chipStyle('#FF6B0022', '#FF6B00')}>{TYPE_OPTS.find((x) => x.id === t.type)?.name || t.type}</span>
                <span style={chipStyle('#ffffff08', '#9a9a9a')}>{SERVICE_OPTS.find((s) => s.id === t.service_id)?.name || t.service_id}</span>
                {!t.enabled && <span style={chipStyle('#3a1f1f', '#d85a5a')}>Deaktiviert</span>}
                {t.pricing_enabled && <span style={chipStyle('rgba(255,215,0,0.12)', '#FFD700')}>{t.pricing_price}</span>}
                {t.type === 'advisor' && <span style={chipStyle('#ffffff05', '#9a9a9a')}>{(t.questions || []).length} Fragen</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => startEdit(t)} style={btnSecondary} data-testid={`btn-edit-${t.slug}`}>
                  <Edit3 size={12} /> Bearbeiten
                </button>
                <button onClick={() => duplicateTool(t)} style={btnGhost} title="Duplizieren">
                  <Copy size={12} />
                </button>
                <button
                  onClick={() => confirmDel === t.id ? handleDelete(t.id) : setConfirmDel(t.id)}
                  style={confirmDel === t.id ? { ...btnDanger, background: '#3a1f1f' } : btnDanger}
                  data-testid={`btn-del-${t.slug}`}
                >
                  <Trash2 size={12} /> {confirmDel === t.id ? 'Wirklich löschen?' : 'Löschen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ----------------- Editor (full screen modal) -----------------

const ToolEditor = ({ data, setData, onSave, onCancel, saving, isNew, toolId, onRestored }) => {
  const set = (k, v) => setData({ ...data, [k]: v });

  // Version history
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [verLoading, setVerLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const loadVersions = React.useCallback(async () => {
    if (isNew || !toolId) return;
    setVerLoading(true);
    try {
      const r = await axios.get(`${API}/admin/tools/${toolId}/versions`, { headers: authHeaders() });
      setVersions(r.data || []);
    } catch {
      setVersions([]);
    } finally {
      setVerLoading(false);
    }
  }, [toolId, isNew]);

  const toggleVersions = () => {
    const next = !showVersions;
    setShowVersions(next);
    if (next) loadVersions();
  };

  const restoreVersion = async (vid) => {
    if (!window.confirm('Diese Version wiederherstellen? Der aktuelle Stand wird vorher als Version gesichert.')) return;
    setRestoringId(vid);
    try {
      const r = await axios.post(`${API}/admin/tools/${toolId}/versions/${vid}/restore`, {}, { headers: authHeaders() });
      setData(r.data);
      toast.success('Version wiederhergestellt');
      await loadVersions();
      if (onRestored) onRestored();
    } catch {
      toast.error('Wiederherstellung fehlgeschlagen');
    } finally {
      setRestoringId(null);
    }
  };

  const fmtVerDate = (iso) => {
    try {
      return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  // Question helpers
  const setQ = (qi, patch) => {
    const next = [...(data.questions || [])];
    next[qi] = { ...next[qi], ...patch };
    set('questions', next);
  };
  const addQ = () => set('questions', [...(data.questions || []), { key: `q${(data.questions || []).length + 1}`, q: 'Neue Frage?', options: [{ v: 'a', l: 'Option A', icon: 'Sparkles' }] }]);
  const delQ = (qi) => set('questions', data.questions.filter((_, i) => i !== qi));
  const setOpt = (qi, oi, patch) => {
    const q = data.questions[qi];
    const opts = [...q.options];
    opts[oi] = { ...opts[oi], ...patch };
    setQ(qi, { options: opts });
  };
  const addOpt = (qi) => setQ(qi, { options: [...data.questions[qi].options, { v: `opt${Date.now().toString(36).slice(-3)}`, l: 'Neue Option', icon: 'Sparkles' }] });
  const delOpt = (qi, oi) => setQ(qi, { options: data.questions[qi].options.filter((_, i) => i !== oi) });

  // Recommendation map
  const setRec = (key, val) => set('recommendations', { ...(data.recommendations || {}), [key]: val });
  const allOptionValues = (data.questions || []).flatMap((q) => q.options.map((o) => o.v));

  // Calc map
  const setCalcBaseField = (k, v) => set('calc_base', { ...(data.calc_base || {}), [k]: Number(v) || 0 });
  const setCalcFeatField = (k, v) => set('calc_features', { ...(data.calc_features || {}), [k]: Number(v) || 0 });
  const addCalcKey = (which) => {
    const k = window.prompt(`Neuer Key für ${which === 'base' ? 'Basispreis' : 'Feature'}:`);
    if (!k) return;
    if (which === 'base') setCalcBaseField(k, 0);
    else setCalcFeatField(k, 0);
  };
  const delCalcKey = (which, key) => {
    const map = { ...(which === 'base' ? data.calc_base : data.calc_features) };
    delete map[key];
    set(which === 'base' ? 'calc_base' : 'calc_features', map);
  };

  // Audit checks
  const addCheck = () => set('audit_checks', [...(data.audit_checks || []), { name: 'Neue Prüfung' }]);
  const setCheck = (i, name) => set('audit_checks', data.audit_checks.map((c, idx) => idx === i ? { name } : c));
  const delCheck = (i) => set('audit_checks', data.audit_checks.filter((_, idx) => idx !== i));

  // Pricing features
  const addPF = () => set('pricing_features', [...(data.pricing_features || []), 'Neues Feature']);
  const setPF = (i, v) => set('pricing_features', data.pricing_features.map((x, idx) => idx === i ? v : x));
  const delPF = (i) => set('pricing_features', data.pricing_features.filter((_, idx) => idx !== i));

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      padding: 30, overflowY: 'auto',
    }} data-testid="tool-editor-modal">
      <div style={{
        background: '#111', border: '1px solid #2a2a2a', borderRadius: 12,
        width: '100%', maxWidth: 900, padding: 28, marginBottom: 40,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #222', paddingBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>
            {isNew ? 'Neues Tool anlegen' : 'Tool bearbeiten'}
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isNew && (
              <button onClick={toggleVersions} style={btnSecondary} data-testid="btn-toggle-versions">
                <History size={15} /> Versionen{versions.length ? ` (${versions.length})` : ''}
              </button>
            )}
            <button onClick={onCancel} style={btnGhost} aria-label="Schließen"><X size={18} /></button>
          </div>
        </div>

        {/* Version history panel */}
        {!isNew && showVersions && (
          <div data-testid="versions-panel" style={{
            marginBottom: 18, background: '#0d0d0d', border: '1px solid #262626', borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FF6B00', borderBottom: '1px solid #1c1c1c' }}>
              Versions-Historie
            </div>
            {verLoading ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}><Loader2 size={14} className="spin" /> Lade …</div>
            ) : versions.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }} data-testid="versions-empty">
                Noch keine früheren Versionen. Sobald du das Tool speicherst, wird der vorherige Stand hier gesichert.
              </div>
            ) : (
              versions.map((v, i) => (
                <div key={v.id} data-testid={`version-row-${i}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  padding: '10px 14px', borderBottom: i < versions.length - 1 ? '1px solid #161616' : 'none',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.title || v.snapshot?.title || '—'}
                      {v.note && <span style={{ marginLeft: 8, fontSize: 11, color: '#f59e0b' }}>({v.note})</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtVerDate(v.saved_at)} · {v.saved_by || '—'}</div>
                  </div>
                  <button
                    onClick={() => restoreVersion(v.id)}
                    disabled={restoringId === v.id}
                    style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12, flexShrink: 0 }}
                    data-testid={`btn-restore-version-${i}`}
                  >
                    {restoringId === v.id ? <Loader2 size={13} className="spin" /> : <RotateCcw size={13} />} Wiederherstellen
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Basics */}
        <div style={sectionTitle}>Basis-Daten</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Fld label="Slug (eindeutig, klein, mit Bindestrichen)">
            <input style={input} value={data.slug} onChange={(e) => set('slug', e.target.value.trim().toLowerCase())} placeholder="mein-berater" data-testid="ed-slug" />
          </Fld>
          <Fld label="Titel">
            <input style={input} value={data.title} onChange={(e) => set('title', e.target.value)} data-testid="ed-title" />
          </Fld>
        </div>
        <Fld label="Beschreibung (kurz, 1 Satz)">
          <input style={input} value={data.description} onChange={(e) => set('description', e.target.value)} data-testid="ed-desc" />
        </Fld>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12 }}>
          <Fld label="Service">
            <select style={input} value={data.service_id} onChange={(e) => set('service_id', e.target.value)} data-testid="ed-service">
              {SERVICE_OPTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Fld>
          <Fld label="Tool-Typ">
            <select style={input} value={data.type} onChange={(e) => set('type', e.target.value)} data-testid="ed-type">
              {TYPE_OPTS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Fld>
          <Fld label="Sortier-Reihenfolge">
            <input type="number" style={input} value={data.order} onChange={(e) => set('order', Number(e.target.value))} data-testid="ed-order" />
          </Fld>
        </div>
        <Fld label="Icon (lucide-react Name — z.B. BrainCircuit, Shield, Code …)">
          <input style={input} value={data.icon} onChange={(e) => set('icon', e.target.value)} placeholder="Sparkles" data-testid="ed-icon" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {ICON_SUGGESTIONS.map((i) => (
              <button key={i} type="button" onClick={() => set('icon', i)} style={{
                fontSize: 10, padding: '3px 7px',
                background: data.icon === i ? '#FF6B00' : '#0f0f0f',
                color: data.icon === i ? '#000' : '#9a9a9a',
                border: '1px solid #2a2a2a', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
              }}>{i}</button>
            ))}
          </div>
        </Fld>
        <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
          <Toggle label="Aktiviert (öffentlich sichtbar)" checked={!!data.enabled} onChange={(v) => set('enabled', v)} testid="ed-enabled" />
          <Toggle label="Featured (hervorgehoben)" checked={!!data.featured} onChange={(v) => set('featured', v)} testid="ed-featured" />
        </div>

        {/* Pricing */}
        <div style={sectionTitle}>Preise (optional — Premium-Variante)</div>
        <Toggle label="Pricing-Block anzeigen" checked={!!data.pricing_enabled} onChange={(v) => set('pricing_enabled', v)} testid="ed-pricing-enabled" />
        {data.pricing_enabled && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <Fld label="Preis (Text)">
                <input style={input} value={data.pricing_price} onChange={(e) => set('pricing_price', e.target.value)} placeholder="ab 49€ / Kostenlos / 99€ pauschal" data-testid="ed-price" />
              </Fld>
              <Fld label="Label">
                <input style={input} value={data.pricing_label} onChange={(e) => set('pricing_label', e.target.value)} placeholder="Premium-Bericht" />
              </Fld>
            </div>
            <Fld label="Features (Liste)">
              <div style={{ display: 'grid', gap: 6 }}>
                {(data.pricing_features || []).map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6 }}>
                    <input style={input} value={f} onChange={(e) => setPF(i, e.target.value)} />
                    <button onClick={() => delPF(i)} style={btnDanger}><Trash2 size={11} /></button>
                  </div>
                ))}
                <button onClick={addPF} style={{ ...btnSecondary, alignSelf: 'flex-start' }}><Plus size={11} /> Feature hinzufügen</button>
              </div>
            </Fld>
          </>
        )}

        {/* Advisor-specific: Questions + Recommendations */}
        {data.type === 'advisor' && (
          <>
            <div style={sectionTitle}>Fragen für den Berater</div>
            <div style={{ display: 'grid', gap: 14 }}>
              {(data.questions || []).map((q, qi) => (
                <div key={qi} style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#9a9a9a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Frage {qi + 1}</span>
                    <button onClick={() => delQ(qi)} style={btnDanger}><Trash2 size={11} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10 }}>
                    <Fld label="Key (nur Buchstaben/Zahlen)">
                      <input style={input} value={q.key} onChange={(e) => setQ(qi, { key: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })} />
                    </Fld>
                    <Fld label="Frage-Text">
                      <input style={input} value={q.q} onChange={(e) => setQ(qi, { q: e.target.value })} />
                    </Fld>
                  </div>
                  <div style={{ ...labelStyle, marginTop: 4 }}>Antwort-Optionen</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {(q.options || []).map((o, oi) => (
                      <div key={oi} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 130px 30px', gap: 6 }}>
                        <input style={input} value={o.v} onChange={(e) => setOpt(qi, oi, { v: e.target.value })} placeholder="value" />
                        <input style={input} value={o.l} onChange={(e) => setOpt(qi, oi, { l: e.target.value })} placeholder="Label" />
                        <input style={input} value={o.icon || ''} onChange={(e) => setOpt(qi, oi, { icon: e.target.value })} placeholder="Icon (Sparkles)" />
                        <button onClick={() => delOpt(qi, oi)} style={btnDanger}><Trash2 size={11} /></button>
                      </div>
                    ))}
                    <button onClick={() => addOpt(qi)} style={{ ...btnSecondary, alignSelf: 'flex-start' }}>
                      <Plus size={11} /> Option
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addQ} style={{ ...btnSecondary, alignSelf: 'flex-start' }}><Plus size={12} /> Frage hinzufügen</button>
            </div>

            <div style={sectionTitle}>Empfehlungen (basierend auf Antwort der 1. Frage)</div>
            <div style={{ fontSize: 11, color: '#777', marginBottom: 10 }}>
              Trage für jede Option der ersten Frage eine Empfehlung ein. <code>_default</code> wird genutzt, wenn keine passt.
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[...(data.questions?.[0]?.options || []).map((o) => o.v), '_default'].map((key) => (
                <div key={key}>
                  <label style={labelStyle}>{key === '_default' ? 'Standard (Fallback)' : `Wenn 1. Frage = "${key}"`}</label>
                  <textarea
                    style={{ ...input, minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                    value={data.recommendations?.[key] || ''}
                    onChange={(e) => setRec(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Calculator-specific */}
        {data.type === 'calculator' && (
          <>
            <div style={sectionTitle}>Kostenrechner – Basispreise (€)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {Object.entries(data.calc_base || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>{k}</label>
                    <input type="number" style={input} value={v} onChange={(e) => setCalcBaseField(k, e.target.value)} />
                  </div>
                  <button onClick={() => delCalcKey('base', k)} style={btnDanger}><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addCalcKey('base')} style={{ ...btnSecondary, marginTop: 8 }}><Plus size={11} /> Basis-Key</button>

            <div style={sectionTitle}>Kostenrechner – Feature-Aufpreise (€)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {Object.entries(data.calc_features || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>{k}</label>
                    <input type="number" style={input} value={v} onChange={(e) => setCalcFeatField(k, e.target.value)} />
                  </div>
                  <button onClick={() => delCalcKey('feat', k)} style={btnDanger}><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addCalcKey('feat')} style={{ ...btnSecondary, marginTop: 8 }}><Plus size={11} /> Feature-Key</button>
          </>
        )}

        {/* Audit-specific */}
        {data.type === 'audit' && (
          <>
            <div style={sectionTitle}>Audit-Konfiguration</div>
            <Fld label="Einleitungstext">
              <textarea style={{ ...input, minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                value={data.audit_intro} onChange={(e) => set('audit_intro', e.target.value)} />
            </Fld>
            <Fld label="Prüfungspunkte (1 pro Zeile)">
              <div style={{ display: 'grid', gap: 6 }}>
                {(data.audit_checks || []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6 }}>
                    <input style={input} value={c.name} onChange={(e) => setCheck(i, e.target.value)} />
                    <button onClick={() => delCheck(i)} style={btnDanger}><Trash2 size={11} /></button>
                  </div>
                ))}
                <button onClick={addCheck} style={{ ...btnSecondary, alignSelf: 'flex-start' }}>
                  <Plus size={11} /> Prüfung hinzufügen
                </button>
              </div>
            </Fld>
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingTop: 18, borderTop: '1px solid #222' }}>
          <button onClick={onSave} disabled={saving} style={btnPrimary} data-testid="ed-save">
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            {saving ? 'Speichert…' : 'Speichern'}
          </button>
          <button onClick={onCancel} style={btnSecondary} data-testid="ed-cancel">
            <ArrowLeft size={14} /> Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------- small helpers -----------------

const pillStyle = (active) => ({
  padding: '6px 12px',
  fontSize: 12,
  background: active ? '#FF6B00' : '#161616',
  color: active ? '#000' : '#9a9a9a',
  border: '1px solid ' + (active ? '#FF6B00' : '#2a2a2a'),
  borderRadius: 999, cursor: 'pointer',
  fontFamily: 'inherit', fontWeight: active ? 700 : 500,
});

const chipStyle = (bg, color) => ({
  display: 'inline-block', fontSize: 10, padding: '2px 8px',
  background: bg, color, borderRadius: 999, fontWeight: 600,
  letterSpacing: '0.04em',
});

const Fld = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange, testid }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cfcfcf', cursor: 'pointer' }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      data-testid={testid} style={{ accentColor: '#FF6B00', width: 14, height: 14 }} />
    {label}
  </label>
);
