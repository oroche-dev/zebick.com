import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Calendar, ExternalLink, CheckCircle2,
  Target, Lightbulb, TrendingUp, Code, Smartphone, Shield, Palette,
  Gamepad2, Bot, Server, PenTool, Quote, Sparkles, Globe, Star,
  Layers, Users, X,
} from 'lucide-react';
import Seo, { SITE_URL } from '../common/Seo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const categoryIcons = {
  'Webentwicklung': Code, 'Web Development': Code,
  'App-Entwicklung': Smartphone, 'App Development': Smartphone,
  'Cyber Security': Shield, 'Gaming': Gamepad2, 'Chatbot & KI': Bot,
  'UI/UX Design': Palette, 'UI/UX': Palette,
  'Server & Systeme': Server, 'Grafikdesign': PenTool,
};

const techLogoUrl = (item) => item.logo || null;

// Großes Popup über der Portfolio-Seite statt einer eigenen Seite — zeigt
// denselben Inhalt, den früher ProjectDetailPage als eigene Route anzeigte.
// Die Route /portfolio/:slug bleibt real (Sitemap, geteilte Links, SEO),
// sie rendert nur PortfolioPage + dieses Modal statt einer separaten Seite.
const ProjectDetailModal = ({ slug, onClose, onNavigate }) => {
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/projects/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          const relRes = await fetch(`${BACKEND_URL}/api/portfolio/projects?category=${encodeURIComponent(data.category)}&limit=6`);
          if (relRes.ok) {
            const all = await relRes.json();
            setRelated(all.filter((p) => p.slug !== data.slug).slice(0, 3));
          }
        } else if (res.status === 404) {
          setNotFound(true);
        }
      } catch (e) {
        console.error(e);
        setNotFound(true);
      }
      setLoading(false);
      if (panelRef.current) panelRef.current.scrollTop = 0;
    };
    load();
  }, [slug]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const CategoryIcon = project ? (categoryIcons[project.category] || Code) : Code;
  const rating = project?.testimonial_rating || 5;

  return (
    <div
      onClick={onClose}
      data-testid="project-detail-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(0px, 3vw, 40px) 0', overflowY: 'auto',
      }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="pdp-root"
        data-testid="project-detail-modal"
        style={{
          position: 'relative', background: 'var(--bg-primary)',
          width: '100%', maxWidth: '1100px', maxHeight: '92vh', overflowY: 'auto',
          borderRadius: 'clamp(0px, 1vw, 16px)', border: '1px solid var(--border-subtle)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={onClose}
          data-testid="project-detail-modal-close"
          style={{
            position: 'absolute', top: '18px', right: '18px', zIndex: 2,
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(8,8,8,0.7)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {loading && (
          <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Lädt Projekt…
          </div>
        )}

        {!loading && (notFound || !project) && (
          <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Projekt nicht gefunden</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>Dieses Projekt existiert nicht oder wurde entfernt.</p>
            <button onClick={onClose} className="btn-primary" data-testid="back-to-portfolio">
              <ArrowLeft size={16} /> Zurück zum Portfolio
            </button>
          </div>
        )}

        {!loading && project && (
          <>
            <Seo
              title={project.title}
              description={project.description}
              path={`/portfolio/${slug}`}
              image={project.cover_image}
              type="article"
              jsonLd={{
                '@context': 'https://schema.org',
                '@type': 'CreativeWork',
                name: project.title,
                description: project.description,
                image: project.cover_image ? [project.cover_image] : undefined,
                creator: { '@type': 'Organization', name: 'Zebick', url: SITE_URL },
                about: project.category,
                keywords: (project.tags || []).join(', ') || undefined,
                url: `${SITE_URL}/portfolio/${slug}`,
              }}
            />

            {/* ============ KOMPAKTE INTRO ============ */}
            <section className="pdp-intro" style={{ position: 'relative', paddingTop: '64px', paddingBottom: '40px', overflow: 'hidden' }}>
              <div className="hero-bg" style={{ position: 'absolute', inset: 0 }}>
                <div className="grid-pattern"></div>
                <div className="ambient-glow ambient-glow-top-right"></div>
              </div>
              <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <button
                  onClick={onClose}
                  data-testid="link-back-portfolio"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '28px',
                    padding: 0, fontFamily: 'inherit',
                  }}
                >
                  <ArrowLeft size={16} /> Alle Projekte
                </button>

                {project.client && (
                  <div data-testid="client-brand-mark" style={{
                    display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '11px',
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
                      color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '17px', fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '-0.02em',
                      boxShadow: '0 8px 20px rgba(255,107,0,0.25)',
                      flexShrink: 0,
                    }}>
                      {(project.client.match(/\b[A-Za-zÄÖÜäöüß]/g) || []).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Kunde
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {project.client}
                      </div>
                    </div>
                    <span style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 4px' }} />
                    <div className="badge" style={{ margin: 0 }}>
                      <CategoryIcon size={13} /> {project.category}
                    </div>
                    {project.year && (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {project.year}
                      </span>
                    )}
                  </div>
                )}

                <h1 className="heading-1 pdp-title" style={{ marginBottom: '14px', fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1, maxWidth: '900px' }}>
                  {project.title}
                </h1>

                {project.subtitle && (
                  <p style={{ color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '18px', fontSize: 'clamp(15px, 1.8vw, 19px)', maxWidth: '780px' }}>
                    {project.subtitle}
                  </p>
                )}

                <p className="text-body" style={{ marginBottom: '24px', maxWidth: '780px', fontSize: '15px' }}>
                  {project.description}
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {project.website_url && (
                    <a
                      href={project.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      data-testid="hero-visit-live"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                      <Globe size={18} /> Projekt live ansehen <ExternalLink size={14} />
                    </a>
                  )}
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {project.duration && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--accent-primary)" /> {project.duration}
                      </span>
                    )}
                    {project.website_type && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} color="var(--accent-primary)" /> {project.website_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ============ ABOUT THIS PROJECT ============ */}
            {(project.about_project || project.website_type || project.website_url) && (
              <section className="pdp-section pdp-about" style={{ padding: '80px 0', position: 'relative', background: 'var(--bg-secondary)' }}>
                <div className="container">
                  <div className="glow-card pdp-about-card" style={{ padding: '56px 48px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', top: 0, right: 0, width: '280px', height: '280px',
                      background: 'radial-gradient(circle, rgba(255, 107, 0, 0.18) 0%, transparent 70%)',
                      filter: 'blur(40px)', pointerEvents: 'none',
                    }} />
                    <div className="pdp-about-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'center' }}>
                      <div>
                        <span className="section-label" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          fontSize: '12px', color: 'var(--accent-primary)',
                          textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                          marginBottom: '16px',
                        }}>
                          <Globe size={14} /> Über das Projekt
                        </span>
                        <h2 className="heading-2" style={{ marginBottom: '20px' }}>
                          {project.website_type ? (
                            <>Eine <span className="text-gradient">{project.website_type}</span></>
                          ) : (
                            <>Was wir gebaut <span className="text-gradient">haben</span></>
                          )}
                        </h2>
                        <p className="text-body" style={{ marginBottom: '28px', whiteSpace: 'pre-line' }}>
                          {project.about_project || project.description}
                        </p>

                        {project.website_url && (
                          <a href={project.website_url} target="_blank" rel="noreferrer" className="btn-primary" data-testid="visit-live-website">
                            <Globe size={18} /> Live-Website besuchen <ArrowRight size={16} />
                          </a>
                        )}
                      </div>

                      <div style={{
                        background: 'linear-gradient(180deg, #0d0d0d 0%, #050505 100%)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '14px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                          <div style={{
                            flex: 1, marginLeft: '10px', height: '22px',
                            background: 'rgba(255,255,255,0.04)', borderRadius: '6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
                          }}>
                            {project.website_url ? new URL(project.website_url.startsWith('http') ? project.website_url : 'https://' + project.website_url).hostname : 'projekt.zebick.com'}
                          </div>
                        </div>
                        {project.cover_image ? (
                          <div style={{ aspectRatio: '16/10', borderRadius: '8px', overflow: 'hidden', background: '#111' }}>
                            <img src={project.cover_image} alt="" className="img-color" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ aspectRatio: '16/10', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(255,107,0,0.08), rgba(255,107,0,0.02))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={48} color="rgba(255,107,0,0.4)" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ============ VORGANG / PROZESS ============ */}
            {project.process_steps && project.process_steps.length > 0 && (
              <section className="pdp-vorgang" style={{ padding: '100px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative' }}>
                  <div style={{ textAlign: 'center', marginBottom: '64px', maxWidth: '760px', margin: '0 auto 64px' }}>
                    <span className="badge" style={{ marginBottom: '20px' }}>
                      <Layers size={14} /> Unser Vorgang
                    </span>
                    <h2 className="heading-1" style={{ marginBottom: '16px' }}>
                      So sind wir <span className="text-gradient">vorgegangen</span>
                    </h2>
                    <p className="text-body">
                      Schritt für Schritt zum fertigen Projekt — strukturiert, transparent und mit klarem Fokus.
                    </p>
                  </div>

                  <div className="pdp-timeline" style={{ position: 'relative', maxWidth: '960px', margin: '0 auto' }}>
                    <div className="pdp-timeline-line" style={{
                      position: 'absolute', left: '32px', top: '32px', bottom: '32px',
                      width: '2px', background: 'linear-gradient(180deg, var(--accent-primary), rgba(255, 107, 0, 0.15))',
                    }} />
                    {project.process_steps.map((step, idx) => (
                      <div key={idx} className="pdp-timeline-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '28px', marginBottom: idx === project.process_steps.length - 1 ? 0 : '32px', position: 'relative' }}>
                        <div className="pdp-timeline-num" style={{
                          width: '64px', height: '64px', borderRadius: '20px',
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#000', fontWeight: 800, fontSize: '24px',
                          boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
                          flexShrink: 0, zIndex: 1, position: 'relative',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="glass-card-static" style={{ padding: '28px 32px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.01em' }}>
                            {step.title}
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px', whiteSpace: 'pre-line' }}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ============ CHALLENGE / SOLUTION / OUTCOME ============ */}
            {(project.challenge || project.solution || project.outcome) && (
              <section style={{ padding: '100px 0' }}>
                <div className="container">
                  <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '720px', margin: '0 auto 56px' }}>
                    <span className="badge" style={{ marginBottom: '20px' }}>
                      <Sparkles size={14} /> Case Study
                    </span>
                    <h2 className="heading-1">
                      Von der Idee zum <span className="text-gradient">Ergebnis</span>
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {project.challenge && <CaseBlock icon={Target} label="Die Herausforderung" body={project.challenge} color="#FF6B00" />}
                    {project.solution && <CaseBlock icon={Lightbulb} label="Unsere Lösung" body={project.solution} color="#FF8533" />}
                    {project.outcome && <CaseBlock icon={TrendingUp} label="Das Ergebnis" body={project.outcome} color="#FFA050" />}
                  </div>
                </div>
              </section>
            )}

            {/* ============ TECH STACK MIT LOGOS ============ */}
            {((project.tech_stack_detailed && project.tech_stack_detailed.length > 0) || (project.tech_stack && project.tech_stack.length > 0)) && (
              <section style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
                <div className="container">
                  <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '720px', margin: '0 auto 56px' }}>
                    <span className="badge" style={{ marginBottom: '20px' }}>
                      <Code size={14} /> Tech Stack
                    </span>
                    <h2 className="heading-1" style={{ marginBottom: '16px' }}>
                      Das haben wir <span className="text-gradient">eingesetzt</span>
                    </h2>
                    <p className="text-body">Moderne, bewährte Technologien für maximale Performance und Skalierbarkeit.</p>
                  </div>

                  {project.tech_stack_detailed && project.tech_stack_detailed.length > 0 && (
                    <div className="stagger-children pdp-tech-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '16px', maxWidth: '1100px', margin: '0 auto',
                    }}>
                      {project.tech_stack_detailed.map((t, idx) => {
                        const logo = techLogoUrl(t);
                        return (
                          <div key={idx} className="glass-card" style={{
                            padding: '28px 20px', textAlign: 'center',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
                          }}>
                            <div style={{
                              width: '64px', height: '64px',
                              background: '#fff', borderRadius: '14px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '12px',
                              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                            }}>
                              {logo ? (
                                <img src={logo} alt={t.name} className="img-color" loading="lazy" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.style.cssText = 'font-weight:800; color:#000; font-size:20px;';
                                  fallback.textContent = (t.name || '?').charAt(0).toUpperCase();
                                  e.target.parentElement.appendChild(fallback);
                                }} />
                              ) : (
                                <div style={{ fontWeight: 800, color: '#000', fontSize: 20 }}>{t.name?.charAt(0).toUpperCase()}</div>
                              )}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {t.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(!project.tech_stack_detailed || project.tech_stack_detailed.length === 0) && project.tech_stack && project.tech_stack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
                      {project.tech_stack.map((t, idx) => (
                        <div key={idx} className="tag" style={{ padding: '12px 22px', fontSize: '14px' }}>
                          <CheckCircle2 size={14} /> {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ============ GALLERY ============ */}
            {project.gallery && project.gallery.length > 0 && (
              <section style={{ padding: '100px 0' }}>
                <div className="container">
                  <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span className="badge" style={{ marginBottom: '20px' }}>
                      <Sparkles size={14} /> Impressionen
                    </span>
                    <h2 className="heading-1">Aus dem <span className="text-gradient">Projekt</span></h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                    {project.gallery.map((img, idx) => (
                      <div key={idx} className="glass-card" style={{ aspectRatio: '16/10', overflow: 'hidden', padding: 0, background: '#111' }}>
                        <img src={img} alt={`Galerie ${idx + 1}`} className="img-color" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ============ KUNDEN-BEWERTUNG ============ */}
            {project.testimonial_quote && (
              <section style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                  width: '700px', height: '500px',
                  background: 'radial-gradient(ellipse, rgba(255, 107, 0, 0.12) 0%, transparent 70%)',
                  filter: 'blur(60px)', pointerEvents: 'none',
                }} />
                <div className="container" style={{ position: 'relative' }}>
                  <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span className="badge" style={{ marginBottom: '20px' }}>
                      <Users size={14} /> Kunden-Bewertung
                    </span>
                    <h2 className="heading-1">Was unser Kunde <span className="text-gradient">sagt</span></h2>
                  </div>

                  <div className="glow-card pdp-testimonial" style={{
                    maxWidth: '900px', margin: '0 auto', padding: '64px 56px', textAlign: 'center', position: 'relative',
                  }}>
                    <Quote size={56} color="var(--accent-primary)" style={{ opacity: 0.6, marginBottom: '24px' }} />

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '28px' }} data-testid="testimonial-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={20} fill={i < rating ? '#FF6B00' : 'transparent'} color={i < rating ? '#FF6B00' : 'rgba(255,255,255,0.2)'} />
                      ))}
                    </div>

                    <blockquote style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', fontWeight: 500, lineHeight: 1.45, color: 'var(--text-primary)', marginBottom: '40px', letterSpacing: '-0.01em', fontStyle: 'italic' }}>
                      &ldquo;{project.testimonial_quote}&rdquo;
                    </blockquote>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                      {project.testimonial_avatar && (
                        <img src={project.testimonial_avatar} alt={project.testimonial_author} className="img-color" loading="lazy" style={{
                          width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover',
                          border: '2px solid var(--accent-primary)',
                        }} />
                      )}
                      <div style={{ textAlign: 'left' }}>
                        {project.testimonial_author && (
                          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {project.testimonial_author}
                          </div>
                        )}
                        {project.testimonial_position && (
                          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {project.testimonial_position}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ============ RELATED – wechselt den Slug im selben Modal ============ */}
            {related.length > 0 && (
              <section data-testid="related-projects" style={{
                padding: '100px 0',
                background: 'var(--bg-primary)',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div className="container">
                  <div style={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: '32px', flexWrap: 'wrap', marginBottom: '48px', paddingBottom: '24px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ maxWidth: '640px' }}>
                      <span style={{
                        display: 'inline-block', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-primary)',
                        paddingBottom: '8px', borderBottom: '1px solid rgba(255,107,0,0.4)', marginBottom: '14px',
                      }}>Nächste Projekte</span>
                      <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: 0,
                        letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)',
                      }}>
                        Mehr aus <span style={{ color: 'var(--accent-primary)' }}>{project.category}</span>
                      </h2>
                      <p style={{ marginTop: '14px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.65, margin: '14px 0 0' }}>
                        Ähnliche Arbeiten, die zeigen, wie wir das Thema in unterschiedlichen Kontexten gelöst haben.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      data-testid="related-all-link"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 18px', background: 'transparent',
                        border: '1px solid var(--border-subtle)', borderRadius: '6px',
                        color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Alle Projekte <ArrowRight size={14} />
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: related.length === 1
                      ? 'minmax(320px, 560px)'
                      : related.length === 2
                        ? 'repeat(2, minmax(320px, 1fr))'
                        : 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '24px',
                    justifyContent: related.length === 1 ? 'start' : 'stretch',
                  }}>
                    {related.map((p, idx) => {
                      const RelCategoryIcon = categoryIcons[p.category] || Code;
                      return (
                        <RelatedCard key={p.slug} project={p} index={idx} CategoryIcon={RelCategoryIcon} onNavigate={onNavigate} />
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ============ CTA ============ */}
            <section data-testid="project-cta" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, rgba(255, 107, 0, 0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
              <div className="container" style={{ position: 'relative' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
                  <Sparkles size={36} color="var(--accent-primary)" style={{ marginBottom: '24px' }} />
                  <h2 className="heading-1" style={{ marginBottom: '16px' }}>
                    Haben Sie ein <span className="text-gradient">ähnliches Projekt</span>?
                  </h2>
                  <p className="text-large" style={{ marginBottom: '40px' }}>
                    Lassen Sie uns reden — wir freuen uns auf Ihre Herausforderung.
                  </p>
                  <Link to="/contact" className="btn-primary" data-testid="cta-contact">
                    Kostenloses Erstgespräch <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ============ MOBILE / RESPONSIVE STYLES ============ */}
        <style>{`
          @media (max-width: 900px) {
            [data-testid="project-detail-modal"] .pdp-about-card { padding: 36px 24px !important; }
            [data-testid="project-detail-modal"] .pdp-about-grid {
              display: grid !important; grid-template-columns: 1fr !important; gap: 32px !important;
            }
            [data-testid="project-detail-modal"] .pdp-tech-grid {
              display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important;
            }
            [data-testid="project-detail-modal"] .pdp-vorgang { padding: 64px 0 !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-line { left: 22px !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-row {
              display: grid !important; grid-template-columns: 56px 1fr !important; gap: 16px !important; margin-bottom: 20px !important;
            }
            [data-testid="project-detail-modal"] .pdp-timeline-num {
              width: 44px !important; height: 44px !important; border-radius: 14px !important; font-size: 16px !important;
            }
            [data-testid="project-detail-modal"] .pdp-timeline-row > .glass-card-static { padding: 20px 22px !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-row h3 { font-size: 17px !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-row p { font-size: 14px !important; line-height: 1.65 !important; }
            [data-testid="project-detail-modal"] .pdp-testimonial { padding: 40px 24px !important; }
            [data-testid="project-detail-modal"] .pdp-testimonial blockquote { font-size: 19px !important; line-height: 1.55 !important; margin-bottom: 28px !important; }
          }
          @media (max-width: 480px) {
            [data-testid="project-detail-modal"] .pdp-title { font-size: clamp(26px, 9vw, 38px) !important; }
            [data-testid="project-detail-modal"] .pdp-about-card { padding: 28px 20px !important; }
            [data-testid="project-detail-modal"] .pdp-about-card h2 { font-size: 26px !important; line-height: 1.2 !important; }
            [data-testid="project-detail-modal"] .pdp-tech-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
            [data-testid="project-detail-modal"] .pdp-tech-grid > div { padding: 20px 14px !important; }
            [data-testid="project-detail-modal"] .pdp-vorgang { padding: 56px 0 !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-line { left: 18px !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-row { grid-template-columns: 40px 1fr !important; gap: 14px !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-num { width: 36px !important; height: 36px !important; border-radius: 10px !important; font-size: 13px !important; }
            [data-testid="project-detail-modal"] .pdp-timeline-row > .glass-card-static { padding: 16px 18px !important; }
            [data-testid="project-detail-modal"] .pdp-testimonial { padding: 32px 18px !important; }
            [data-testid="project-detail-modal"] .pdp-testimonial blockquote { font-size: 17px !important; }
          }
          @media (max-width: 600px) {
            .pdp-root .badge { font-size: 11px !important; padding: 8px 14px !important; }
            .pdp-root .heading-1 { font-size: clamp(26px, 7vw, 36px) !important; }
            .pdp-root .heading-2 { font-size: clamp(22px, 6vw, 30px) !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

const CaseBlock = ({ icon: Icon, label, body, color }) => (
  <div className="glass-card-static" style={{ padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}, transparent)` }} />
    <div style={{
      width: '56px', height: '56px',
      background: `${color}1a`, border: `1px solid ${color}40`,
      borderRadius: '14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '24px',
    }}>
      <Icon size={24} color={color} />
    </div>
    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px', letterSpacing: '-0.01em' }}>{label}</h3>
    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '15px', whiteSpace: 'pre-line' }}>
      {body}
    </p>
  </div>
);

/* ---- Related Project Card — wechselt den Slug im Modal statt wegzunavigieren ---- */
const RelatedCard = ({ project: p, index, CategoryIcon, onNavigate }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onNavigate(p.slug)}
      data-testid={`related-card-${p.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(p.slug); }}
      style={{
        cursor: 'pointer',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        border: '1px solid',
        borderColor: hover ? 'rgba(255,107,0,0.5)' : 'var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, border-color 0.25s ease',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'relative',
        aspectRatio: '16 / 10',
        background: '#101010',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {p.cover_image ? (
          <img
            src={p.cover_image}
            alt={p.title}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hover ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0c0c0c 0%, #161616 100%)',
          }}>
            <CategoryIcon size={48} color="var(--accent-primary)" strokeWidth={1.3} />
          </div>
        )}

        <div style={{
          position: 'absolute', top: '14px', left: '14px',
          padding: '6px 10px',
          background: 'rgba(8,8,8,0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          fontSize: '10.5px', fontWeight: 700,
          color: 'var(--text-secondary)',
          letterSpacing: '0.12em',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {String(index + 1).padStart(2, '0')} / NEXT
        </div>

        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 11px',
          background: 'rgba(8,8,8,0.85)',
          border: '1px solid rgba(255,107,0,0.4)',
          borderRadius: '4px',
          fontSize: '11px', fontWeight: 600,
          color: '#fff',
        }}>
          <CategoryIcon size={12} color="var(--accent-primary)" />
          {p.category}
        </div>
      </div>

      <div style={{
        padding: '24px 26px 26px',
        display: 'flex', flexDirection: 'column',
        flex: 1,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '10px',
          fontSize: '10.5px', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.client || '—'}</span>
          {p.year && <span>{p.year}</span>}
        </div>

        <h3 style={{
          fontSize: '20px', fontWeight: 700,
          marginBottom: '6px', letterSpacing: '-0.01em',
          lineHeight: 1.25, color: 'var(--text-primary)',
        }}>
          {p.title}
        </h3>

        {p.subtitle && (
          <div style={{ fontSize: '13px', color: 'var(--accent-primary)', marginBottom: '12px', fontWeight: 500 }}>
            {p.subtitle}
          </div>
        )}

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '13.5px', lineHeight: 1.6,
          marginBottom: '18px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', flex: 1,
        }}>
          {p.description}
        </p>

        {((p.tags && p.tags.length > 0) || (p.tech_stack && p.tech_stack.length > 0)) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
            {(p.tags || p.tech_stack || []).slice(0, 3).map((t, i) => (
              <span key={i} style={{
                padding: '4px 9px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                fontSize: '11px', fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '14px', marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <span style={{
            fontSize: '12.5px', fontWeight: 600,
            color: hover ? 'var(--accent-primary)' : 'var(--text-secondary)',
            transition: 'color 0.2s',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Case Study lesen
          </span>
          <ArrowRight
            size={16}
            color={hover ? 'var(--accent-primary)' : 'var(--text-muted)'}
            style={{ transition: 'transform 0.2s', transform: hover ? 'translateX(3px)' : 'translateX(0)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
