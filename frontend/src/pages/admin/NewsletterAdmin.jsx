import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Users, TrendingUp, Download, Trash2, RefreshCw, LogOut } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Setup axios interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Quote for CSV and neutralize formula injection (=, +, -, @) in Excel.
const csvCell = (value) => {
  let s = String(value ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

const NewsletterAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignResult, setCampaignResult] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/newsletter/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/newsletter/subscribers?status=${filter}`);
      setSubscribers(response.data.subscribers);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchStats();
    fetchSubscribers();
  }, [fetchStats, fetchSubscribers]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/zb-panel-8x2k/login');
  };

  const sendCampaign = async () => {
    if (!campaignSubject || !campaignContent) {
      alert('Bitte füllen Sie Betreff und Inhalt aus');
      return;
    }

    if (!window.confirm(`Newsletter an ${stats.active} Abonnenten senden?`)) {
      return;
    }

    setSendingCampaign(true);
    setCampaignResult(null);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/newsletter/campaign/send?subject=${encodeURIComponent(campaignSubject)}&content=${encodeURIComponent(campaignContent)}`
      );
      
      setCampaignResult(response.data);
      setCampaignSubject('');
      setCampaignContent('');
      setPreviewHtml(null);
      alert(`✅ Newsletter wird im Hintergrund an ${response.data.recipient_count} Abonnenten versendet.`);
    } catch (error) {
      console.error('Campaign error:', error);
      alert('❌ Fehler beim Versenden der Kampagne');
    } finally {
      setSendingCampaign(false);
    }
  };

  const showPreview = async () => {
    if (!campaignSubject || !campaignContent) {
      alert('Bitte Betreff und Inhalt ausfüllen, um die Vorschau zu sehen.');
      return;
    }
    setLoadingPreview(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/newsletter/campaign/preview?subject=${encodeURIComponent(campaignSubject)}&content=${encodeURIComponent(campaignContent)}`
      );
      setPreviewHtml(response.data);
    } catch (error) {
      console.error('Preview error:', error);
      alert('❌ Vorschau konnte nicht erstellt werden.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Status', 'Subscribed At'],
      ...subscribers.map(sub => [
        sub.email,
        sub.status,
        new Date(sub.subscribed_at).toLocaleString('de-DE')
      ])
    ].map(row => row.map(csvCell).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
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
              Newsletter Administration
            </h1>
            <p style={{ color: '#888', fontSize: '16px' }}>
              Verwalten Sie Ihre Newsletter-Abonnenten
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
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/zb-panel-8x2k/contacts')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Kontakte
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
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.target.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#fff';
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
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={24} color="#10B981" />
              <span style={{ color: '#888', fontSize: '14px' }}>Aktiv</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#10B981' }}>
              {stats.active}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Mail size={24} color="#EF4444" />
              <span style={{ color: '#888', fontSize: '14px' }}>Abgemeldet</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#EF4444' }}>
              {stats.unsubscribed}
            </div>
          </div>
        </div>

        {/* E-Mail Campaign Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
          border: '2px solid rgba(255, 107, 0, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '40px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                📧 E-Mail Marketing Kampagne
              </h3>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Senden Sie Newsletter an alle {stats.active} aktiven Abonnenten
              </p>
            </div>
            <button
              onClick={() => setShowCampaignForm(!showCampaignForm)}
              style={{
                padding: '14px 28px',
                background: showCampaignForm 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%)',
                border: 'none',
                borderRadius: '12px',
                color: showCampaignForm ? '#fff' : '#000',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: showCampaignForm ? 'none' : '0 8px 24px rgba(255, 107, 0, 0.3)',
              }}
            >
              {showCampaignForm ? '❌ Abbrechen' : '✉️ Neue Kampagne'}
            </button>
          </div>

          {showCampaignForm && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                  Betreff:
                </label>
                <input
                  type="text"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="z.B. Neue Services & Sonderangebote"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 107, 0, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                  Inhalt:
                </label>
                <textarea
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  placeholder="Schreiben Sie Ihre Newsletter-Nachricht hier..."
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 107, 0, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={showPreview}
                  disabled={loadingPreview || !campaignSubject || !campaignContent}
                  data-testid="campaign-preview-btn"
                  style={{
                    flex: '0 0 auto',
                    padding: '16px 24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(255, 107, 0, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: loadingPreview ? 'wait' : 'pointer',
                    opacity: (!campaignSubject || !campaignContent) ? 0.5 : 1,
                  }}
                >
                  {loadingPreview ? '⏳ Lädt…' : '👁️ Vorschau anzeigen'}
                </button>
                <button
                  onClick={sendCampaign}
                  disabled={sendingCampaign || !campaignSubject || !campaignContent}
                  data-testid="campaign-send-btn"
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: sendingCampaign 
                      ? 'rgba(255, 107, 0, 0.5)'
                      : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: sendingCampaign ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
                    opacity: (!campaignSubject || !campaignContent) ? 0.5 : 1,
                  }}
                >
                  {sendingCampaign ? '📤 Sendet...' : `📧 An ${stats.active} Abonnenten senden`}
                </button>
              </div>

              {campaignResult && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  color: '#10B981',
                }}>
                  ✅ Kampagne gestartet: Versand an {campaignResult.recipient_count} Abonnenten läuft im Hintergrund
                </div>
              )}
            </div>
          )}
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setFilter('active')}
              style={{
                padding: '10px 20px',
                background: filter === 'active' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: filter === 'active' ? '#000' : '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Aktiv
            </button>
            <button
              onClick={() => setFilter('unsubscribed')}
              style={{
                padding: '10px 20px',
                background: filter === 'unsubscribed' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: filter === 'unsubscribed' ? '#000' : '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Abgemeldet
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchSubscribers}
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

        {/* Subscribers Table */}
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
          ) : subscribers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              Keine Abonnenten gefunden
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: '14px' }}>
                      E-Mail
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: '14px' }}>
                      Status
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: '14px' }}>
                      Angemeldet am
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: '#fff', fontSize: '15px' }}>
                        {subscriber.email}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: subscriber.status === 'active'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                          color: subscriber.status === 'active' ? '#10B981' : '#EF4444',
                        }}>
                          {subscriber.status === 'active' ? 'Aktiv' : 'Abgemeldet'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#888', fontSize: '14px' }}>
                        {new Date(subscriber.subscribed_at).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(255, 107, 0, 0.05)',
          border: '1px solid rgba(255, 107, 0, 0.2)',
          borderRadius: '12px',
        }}>
          <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
            💡 Nächste Schritte
          </h3>
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>
            • <strong>E-Mail-Versand aktivieren:</strong> Integrieren Sie Resend/SendGrid für automatische Newsletter<br />
            • <strong>Kampagnen erstellen:</strong> Versenden Sie Newsletter an alle aktiven Abonnenten<br />
            • <strong>Analytics hinzufügen:</strong> Tracking von Öffnungsraten und Klicks
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <div
          data-testid="campaign-preview-modal"
          onClick={() => setPreviewHtml(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '32px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: '16px',
              maxWidth: '760px', width: '100%', maxHeight: '92vh',
              display: 'flex', flexDirection: 'column',
              border: '1px solid rgba(255,107,0,0.3)', overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                  Live-Vorschau Newsletter
                </div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: 700, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📧 {previewHtml.subject}
                </div>
              </div>
              <button
                onClick={() => setPreviewHtml(null)}
                data-testid="campaign-preview-close"
                style={{
                  padding: '8px 16px', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
                  color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                }}
              >
                ✕ Schließen
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: '#EDEFF2' }}>
              <iframe
                title="Newsletter Vorschau"
                srcDoc={previewHtml.html}
                style={{ width: '100%', height: '78vh', border: 'none', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterAdmin;
