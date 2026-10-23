import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Users, MessageSquare, Download, RefreshCw, LogOut, Eye, CheckCircle, Reply, Send, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Quote for CSV and neutralize formula injection (=, +, -, @) in Excel.
const csvCell = (value) => {
  let s = String(value ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

const ContactsAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0 });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [composeFor, setComposeFor] = useState(null); // contact object or null
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [composeContext, setComposeContext] = useState({});
  const [attachPdf, setAttachPdf] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const [repliesMap, setRepliesMap] = useState({}); // contact_id -> replies[]

  const token = localStorage.getItem('admin_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/contact/stats`, { headers: authHeaders });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/contact/submissions?status=${filter}`, { headers: authHeaders });
      setContacts(response.data.submissions);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchContacts();
    // Load templates for compose modal
    axios.get(`${BACKEND_URL}/api/admin/email-templates/auto`, { headers: authHeaders })
      .then((r) => setTemplates((r.data.templates || []).filter(t => t.key !== 'signature')))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openCompose = async (contact) => {
    setComposeFor(contact);
    setSelectedTemplate('offer_ab_test');
    setCustomSubject('');
    setCustomBody('');
    setComposeContext({ service: contact.service || '', price: '', timeline: '', company: contact.company || '' });
    setAttachPdf(true);
    setSendMessage('');
    // Load prior replies for this contact
    try {
      const r = await axios.get(`${BACKEND_URL}/api/contact/${contact.id}/replies`, { headers: authHeaders });
      setRepliesMap((prev) => ({ ...prev, [contact.id]: r.data.replies || [] }));
    } catch {}
  };

  const closeCompose = () => { setComposeFor(null); setSendMessage(''); };

  const sendNow = async () => {
    if (!composeFor) return;
    setSending(true);
    setSendMessage('');
    try {
      const body = {
        template_key: customSubject || customBody ? null : selectedTemplate,
        custom_subject: customSubject || null,
        custom_body_html: customBody ? `<p>${customBody.replace(/\n/g, '<br>')}</p>` : null,
        custom_body_text: customBody || null,
        context: composeContext,
        attach_offer_pdf: attachPdf,
      };
      const r = await axios.post(
        `${BACKEND_URL}/api/contact/${composeFor.id}/send-email`,
        body, { headers: authHeaders, timeout: 30000 }
      );
      const extras = [];
      if (r.data.ab_variant) extras.push(`Variante ${r.data.ab_variant}`);
      if (r.data.pdf_attached) extras.push('PDF im Anhang');
      const suffix = extras.length ? ` (${extras.join(' · ')})` : '';
      setSendMessage(`✉️ E-Mail an ${r.data.to} gesendet: "${r.data.subject}"${suffix}`);
      fetchContacts();
      // Refresh replies
      const rep = await axios.get(`${BACKEND_URL}/api/contact/${composeFor.id}/replies`, { headers: authHeaders });
      setRepliesMap((prev) => ({ ...prev, [composeFor.id]: rep.data.replies || [] }));
    } catch (err) {
      setSendMessage(err.response?.data?.detail || 'Versand fehlgeschlagen');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/zb-panel-8x2k/login');
  };

  const updateStatus = async (contactId, newStatus) => {
    try {
      // Use enriched endpoint for funnel stages, legacy for read/replied
      const isFunnel = ['new', 'contacted', 'offer_sent', 'won', 'lost'].includes(newStatus);
      if (isFunnel) {
        await axios.patch(`${BACKEND_URL}/api/admin/contact/${contactId}`, { status: newStatus }, { headers: authHeaders });
      } else {
        await axios.patch(`${BACKEND_URL}/api/contact/${contactId}/status?status=${newStatus}`, null, { headers: authHeaders });
      }
      fetchStats();
      fetchContacts();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const convertToCustomer = async (contact) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/customers/from-contact/${contact.id}`, {}, { headers: authHeaders });
      alert(`Kunde angelegt: ${res.data.name}`);
      fetchContacts();
    } catch (e) {
      alert(e.response?.data?.detail || 'Fehler beim Anlegen');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Name', 'Email', 'Telefon', 'Firma', 'Service', 'Budget', 'Deal-Wert', 'Status', 'Nachricht', 'Datum'],
      ...contacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone || '',
        contact.company || '',
        contact.service || '',
        contact.budget || '',
        contact.deal_value || '',
        contact.status,
        contact.message,
        new Date(contact.submitted_at).toLocaleString('de-DE')
      ])
    ].map(row => row.map(csvCell).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kontaktanfragen_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #fff 0%, #999 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Kontaktanfragen
            </h1>
            <p style={{ color: '#888', fontSize: '16px' }}>
              Verwalten Sie Ihre Kontaktanfragen
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/zb-panel-8x2k/dashboard')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/zb-panel-8x2k/newsletter')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Newsletter
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={18} />
              Abmelden
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
            border: '1px solid rgba(255, 107, 0, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Users size={24} color="#FF6B00" />
              <span style={{ color: '#888', fontSize: '14px' }}>Gesamt</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff' }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <MessageSquare size={24} color="#3B82F6" />
              <span style={{ color: '#888', fontSize: '14px' }}>Neu</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#3B82F6' }}>
              {stats.new}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Eye size={24} color="#10B981" />
              <span style={{ color: '#888', fontSize: '14px' }}>Gelesen</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#10B981' }}>
              {stats.read}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Reply size={24} color="#8B5CF6" />
              <span style={{ color: '#888', fontSize: '14px' }}>Beantwortet</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#8B5CF6' }}>
              {stats.replied}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { k: 'all', label: 'Alle' },
              { k: 'new', label: 'Neu' },
              { k: 'contacted', label: 'Kontaktiert' },
              { k: 'offer_sent', label: 'Angebot' },
              { k: 'won', label: 'Gewonnen' },
              { k: 'lost', label: 'Verloren' },
              { k: 'read', label: 'Gelesen' },
              { k: 'replied', label: 'Beantwortet' },
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: '10px 20px',
                  background: filter === k ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: filter === k ? '#000' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                data-testid={`contacts-filter-${k}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchContacts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} /> Aktualisieren
            </button>
            <button
              onClick={exportToCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={16} /> CSV Export
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              Lädt...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              Keine Kontaktanfragen gefunden
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    padding: '24px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                        {contact.name}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#888', fontSize: '14px' }}>
                        <span>📧 {contact.email}</span>
                        {contact.phone && <span>📞 {contact.phone}</span>}
                        {contact.company && <span>🏢 {contact.company}</span>}
                        {contact.service && <span>💼 {contact.service}</span>}
                        {contact.budget && <span>💰 {contact.budget}</span>}
                        {contact.deal_value && <span style={{ color: '#22c55e', fontWeight: 700 }}>💎 €{Number(contact.deal_value).toLocaleString('de-DE')}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(() => {
                        const s = contact.status || 'new';
                        const SCOLORS = {
                          new: { bg: 'rgba(59,130,246,0.2)', color: '#3B82F6', label: 'Neu' },
                          contacted: { bg: 'rgba(245,158,11,0.2)', color: '#F59E0B', label: 'Kontaktiert' },
                          offer_sent: { bg: 'rgba(167,139,250,0.2)', color: '#A78BFA', label: 'Angebot' },
                          won: { bg: 'rgba(34,197,94,0.2)', color: '#22C55E', label: 'Gewonnen' },
                          lost: { bg: 'rgba(239,68,68,0.2)', color: '#EF4444', label: 'Verloren' },
                          read: { bg: 'rgba(16,185,129,0.2)', color: '#10B981', label: 'Gelesen' },
                          replied: { bg: 'rgba(139,92,246,0.2)', color: '#8B5CF6', label: 'Beantwortet' },
                        };
                        const sc = SCOLORS[s] || SCOLORS.new;
                        return (
                          <span style={{
                            padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                            fontWeight: 600, background: sc.bg, color: sc.color,
                          }}>{sc.label}</span>
                        );
                      })()}
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        {new Date(contact.submitted_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderLeft: '3px solid var(--accent-primary)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '15px' }}>
                      {contact.message}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Funnel stage quick-buttons */}
                    {[
                      { k: 'contacted', label: '→ Kontaktiert', color: '#F59E0B' },
                      { k: 'offer_sent', label: '→ Angebot', color: '#A78BFA' },
                      { k: 'won', label: '✓ Gewonnen', color: '#22C55E' },
                      { k: 'lost', label: '✕ Verloren', color: '#EF4444' },
                    ].filter(s => s.k !== contact.status).map(s => (
                      <button
                        key={s.k}
                        onClick={() => updateStatus(contact.id, s.k)}
                        style={{
                          padding: '6px 12px',
                          background: `${s.color}1A`,
                          border: `1px solid ${s.color}55`,
                          borderRadius: '6px',
                          color: s.color,
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        data-testid={`contact-stage-${contact.id}-${s.k}`}
                      >
                        {s.label}
                      </button>
                    ))}
                    {!contact.customer_id && (
                      <button
                        onClick={() => convertToCustomer(contact)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(168,85,247,0.12)',
                          border: '1px solid rgba(168,85,247,0.4)',
                          borderRadius: '6px',
                          color: '#A855F7',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        data-testid={`contact-to-customer-${contact.id}`}
                      >
                        + Kunde anlegen
                      </button>
                    )}
                    {contact.customer_id && (
                      <span style={{ padding: '6px 12px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '6px', color: '#A855F7', fontSize: '11px', fontWeight: 600 }}>
                        ✓ Kunde verknüpft
                      </span>
                    )}
                    <a
                      href={`mailto:${contact.email}`}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(255, 107, 0, 0.1)',
                        border: '1px solid rgba(255, 107, 0, 0.3)',
                        borderRadius: '8px',
                        color: 'var(--accent-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      Mailto
                    </a>
                    <button
                      onClick={() => openCompose(contact)}
                      data-testid={`compose-btn-${contact.id}`}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10B981',
                        borderRadius: '8px',
                        color: '#10B981',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Send size={14} /> ✉️ Anschreiben
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composeFor && (
        <div data-testid="compose-modal" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: '#111', border: '1px solid #333', borderRadius: '16px',
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
                ✉️ Anschreiben: <span style={{ color: '#FF6B00' }}>{composeFor.name}</span> ({composeFor.email})
              </h2>
              <button onClick={closeCompose} data-testid="compose-close-btn"
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {sendMessage && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid #10B981', borderRadius: '8px', color: '#10B981', marginBottom: '14px', fontSize: '13px' }}>
                {sendMessage}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 700 }}>TEMPLATE WÄHLEN</label>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}
                data-testid="compose-template-select"
                style={{ width: '100%', marginTop: '6px', padding: '10px', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}>
                <option value="offer_ab_test" data-testid="template-option-ab">🧪 Angebot (A/B-Test) — automatisch A/B rotierend</option>
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
              </select>
              {selectedTemplate === 'offer_ab_test' && (
                <div style={{ fontSize: '11px', color: '#8B5CF6', marginTop: '4px' }}>
                  💡 Variante A (Premium/Festpreis) und B (Schnell/Agil) werden automatisch im Wechsel versendet. Statistik: <strong>/zb-panel-8x2k/angebot-ab-test</strong>
                </div>
              )}
            </div>

            {(selectedTemplate?.startsWith('offer_') || selectedTemplate === 'offer_ab_test') && (
              <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '8px' }}>
                <label style={{ fontSize: '12px', color: '#FF6B00', fontWeight: 700 }}>ANGEBOTS-VARIABLEN</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
                  <input placeholder="Service" value={composeContext.service || ''}
                    onChange={(e) => setComposeContext({ ...composeContext, service: e.target.value })}
                    data-testid="compose-ctx-service"
                    style={{ padding: '8px', background: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }} />
                  <input placeholder="Preis (z.B. ab 3.500€)" value={composeContext.price || ''}
                    onChange={(e) => setComposeContext({ ...composeContext, price: e.target.value })}
                    data-testid="compose-ctx-price"
                    style={{ padding: '8px', background: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }} />
                  <input placeholder="Zeitraum (z.B. 4 Wochen)" value={composeContext.timeline || ''}
                    onChange={(e) => setComposeContext({ ...composeContext, timeline: e.target.value })}
                    data-testid="compose-ctx-timeline"
                    style={{ padding: '8px', background: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#10B981' }}>
                  <input type="checkbox" checked={attachPdf} onChange={(e) => setAttachPdf(e.target.checked)}
                    data-testid="compose-attach-pdf"
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  📎 <strong>PDF-Angebot an E-Mail anhängen</strong> — automatisch aus den Variablen generiert
                </label>
              </div>
            )}

            <details style={{ marginBottom: '14px' }}>
              <summary style={{ cursor: 'pointer', color: '#aaa', fontSize: '13px', padding: '8px 0' }}>
                Template überschreiben (freier Text)
              </summary>
              <input placeholder="Eigener Betreff" value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                data-testid="compose-custom-subject"
                style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }} />
              <textarea placeholder="Eigener Nachrichtentext (plain, Signatur wird automatisch angehängt)" value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                data-testid="compose-custom-body"
                rows={8}
                style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                Wenn ausgefüllt: überschreibt das Template oben. Sonst wird das Template verwendet.
              </div>
            </details>

            {repliesMap[composeFor.id]?.length > 0 && (
              <div style={{ marginBottom: '14px', padding: '10px', background: 'rgba(139,92,246,0.06)', borderRadius: '8px', borderLeft: '3px solid #8B5CF6', fontSize: '12px', color: '#ccc' }}>
                <strong style={{ color: '#8B5CF6' }}>Bereits {repliesMap[composeFor.id].length} Nachricht(en) an diesen Kunden:</strong>
                {repliesMap[composeFor.id].slice(0, 3).map((r, i) => (
                  <div key={i} style={{ marginTop: '4px' }}>
                    • {new Date(r.sent_at).toLocaleString('de-DE')}: "{r.subject}"
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeCompose}
                style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#aaa', cursor: 'pointer' }}>
                Abbrechen
              </button>
              <button onClick={sendNow} disabled={sending}
                data-testid="compose-send-btn"
                style={{ padding: '10px 20px', background: sending ? '#555' : '#10B981', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, cursor: sending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} /> {sending ? 'Sendet...' : 'E-Mail senden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsAdmin;
