import React, { useState, useEffect } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * ServicePortfolioSection
 * - Zeigt echte Portfolio-Projekte aus dem Admin gepflegt
 * - Gefiltert nach service_id
 * - Klick öffnet website_url (falls vorhanden) sonst Detail-Page
 * - Fallback: zeigt statische Beispiele wenn keine Portfolio-Daten vorhanden
 *
 * Props:
 *   serviceId: string  — z.B. 'web-development', 'chatbot' (zum Filtern)
 *   fallbackExamples: array  — statische Beispiele falls Backend leer
 *     [{ title, tag, desc, img }]
 *   eyebrow: string   — Section-Badge Text (default: 'Projektbeispiele')
 *   title, accentWord, subtitle
 *   testid: string
 *   showCategoryFilter: bool — wie die Portfolio-Seite: zeigt ALLE Projekte
 *     (nicht nach serviceId gefiltert) mit Kategorie-Pills ("Alle" + Kategorien)
 */
const ServicePortfolioSection = ({
  serviceId,
  fallbackExamples = [],
  eyebrow = 'Projektbeispiele',
  title = 'Was wir',
  accentWord = 'bauen können',
  subtitle = 'Echte Projekte aus unserem Portfolio — direkt aus der Praxis.',
  testid = 'section-projects',
  showCategoryFilter = false,
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Alle');

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/portfolio/projects?limit=50`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          // Ohne Kategorie-Filter: nach service_id eingrenzen (falls gesetzt)
          const filtered = (!showCategoryFilter && serviceId)
            ? data.filter(p => p.service_id === serviceId)
            : data;
          setProjects(showCategoryFilter ? filtered : filtered.slice(0, 9));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [serviceId, showCategoryFilter]);

  const openProject = (project) => {
    if (project.website_url) {
      window.open(project.website_url, '_blank', 'noopener,noreferrer');
    } else if (project.slug) {
      window.location.href = `/portfolio/${project.slug}`;
    }
  };

  // Wenn keine Portfolio-Projekte vorhanden sind → Fallback (statische Beispiele)
  const usingFallback = !loading && projects.length === 0;
  const categories = showCategoryFilter ? ['Alle', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))] : [];
  const filteredProjects = (showCategoryFilter && activeFilter !== 'Alle')
    ? projects.filter((p) => p.category === activeFilter)
    : projects;
  const items = usingFallback ? fallbackExamples : filteredProjects;

  if (items.length === 0) return null;

  return (
    <section className="section" data-testid={testid} style={{ padding: '120px 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block', padding: '6px 14px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: '6px',
            fontSize: '12px', fontWeight: 700, color: '#FF6B00',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            marginBottom: '16px',
          }}>
            {eyebrow}
          </div>
          <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>
            {title} <span className="text-gradient">{accentWord}</span>
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            {subtitle}
          </p>
        </div>

        {showCategoryFilter && categories.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
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
                    padding: '10px 18px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit', borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {items.map((p, i) => {
            // Normalisiere die Felder (Portfolio API hat cover_image, description, tags; Fallback hat img, desc, tag)
            const image = p.cover_image || p.img;
            const cardTitle = p.title;
            const cardDesc = p.description || p.desc;
            const cardTag = p.category || p.tag;
            const hasUrl = !!p.website_url;

            return (
              <article
                key={p.id || i}
                data-testid={`project-card-${i}`}
                onClick={() => !usingFallback && openProject(p)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 0, overflow: 'hidden',
                  cursor: !usingFallback ? 'pointer' : 'default',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(255,107,0,0.18)';
                  const img = e.currentTarget.querySelector('.proj-img');
                  if (img) img.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  const img = e.currentTarget.querySelector('.proj-img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    className="proj-img"
                    src={image}
                    alt={cardTitle}
                    loading="lazy"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s ease',
                      display: 'block',
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
                  }} />
                  {cardTag && (
                    <span style={{
                      position: 'absolute', top: '16px', left: '16px',
                      padding: '6px 12px', borderRadius: '999px',
                      background: 'rgba(255,107,0,0.92)',
                      backdropFilter: 'blur(8px)',
                      color: '#000', fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      {cardTag}
                    </span>
                  )}
                  {/* External-Link Indicator */}
                  {hasUrl && (
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(10, 10, 10, 0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 107, 0, 0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ExternalLink size={16} color="#FF6B00" />
                    </div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {cardTitle}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: hasUrl ? '14px' : 0 }}>
                    {(cardDesc || '').substring(0, 140)}
                    {(cardDesc || '').length > 140 ? '…' : ''}
                  </p>
                  {hasUrl && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 700, color: '#FF6B00',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Website besuchen <ExternalLink size={13} />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA: Alle Projekte */}
        {!usingFallback && (
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/portfolio" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px',
              background: 'transparent',
              border: '2px solid var(--accent-primary)',
              borderRadius: '50px',
              color: 'var(--accent-primary)',
              fontSize: '14px', fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            >
              Alle Projekte ansehen <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicePortfolioSection;
