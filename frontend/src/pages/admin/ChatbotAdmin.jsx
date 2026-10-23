import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Power, Bot, MessageCircle, User } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnDanger, btnGhost, Field } from './_adminShared';

export default function ChatbotAdmin() {
  const [tab, setTab] = useState('qa');
  const [qa, setQa] = useState([]);
  const [config, setConfig] = useState({ enabled: true, welcome_message: '', fallback_message: '' });
  const [leads, setLeads] = useState([]);
  const [conv, setConv] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  const load = async () => {
    const [q, c, l, cv] = await Promise.all([
      axios.get(`${BACKEND_URL}/api/admin/chatbot/qa`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/chatbot/config`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/chatbot/leads`, { headers: authHeaders() }),
      axios.get(`${BACKEND_URL}/api/admin/chatbot/conversations`, { headers: authHeaders() }),
    ]);
    setQa(q.data.qa || []);
    setConfig(c.data || {});
    setLeads(l.data.leads || []);
    setConv(cv.data.conversations || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing('new'); setForm({ question: '', answer: '', keywords: [], is_active: true, order: qa.length }); };
  const openEdit = (q) => { setEditing(q.id); setForm({ ...q, keywords: q.keywords || [] }); };
  const cancel = () => { setEditing(null); setForm(null); };

  const save = async () => {
    if (!form.question || !form.answer) return alert('Frage & Antwort nötig');
    try {
      if (editing === 'new') await axios.post(`${BACKEND_URL}/api/admin/chatbot/qa`, form, { headers: authHeaders() });
      else await axios.patch(`${BACKEND_URL}/api/admin/chatbot/qa/${editing}`, form, { headers: authHeaders() });
      await load(); cancel();
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Q&A löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/chatbot/qa/${id}`, { headers: authHeaders() });
    load();
  };

  const saveConfig = async () => {
    await axios.put(`${BACKEND_URL}/api/admin/chatbot/config`, config, { headers: authHeaders() });
    alert('Gespeichert');
  };

  return (
    <AdminLayout title="Chatbot-Verwaltung">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button data-testid="chat-tab-qa" onClick={() => setTab('qa')} style={tab === 'qa' ? btnPrimary : btnSecondary}><MessageCircle size={14} />Q&A</button>
        <button data-testid="chat-tab-config" onClick={() => setTab('config')} style={tab === 'config' ? btnPrimary : btnSecondary}><Bot size={14} />Konfiguration</button>
        <button data-testid="chat-tab-leads" onClick={() => setTab('leads')} style={tab === 'leads' ? btnPrimary : btnSecondary}><User size={14} />Leads ({leads.length})</button>
        <button data-testid="chat-tab-conv" onClick={() => setTab('conv')} style={tab === 'conv' ? btnPrimary : btnSecondary}>Verlauf ({conv.length})</button>
      </div>

      {tab === 'qa' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <button onClick={openNew} style={btnPrimary}><Plus size={14} />Neue Q&A</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {qa.map((q) => (
              <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#FF8C32' }}>{q.question}</div>
                    <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{q.answer}</div>
                    {q.keywords?.length > 0 && <div style={{ marginTop: 6, fontSize: 11, color: '#666' }}>Keywords: {q.keywords.join(', ')}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    {!q.is_active && <span style={{ color: '#ef4444', fontSize: 11, padding: '4px 8px' }}>Inaktiv</span>}
                    <button onClick={() => openEdit(q)} style={btnSecondary}><Edit2 size={14} /></button>
                    <button onClick={() => remove(q.id)} style={btnDanger}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {qa.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 30 }}>Noch keine Q&A.</div>}
          </div>
        </>
      )}

      {tab === 'config' && (
        <div style={{ maxWidth: 600, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 22 }}>
          <Field label="Chatbot aktiv">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: config.enabled ? '#22c55e' : '#ef4444', padding: 11 }}>
              <input type="checkbox" checked={config.enabled || false} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />
              <Power size={16} /> {config.enabled ? 'Eingeschaltet' : 'Ausgeschaltet'}
            </label>
          </Field>
          <Field label="Willkommensnachricht"><textarea style={{ ...input, minHeight: 70 }} value={config.welcome_message || ''} onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })} /></Field>
          <Field label="Fallback-Antwort (wenn keine Q&A passt)"><textarea style={{ ...input, minHeight: 70 }} value={config.fallback_message || ''} onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })} /></Field>
          <button onClick={saveConfig} style={btnPrimary}><Save size={14} />Speichern</button>
        </div>
      )}

      {tab === 'leads' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {leads.map((l) => (
            <div key={l.id || l.email} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700 }}>{l.name || l.email}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{l.email} · {l.phone || '—'}</div>
              {l.message && <div style={{ color: '#bbb', fontSize: 13, marginTop: 6 }}>{l.message}</div>}
              <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{new Date(l.created_at || l.timestamp).toLocaleString('de-DE')}</div>
            </div>
          ))}
          {leads.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 30 }}>Keine Leads aus Chatbot.</div>}
        </div>
      )}

      {tab === 'conv' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {conv.map((c, i) => (
            <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <div style={{ color: '#888', fontSize: 11 }}>Session: {c.session_id} · {new Date(c.timestamp).toLocaleString('de-DE')}</div>
              <div style={{ marginTop: 6, fontSize: 13 }}><span style={{ color: '#FF8C32' }}>User:</span> {c.user_message}</div>
              <div style={{ marginTop: 4, fontSize: 13 }}><span style={{ color: '#22c55e' }}>Bot:</span> {c.bot_response}</div>
            </div>
          ))}
          {conv.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 30 }}>Noch keine Konversationen.</div>}
        </div>
      )}

      {editing && form && (
        <div onClick={cancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', borderRadius: 16, padding: 24, width: 600, maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Q&A</h2>
              <button onClick={cancel} style={btnGhost}><X size={18} /></button>
            </div>
            <Field label="Frage"><input style={input} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></Field>
            <Field label="Antwort"><textarea style={{ ...input, minHeight: 100 }} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></Field>
            <Field label="Keywords (Komma-getrennt)" hint="Nutzer-Eingaben mit diesen Worten lösen diese Antwort aus">
              <input style={input} value={(form.keywords || []).join(', ')} onChange={(e) => setForm({ ...form, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) })} />
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ccc', padding: 8 }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Aktiv
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={cancel} style={btnSecondary}>Abbrechen</button>
              <button onClick={save} style={btnPrimary}><Save size={14} />Speichern</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
