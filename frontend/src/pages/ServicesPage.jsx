import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Code, Smartphone, Shield, Palette, Gamepad2, Bot, Server, TrendingUp, PenTool, Globe, Layers, Database, CheckCircle, Sparkles, Zap, ExternalLink, Workflow, LayoutGrid } from 'lucide-react';
import Header from '../components/layout/Header';
import PageIntro from '../components/common/PageIntro';
import Seo from '../components/common/Seo';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import { services as mockServices } from '../data/mock';
import { AnimatedCounter, SplitLineHeading, GradientText } from '../components/ui/AnimatedText';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const iconMap = {
  Code, Smartphone, Shield, Palette, Gamepad2, Bot, Server, TrendingUp, PenTool, Globe, Layers, Database, Workflow,
};

// Service Features Data (fallback if no benefits set)
const serviceFeatures = {
  'web-development': ['SaaS-Plattformen', 'CRM-Systeme', 'Kundenportale', 'Buchungssysteme', 'Web-Apps', 'Mitgliederbereiche'],
  'app-development': ['iOS & Android', 'Mobile CRM Apps', 'SaaS Mobile Apps', 'Kunden-Apps', 'Mitarbeiter-Apps'],
  'cyber-security': ['Penetration Tests', 'Security Audits', 'DSGVO-Check', 'Security Monitoring', 'Compliance-Prüfungen'],
  'ui-ux': ['User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
  'gaming': ['Unity & Unreal', 'VR/AR Games', 'Multiplayer', 'Cross-Platform'],
  'chatbot': ['KI-Agenten für Unternehmen', 'KI-Kundenservice', 'KI-Vertriebsagenten', 'KI-Terminbuchung', 'KI-Wissensdatenbanken', 'Automatisierungen mit KI'],
  'server': ['Hosting & Managed Hosting', 'Cloud-Infrastruktur', 'Monitoring', 'Backups', 'DevOps', 'Wartung'],
  'marketing': ['SEO-Abonnements', 'Google Ads Management', 'LinkedIn Lead Generation', 'Conversion-Optimierung', 'E-Mail-Marketing', 'Lead-Generierung'],
  'automation-ki': ['KI-Agenten', 'Prozessautomatisierung', 'CRM-Automatisierung', 'E-Mail-Automatisierung', 'WhatsApp-Automatisierung', 'Lead-Automatisierung'],
  'graphic-design': ['Brand Identity', 'Logo Design', 'Print & Digital', 'Motion Graphics'],
};

const ServicesPage = () => {
  const [hoveredService, setHoveredService] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dbCategories, setDbCategories] = useState([]);
  const [dbServices, setDbServices] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/catalog/categories`),
          axios.get(`${BACKEND_URL}/api/catalog/services`),
        ]);
        setDbCategories(c.data.categories || []);
        setDbServices(s.data.services || []);
      } catch (e) { console.warn('Catalog load failed', e); }
    })();
  }, []);

  // Build effective services list from DB if available, otherwise fallback to mock
  const effectiveItems = (() => {
    if (dbCategories.length > 0) {
      // Build cards from categories; deep dive available via embedded services count
      const catMap = Object.fromEntries(dbCategories.map((c) => [c.id, c]));
      return dbCategories.map((cat) => {
        const svc = dbServices.filter((s) => s.category_id === cat.id);
        return {
          id: cat.slug,
          title: cat.name,
          description: cat.description || '',
          icon: cat.icon || 'Code',
          image: cat.image || (mockServices.find((m) => m.title === cat.name)?.image) || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
          link: `/services/${cat.slug}`,
          color: cat.color,
          serviceCount: svc.length,
          benefitsList: svc.flatMap((s) => s.benefits || []).slice(0, 4),
        };
      });
    }
    return mockServices.map((m) => ({ ...m, benefitsList: serviceFeatures[m.id] || [] }));
  })();

  const categories = [
    { id: 'all', name: 'Alle Services', icon: LayoutGrid },
    { id: 'development', name: 'Development', icon: Code },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  ];

  const categoryMap = {
    'web-development': 'development',
    'webentwicklung': 'development',
    'app-development': 'development',
    'app-entwicklung': 'development',
    'server': 'development',
    'server-systeme': 'development',
    'cyber-security': 'security',
    'ui-ux': 'design',
    'ui-ux-design': 'design',
    'graphic-design': 'design',
    'grafikdesign': 'design',
    'gaming': 'development',
    'gaming-entwicklung': 'development',
    'chatbot': 'development',
    'chatbot-entwicklung': 'development',
    'marketing': 'marketing',
    'digitales-marketing-seo': 'marketing',
  };

  const filteredServices = activeFilter === 'all'
    ? effectiveItems
    : effectiveItems.filter((s) => categoryMap[s.id] === activeFilter);

  return (
    <div className="page-transition">
      <Seo
        title="Unsere Services"
        description="Webentwicklung, App-Entwicklung, Cyber Security, UI/UX Design und mehr – alle Leistungen von Zebick im Überblick."
        path="/services"
      />
      <Header />

      {/* ========== INTRO (kompakt, kein Hero-Banner) ========== */}
      <PageIntro
        icon={<Sparkles size={13} />}
        badge="9 Servicebereiche • 50+ Projekte"
        title="Unsere Services"
        description={<>Von der ersten Idee bis zum erfolgreichen Launch – wir bieten das komplette Spektrum digitaler Services unter einem Dach.</>}
      />

      {/* Filter Tabs — top padding clears the fixed header (64px) now that
          PageIntro above no longer takes up any visible space. */}
      <section style={{
        paddingTop: '84px',
        paddingBottom: '20px',
        background: '#0a0a0a',
        position: 'sticky',
        top: '60px',
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ 
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px',
          }}>
            {categories.map((cat) => {
              const isActive = activeFilter === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  data-testid={`filter-${cat.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: isActive 
                      ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: isActive ? '#000' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={16} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid - Modern Bento Style */}
      <section style={{ 
        paddingTop: 'clamp(32px, 6vw, 80px)', 
        paddingBottom: 'clamp(48px, 8vw, 120px)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0d0d0d 100%)',
      }}>
        <div style={{ 
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 'clamp(16px, 3vw, 24px)',
          }}>
            {filteredServices.map((service, idx) => {
              const IconComponent = iconMap[service.icon] || Code;
              const isHovered = hoveredService === service.id;
              const features = service.benefitsList || serviceFeatures[service.id] || [];
              
              return (
                <Link 
                  to={service.link} 
                  key={service.id}
                  data-testid={`service-card-${service.id}`}
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                  style={{
                    position: 'relative',
                    borderRadius: 'clamp(16px, 2vw, 24px)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    minHeight: 'clamp(280px, 40vw, 380px)',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 30px 60px rgba(255, 107, 0, 0.15)' : 'none',
                  }}
                >
                  {/* Background Image */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${service.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: isHovered ? 0.15 : 0.08,
                    transition: 'opacity 0.5s ease',
                  }} />
                  
                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: isHovered 
                      ? 'linear-gradient(180deg, rgba(255, 107, 0, 0.1) 0%, rgba(0,0,0,0.9) 100%)'
                      : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
                    transition: 'background 0.5s ease',
                  }} />
                  
                  {/* Top Accent Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-light))',
                    transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.5s ease',
                  }} />
                  
                  {/* Content */}
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}>
                    {/* Icon */}
                    <div style={{ 
                      width: '72px', 
                      height: '72px',
                      background: isHovered 
                        ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))'
                        : 'rgba(255, 107, 0, 0.1)',
                      border: isHovered ? 'none' : '1px solid rgba(255, 107, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '20px',
                      marginBottom: '24px',
                      transition: 'all 0.4s ease',
                      boxShadow: isHovered ? '0 10px 40px rgba(255, 107, 0, 0.4)' : 'none',
                    }}>
                      {IconComponent && <IconComponent size={32} color={isHovered ? '#000' : 'var(--accent-primary)'} />}
                    </div>
                    
                    {/* Title */}
                    <h3 style={{ 
                      fontSize: '26px', 
                      fontWeight: 700, 
                      marginBottom: '12px',
                      color: 'var(--text-primary)',
                      transition: 'color 0.3s ease',
                    }}>
                      {service.title}
                    </h3>
                    
                    {/* Description */}
                    <p style={{ 
                      fontSize: '15px', 
                      lineHeight: 1.7, 
                      color: 'var(--text-muted)',
                      marginBottom: '24px',
                      flex: 1,
                    }}>
                      {service.description}
                    </p>
                    
                    {/* Features - Show on hover */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '10px',
                      marginBottom: '24px',
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'all 0.4s ease',
                      maxHeight: isHovered ? '200px' : '0',
                      overflow: 'hidden',
                    }}>
                      {features.map((feature, fIdx) => (
                        <div key={fIdx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                        }}>
                          <CheckCircle size={14} color="var(--accent-primary)" />
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      paddingTop: '20px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        Mehr erfahren
                        <ArrowRight size={16} style={{
                          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                          transition: 'transform 0.3s ease',
                        }} />
                      </span>
                      
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: isHovered ? 'var(--accent-primary)' : 'rgba(255, 107, 0, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                        <ExternalLink size={18} color={isHovered ? '#000' : 'var(--accent-primary)'} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section - Modern Timeline */}
      <section style={{ 
        padding: 'clamp(60px, 10vw, 120px) 16px',
        background: 'linear-gradient(180deg, #0d0d0d 0%, rgba(255, 107, 0, 0.04) 50%, #121212 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Elements - Hidden on Mobile */}
        <div className="hide-mobile" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 60%)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }} />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 80px)' }}>
            <span style={{
              display: 'inline-block',
              fontSize: 'clamp(10px, 1.5vw, 12px)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              padding: '8px 16px',
              background: 'rgba(255, 107, 0, 0.1)',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              Unser Prozess
            </span>
            <h2 style={{ 
              fontSize: 'clamp(28px, 5vw, 48px)', 
              fontWeight: 900,
              marginBottom: '20px',
            }}>
              <SplitLineHeading 
                line1="Von der Idee zum"
                line2="Erfolg"
                line2Gradient={true}
              />
            </h2>
            <p style={{ 
              fontSize: 'clamp(14px, 2vw, 18px)', 
              color: 'var(--text-muted)', 
              maxWidth: '600px', 
              margin: '0 auto',
              lineHeight: 1.7,
              padding: '0 8px',
            }}>
              Ein strukturierter Ansatz, der Transparenz und Qualität in jedem Schritt garantiert.
            </p>
          </div>

          {/* Process Steps */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 'clamp(24px, 4vw, 32px)',
            position: 'relative',
          }}>
            {[
              { 
                step: '01', 
                title: 'Discovery', 
                desc: 'Anforderungsanalyse, User Research und strategische Planung',
                icon: Sparkles,
              },
              { 
                step: '02', 
                title: 'Design', 
                desc: 'Wireframes, Prototypen und visuelles Design mit Feedback-Schleifen',
                icon: Palette,
              },
              { 
                step: '03', 
                title: 'Develop', 
                desc: 'Agile Entwicklung mit wöchentlichen Sprints und Reviews',
                icon: Code,
              },
              { 
                step: '04', 
                title: 'Deploy', 
                desc: 'Testing, Launch und kontinuierlicher Support & Optimierung',
                icon: Zap,
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  data-testid={`process-step-${idx}`}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    padding: '24px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {/* Step Circle */}
                  <div style={{
                    width: 'clamp(80px, 15vw, 120px)',
                    height: 'clamp(80px, 15vw, 120px)',
                    margin: '0 auto 24px',
                    background: 'linear-gradient(145deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                    border: '2px solid var(--accent-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 0 40px rgba(255, 107, 0, 0.2)',
                  }}>
                    <IconComp size={window.innerWidth <= 768 ? 28 : 36} color="var(--accent-primary)" />
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: 'clamp(28px, 5vw, 36px)',
                      height: 'clamp(28px, 5vw, 36px)',
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(11px, 1.5vw, 14px)',
                      fontWeight: 800,
                      color: '#000',
                    }}>
                      {item.step}
                    </span>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: 'clamp(18px, 3vw, 24px)', 
                    fontWeight: 700, 
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                  }}>
                    {item.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: 'clamp(13px, 1.5vw, 14px)', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.7,
                    maxWidth: '220px',
                    margin: '0 auto',
                  }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: 'clamp(60px, 12vw, 140px) 16px',
        background: 'linear-gradient(180deg, #121212 0%, rgba(255, 107, 0, 0.1) 50%, #080808 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Elements - Hidden on Mobile */}
        <div className="hide-mobile" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[800, 600, 400].map((size, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${size}px`,
              height: `${size}px`,
              border: `1px solid rgba(255, 107, 0, ${0.08 + idx * 0.04})`,
              borderRadius: '50%',
            }} />
          ))}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 107, 0, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }} />
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 6vw, 52px)', 
              fontWeight: 900,
              marginBottom: '24px',
              lineHeight: 1.1,
            }}>
              <SplitLineHeading 
                line1="Bereit für Ihr"
                line2="nächstes Projekt?"
                line2Gradient={true}
              />
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(14px, 2vw, 18px)', 
              color: 'var(--text-muted)', 
              marginBottom: 'clamp(32px, 6vw, 48px)',
              lineHeight: 1.7,
              padding: '0 8px',
            }}>
              Lassen Sie uns gemeinsam Ihre Vision verwirklichen. Kontaktieren Sie uns für ein unverbindliches Beratungsgespräch.
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px', 
              alignItems: 'center',
            }}>
              <Link 
                to="/contact" 
                className="btn-primary"
                data-testid="cta-contact"
                style={{ 
                  padding: 'clamp(14px, 2vw, 20px) clamp(28px, 5vw, 48px)', 
                  fontSize: 'clamp(14px, 1.5vw, 16px)',
                  fontWeight: 700,
                  width: '100%',
                  maxWidth: '300px',
                }}
              >
                Projekt starten
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/portfolio" 
                className="btn-secondary"
                data-testid="cta-portfolio"
                style={{ 
                  padding: 'clamp(14px, 2vw, 20px) clamp(28px, 5vw, 48px)', 
                  fontSize: 'clamp(14px, 1.5vw, 16px)',
                  width: '100%',
                  maxWidth: '300px',
                }}
              >
                Portfolio ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(-20px, 30px); }
          75% { transform: translate(20px, 20px); }
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
