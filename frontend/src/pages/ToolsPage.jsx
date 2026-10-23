import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, CheckCircle, MessageSquare, Filter, Tag,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import Header from '../components/layout/Header';
import Seo from '../components/common/Seo';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import WebsiteCalculator from '../components/tools/WebsiteCalculator';
import UrlAuditTool from '../components/tools/UrlAuditTool';
import DsgvoCheck from '../components/tools/DsgvoCheck';
import BookingCall from '../components/tools/BookingCall';
import AdvisorShowcase from '../components/tools/AdvisorShowcase';
import { getAdvisorInfo, ADVISOR_FACTS } from '../data/advisorInfo';
import { services as serviceCatalog, images as siteImages } from '../data/mock';

// Same category photos as the Services page — keyed by service_id, used as a
// dimmed tool-card background so a tool's card visually matches its category.
const SERVICE_IMAGES = Object.fromEntries(serviceCatalog.map((s) => [s.id, s.image]));
const catImage = (id) => serviceCatalog.find((s) => s.id === id)?.image;

// "Universell" tools (service_id: general) have no category to borrow a photo
// from — pick an existing, thematically fitting photo per tool instead.
const GENERAL_TOOL_IMAGES = {
  kostenrechner: siteImages.coding,
  'website-check': siteImages.codingAlt,
  'seo-audit': catImage('marketing'),
  'dsgvo-check': siteImages.security,
  'ki-berater': catImage('automation-ki'),
  erstgespraech: siteImages.team,
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Service-Filter — what we display
const SERVICE_FILTERS = [
  { id: 'all',                name: 'Alle Tools',     icon: 'LayoutGrid' },
  { id: 'general',            name: 'Universell',     icon: 'Globe' },
  { id: 'web-development',    name: 'Webentwicklung', icon: 'Code' },
  { id: 'app-development',    name: 'App',            icon: 'Smartphone' },
  { id: 'cyber-security',     name: 'Security',       icon: 'Shield' },
  { id: 'ui-ux',              name: 'UI/UX',          icon: 'Palette' },
  { id: 'gaming',             name: 'Gaming',         icon: 'Gamepad2' },
  { id: 'chatbot',            name: 'Chatbot/KI',     icon: 'Bot' },
  { id: 'server',             name: 'Cloud/DevOps',   icon: 'Server' },
  { id: 'marketing',          name: 'Marketing',      icon: 'TrendingUp' },
  { id: 'graphic-design',     name: 'Design',         icon: 'PenTool' },
  { id: 'automation-ki',      name: 'Automatisierung', icon: 'Workflow' },
];

const TYPE_LABELS = {
  advisor:    { label: 'Projekt-Berater', color: '#FF6B00' },
  calculator: { label: 'Rechner',         color: '#3b82f6' },
  audit:      { label: 'Audit',           color: '#10b981' },
  dsgvo:      { label: 'Compliance',      color: '#a855f7' },
  booking:    { label: 'Termin',          color: '#f59e0b' },
};

const Icon = ({ name, ...rest }) => {
  const Cmp = (name && Icons[name]) || Icons.Sparkles;
  return <Cmp {...rest} />;
};

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [active, setActive] = useState(null);  // tool slug
  const [filter, setFilter] = useState('all'); // service_id filter
  const [calcBase, setCalcBase] = useState(null);
  const [calcFeat, setCalcFeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const hasToolsRef = React.useRef(false);

  const fetchTools = React.useCallback(async ({ signal } = {}) => {
    setLoadError(false);
    // Only show the full-page loader when we have nothing yet — a background
    // refresh (e.g. React StrictMode's double-mount) must NOT blank the list.
    if (!hasToolsRef.current) setLoading(true);

    // Retry /api/tools up to 4x — a transient failure must NOT blank out the list
    let list = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await axios.get(`${API}/tools`, { timeout: 12000, signal });
        if (Array.isArray(res.data)) { list = res.data; break; }
      } catch (e) {
        // Request was cancelled (unmount / StrictMode remount) — leave state untouched.
        if (signal?.aborted || axios.isCancel?.(e)) return;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    if (signal?.aborted) return;

    if (list === null) {
      // All retries failed — keep any previously loaded tools, show retry banner
      setLoadError(true);
      setLoading(false);
      return;
    }

    // Render tools IMMEDIATELY. The optional calculator config below must never
    // block or clear the tool list.
    hasToolsRef.current = list.length > 0;
    setTools(list);
    setActive((prev) => {
      if (prev && list.some((t) => t.slug === prev)) return prev;
      const first = list.find((t) => t.service_id === 'general') || list[0];
      return first ? first.slug : null;
    });
    setLoading(false);

    // Optional legacy calculator config — failure here is non-critical.
    try {
      const srv = await axios.get(`${API}/service-pages/tools`, { timeout: 8000, signal });
      if (signal?.aborted) return;
      if (srv.data?.calculator_base) setCalcBase(srv.data.calculator_base);
      if (srv.data?.calculator_features) setCalcFeat(srv.data.calculator_features);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTools({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchTools]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tools;
    return tools.filter((t) => t.service_id === filter);
  }, [tools, filter]);

  const activeTool = useMemo(
    () => tools.find((t) => t.slug === active),
    [tools, active]
  );

  // When filter changes, switch active to first match
  useEffect(() => {
    if (!activeTool || activeTool.service_id !== filter && filter !== 'all') {
      const f = filtered[0];
      if (f) setActive(f.slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filtered.length]);

  const renderTool = () => {
    if (!activeTool) return null;

    // Use tool's own calc data if set, else fallback to service-page legacy
    const base = (activeTool.calc_base && Object.keys(activeTool.calc_base).length)
      ? activeTool.calc_base : calcBase;
    const feats = (activeTool.calc_features && Object.keys(activeTool.calc_features).length)
      ? activeTool.calc_features : calcFeat;

    switch (activeTool.type) {
      case 'calculator':
        return <WebsiteCalculator basePrices={base} featurePrices={feats} />;
      case 'audit':
        return (
          <UrlAuditTool
            tool={activeTool.slug}
            intro={activeTool.audit_intro || 'Wir analysieren Ihre Website.'}
            checks={activeTool.audit_checks || []}
          />
        );
      case 'dsgvo':
        return <DsgvoCheck />;
      case 'advisor':
        return <AdvisorShowcase tool={activeTool} />;
      case 'booking':
        return <BookingCall />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} data-testid="tools-page">
      <Seo
        title="Kostenlose Analyse & Projekt-Berater"
        description="10 kostenlose Tools: Website-Kostenrechner, SEO-Audit, DSGVO-Check und Projekt-Berater für jeden Service – in 30 Sekunden zur ersten Einschätzung."
        path="/tools"
      />
      <Header />

      {/* HERO — top padding only needs to clear the fixed header (70px); the
          filter bar below is `sticky`, so it takes up its own space in the
          document flow instead of overlapping (its height varies with how
          many rows the pills wrap into, which a fixed top-padding guess
          could never match at every viewport width).
          A <div>, not <section> — bare section tags get their padding
          force-overridden by a global mobile rule
          (section{padding:48px 0!important}), which tucked the badge
          13px under the fixed header. */}
      <div style={{ padding: '110px 0 50px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '10%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1000, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.18) 0%, transparent 60%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: 920 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: 999,
            marginBottom: 22,
            maxWidth: 'calc(100vw - 32px)',
            boxSizing: 'border-box',
          }}>
            <Sparkles size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'normal' }}>
              {tools.length} kostenlose Tools
            </span>
          </div>
          <h1 className="heading-1" style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 18 }}>
            <span className="text-gradient">Projekt-Berater</span><br />
            für jeden Service
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto' }}>
            Beantworten Sie 3–4 Fragen und erhalten Sie sofort eine konkrete Empfehlung — von Web-Entwicklung über
            Cyber Security bis hin zu KI-Automatisierung. Plus: Kostenrechner, SEO-Audit, DSGVO-Check und Erstgespräch.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginTop: 28 }}>
            {[
              '10 Service-Berater',
              'Website-Kostenrechner',
              'SEO-Audit',
              'DSGVO-Check',
              'Erstgespräch buchen',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle size={14} color="var(--accent-primary)" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICE FILTER PILLS — sticky bar, sticks below the header once scrolled to */}
      <div className="tools-fixed-filter" style={{
        position: 'sticky',
        top: 70, // below header (header is 70px high)
        left: 0,
        right: 0,
        zIndex: 90,
        opacity: 1,
        visibility: 'visible',
        background: 'rgba(10, 10, 10, 0.96)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255, 107, 0, 0.18)',
        padding: '12px 0 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Filter size={13} color="var(--accent-primary)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Filter nach Service
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} data-testid="service-filter-pills">
            {SERVICE_FILTERS.map((s) => {
              const isActive = filter === s.id;
              const count = s.id === 'all' ? tools.length : tools.filter((t) => t.service_id === s.id).length;
              if (s.id !== 'all' && count === 0) return null;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  data-testid={`filter-${s.id}`}
                  className="filter-pill"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                    color: isActive ? '#000' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600,
                    borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon name={s.icon} size={13} />
                  {s.name}
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 999,
                    background: isActive ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#000' : 'var(--text-muted)',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOOLS CARDS + RENDER AREA in one wrapper */}
      <div className="tools-content-wrap">
      <section style={{ padding: '20px 0 30px' }}>
        <div className="container">
          {loading ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Lade Tools …</div>
          ) : loadError && tools.length === 0 ? (
            <div data-testid="tools-load-error" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,107,0,0.04)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 14, maxWidth: 480, margin: '0 auto' }}>
              <p style={{ marginBottom: 18, fontSize: 15 }}>Die Tools konnten gerade nicht geladen werden.</p>
              <button onClick={() => fetchTools()} data-testid="tools-retry" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700 }}>
                Erneut versuchen
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
              Keine Tools in dieser Kategorie verfügbar.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
              marginBottom: 36,
            }} data-testid="tools-grid">
              {filtered.map((t) => {
                const isActive = active === t.slug;
                const typeMeta = TYPE_LABELS[t.type] || { label: t.type, color: '#888' };
                const bgImage = SERVICE_IMAGES[t.service_id] || GENERAL_TOOL_IMAGES[t.slug];
                return (
                  <button
                    key={t.slug}
                    onClick={() => {
                      setActive(t.slug);
                      // Smooth scroll to tool render area
                      setTimeout(() => {
                        document.getElementById('tool-render-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    data-testid={`tool-card-${t.slug}`}
                    className={`tool-card ${isActive ? 'is-active' : ''}`}
                    style={{
                      position: 'relative',
                      padding: 20,
                      borderRadius: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(255,107,0,0.18) 0%, rgba(255,107,0,0.03) 100%)'
                        : 'rgba(255,255,255,0.025)',
                      border: isActive
                        ? '1px solid rgba(255,107,0,0.55)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: 'inherit', fontFamily: 'inherit',
                      transition: 'all 0.25s ease',
                      overflow: 'hidden',
                    }}
                  >
                    {bgImage && (
                      <>
                        <div className="tool-bg-image" style={{
                          position: 'absolute', inset: 0,
                          backgroundImage: `url(${bgImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: isActive ? 0.28 : 0.16,
                          transition: 'opacity 0.4s ease',
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.88) 100%)',
                        }} />
                        <div className="accent-line" style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-light))',
                          transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: 'transform 0.4s ease',
                        }} />
                      </>
                    )}

                    {t.featured && (
                      <span style={{
                        position: 'absolute', top: 12, right: 12, zIndex: 1,
                        fontSize: 9, padding: '3px 8px',
                        background: '#FF6B00', color: '#000',
                        borderRadius: 999, fontWeight: 800, letterSpacing: '0.1em',
                      }}>
                        FEATURED
                      </span>
                    )}

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: isActive
                          ? 'linear-gradient(135deg, var(--accent-primary), #c54f00)'
                          : 'rgba(255, 107, 0, 0.12)',
                        display: 'grid', placeItems: 'center',
                        marginBottom: 14,
                      }}>
                        <Icon name={t.icon} size={20} color={isActive ? '#000' : 'var(--accent-primary)'} />
                      </div>

                      <div style={{
                        fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                        marginBottom: 6, lineHeight: 1.3,
                      }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 12 }}>
                        {t.description}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, padding: '2px 8px',
                          borderRadius: 999, fontWeight: 700,
                          background: `${typeMeta.color}22`,
                          color: typeMeta.color,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                          <Tag size={9} /> {typeMeta.label}
                        </span>
                        {t.pricing_enabled && (
                          <span style={{
                            fontSize: 10, padding: '2px 8px',
                            borderRadius: 999, fontWeight: 700,
                            background: 'rgba(255, 215, 0, 0.12)',
                            color: '#FFD700',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>
                            Premium · {t.pricing_price}
                          </span>
                        )}
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                          {SERVICE_FILTERS.find((s) => s.id === t.service_id)?.name || t.service_id}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* TOOL RENDER AREA */}
      <section id="tool-render-area" style={{ padding: '20px 0 100px', scrollMarginTop: 120 }}>
        <div className="container">
          {activeTool && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 6 }}>
                {activeTool.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
                {activeTool.description}
              </p>
            </div>
          )}
          {renderTool()}

          {/* Pricing info banner (if tool has pricing) */}
          {activeTool?.pricing_enabled && (
            <div style={{
              marginTop: 24, padding: 18,
              background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,107,0,0.04) 100%)',
              border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{
                fontSize: 11, padding: '4px 10px',
                background: '#FFD700', color: '#000',
                borderRadius: 999, fontWeight: 800, letterSpacing: '0.1em',
              }}>
                {activeTool.pricing_label || 'Premium'} · {activeTool.pricing_price}
              </div>
              <div style={{ flex: 1, minWidth: 240, fontSize: 13, color: 'var(--text-secondary)' }}>
                {(activeTool.pricing_features || []).join(' · ')}
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
      {/* /tools-content-wrap */}

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.25)',
            borderRadius: 999,
            marginBottom: 16,
          }}>
            <MessageSquare size={12} color="var(--accent-primary)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Persönlicher Austausch
            </span>
          </div>
          <h2 className="heading-1" style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, marginBottom: 14 }}>
            Lieber direkt mit einem Experten sprechen?
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Schreiben Sie uns direkt — wir antworten innerhalb von 24 Stunden.
          </p>
          {/* Tailored to the selected tool's service */}
          <div data-testid="cta-topics" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: 12 }}>
              Im Gespräch klären wir
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {getAdvisorInfo(activeTool?.service_id).deliverables.map((d) => (
                <span key={d.title} style={{
                  fontSize: 13, padding: '6px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                }}>{d.title}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', marginBottom: 28 }}>
            {ADVISOR_FACTS.map((f) => (
              <span key={f.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                <Icon name={f.icon} size={16} color="var(--accent-primary)" /> {f.text}
              </span>
            ))}
          </div>
          <Link to="/contact" data-testid="cta-contact" className="btn-primary" style={{ padding: '16px 32px', fontSize: 15, fontWeight: 700 }}>
            Direkt Kontakt aufnehmen <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
      <Chatbot />

      <style>{`
        .tools-fixed-filter,
        .tools-fixed-filter * {
          opacity: 1 !important;
        }
        .filter-pill:hover {
          border-color: rgba(255, 107, 0, 0.4) !important;
          color: var(--text-primary) !important;
        }
        .tool-card:hover:not(.is-active) {
          border-color: rgba(255, 107, 0, 0.35) !important;
          background: rgba(255, 107, 0, 0.04) !important;
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(255, 107, 0, 0.18);
        }
        .tool-card:hover:not(.is-active) .tool-bg-image { opacity: 0.26 !important; }
        .tool-card:hover:not(.is-active) .accent-line { transform: scaleX(1) !important; }
        @media (max-width: 768px) {
          #tools-page section { padding-left: 16px; padding-right: 16px; }
        }
      `}</style>
    </div>
  );
};

export default ToolsPage;
