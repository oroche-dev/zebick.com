import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DynamicAdvisor from './DynamicAdvisor';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * ServiceAdvisorBlock — embeds the advisor for a specific service on its service page.
 * Usage:  <ServiceAdvisorBlock serviceId="web-development" />
 */
const ServiceAdvisorBlock = ({ serviceId, fallbackTitle = 'Projekt-Berater' }) => {
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    axios.get(`${API}/tools?service_id=${serviceId}`)
      .then((r) => {
        if (cancel) return;
        const advisor = (r.data || []).find(
          (t) => t.type === 'advisor' && t.service_id === serviceId
        );
        setTool(advisor || null);
      })
      .catch(() => setTool(null))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, [serviceId]);

  if (loading) {
    return (
      <section className="under-header" style={{ padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Lade Berater …
        </div>
      </section>
    );
  }

  if (!tool) {
    // Fallback CTA when no service-specific advisor is configured
    return (
      <section className="under-header" style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, marginBottom: 12 }}>
            Sie sind sich unsicher, welche Lösung passt?
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15 }}>
            Probieren Sie unseren universellen Projekt-Berater oder vereinbaren Sie ein kostenloses Erstgespräch.
          </p>
          <Link to="/kostenlose-analyse" className="btn-primary" style={{ padding: '14px 26px' }}>
            Zur kostenlosen Analyse <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="under-header" data-testid={`service-advisor-${serviceId}`} style={{
      padding: '80px 0',
      background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 700, height: 400,
        background: 'radial-gradient(ellipse, rgba(255, 107, 0, 0.10) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div className="container" style={{ position: 'relative', maxWidth: 880 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{
            fontSize: 'clamp(34px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '0 0 16px',
            color: 'var(--text-primary)',
          }}>
            {tool.title}
          </h2>
          <h3 style={{
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 12px',
          }}>
            Persönliche <span className="text-gradient">Beratung</span>
          </h3>
          {tool.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              {tool.description}
            </p>
          )}
        </div>

        <DynamicAdvisor config={tool} />
      </div>
    </section>
  );
};

export default ServiceAdvisorBlock;
