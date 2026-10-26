import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Trophy, Users, Calendar, TrendingUp, Sparkles,
  ChevronRight, Code, Smartphone, Shield, Palette, Gamepad2, Bot, Server, PenTool,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Seo, { SITE_URL } from '../components/common/Seo';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import ProjectDetailModal from '../components/portfolio/ProjectDetailModal';
import { portfolioProjects as fallbackProjects } from '../data/mock';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const categoryIcons = {
  'Webentwicklung': Code,
  'Web Development': Code,
  'App-Entwicklung': Smartphone,
  'App Development': Smartphone,
  'Cyber Security': Shield,
  'Gaming': Gamepad2,
  'Chatbot & KI': Bot,
  'UI/UX Design': Palette,
  'UI/UX': Palette,
  'Server & Systeme': Server,
  'Grafikdesign': PenTool,
  'Marketing': TrendingUp,
};

const PortfolioPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/projects`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.error('Portfolio fetch failed', e);
      }
      setProjects(
        fallbackProjects.map((p) => ({
          ...p,
          slug: String(p.id),
          cover_image: p.image,
          tech_stack: p.tags,
          metrics: [],
        }))
      );
      setLoading(false);
    };
    load();
    return () => controller.abort();
  }, []);

  const categories = ['Alle', ...Array.from(new Set(projects.map((p) => p.category)))];
  const filtered = activeFilter === 'Alle' ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="page-transition" style={{ background: 'var(--bg-primary)' }}>
      <Seo
        title="Portfolio & Referenzen"
        description="Ausgewählte Projekte von Zebick aus Webentwicklung, App-Entwicklung, Cyber Security und mehr – echte Arbeit, echte Ergebnisse."
        path="/portfolio"
        jsonLd={projects.length > 0 ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: projects.slice(0, 20).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/portfolio/${p.slug}`,
            name: p.title,
          })),
        } : null}
      />
      <Header />

      {/* Kein sichtbarer Banner mehr — nur eine sr-only h1 für SEO (der
          Abschnitt direkt darunter hat selbst genug Abstand zum Header).
          <div>, nicht <section> — jedes bloße section-Tag bekommt sonst von
          einer globalen Mobil-Regel Padding aufgezwungen (die schwarze Lücke). */}
      <div data-testid="portfolio-intro">
        <div className="container">
          <div className="sr-only">
            <h1>Portfolio & Referenzen</h1>
            <p>Eine Auswahl an Arbeiten aus 12+ Jahren — messbar, durchdacht und gebaut für die Zukunft.</p>
          </div>
        </div>
      </div>

      {/* ========== FILTER + GRID ========== */}
      <section
        data-testid="portfolio-projects"
        style={{
          paddingTop: '72px',
          paddingBottom: '120px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <SectionLabel
            kicker="Alle Arbeiten"
            title="Was wir gebaut haben"
            titleAccent="gebaut haben"
          />

          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {categories.map((cat) => {
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  data-testid={`filter-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  style={{
                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#000' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
                    fontFamily: 'inherit',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Lädt Projekte…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              Keine Projekte in dieser Kategorie.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px',
            }}>
              {filtered.map((project) => {
                const CategoryIcon = categoryIcons[project.category] || Code;
                const isHover = hoveredProject === project.slug;
                return (
                  <Link
                    key={project.slug || project.id}
                    to={`/portfolio/${project.slug}`}
                    data-testid={`project-card-${project.slug}`}
                    onMouseEnter={() => setHoveredProject(project.slug)}
                    onMouseLeave={() => setHoveredProject(null)}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'var(--bg-primary)',
                      border: '1px solid',
                      borderColor: isHover ? 'rgba(255,107,0,0.55)' : 'var(--border-subtle)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      transition: 'transform 0.25s ease, border-color 0.25s ease',
                      transform: isHover ? 'translateY(-4px)' : 'translateY(0)',
                      display: 'block',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      position: 'relative',
                      height: '240px',
                      overflow: 'hidden',
                      background: '#101010',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                            transform: isHover ? 'scale(1.04)' : 'scale(1)',
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

                      {/* Top row: category + year */}
                      <div style={{
                        position: 'absolute', top: '14px', left: '14px', right: '14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '6px 11px',
                          background: 'rgba(8,8,8,0.78)',
                          border: '1px solid rgba(255,107,0,0.35)',
                          borderRadius: '4px',
                          fontSize: '11px', fontWeight: 600,
                          color: '#fff',
                          letterSpacing: '0.04em',
                        }}>
                          <CategoryIcon size={12} color="var(--accent-primary)" />
                          {project.category}
                        </span>
                        {project.year && (
                          <span style={{
                            padding: '5px 9px',
                            background: 'rgba(8,8,8,0.78)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            fontSize: '10px', fontWeight: 600,
                            letterSpacing: '0.1em',
                            color: 'var(--text-secondary)',
                          }}>{project.year}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '22px 22px 24px' }}>
                      {project.client && (
                        <div style={{
                          fontSize: '10.5px',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          marginBottom: '8px',
                          fontWeight: 600,
                        }}>
                          {project.client}
                        </div>
                      )}
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        marginBottom: '6px',
                        letterSpacing: '-0.01em',
                        color: 'var(--text-primary)',
                      }}>
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--accent-primary)',
                          marginBottom: '12px',
                          fontWeight: 500,
                        }}>
                          {project.subtitle}
                        </div>
                      )}
                      <p style={{
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        fontSize: '13.5px',
                        marginBottom: '18px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {project.description}
                      </p>

                      {/* Tech tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                          {project.tags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} style={{
                              padding: '4px 9px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'var(--text-secondary)',
                            }}>{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* CTA row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}>
                        <span style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: isHover ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          transition: 'color 0.2s',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}>
                          Case Study lesen
                        </span>
                        <ChevronRight
                          size={18}
                          color={isHover ? 'var(--accent-primary)' : 'var(--text-muted)'}
                          style={{ transition: 'transform 0.2s', transform: isHover ? 'translateX(3px)' : 'translateX(0)' }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========== STATS (clean cards, kein Glow) ========== */}
      <section data-testid="portfolio-stats" style={{
        paddingTop: '96px',
        paddingBottom: '96px',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div className="container">
          <SectionLabel
            kicker="Zahlen & Fakten"
            title="Messbare Erfolge"
            titleAccent="Erfolge"
            align="center"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            {[
              { icon: Trophy, value: `${projects.length}+`, label: 'Projekte', desc: 'Erfolgreich ausgeliefert' },
              { icon: Users, value: '50+', label: 'Kunden', desc: 'Langfristige Partner' },
              { icon: Calendar, value: '12+', label: 'Jahre', desc: 'Seit 2012' },
              { icon: TrendingUp, value: '20+', label: 'Branchen', desc: 'Branchenübergreifend' },
            ].map((s, idx) => (
              <div key={idx} style={{
                padding: '28px 24px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,107,0,0.45)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '44px', height: '44px',
                  marginBottom: '18px',
                  background: 'rgba(255,107,0,0.08)',
                  border: '1px solid rgba(255,107,0,0.25)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon size={20} color="var(--accent-primary)" />
                </div>
                <div style={{
                  fontSize: '34px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA (kein Glow, flacher Akzentblock) ========== */}
      <section data-testid="portfolio-cta" style={{
        background: 'var(--bg-secondary)',
        paddingTop: '96px',
        paddingBottom: '96px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div className="container">
          <div style={{
            maxWidth: '880px',
            margin: '0 auto',
            padding: 'clamp(40px, 6vw, 64px)',
            background: 'var(--bg-primary)',
            border: '1px solid rgba(255, 107, 0, 0.28)',
            borderLeft: '3px solid var(--accent-primary)',
            borderRadius: '10px',
            textAlign: 'left',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                background: 'rgba(255, 107, 0, 0.1)',
                border: '1px solid rgba(255, 107, 0, 0.25)',
                borderRadius: '4px',
                marginBottom: '18px',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--accent-primary)',
              }}>
                <Sparkles size={12} />
                Ihr Projekt könnte das nächste sein
              </div>
              <h2 style={{
                fontSize: 'clamp(26px, 4vw, 38px)',
                fontWeight: 800,
                marginBottom: '12px',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}>
                Lassen Sie uns <span style={{ color: 'var(--accent-primary)' }}>zusammenarbeiten.</span>
              </h2>
              <p style={{
                fontSize: '15px',
                color: 'var(--text-muted)',
                maxWidth: '480px',
                margin: 0,
                lineHeight: 1.6,
              }}>
                Vom ersten Gespräch bis zum Launch — wir begleiten Sie durch den gesamten Prozess.
              </p>
            </div>

            <Link to="/contact" data-testid="portfolio-cta-btn" className="btn-fill btn-fill-dark" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 26px',
              background: 'var(--accent-primary)',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
            >
              Projekt anfragen <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      {slug && (
        <ProjectDetailModal
          slug={slug}
          onClose={() => navigate('/portfolio')}
          onNavigate={(newSlug) => navigate(`/portfolio/${newSlug}`)}
        />
      )}
    </div>
  );
};

/* ---- Reusable section header (clean, kein Glow) ---- */
const SectionLabel = ({ kicker, title, titleAccent, align = 'left' }) => {
  // titleAccent: ein Wort/Phrase aus `title`, das in Orange gefärbt wird
  const renderTitle = () => {
    if (!titleAccent || !title.includes(titleAccent)) {
      return <>{title}</>;
    }
    const parts = title.split(titleAccent);
    return (
      <>
        {parts[0]}
        <span style={{ color: 'var(--accent-primary)' }}>{titleAccent}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div style={{
      marginBottom: '36px',
      textAlign: align,
    }}>
      <span style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--accent-primary)',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,107,0,0.4)',
        marginBottom: '14px',
      }}>{kicker}</span>
      <h2 style={{
        fontSize: 'clamp(26px, 4vw, 38px)',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.02em',
        color: 'var(--text-primary)',
      }}>
        {renderTitle()}
      </h2>
    </div>
  );
};

export default PortfolioPage;
