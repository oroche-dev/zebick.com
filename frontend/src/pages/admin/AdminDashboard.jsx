import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Users, Mail, MessageSquare, 
  Shield, Code, Smartphone, Palette, Gamepad2, 
  Bot, Server, TrendingUpIcon, PenTool, LogOut,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Target, Euro,
} from 'lucide-react';
import axios from 'axios';

// Add keyframe animations
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.05);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = pulseAnimation;
  document.head.appendChild(styleSheet);
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Service Icons Map
const serviceIcons = {
  'Cyber Security': Shield,
  'Web Development': Code,
  'App Development': Smartphone,
  'UI/UX': Palette,
  'Gaming Development': Gamepad2,
  'Chatbot Development': Bot,
  'Server System': Server,
  'Digital Marketing SEO': TrendingUpIcon,
  'Graphic Design': PenTool,
};

const serviceColors = {
  'Cyber Security': { 
    bg: 'rgba(255, 107, 0, 0.1)', 
    border: 'rgba(255, 107, 0, 0.3)', 
    color: '#FF6B00',
    gradient: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 107, 0, 0.1) 100%)'
  },
  'Web Development': { 
    bg: 'rgba(255, 140, 50, 0.1)', 
    border: 'rgba(255, 140, 50, 0.3)', 
    color: '#FF8C32',
    gradient: 'linear-gradient(135deg, rgba(255, 140, 50, 0.2) 0%, rgba(255, 140, 50, 0.1) 100%)'
  },
  'App Development': { 
    bg: 'rgba(255, 160, 80, 0.1)', 
    border: 'rgba(255, 160, 80, 0.3)', 
    color: '#FFA050',
    gradient: 'linear-gradient(135deg, rgba(255, 160, 80, 0.2) 0%, rgba(255, 160, 80, 0.1) 100%)'
  },
  'UI/UX': { 
    bg: 'rgba(255, 120, 30, 0.1)', 
    border: 'rgba(255, 120, 30, 0.3)', 
    color: '#FF781E',
    gradient: 'linear-gradient(135deg, rgba(255, 120, 30, 0.2) 0%, rgba(255, 120, 30, 0.1) 100%)'
  },
  'Gaming Development': { 
    bg: 'rgba(245, 158, 11, 0.1)', 
    border: 'rgba(245, 158, 11, 0.3)', 
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)'
  },
  'Chatbot Development': { 
    bg: 'rgba(251, 146, 60, 0.1)', 
    border: 'rgba(251, 146, 60, 0.3)', 
    color: '#FB923C',
    gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)'
  },
  'Server System': { 
    bg: 'rgba(255, 180, 100, 0.1)', 
    border: 'rgba(255, 180, 100, 0.3)', 
    color: '#FFB464',
    gradient: 'linear-gradient(135deg, rgba(255, 180, 100, 0.2) 0%, rgba(255, 180, 100, 0.1) 100%)'
  },
  'Digital Marketing SEO': { 
    bg: 'rgba(249, 115, 22, 0.1)', 
    border: 'rgba(249, 115, 22, 0.3)', 
    color: '#F97316',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
  },
  'Graphic Design': { 
    bg: 'rgba(234, 179, 8, 0.1)', 
    border: 'rgba(234, 179, 8, 0.3)', 
    color: '#EAB308',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%)'
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0 });
  const [newsletterStats, setNewsletterStats] = useState({ total: 0, active: 0 });
  const [contacts, setContacts] = useState([]);
  const [serviceStats, setServiceStats] = useState({});
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const authConf = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // Fetch contact stats
      const contactStatsRes = await axios.get(`${BACKEND_URL}/api/contact/stats`, authConf);
      setStats(contactStatsRes.data);

      // Fetch all contacts
      const contactsRes = await axios.get(`${BACKEND_URL}/api/contact/submissions?status=all&limit=1000`, authConf);
      const allContacts = contactsRes.data.submissions;
      setContacts(allContacts);

      // Phase 1: Funnel/Pipeline overview
      try {
        const ov = await axios.get(`${BACKEND_URL}/api/admin/dashboard/overview`, authConf);
        setOverview(ov.data);
      } catch (e) { console.warn('dashboard overview missing'); }

      // Calculate service statistics
      const serviceData = {};
      allContacts.forEach(contact => {
        const service = contact.service || 'Other';
        if (!serviceData[service]) {
          serviceData[service] = {
            count: 0,
            new: 0,
            totalBudget: 0,
            budgets: []
          };
        }
        serviceData[service].count++;
        if (contact.status === 'new') serviceData[service].new++;
        
        // Extract budget value
        if (contact.budget) {
          const budgetMatch = contact.budget.match(/(\d+)-(\d+)/);
          if (budgetMatch) {
            const avgBudget = (parseInt(budgetMatch[1]) + parseInt(budgetMatch[2])) / 2;
            serviceData[service].budgets.push(avgBudget);
            serviceData[service].totalBudget += avgBudget;
          }
        }
      });

      setServiceStats(serviceData);

      // Ensure all services are shown
      const allServices = [
        'Cyber Security',
        'Web Development', 
        'App Development',
        'UI/UX',
        'Gaming Development',
        'Chatbot Development',
        'Server System',
        'Digital Marketing SEO',
        'Graphic Design'
      ];

      allServices.forEach(service => {
        if (!serviceData[service]) {
          serviceData[service] = {
            count: 0,
            new: 0,
            totalBudget: 0,
            budgets: []
          };
        }
      });

      setServiceStats(serviceData);

      // Fetch newsletter stats
      const newsletterRes = await axios.get(`${BACKEND_URL}/api/newsletter/stats`, authConf);
      setNewsletterStats(newsletterRes.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/zb-panel-8x2k/login');
  };

  const formatBudget = (budget) => {
    if (budget >= 1000) return `€${(budget / 1000).toFixed(0)}k`;
    return `€${budget}`;
  };

  const allServicesList = [
    'Cyber Security',
    'Web Development',
    'App Development', 
    'UI/UX',
    'Gaming Development',
    'Chatbot Development',
    'Server System',
    'Digital Marketing SEO',
    'Graphic Design'
  ];

  const displayServices = allServicesList.map(service => [
    service,
    serviceStats[service] || { count: 0, new: 0, totalBudget: 0, budgets: [] }
  ]);

  const totalRevenuePotential = Object.values(serviceStats).reduce(
    (sum, service) => sum + service.totalBudget, 0
  );

  return (
    <div style={{
      minHeight: '100%',
      background: '#0a0a0a',
      padding: '28px 28px 60px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '6px',
              color: '#fff',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              Service Dashboard
            </h1>
            <p style={{ color: '#9a9a9a', fontSize: '14px', margin: '6px 0 0' }}>
              Übersicht aller Geschäftsbereiche und Anfragen
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '60px' }}>
            Lädt Dashboard...
          </div>
        ) : (
          <>
            {/* Phase 1: Sales-Funnel Overview */}
            {overview && (
              <div style={{ marginBottom: '40px' }}>
                {/* KPI row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginBottom: '20px',
                }} data-testid="dashboard-kpis">
                  <KpiCard color="#3B82F6" icon={<MessageSquare size={18} />} label="Neue Anfragen heute" value={overview.requests?.today || 0} sub={`${overview.requests?.week || 0} diese Woche`} />
                  <KpiCard color="#FF8C32" icon={<Target size={18} />} label="Offene Pipeline" value={`€${(overview.revenue?.pipeline_open || 0).toLocaleString('de-DE', { maximumFractionDigits: 0 })}`} sub={`${(overview.requests?.new || 0) + (overview.requests?.contacted || 0) + (overview.requests?.offer_sent || 0)} Deals aktiv`} />
                  <KpiCard color="#22c55e" icon={<Euro size={18} />} label="Umsatz gewonnen" value={`€${(overview.revenue?.won_total || 0).toLocaleString('de-DE', { maximumFractionDigits: 0 })}`} sub={`${overview.requests?.won || 0} Abschlüsse`} />
                  <KpiCard color="#A855F7" icon={<Users size={18} />} label="Aktive Kunden" value={overview.customers?.total || 0} sub={`+${overview.customers?.new_this_month || 0} diesen Monat`} />
                  <KpiCard color="#FF6B00" icon={<Zap size={18} />} label="Newsletter" value={overview.newsletter?.active || 0} sub="aktive Abonnenten" />
                </div>

                {/* Funnel + Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }} className="dashboard-grid">
                  {/* Funnel Pipeline */}
                  <div style={{
                    background: '#111111',
                    border: '1px solid #222222',
                    borderRadius: 8,
                    padding: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a9a9a', margin: 0 }}>Sales-Pipeline</h3>
                      <button onClick={() => navigate('/zb-panel-8x2k/funnel')} style={{ background: 'transparent', color: '#FF6B00', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} data-testid="dashboard-open-funnel">Vollständig anzeigen →</button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', height: '120px', alignItems: 'flex-end' }}>
                      {[
                        { key: 'new', label: 'Neu', count: overview.requests?.new || 0 },
                        { key: 'contacted', label: 'Kontakt', count: overview.requests?.contacted || 0 },
                        { key: 'offer_sent', label: 'Angebot', count: overview.requests?.offer_sent || 0 },
                        { key: 'won', label: 'Gewonnen', count: overview.requests?.won || 0 },
                        { key: 'lost', label: 'Verloren', count: overview.requests?.lost || 0 },
                      ].map((s, i, arr) => {
                        const max = Math.max(1, ...arr.map((x) => x.count));
                        const h = Math.max(12, (s.count / max) * 100);
                        return (
                          <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{s.count}</div>
                            <div style={{
                              width: '100%', height: `${h}%`,
                              background: '#FF6B00',
                              borderRadius: 0,
                              transition: 'height 0.4s ease',
                            }} />
                            <div style={{ fontSize: '11px', color: '#9a9a9a' }}>{s.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div style={{
                    background: '#111111',
                    border: '1px solid #222222',
                    borderRadius: 8,
                    padding: '20px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }} data-testid="dashboard-activities">
                    <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a9a9a', margin: '0 0 14px' }}>
                      <Activity size={14} style={{ display: 'inline', marginRight: 6 }} />Letzte Aktivitäten
                    </h3>
                    {(overview.activities || []).length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#6a6a6a', padding: '12px 0' }}>Noch keine Aktivitäten.</div>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {(overview.activities || []).slice(0, 8).map((a) => (
                          <div key={a.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '8px', borderBottom: '1px solid #1c1c1c' }}>
                            <div style={{ width: 6, height: 6, borderRadius: 0, background: '#FF6B00', marginTop: 6, flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{a.title}</div>
                              {a.description && <div style={{ fontSize: '11px', color: '#9a9a9a', marginTop: '2px' }}>{a.description}</div>}
                              <div style={{ fontSize: '10px', color: '#5a5a5a', marginTop: '3px' }}>{new Date(a.timestamp).toLocaleString('de-DE')} · {a.actor}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Overview Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#9a9a9a' }}>
                  <MessageSquare size={18} color="#FF6B00" />
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Gesamt Anfragen</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.total}</div>
                <div style={{ fontSize: 11, color: '#6a6a6a', marginTop: 6 }}>{stats.new} neue · {stats.read} gelesen · {stats.replied} beantwortet</div>
              </div>

              <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#9a9a9a' }}>
                  <Mail size={18} color="#FF6B00" />
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Newsletter</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{newsletterStats.active}</div>
                <div style={{ fontSize: 11, color: '#6a6a6a', marginTop: 6 }}>Aktive Abonnenten</div>
              </div>

              <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#9a9a9a' }}>
                  <BarChart3 size={18} color="#FF6B00" />
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Services</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{Object.keys(serviceStats).length}</div>
                <div style={{ fontSize: 11, color: '#6a6a6a', marginTop: 6 }}>Aktive Bereiche</div>
              </div>

              <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: 8, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#9a9a9a' }}>
                  <TrendingUp size={18} color="#FF6B00" />
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Potenzial</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#FF6B00' }}>{formatBudget(totalRevenuePotential)}</div>
                <div style={{ fontSize: 11, color: '#6a6a6a', marginTop: 6 }}>Geschätztes Budget</div>
              </div>
            </div>

            {/* Service Breakdown */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Activity size={24} color="var(--accent-primary)" />
                Service-Analyse
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '14px',
              }}>
                {displayServices.map(([service, data]) => {
                  const Icon = serviceIcons[service] || Code;
                  const avgBudget = data.budgets.length > 0
                    ? data.budgets.reduce((a, b) => a + b, 0) / data.budgets.length
                    : 0;

                  return (
                    <div
                      key={service}
                      style={{
                        background: '#111111',
                        border: '1px solid #222222',
                        borderRadius: 8,
                        padding: 20,
                        cursor: 'pointer',
                        transition: 'border-color 150ms, background 150ms',
                      }}
                      onClick={() => navigate(`/zb-panel-8x2k/contacts?service=${encodeURIComponent(service)}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FF6B00';
                        e.currentTarget.style.background = '#141414';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#222222';
                        e.currentTarget.style.background = '#111111';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 6,
                          background: '#1a1a1a', border: '1px solid #2a2a2a',
                          display: 'grid', placeItems: 'center',
                        }}>
                          <Icon size={20} color="#FF6B00" />
                        </div>
                        {data.new > 0 && (
                          <div style={{
                            padding: '4px 10px',
                            background: '#FF6B00',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#000',
                            letterSpacing: '0.04em',
                          }}>
                            {data.new} NEU
                          </div>
                        )}
                      </div>

                      <h3 style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 0 14px',
                        letterSpacing: '-0.01em',
                      }}>
                        {service}
                      </h3>

                      <div style={{ display: 'grid', gap: 8 }}>
                        <Row label="Anfragen" value={data.count} accent />
                        {avgBudget > 0 && <Row label="Ø Budget" value={formatBudget(avgBudget)} />}
                        <Row label="Potenzial" value={formatBudget(data.totalBudget)} accent />
                      </div>

                      <div style={{
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: '1px solid #1f1f1f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#FF6B00',
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        <span>Details anzeigen</span>
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: '#111111',
              border: '1px solid #222222',
              borderRadius: 8,
              padding: 24,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                Schnellzugriff
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
              }}>
                {[
                  { val: stats.new, label: 'Neue Anfragen bearbeiten', to: '/zb-panel-8x2k/contacts?status=new' },
                  { val: newsletterStats.active, label: 'Newsletter-Kampagne starten', to: '/zb-panel-8x2k/newsletter' },
                  { val: stats.total, label: 'Alle Kontakte verwalten', to: '/zb-panel-8x2k/contacts' },
                  { val: '—', label: 'E-Mail Templates', to: '/zb-panel-8x2k/email-templates' },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(a.to)}
                    style={{
                      padding: 16,
                      background: '#0d0d0d',
                      border: '1px solid #222222',
                      borderRadius: 6,
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B00'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222222'; }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#FF6B00', marginBottom: 6 }}>{a.val}</div>
                    <div style={{ fontSize: 13, color: '#b5b5b5' }}>{a.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

function Row({ label, value, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px', background: '#0a0a0a', borderRadius: 6,
      border: '1px solid #1c1c1c',
    }}>
      <span style={{ fontSize: 12, color: '#9a9a9a', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: accent ? '#FF6B00' : '#fff' }}>{value}</span>
    </div>
  );
}

// Reusable KPI card for Phase 1 dashboard widgets
function KpiCard({ color, icon, label, value, sub }) {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid #222222',
      borderRadius: 8,
      padding: '18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#9a9a9a' }}>
        {icon}
        <span style={{ fontSize: '11px', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#6a6a6a', marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}
