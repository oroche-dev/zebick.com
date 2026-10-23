import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Users, Eye, Clock, Globe, 
  ArrowUpRight, ExternalLink, RefreshCw, Calendar,
  Smartphone, Monitor, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AnalyticsAdmin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      visitors: { value: '0', change: '0%', isPositive: true },
      pageViews: { value: '0', change: '0%', isPositive: true },
      avgSessionDuration: { value: '0:00', change: '0%', isPositive: true },
      bounceRate: { value: '0%', change: '0%', isPositive: true },
    },
    topPages: [],
    devices: [],
    countries: [],
    realtimeVisitors: 0,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [overviewRes, pagesRes, devicesRes, countriesRes, realtimeRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/analytics/overview`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/analytics/top-pages`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/analytics/devices`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/analytics/countries`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/analytics/realtime`, { headers: getAuthHeaders() }),
      ]);

      setAnalyticsData({
        overview: {
          visitors: overviewRes.data.visitors,
          pageViews: overviewRes.data.pageViews,
          avgSessionDuration: overviewRes.data.avgSessionDuration,
          bounceRate: overviewRes.data.bounceRate,
        },
        topPages: pagesRes.data.pages || [],
        devices: devicesRes.data.devices || [],
        countries: countriesRes.data.countries || [],
        realtimeVisitors: realtimeRes.data.activeUsers || 0,
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Fehler beim Laden der Analytics-Daten');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();

    // Refresh realtime data every 30 seconds
    const interval = setInterval(async () => {
      try {
        const realtimeRes = await axios.get(`${BACKEND_URL}/api/analytics/realtime`, { headers: getAuthHeaders() });
        setAnalyticsData(prev => ({
          ...prev,
          realtimeVisitors: realtimeRes.data.activeUsers || 0,
        }));
      } catch (err) {
        console.error('Realtime fetch error:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
    <div style={{
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 107, 0, 0.15)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} color="#FF6B00" />
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: 600,
          color: isPositive ? '#10B981' : '#EF4444',
        }}>
          <ArrowUpRight size={14} style={{ transform: isPositive ? 'none' : 'rotate(90deg)' }} />
          {change}
        </div>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{title}</p>
      <p style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{value}</p>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#fff',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/zb-panel-8x2k/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
            Zurück
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
              <BarChart3 size={28} style={{ display: 'inline', marginRight: '12px', color: '#FF6B00' }} />
              Analytics Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Website-Statistiken powered by Google Analytics
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
          <button
            onClick={() => window.open('https://analytics.google.com', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C32 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ExternalLink size={18} />
            Google Analytics öffnen
          </button>
        </div>
      </div>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Error Banner */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <AlertCircle size={20} color="#EF4444" />
            <span style={{ color: '#EF4444' }}>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 0',
            gap: '16px',
          }}>
            <Loader2 size={48} color="#FF6B00" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Lade Analytics-Daten...</p>
          </div>
        ) : (
          <>
        {/* Realtime Visitors Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#10B981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>
              Aktive Besucher gerade jetzt:
            </span>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B00' }}>
              {analyticsData.realtimeVisitors}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            <Calendar size={16} />
            Letzte 30 Tage
          </div>
        </div>

        {/* Overview Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatCard 
            title="Besucher" 
            value={analyticsData.overview.visitors.value} 
            change={analyticsData.overview.visitors.change}
            isPositive={analyticsData.overview.visitors.isPositive}
            icon={Users}
          />
          <StatCard 
            title="Seitenaufrufe" 
            value={analyticsData.overview.pageViews.value} 
            change={analyticsData.overview.pageViews.change}
            isPositive={analyticsData.overview.pageViews.isPositive}
            icon={Eye}
          />
          <StatCard 
            title="Ø Sitzungsdauer" 
            value={analyticsData.overview.avgSessionDuration.value} 
            change={analyticsData.overview.avgSessionDuration.change}
            isPositive={analyticsData.overview.avgSessionDuration.isPositive}
            icon={Clock}
          />
          <StatCard 
            title="Absprungrate" 
            value={analyticsData.overview.bounceRate.value} 
            change={analyticsData.overview.bounceRate.change}
            isPositive={analyticsData.overview.bounceRate.isPositive}
            icon={TrendingUp}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Top Pages */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '28px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={20} color="#FF6B00" />
              Top Seiten
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {analyticsData.topPages.map((page, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    background: 'rgba(255, 107, 0, 0.15)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FF6B00',
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{page.title}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{page.views.toLocaleString()} Aufrufe</span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${page.percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #FF6B00, #FF8C32)',
                        borderRadius: '3px',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Devices */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '28px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Monitor size={20} color="#FF6B00" />
                Geräte
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analyticsData.devices.map((device, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {device.type === 'Desktop' ? <Monitor size={20} color={device.color} /> :
                     device.type === 'Mobile' ? <Smartphone size={20} color={device.color} /> :
                     <Monitor size={20} color={device.color} />}
                    <span style={{ flex: 1 }}>{device.type}</span>
                    <span style={{ fontWeight: 700, color: device.color }}>{device.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '28px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={20} color="#FF6B00" />
                Länder
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analyticsData.countries.map((country, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {country.flag || '🌍'}
                    </span>
                    <span style={{ flex: 1 }}>{country.name}</span>
                    <span style={{ fontWeight: 700, color: '#FF6B00' }}>{country.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          marginTop: '32px',
          padding: '20px 28px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <BarChart3 size={24} color="#3B82F6" />
          <div>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Detaillierte Statistiken</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Für erweiterte Analysen, Conversions und detaillierte Berichte besuchen Sie das Google Analytics Dashboard.
            </p>
          </div>
          <button
            onClick={() => window.open('https://analytics.google.com', '_blank')}
            style={{
              marginLeft: 'auto',
              padding: '10px 20px',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Öffnen
            <ExternalLink size={16} />
          </button>
        </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsAdmin;
