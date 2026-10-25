import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ArrowRight, CheckCircle, Sparkles, Code, Smartphone, Shield, Palette, Gamepad2,
  Bot, Server, TrendingUp, PenTool,
} from 'lucide-react';
import Header from '../components/layout/Header';
import PageIntro from '../components/common/PageIntro';
import Footer from '../components/layout/Footer';
import Seo from '../components/common/Seo';
import { getThemeForCategory } from '../data/serviceThemes';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const iconMap = { Code, Smartphone, Shield, Palette, Gamepad2, Bot, Server, TrendingUp, PenTool };

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [c, s] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/catalog/categories`),
          axios.get(`${BACKEND_URL}/api/catalog/services?category_slug=${slug}`),
        ]);
        const cat = (c.data.categories || []).find((x) => x.slug === slug);
        setCategory(cat);
        setServices(s.data.services || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="page-transition">
        <Header />
        <div style={{ padding: '160px 20px', textAlign: 'center', color: '#888' }}>Lädt…</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="page-transition">
        <Header />
        <div style={{ padding: '160px 20px', textAlign: 'center' }}>
          <h1 className="heading-display" style={{ marginBottom: 12 }}>Service nicht gefunden</h1>
          <Link to="/services" className="btn-primary">Zurück zur Übersicht</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = iconMap[category.icon] || Code;
  const theme = getThemeForCategory(category);

  return (
    <div className="page-transition">
      <Seo title={category.name} description={theme.description} path={`/services/${slug}`} />
      <Header />

      {/* ========== INTRO (kompakt, kein Hero-Banner) ========== */}
      <PageIntro
        testid="service-detail-intro"
        icon={<Icon size={13} />}
        badge={theme.badge}
        stats={theme.stats}
        title={
          <span data-testid="service-detail-title">
            {theme.heroLines.map((line, i) => {
              const isAccent = line === theme.accentWord;
              return (
                <React.Fragment key={i}>
                  {isAccent ? <span className="text-gradient">{line}</span> : line}
                  {i < theme.heroLines.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </span>
        }
        description={theme.description}
      >
        <button onClick={() => navigate('/services')} style={{
          background: 'transparent', border: 'none', color: '#9a9a9a', cursor: 'pointer', padding: 0,
          fontSize: 14, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6,
        }} data-testid="service-back-btn">
          <ArrowLeft size={16} /> Zurück zu allen Services
        </button>
      </PageIntro>

      {/* Services Grid */}
      <section id="services" style={{ padding: '80px 20px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FF6B00', marginBottom: 12 }}>
            Unsere Leistungen
          </div>
          <h2 className="heading-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', maxWidth: 720, marginBottom: 0 }}>
            Was wir im Bereich <span className="text-gradient">{category.name}</span> für dich machen
          </h2>
        </div>

        {services.length === 0 ? (
          <div style={{ padding: 40, background: '#111', border: '1px solid #222', borderRadius: 12, textAlign: 'center', color: '#9a9a9a', maxWidth: 720, margin: '0 auto' }}>
            <Sparkles size={28} color="#FF6B00" style={{ marginBottom: 12 }} />
            <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Individuelles Angebot statt Standard-Paket</h3>
            <p style={{ margin: 0 }}>Sprich uns an – wir bauen dir ein maßgeschneidertes Konzept inkl. Festpreis.</p>
            <Link to="/contact" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              Projekt besprechen <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div data-testid="service-detail-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {services.map((s) => (
              <article key={s.id} data-testid={`service-card-${s.slug}`} style={{
                background: '#111', border: '1px solid #222', borderRadius: 12, padding: 26,
                display: 'flex', flexDirection: 'column', gap: 14,
                transition: 'border-color 180ms, transform 180ms',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.transform = 'none'; }}
              >
                {s.image && (
                  <div style={{ aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                    <img src={s.image} alt={s.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{s.title}</h3>
                {s.description && <p style={{ color: '#b5b5b5', fontSize: 14, lineHeight: 1.55, margin: 0 }}>{s.description}</p>}

                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: '#9a9a9a', marginTop: 4 }}>
                  {s.price_from && <span><strong style={{ color: '#FF6B00' }}>ab €{Number(s.price_from).toLocaleString('de-DE')}</strong></span>}
                  {s.duration && <span>⏱ {s.duration}</span>}
                </div>

                {(s.benefits || []).length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 7 }}>
                    {s.benefits.slice(0, 6).map((b, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#d5d5d5' }}>
                        <CheckCircle size={15} color="#FF6B00" style={{ marginTop: 1, flexShrink: 0 }} /> {b}
                      </li>
                    ))}
                  </ul>
                )}

                {(s.faqs || []).length > 0 && (
                  <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: 14, marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>FAQ</div>
                    {s.faqs.map((f, i) => {
                      const key = `${s.id}-${i}`;
                      const open = openFaq === key;
                      return (
                        <div key={i} style={{ borderBottom: '1px solid #1c1c1c' }}>
                          <button onClick={() => setOpenFaq(open ? null : key)} style={{
                            width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
                            color: '#fff', padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit',
                          }}>
                            {f.question}
                            <span style={{ color: '#FF6B00', fontSize: 18 }}>{open ? '−' : '+'}</span>
                          </button>
                          {open && f.answer && <div style={{ color: '#b5b5b5', fontSize: 13, paddingBottom: 12, lineHeight: 1.55 }}>{f.answer}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}

                <Link
                  to={s.cta_url || '/contact'}
                  data-testid={`service-cta-${s.slug}`}
                  className="btn-primary"
                  style={{ marginTop: 6, justifyContent: 'center' }}
                >
                  {s.cta_label || 'Mehr erfahren'} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '40px 20px 100px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,0,0.06), rgba(255,107,0,0.01))',
          border: '1px solid rgba(255,107,0,0.25)', borderRadius: 16, padding: 60, textAlign: 'center',
        }}>
          <Sparkles size={32} color="#FF6B00" style={{ marginBottom: 18 }} />
          <h2 className="heading-display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 14 }}>
            Bereit, deine <span className="text-gradient">{category.name}</span> auf das nächste Level zu heben?
          </h2>
          <p style={{ color: '#b5b5b5', marginBottom: 28, fontSize: 16, maxWidth: 620, margin: '0 auto 28px' }}>
            Erzähl uns von deiner Idee. Wir melden uns innerhalb von 24 Stunden mit einem unverbindlichen Vorschlag.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary">Projekt starten <ArrowRight size={18} /></Link>
            <Link to="/portfolio" className="btn-secondary">Referenzen ansehen</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
