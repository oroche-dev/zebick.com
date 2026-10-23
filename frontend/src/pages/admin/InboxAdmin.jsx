import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox, Mail, Star, Archive, Trash2, RefreshCw, ArrowLeft,
  Search, AlertCircle, Paperclip, CheckCircle, CircleDot, Reply, Send, X,
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InboxAdmin = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingNew, setFetchingNew] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | starred
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, unread: 0, configured: false });
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyQuote, setReplyQuote] = useState(true);
  const [replySending, setReplySending] = useState(false);
  const [replyHistory, setReplyHistory] = useState([]);

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        ...(filter === 'unread' && { unread_only: true }),
        ...(filter === 'starred' && { starred_only: true }),
      };
      const res = await axios.get(`${BACKEND_URL}/api/admin/inbox`, { headers, params });
      setEmails(res.data.emails || []);
      setStats({ total: res.data.total, unread: res.data.unread, configured: res.data.configured });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openEmail = async (id) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/inbox/${id}`, { headers });
      setSelected(res.data);
      setReplyOpen(false);
      setReplyBody('');
      // refresh list to update read state
      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
      setStats((s) => ({ ...s, unread: Math.max(0, s.unread - (res.data.read ? 0 : 1)) }));
      try {
        const rep = await axios.get(`${BACKEND_URL}/api/admin/inbox/${id}/replies`, { headers });
        setReplyHistory(rep.data.replies || []);
      } catch { setReplyHistory([]); }
    } catch (err) {
      setMessage(err.response?.data?.detail || 'E-Mail laden fehlgeschlagen');
    }
  };

  const sendReply = async () => {
    if (!replyBody.trim()) { setMessage('Antworttext darf nicht leer sein.'); return; }
    setReplySending(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/inbox/${selected.id}/reply`,
        { body: replyBody, include_quote: replyQuote },
        { headers, timeout: 30000 }
      );
      setMessage(`✉️ Antwort an ${res.data.to} gesendet: "${res.data.subject}"`);
      setReplyOpen(false);
      setReplyBody('');
      // refresh replies
      const rep = await axios.get(`${BACKEND_URL}/api/admin/inbox/${selected.id}/replies`, { headers });
      setReplyHistory(rep.data.replies || []);
      setSelected({ ...selected, replied: true });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Senden fehlgeschlagen');
    } finally {
      setReplySending(false);
    }
  };

  const patch = async (id, updates) => {
    await axios.patch(`${BACKEND_URL}/api/admin/inbox/${id}`, updates, { headers });
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    if (selected?.id === id) setSelected({ ...selected, ...updates });
  };

  const deleteEmail = async (id) => {
    if (!window.confirm('E-Mail wirklich löschen? (Original bleibt im Postfach)')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/inbox/${id}`, { headers });
    setEmails((prev) => prev.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const fetchNow = async () => {
    setFetchingNew(true);
    setMessage('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/inbox/fetch-now`, {}, { headers, timeout: 60000 });
      if (res.data.status === 'skipped') {
        setMessage('IMAP nicht konfiguriert — bitte IMAP_HOST/USERNAME/PASSWORD in .env setzen.');
      } else if (res.data.status === 'success') {
        setMessage(`${res.data.inserted} neue E-Mails geholt, ${res.data.updated} aktualisiert.`);
        await load();
      } else {
        setMessage(`Fehler: ${res.data.error}`);
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Abruf fehlgeschlagen');
    } finally {
      setFetchingNew(false);
    }
  };

  const filteredEmails = emails.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.from_email || '').toLowerCase().includes(q)
        || (e.from_name || '').toLowerCase().includes(q)
        || (e.subject || '').toLowerCase().includes(q);
  });

  const card = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <button onClick={() => navigate('/zb-panel-8x2k/dashboard')} data-testid="inbox-back-btn"
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Zurück zum Dashboard
            </button>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Inbox size={28} color="#FF6B00" />
              Posteingang
              {stats.unread > 0 && (
                <span style={{ background: '#FF6B00', color: '#000', padding: '2px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: 700 }}>
                  {stats.unread} ungelesen
                </span>
              )}
            </h1>
            <p style={{ color: '#888', marginTop: '6px', fontSize: '14px' }}>
              {stats.configured
                ? 'IMAP-Abruf alle 5 Min. aktiv · '+stats.total+' E-Mails gespeichert'
                : 'IMAP nicht konfiguriert — siehe README'}
            </p>
          </div>
          <button onClick={fetchNow} disabled={fetchingNew} data-testid="inbox-fetch-now-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              background: fetchingNew ? '#555' : 'rgba(255, 107, 0, 0.15)',
              border: '1px solid rgba(255, 107, 0, 0.35)',
              borderRadius: '10px', color: '#FF6B00', cursor: fetchingNew ? 'wait' : 'pointer', fontWeight: 600 }}>
            <RefreshCw size={16} className={fetchingNew ? 'spin' : ''} />
            {fetchingNew ? 'Hole E-Mails...' : 'Jetzt abrufen'}
          </button>
        </div>

        {message && (
          <div data-testid="inbox-message" style={{ ...card, padding: '14px', marginBottom: '16px', background: 'rgba(255, 107, 0, 0.08)', borderColor: '#FF6B00' }}>
            {message}
          </div>
        )}

        {!stats.configured && !loading && (
          <div style={{ ...card, padding: '20px', marginBottom: '16px', background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={22} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                <strong style={{ color: '#3B82F6', fontSize: '15px' }}>IMAP noch nicht konfiguriert</strong>
                <p style={{ color: '#aaa', marginTop: '6px' }}>
                  Um E-Mails automatisch abzurufen, müssen in <code style={{ background:'#222', padding:'2px 6px', borderRadius:'4px' }}>backend/.env</code> folgende Werte gesetzt sein:
                </p>
                <pre style={{ background:'#111', padding:'10px', borderRadius:'6px', fontSize:'12px', color:'#aaa', marginTop:'8px' }}>
{`IMAP_HOST=imap.eu01.siteground.eu
IMAP_PORT=993
IMAP_USERNAME=admin@zebick.com
IMAP_PASSWORD=<dein-siteground-passwort>

SMTP_HOST=smtp.eu01.siteground.eu
SMTP_PORT=465
SMTP_USERNAME=admin@zebick.com
SMTP_PASSWORD=<dein-siteground-passwort>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Split layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px' }}>
          {/* LIST */}
          <div style={card}>
            {/* Filter + Search */}
            <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {[
                  { key: 'all', label: 'Alle' },
                  { key: 'unread', label: 'Ungelesen' },
                  { key: 'starred', label: 'Markiert' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    data-testid={`inbox-filter-${f.key}`}
                    style={{ padding: '6px 12px', fontSize: '13px',
                      background: filter === f.key ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid ' + (filter === f.key ? '#FF6B00' : 'transparent'),
                      borderRadius: '8px', color: filter === f.key ? '#FF6B00' : '#aaa',
                      cursor: 'pointer', fontWeight: 600 }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#666" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Suchen..." data-testid="inbox-search"
                  style={{ width: '100%', padding: '8px 10px 8px 32px', background: '#000', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
            </div>
            {/* Email list */}
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {loading && <div style={{ padding: '24px', color: '#666', textAlign: 'center' }}>Lädt...</div>}
              {!loading && filteredEmails.length === 0 && (
                <div style={{ padding: '40px 20px', color: '#666', textAlign: 'center', fontSize: '14px' }}>
                  {stats.configured ? 'Keine E-Mails vorhanden' : 'IMAP konfigurieren → dann „Jetzt abrufen"'}
                </div>
              )}
              {filteredEmails.map((e) => (
                <div key={e.id} onClick={() => openEmail(e.id)} data-testid={`inbox-row-${e.id}`}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: selected?.id === e.id ? 'rgba(255,107,0,0.08)' : 'transparent',
                    cursor: 'pointer',
                    borderLeft: '3px solid ' + (selected?.id === e.id ? '#FF6B00' : 'transparent'),
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {!e.read && <CircleDot size={10} color="#FF6B00" />}
                    <span style={{ fontWeight: e.read ? 500 : 700, color: e.read ? '#ccc' : '#fff', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.from_name || e.from_email}
                    </span>
                    {e.starred && <Star size={12} fill="#F59E0B" color="#F59E0B" />}
                    {e.attachments_count > 0 && <Paperclip size={12} color="#888" />}
                  </div>
                  <div style={{ fontSize: '13px', color: e.read ? '#888' : '#fff', fontWeight: e.read ? 400 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                    {e.subject}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {new Date(e.date).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAIL */}
          <div style={card}>
            {!selected && (
              <div style={{ padding: '60px 30px', textAlign: 'center', color: '#666' }}>
                <Mail size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <div>Eine E-Mail aus der Liste auswählen</div>
              </div>
            )}
            {selected && (
              <div>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <button onClick={() => setReplyOpen(!replyOpen)}
                      data-testid="inbox-reply-btn"
                      style={{ padding: '8px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: '8px', color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                      <Reply size={14} /> Antworten
                    </button>
                    <button onClick={() => patch(selected.id, { starred: !selected.starred })}
                      data-testid="inbox-star-btn"
                      style={{ padding: '8px 12px', background: selected.starred ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (selected.starred ? '#F59E0B' : 'rgba(255,255,255,0.08)'), borderRadius: '8px', color: selected.starred ? '#F59E0B' : '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Star size={14} fill={selected.starred ? '#F59E0B' : 'none'} /> {selected.starred ? 'Markiert' : 'Markieren'}
                    </button>
                    <button onClick={() => patch(selected.id, { read: !selected.read })}
                      data-testid="inbox-read-btn"
                      style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <CheckCircle size={14} /> Als {selected.read ? 'ungelesen' : 'gelesen'} markieren
                    </button>
                    <button onClick={() => patch(selected.id, { archived: true })}
                      data-testid="inbox-archive-btn"
                      style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Archive size={14} /> Archivieren
                    </button>
                    <button onClick={() => deleteEmail(selected.id)}
                      data-testid="inbox-delete-btn"
                      style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginLeft: 'auto' }}>
                      <Trash2 size={14} /> Löschen
                    </button>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '10px', color: '#fff' }}>
                    {selected.subject}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>
                    <strong style={{ color: '#fff' }}>Von:</strong> {selected.from_name ? `${selected.from_name} <${selected.from_email}>` : selected.from_email}
                  </div>
                  <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>
                    <strong style={{ color: '#fff' }}>An:</strong> {(selected.to || []).join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {new Date(selected.date).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                  {selected.attachments_count > 0 && (
                    <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(168,85,247,0.08)', borderRadius: '8px', fontSize: '12px', color: '#A855F7' }}>
                      <Paperclip size={12} style={{ display: 'inline', marginRight: '6px' }} />
                      {selected.attachments_count} Anhang/Anhänge: {(selected.attachments || []).map((a) => a.filename).join(', ')}
                      <div style={{ color: '#666', marginTop: '4px' }}>
                        (Anhänge sind im Original-Postfach abrufbar)
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '20px', maxHeight: '55vh', overflowY: 'auto' }}>
                  {replyOpen && (
                    <div data-testid="inbox-reply-form" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ color: '#10B981' }}>Antwort an {selected.from_email}</strong>
                        <button onClick={() => setReplyOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={16} /></button>
                      </div>
                      <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Ihre Antwort..." rows={8}
                        data-testid="inbox-reply-textarea"
                        style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '13px', color: '#aaa', cursor: 'pointer' }}>
                        <input type="checkbox" checked={replyQuote} onChange={(e) => setReplyQuote(e.target.checked)} data-testid="inbox-reply-quote-cb" />
                        Original-Nachricht zitieren
                      </label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button onClick={sendReply} disabled={replySending || !replyBody.trim()}
                          data-testid="inbox-reply-send-btn"
                          style={{ padding: '10px 18px', background: replySending ? '#555' : '#10B981', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, cursor: replySending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Send size={14} /> {replySending ? 'Sendet...' : 'Antwort senden'}
                        </button>
                        <button onClick={() => { setReplyBody(''); setReplyOpen(false); }}
                          style={{ padding: '10px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#aaa', cursor: 'pointer' }}>
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}
                  {replyHistory.length > 0 && (
                    <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                      <strong style={{ color: '#10B981', fontSize: '13px' }}>
                        {replyHistory.length} Antwort(en) gesendet:
                      </strong>
                      {replyHistory.map((r, i) => (
                        <div key={i} style={{ marginTop: '8px', fontSize: '13px', color: '#ccc' }}>
                          <span style={{ color: '#888' }}>{new Date(r.sent_at).toLocaleString('de-DE')}</span> —
                          an {r.to} von {r.sent_by}
                        </div>
                      ))}
                    </div>
                  )}
                  {selected.body_html ? (
                    <div data-testid="inbox-body-html"
                      dangerouslySetInnerHTML={{ __html: selected.body_html }}
                      style={{ color: '#ddd', fontSize: '14px', lineHeight: 1.6 }} />
                  ) : (
                    <pre data-testid="inbox-body-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ddd', fontSize: '14px', fontFamily: 'inherit', margin: 0 }}>
                      {selected.body_text || '(leerer E-Mail-Body)'}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default InboxAdmin;
