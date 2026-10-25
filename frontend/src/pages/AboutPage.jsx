import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Target, Lightbulb, Shield, Users, Award, Code, Sparkles,
  Building, MapPin, Star, Rocket, Mail, Heart, TrendingUp,
  Quote, Calendar, Linkedin
} from 'lucide-react';
import Header from '../components/layout/Header';
import Seo from '../components/common/Seo';
import PageIntro from '../components/common/PageIntro';
import AutoSlider from '../components/common/AutoSlider';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import { MicrosoftLogo, AWSLogo, AzureLogo, GoogleLogo } from '../components/svg/LogoIcons';
import { aboutContent } from '../data/mock';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Timeline ab 2024 (Gründung) – realistisch für junge Agentur
const TIMELINE = [
  { year: '2024', title: 'Gründung',         desc: 'Drei Gründer starten mit einer klaren Vision: Digitale Lösungen, die wirken — sicher, durchdacht, ehrlich.', icon: Rocket,        img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop' },
  { year: '2024', title: 'Erste Kunden',     desc: 'Innerhalb der ersten 6 Monate gewinnen wir 12 Kunden – vom Solo-Unternehmer bis zum etablierten Mittelständler.', icon: Users,         img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop' },
  { year: '2025', title: 'Team-Wachstum',    desc: 'Wir wachsen auf 12 Expert:innen – Development, Design, Security und Marketing unter einem Dach.',          icon: TrendingUp,    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop' },
  { year: '2025', title: 'Security-Fokus',   desc: 'Ausbau des Cyber-Security-Teams und erste Penetration-Tests für Banken & Healthcare-Kund:innen.',           icon: Shield,        img: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&auto=format&fit=crop' },
  { year: '2026', title: '50+ Projekte',     desc: 'Über 50 erfolgreich umgesetzte Projekte. Standort Zürich kommt dazu, DACH-weite Präsenz.',                  icon: Award,         img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80&auto=format&fit=crop' },
];

const VALUES = [
  { icon: Lightbulb, title: 'Innovation',    desc: 'Wir denken voraus und setzen auf zukunftsweisende Technologien, die echten Mehrwert schaffen.', stat: '20+ Tech-Stack', img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80&auto=format&fit=crop' },
  { icon: Award,     title: 'Exzellenz',     desc: 'Höchste Qualitätsstandards in jedem Projekt. Gut ist uns nicht gut genug.',                    stat: '100% Qualität', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80&auto=format&fit=crop' },
  { icon: Shield,    title: 'Sicherheit',    desc: 'Security by Design ist unser Grundprinzip. Ihre Daten sind bei uns sicher.',                   stat: 'DSGVO-konform', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80&auto=format&fit=crop' },
  { icon: Users,     title: 'Partnerschaft', desc: 'Langfristige Beziehungen auf Augenhöhe. Ihr Erfolg ist unser Erfolg.',                         stat: '87% Retention', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80&auto=format&fit=crop' },
];

// Awards / Certifications mit ECHTEN Logos
const CERTIFICATIONS = [
  { name: 'AWS',              desc: 'Partner Network',     Component: AWSLogo,       h: 36 },
  { name: 'Microsoft',        desc: 'Solution Partner',    Component: MicrosoftLogo, h: 30 },
  { name: 'Azure',            desc: 'Certified',           Component: AzureLogo,     h: 32 },
  { name: 'Google Cloud',     desc: 'Partner',             src: 'https://cdn.simpleicons.org/googlecloud/4285F4', h: 34 },
  { name: 'Cloudflare',       desc: 'Partner',             src: 'https://cdn.simpleicons.org/cloudflare/F38020', h: 32 },
  { name: 'Stripe',           desc: 'Verified Partner',    src: 'https://cdn.simpleicons.org/stripe/635BFF',     h: 30 },
  { name: 'Docker',           desc: 'Certified',           src: 'https://cdn.simpleicons.org/docker/2496ED',     h: 32 },
  { name: 'GitHub',           desc: 'Verified Partner',    src: 'https://cdn.simpleicons.org/github/ffffff',     h: 30 },
];

// "Unsere Technologie-Partner" Logo-Wand (Team-Vorstellungs-Bento)
const techLogos = [
  { name: 'Microsoft',    Component: MicrosoftLogo, h: 24 },
  { name: 'AWS',          Component: AWSLogo,       h: 22 },
  { name: 'Azure',        Component: AzureLogo,     h: 24 },
  { name: 'Google Cloud', src: 'https://cdn.simpleicons.org/googlecloud/4285F4', h: 24 },
  { name: 'Stripe',       src: 'https://cdn.simpleicons.org/stripe/635BFF',       h: 22 },
  { name: 'Docker',       src: 'https://cdn.simpleicons.org/docker/2496ED',       h: 24 },
  { name: 'GitHub',       src: 'https://cdn.simpleicons.org/github/ffffff',       h: 24 },
  { name: 'Vercel',       src: 'https://cdn.simpleicons.org/vercel/ffffff',       h: 20 },
];

const AboutPage = () => {
  const [apiTeam, setApiTeam] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/team/members`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data) && data.length > 0) setApiTeam(data); })
      .catch(() => {});
    window.scrollTo(0, 0);
  }, []);

  const team = apiTeam || aboutContent.team;

  return (
    <div className="page-transition about-root" data-testid="about-page">
      <Seo
        title="Über uns"
        description="Lernen Sie Zebick kennen – ein Team aus Entwicklern, Designern und Security-Experten, das digitale Produkte mit Substanz baut."
        path="/about"
      />
      <Header />

      {/* ========== INTRO (kompakt, kein Hero-Banner) ========== */}
      <PageIntro
        icon={<Building size={13} />}
        badge="Über zebick"
        title="Über uns"
        description={<>Wir sind ein junges Team aus leidenschaftlichen Entwicklern, Designern und Security-Experten, die gemeinsam an der digitalen Zukunft arbeiten.</>}
      />

      {/* ============ STORY (im Vertrauen-Stil mit Bild + Text + Logo-Wand) ============ */}
      {/* <div>, not <section> — right after the zero-height intro above, a
          bare section tag gets its padding force-overridden by a global
          mobile rule (section{padding:48px 0!important}), leaving almost
          no clearance under the fixed header. */}
      <div className="about-section about-story-section" style={{ padding: 'clamp(70px, 10vw, 110px) 0', background: '#0a0a0a', borderTop: '1px solid rgba(255, 107, 0, 0.06)', borderBottom: '1px solid rgba(255, 107, 0, 0.06)' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          {/* Header — schlicht, ohne Gradient */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 5vw, 56px)' }}>
            <span style={{
              display: 'inline-block', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
              padding: '7px 14px', background: 'rgba(255, 107, 0, 0.08)',
              borderRadius: '6px', marginBottom: '16px',
            }}>Unsere Geschichte</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#fff' }}>
              Von der Idee zur <span style={{ color: '#FF6B00' }}>jungen Agentur</span> mit Ambition
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.7 }}>
              Wir sind 2024 mit klarem Kopf gestartet — und seitdem konsequent gewachsen.
            </p>
          </div>

          {/* Story-Block: Team-Bild + Text + Logos */}
          <div className="trust-story" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.9fr) 1fr',
            gap: 'clamp(24px, 4vw, 40px)',
            alignItems: 'stretch',
            background: '#0e0e0e',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            {/* Linkes Bild + Floating Elements */}
            <div style={{ position: 'relative', minHeight: '380px', background: '#0a0a0a' }}>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
                alt="Unser Team"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }} />
              {/* Floating "Seit 2024" Badge */}
              <div style={{
                position: 'absolute', top: '20px', left: '20px',
                padding: '6px 14px', background: '#FF6B00', borderRadius: '50px',
                fontSize: '11px', fontWeight: 700, color: '#000',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>Seit 2024</div>
              {/* Floating Team Strip */}
              <div style={{
                position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                padding: '14px 16px',
                background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{ display: 'flex' }}>
                  {[
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop',
                  ].map((src, i) => (
                    <img key={i} src={src} alt={`Team ${i+1}`} loading="lazy" style={{
                      width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover',
                      border: '2px solid #0a0a0a', marginLeft: i === 0 ? 0 : '-10px',
                    }} />
                  ))}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
                    border: '2px solid #0a0a0a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 800, color: '#000', marginLeft: '-10px',
                  }}>+8</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>12+ Expert:innen</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>im Team</div>
                </div>
              </div>
            </div>

            {/* Rechts: Text + Logos */}
            <div style={{ padding: 'clamp(24px, 3vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, marginBottom: '14px', color: '#fff', lineHeight: 1.3 }}>
                  Drei Gründer. Ein Versprechen. Ehrliche Arbeit.
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Zebick wurde 2024 von drei Macher:innen gegründet, die wussten: Es gibt zu viele Agenturen, die viel reden und wenig liefern. Wir machen es anders — wir arbeiten nicht
                  <em style={{ color: '#FF6B00', fontStyle: 'normal', fontWeight: 600 }}>&nbsp;für&nbsp;</em>
                  unsere Kunden, sondern
                  <em style={{ color: '#FF6B00', fontStyle: 'normal', fontWeight: 600 }}>&nbsp;mit&nbsp;</em>
                  ihnen.
                </p>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                  In nur zwei Jahren haben wir über 50 Projekte umgesetzt — und unsere Wiederkehrerrate liegt bei <strong style={{ color: '#FF6B00' }}>87%</strong>. Neun von zehn Kunden arbeiten nach dem ersten Projekt weiter mit uns.
                </p>
              </div>

              {/* Logo-Wand mit echten Logos */}
              <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, marginBottom: '14px' }}>
                  Unsere Technologie-Partner
                </div>
                {/* Desktop (>768px): static grid, unchanged. */}
                <div className="tp-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px 18px', alignItems: 'center' }}>
                  {techLogos.map((p, i) => (
                    <div key={i} title={p.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '32px', opacity: 0.6, transition: 'opacity 0.2s ease',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                    >
                      {p.Component ? <p.Component size={p.h} /> : (
                        <img src={p.src} alt={p.name} loading="lazy" style={{ height: `${p.h}px`, maxWidth: '100%', objectFit: 'contain' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile (<=768px): auto-sliding marquee — list rendered
                    twice, track scrolls exactly -50% for a seamless loop. */}
                <div className="tp-marquee" aria-hidden="true">
                  <div className="tp-marquee-track">
                    {[...techLogos, ...techLogos].map((p, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '32px', flexShrink: 0, opacity: 0.6,
                      }}>
                        {p.Component ? <p.Component size={p.h} /> : (
                          <img src={p.src} alt="" loading="lazy" style={{ height: `${p.h}px`, maxWidth: 'none', objectFit: 'contain' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission + Vision (Bild + Card pro Block) */}
          <div className="about-mv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '40px' }}>
            <FlatBlock icon={Target}    img="https://images.unsplash.com/photo-1552581234-26160f608093?w=900&q=80&auto=format&fit=crop"     label="Unsere Mission"  title="Was uns antreibt"  body={aboutContent.mission} />
            <FlatBlock icon={Lightbulb} img="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80&auto=format&fit=crop"   label="Unsere Vision"   title="Wohin wir wollen"  body={aboutContent.vision} />
          </div>

          {/* Philosophy + Culture */}
          <div className="about-mv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <FlatBlock icon={Code}  img="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80&auto=format&fit=crop"    label="Philosophie" title="Wie wir bauen" body={aboutContent.philosophy} compact />
            <FlatBlock icon={Heart} img="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=80&auto=format&fit=crop"      label="Kultur"      title="Wie wir leben" body={aboutContent.culture} compact />
          </div>
        </div>
      </div>

      {/* ============ TIMELINE — mit Bildern, ohne Glow ============ */}
      <section className="about-section" style={{ padding: '100px 0', background: '#0c0c0c' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px', maxWidth: '760px', margin: '0 auto 64px' }}>
            <span style={{
              display: 'inline-block', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
              padding: '7px 14px', background: 'rgba(255, 107, 0, 0.08)',
              borderRadius: '6px', marginBottom: '16px',
            }}>Meilensteine</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#fff' }}>
              Unser Weg <span style={{ color: '#FF6B00' }}>seit 2024</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Junges Unternehmen, klare Richtung — Schritt für Schritt zur etablierten Agentur.
            </p>
          </div>

          <div className="about-timeline" style={{ position: 'relative', maxWidth: '980px', margin: '0 auto' }}>
            <div className="about-timeline-line" style={{ position: 'absolute', left: '32px', top: '32px', bottom: '32px', width: '2px', background: 'linear-gradient(180deg, #FF6B00, rgba(255, 107, 0, 0.15))' }} />
            {TIMELINE.map((it, idx) => {
              const Ic = it.icon;
              return (
                <div key={idx} className="about-timeline-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '28px', marginBottom: idx === TIMELINE.length - 1 ? 0 : '32px', position: 'relative' }}>
                  <div className="about-timeline-num" style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: '#FF6B00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000',
                    flexShrink: 0, zIndex: 1, position: 'relative',
                  }}>
                    <Ic size={26} />
                  </div>
                  <div className="about-tl-card" style={{
                    background: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr',
                    transition: 'border-color 0.25s ease',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
                  >
                    <div className="about-tl-img" style={{ position: 'relative', minHeight: '160px', background: '#0a0a0a', overflow: 'hidden' }}>
                      <img src={it.img} alt={it.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0, filter: 'brightness(0.85) saturate(0.9)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
                    </div>
                    <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, color: '#FF6B00', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
                          {it.year}
                        </span>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>{it.title}</h3>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '14.5px', margin: 0 }}>
                        {it.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="about-section" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '720px', margin: '0 auto 56px' }}>
            <span className="badge" style={{ marginBottom: '20px' }}><Sparkles size={14} /> Unsere Werte</span>
            <h2 className="heading-1">Wofür wir <span className="text-gradient">stehen</span></h2>
          </div>
          <div className="about-values-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {VALUES.map((v, i) => {
              const Ic = v.icon;
              return (
                <div key={i} className="about-value-card" style={{
                  position: 'relative', overflow: 'hidden', borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  <img
                    src={v.img}
                    alt=""
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) brightness(0.45)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.75) 55%, rgba(10,10,10,0.96) 100%)' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--accent-primary), transparent)' }} />
                  <div className="about-value-content" style={{ position: 'relative', padding: '28px 32px 32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div className="about-value-icon" style={{ width: '56px', height: '56px', background: 'rgba(255,107,0,0.2)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic size={26} color="var(--accent-primary)" />
                      </div>
                      <span className="about-value-stat" style={{ padding: '7px 14px', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '50px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {v.stat}
                      </span>
                    </div>
                    <h3 className="about-value-title" style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.01em', color: '#fff' }}>{v.title}</h3>
                    <p className="about-value-desc" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: '15px' }}>{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TEAM ============
          Temporarily disabled on request — kept in code for later, not deleted. */}
      {false && (
      <section className="about-section" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '720px', margin: '0 auto 56px' }}>
            <span className="badge" style={{ marginBottom: '20px' }}><Users size={14} /> Das Team</span>
            <h2 className="heading-1">Die Köpfe hinter <span className="text-gradient">zebick</span></h2>
            <p className="text-body" style={{ marginTop: '14px' }}>
              50+ feste Expert:innen — keine Freelancer-Pools, kein Rotations-Karussell.
            </p>
          </div>

          {/* Desktop (>768px): static grid, unchanged. */}
          <div className="about-team-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {team.slice(0, 4).map((m, i) => (
              <TeamCard key={i} m={m} />
            ))}
          </div>

          {/* Mobile (<=768px): auto-slide, one member at a time. */}
          <div className="about-team-slider">
            <AutoSlider testid="about-team-slider" showDots={false} items={team.slice(0, 4)} renderItem={(m) => (
              <div style={{ padding: '2px' }}><TeamCard m={m} /></div>
            )} />
          </div>
        </div>
      </section>
      )}

      {/* ============ LOCATIONS ============ */}
      <section className="about-section" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '720px', margin: '0 auto 48px' }}>
            <span className="badge" style={{ marginBottom: '20px' }}><MapPin size={14} /> Standorte</span>
            <h2 className="heading-1">Wo Sie uns <span className="text-gradient">finden</span></h2>
          </div>
          {aboutContent.locations.map((loc, i) => (
            <div key={i} className="about-loc-card" style={{
              position: 'relative', maxWidth: '900px', margin: '0 auto',
              borderRadius: '20px', overflow: 'hidden',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              minHeight: '320px',
              display: 'flex', alignItems: 'flex-end',
            }}>
              <img
                src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1400&q=80&auto=format&fit=crop"
                alt=""
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) brightness(0.55)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.15) 100%)' }} />
              {loc.isHQ && (
                <div style={{ position: 'absolute', top: 20, right: 20, padding: '6px 14px', background: 'var(--accent-primary)', borderRadius: '50px', fontSize: '11px', fontWeight: 700, color: '#000', letterSpacing: '0.06em' }}>HAUPTSITZ</div>
              )}
              <div style={{ position: 'relative', padding: '36px 40px', width: '100%' }}>
                <div style={{ width: '52px', height: '52px', background: 'rgba(255,107,0,0.2)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <MapPin size={24} color="var(--accent-primary)" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.01em', color: '#fff' }}>{loc.city}</h3>
                <p style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '12px' }}>{loc.country}</p>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>{loc.address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ AWARDS / PARTNER mit ECHTEN Logos (kein Glow) ============ */}
      <section className="about-section" style={{ padding: '100px 0', background: '#0a0a0a' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '720px', margin: '0 auto 56px' }}>
            <span style={{
              display: 'inline-block', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
              padding: '7px 14px', background: 'rgba(255, 107, 0, 0.08)',
              borderRadius: '6px', marginBottom: '16px',
            }}>Partnerschaften</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#fff' }}>
              Wir bauen auf <span style={{ color: '#FF6B00' }}>starke Partner</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Zertifizierte Partnerschaften mit den führenden Tech-Anbietern weltweit.
            </p>
          </div>

          {/* Desktop (>768px): static grid, unchanged. */}
          <div className="about-certs-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
            {CERTIFICATIONS.map((c, i) => (
              <CertCard key={i} c={c} />
            ))}
          </div>

          {/* Mobile (<=768px): auto-sliding marquee, same pattern as
              "Unsere Technologie-Partner" — list rendered twice, track
              scrolls exactly -50% for a seamless loop. */}
          <div className="certs-marquee" aria-hidden="true">
            <div className="certs-marquee-track">
              {[...CERTIFICATIONS, ...CERTIFICATIONS].map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '40px', flexShrink: 0, opacity: 0.85,
                }}>
                  {c.Component ? <c.Component size={c.h} /> : (
                    <img src={c.src} alt="" loading="lazy" style={{ height: `${c.h}px`, maxWidth: 'none', objectFit: 'contain' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA — ohne Glow ============ */}
      <section className="about-section" data-testid="about-cta" style={{ padding: '120px 0', background: '#0a0a0a' }}>
        <div className="container">
          <div className="about-cta-card" style={{
            maxWidth: '880px', margin: '0 auto',
            padding: '56px 48px', textAlign: 'center', position: 'relative',
            background: '#111',
            border: '1px solid rgba(255, 107, 0, 0.25)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative' }}>
              <Rocket size={44} color="#FF6B00" style={{ marginBottom: '20px' }} />
              <span style={{
                display: 'inline-block', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
                padding: '7px 14px', background: 'rgba(255, 107, 0, 0.08)',
                borderRadius: '6px', marginBottom: '24px',
              }}>Lassen Sie uns starten</span>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, marginBottom: '18px', color: '#fff', lineHeight: 1.2 }}>
                Bereit für Ihr <span style={{ color: '#FF6B00' }}>nächstes Projekt?</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.65 }}>
                Lassen Sie uns gemeinsam Ihr Vorhaben verwirklichen und digitale Exzellenz schaffen.
              </p>
              <div className="about-cta-buttons" style={{ display: 'inline-flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/contact" className="btn-primary" data-testid="about-cta-contact">
                  Kontakt aufnehmen <ArrowRight size={18} />
                </Link>
                <Link to="/portfolio" className="btn-secondary" data-testid="about-cta-portfolio">
                  Portfolio ansehen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      {/* ============ MOBILE-RESPONSIVE ============ */}
      <style>{`
        /* Desktop: slider/marquee stay hidden, the static grids above are used. */
        .about-team-slider, .certs-marquee { display: none; }

        @media (max-width: 900px) {
          [data-testid="about-page"] .about-hero-stats {
            display: grid !important; grid-template-columns: 1fr 1fr 1fr !important;
            gap: 10px !important; margin-top: 48px !important;
          }
          [data-testid="about-page"] .about-hero-stats .glass-card-static {
            padding: 16px 8px !important;
          }
          [data-testid="about-page"] .about-hero-stats .glass-card-static > div:first-child {
            font-size: 26px !important;
          }
          [data-testid="about-page"] .about-section {
            padding: 64px 0 !important;
          }
          /* Story section is first after the (zero-height) intro, so it
             alone needs extra top clearance under the fixed header. */
          [data-testid="about-page"] .about-story-section {
            padding-top: 76px !important;
          }
          [data-testid="about-page"] .about-story-card {
            padding: 32px 24px !important;
          }
          [data-testid="about-page"] .about-mv-grid,
          [data-testid="about-page"] .about-loc-grid {
            display: grid !important; grid-template-columns: 1fr !important; gap: 14px !important;
          }
          [data-testid="about-page"] .about-values-grid {
            grid-template-columns: 1fr 1fr !important; gap: 10px !important;
          }
          [data-testid="about-page"] .about-value-card {
            min-height: 220px !important;
          }
          [data-testid="about-page"] .about-value-content {
            padding: 16px 16px 18px !important;
          }
          [data-testid="about-page"] .about-value-icon {
            width: 26px !important; height: 26px !important; border-radius: 8px !important;
          }
          [data-testid="about-page"] .about-value-icon svg {
            width: 13px !important; height: 13px !important;
          }
          [data-testid="about-page"] .about-value-stat {
            padding: 3px 7px !important; font-size: 8px !important; white-space: nowrap !important;
          }
          [data-testid="about-page"] .about-value-title {
            font-size: 15px !important; margin-bottom: 4px !important;
          }
          [data-testid="about-page"] .about-value-desc {
            font-size: 11.5px !important; line-height: 1.45 !important;
          }
          [data-testid="about-page"] .about-team-grid { display: none !important; }
          [data-testid="about-page"] .about-team-slider { display: block !important; }
          [data-testid="about-page"] .about-tl-card {
            display: grid !important; grid-template-columns: 1fr !important;
          }
          [data-testid="about-page"] .about-tl-img {
            min-height: 140px !important;
          }
          [data-testid="about-page"] .about-timeline-line {
            left: 22px !important;
          }
          [data-testid="about-page"] .about-timeline-row {
            display: grid !important; grid-template-columns: 56px 1fr !important; gap: 16px !important; margin-bottom: 20px !important;
          }
          [data-testid="about-page"] .about-timeline-num {
            width: 44px !important; height: 44px !important; border-radius: 14px !important;
          }
          [data-testid="about-page"] .about-cta-card {
            padding: 40px 24px !important;
          }
        }
        /* Desktop: marquee stays hidden, the static grid above is used. */
        .tp-marquee { display: none; }

        /* Mobile: auto-slide instead of a cramped 4-column logo grid. */
        @media screen and (max-width: 768px) {
          .tp-grid { display: none !important; }
          .tp-marquee {
            display: block;
            overflow: hidden;
            mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
          }
          .tp-marquee-track {
            display: flex;
            width: max-content;
            gap: 28px;
            animation: tp-slide 18s linear infinite;
          }
          @keyframes tp-slide {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        }

        /* Desktop: marquee stays hidden, the static grid above is used. */
        .certs-marquee { display: none; }

        /* Mobile: auto-slide instead of a cramped 4-column logo grid. */
        @media screen and (max-width: 768px) {
          [data-testid="about-page"] .about-certs-grid { display: none !important; }
          .certs-marquee {
            display: block;
            overflow: hidden;
            mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
          }
          .certs-marquee-track {
            display: flex;
            width: max-content;
            gap: 36px;
            animation: certs-slide 20s linear infinite;
          }
          @keyframes certs-slide {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        }
      `}</style>
    </div>
  );
};

// ---- Helpers ----
const CertCard = ({ c }) => (
  <div className="about-cert-card" style={{
    padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    background: '#111', border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '14px',
  }}>
    <div className="about-cert-logo" style={{ height: '52px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {c.Component ? (
        <c.Component size={c.h} />
      ) : (
        <img src={c.src} alt={c.name} loading="lazy" style={{ height: `${c.h}px`, maxWidth: '100%', objectFit: 'contain' }} />
      )}
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{c.desc}</div>
    </div>
  </div>
);

const TeamCard = ({ m }) => (
  <div className="glass-card-static about-team-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ aspectRatio: '4/5', background: '#111', position: 'relative', overflow: 'hidden' }}>
      <img src={m.image} alt={m.name} className="img-color" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px', letterSpacing: '-0.01em' }}>{m.name}</h3>
        <p style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>{m.role}</p>
      </div>
    </div>
    {m.bio && (
      <div style={{ padding: '20px 22px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.bio}</p>
      </div>
    )}
  </div>
);

const FlatBlock = ({ icon: Icon, label, title, body, img, compact = false }) => (
  <div className="about-flat-card" style={{
    background: '#111', border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px', overflow: 'hidden',
    transition: 'border-color 0.25s ease',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
  >
    {img && (
      <div className="about-flat-img" style={{ position: 'relative', height: '180px', background: '#0a0a0a', overflow: 'hidden' }}>
        <img src={img} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.78) saturate(0.9)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(17,17,17,1) 100%)' }} />
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          width: '40px', height: '40px', borderRadius: '11px',
          background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 107, 0, 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color="#FF6B00" />
        </div>
      </div>
    )}
    <div style={{ padding: compact ? '24px 28px' : '28px 32px' }}>
      <span style={{
        display: 'inline-block', fontSize: '11px', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF6B00',
        marginBottom: '10px',
      }}>{label}</span>
      <h3 style={{ fontSize: compact ? '20px' : '22px', fontWeight: 800, marginBottom: '12px', color: '#fff', letterSpacing: '-0.015em' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: compact ? '14.5px' : '15px', margin: 0 }}>{body}</p>
    </div>
  </div>
);

export default AboutPage;
