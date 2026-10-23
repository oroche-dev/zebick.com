import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Save, RotateCcw, Send, CheckCircle, XCircle, Eye, Code } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AutoEmails = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState('html'); // html | code | plain
  const [testEmail, setTestEmail] = useState('');

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/email-templates/auto`, { headers });
      setTemplates(res.data.templates || []);
      if (res.data.templates?.length && !selected) {
        setSelected(res.data.templates[0]);
        setDraft({ ...res.data.templates[0] });
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const pickTemplate = (tpl) => {
    setSelected(tpl);
    setDraft({ ...tpl });
    setMessage('');
  };

  const save = async () => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/email-templates/auto/${draft.key}`, {
        subject: draft.subject, body_html: draft.body_html,
        body_text: draft.body_text, enabled: draft.enabled,
      }, { headers });
      setMessage('✅ Template gespeichert.');
      setTemplates((prev) => prev.map((t) => (t.key === draft.key ? draft : t)));
      setSelected(draft);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Speichern fehlgeschlagen');
    }
  };

  const reset = async () => {
    if (!window.confirm(`Template "${draft.name}" auf Standard zurücksetzen?`)) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/email-templates/auto/reseed?force=true`, {}, { headers });
      await load();
      setMessage('✅ Templates zurückgesetzt.');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Reset fehlgeschlagen');
    }
  };

  const sendTest = async () => {
    const to = testEmail.trim() || 'admin@zebick.com';
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/email-templates/auto/${draft.key}/test`,
        { to_email: to }, { headers, timeout: 30000 });
      setMessage(res.data.sent ? `✉️ Test-Mail an ${to} gesendet` : `❌ Versand fehlgeschlagen (SMTP prüfen)`);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Test fehlgeschlagen');
    }
  };

  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/zb-panel-8x2k/dashboard')} data-testid="auto-mail-back"
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Zurück zum Dashboard
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={28} color="#FF6B00" /> Automatische E-Mails
          </h1>
          <p style={{ color: '#888', marginTop: '6px', fontSize: '14px' }}>
            Diese Templates werden automatisch verschickt, wenn Kunden Formulare auf der Website ausfüllen. Platzhalter wie <code style={{ background: '#222', padding: '2px 6px', borderRadius: '4px' }}>{'{{name}}'}</code> werden beim Versand ersetzt.
          </p>
        </div>

        {message && (
          <div data-testid="auto-mail-message" style={{ ...card, padding: '14px', marginBottom: '16px', background: 'rgba(255, 107, 0, 0.08)', borderColor: '#FF6B00' }}>
            {message}
          </div>
        )}

        {loading && <div style={{ color: '#888', padding: '40px', textAlign: 'center' }}>Lädt...</div>}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
            {/* Template list */}
            <div style={card}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', color: '#888', fontWeight: 700 }}>
                {templates.length} TEMPLATES
              </div>
              {templates.map((t) => (
                <div key={t.key} onClick={() => pickTemplate(t)}
                  data-testid={`tpl-row-${t.key}`}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: selected?.key === t.key ? 'rgba(255,107,0,0.1)' : 'transparent',
                    borderLeft: '3px solid ' + (selected?.key === t.key ? '#FF6B00' : 'transparent'),
                    cursor: 'pointer',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{t.description}</div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    {t.enabled ? (
                      <><CheckCircle size={12} color="#10B981" /><span style={{ color: '#10B981' }}>Aktiv</span></>
                    ) : (
                      <><XCircle size={12} color="#EF4444" /><span style={{ color: '#EF4444' }}>Deaktiviert</span></>
                    )}
                    <span style={{ color: '#555' }}>·</span>
                    <code style={{ color: '#888', fontSize: '11px' }}>{t.trigger}</code>
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={reset} data-testid="tpl-reset-all-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>
                  <RotateCcw size={12} /> Alle zurücksetzen
                </button>
              </div>
            </div>

            {/* Editor */}
            {draft && (
              <div style={card}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{draft.name}</h2>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#aaa', cursor: 'pointer' }}>
                      <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                        data-testid="tpl-enabled-cb" />
                      Template aktiv
                    </label>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', color: '#888', fontWeight: 700, display: 'block', marginBottom: '6px' }}>BETREFF</label>
                    <input type="text" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      data-testid="tpl-subject-input"
                      style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                    <strong style={{ color: '#FF6B00' }}>Verfügbare Platzhalter:</strong>{' '}
                    {(draft.available_vars || []).map((v) => (
                      <code key={v} style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '11px', color: '#aaa' }}>
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {[
                      { key: 'html', label: 'HTML-Editor', icon: Code },
                      { key: 'plain', label: 'Plain Text', icon: Mail },
                      { key: 'preview', label: 'Vorschau', icon: Eye },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button key={m.key} onClick={() => setPreviewMode(m.key)}
                          data-testid={`tpl-mode-${m.key}`}
                          style={{ padding: '6px 12px', fontSize: '12px',
                            background: previewMode === m.key ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.04)',
                            border: '1px solid ' + (previewMode === m.key ? '#FF6B00' : 'transparent'),
                            borderRadius: '8px', color: previewMode === m.key ? '#FF6B00' : '#aaa',
                            cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon size={12} /> {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {previewMode === 'html' && (
                    <textarea value={draft.body_html || ''} onChange={(e) => setDraft({ ...draft, body_html: e.target.value })}
                      data-testid="tpl-html-editor" spellCheck="false"
                      style={{ width: '100%', minHeight: '400px', padding: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#aaffaa', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }} />
                  )}
                  {previewMode === 'plain' && (
                    <textarea value={draft.body_text || ''} onChange={(e) => setDraft({ ...draft, body_text: e.target.value })}
                      data-testid="tpl-plain-editor"
                      style={{ width: '100%', minHeight: '400px', padding: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                  )}
                  {previewMode === 'preview' && (
                    <div data-testid="tpl-preview" style={{ minHeight: '400px', padding: '20px', background: '#fff', borderRadius: '8px', color: '#333', overflowY: 'auto' }}>
                      <div dangerouslySetInnerHTML={{ __html: draft.body_html || '' }} />
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={save} data-testid="tpl-save-btn"
                    style={{ padding: '10px 18px', background: '#10B981', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={14} /> Speichern
                  </button>
                  <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
                    <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="admin@zebick.com" data-testid="tpl-test-email"
                      style={{ padding: '8px 10px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }} />
                    <button onClick={sendTest} data-testid="tpl-send-test-btn"
                      style={{ padding: '10px 14px', background: '#FF6B00', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Send size={12} /> Test senden
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoEmails;
