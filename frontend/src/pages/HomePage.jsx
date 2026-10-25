import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Code, Smartphone, Shield, Palette, Gamepad2, Bot, Server, TrendingUp,
  PenTool, CheckCircle, Users, Clock, Sparkles, Rocket, Cloud, Layers, FlaskConical,
  Plus, Minus, Phone, Mail, Award, Zap, Search, Heart, MessageCircle, Globe, Briefcase,
  Building2, Quote, ShieldCheck, BadgeCheck, X, Check, Headphones, GraduationCap, Lock,
  Eye, FileCheck, ExternalLink, LayoutGrid,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import HeroSVG from '../components/svg/HeroSVG';
import { MicrosoftLogo, AWSLogo, AzureLogo, OpenAILogo, GoogleLogo, SlackLogo, SalesforceLogo } from '../components/svg/LogoIcons';
import ZebickMark from '../components/brand/ZebickMark';
import TestimonialsMarquee from '../components/common/TestimonialsMarquee';
import { portfolioProjects, testimonials as staticTestimonials, services as mockServices, companyInfo } from '../data/mock';
import { AnimatedCounter, SplitLineHeading, Reveal } from '../components/ui/AnimatedText';
import TestimonialForm from '../components/common/TestimonialForm';
import Seo, { SITE_URL } from '../components/common/Seo';

// Organization (as ProfessionalService, which covers LocalBusiness fields
// too) + WebSite JSON-LD, combined via @graph — rendered once here (home
// page), not repeated per-page, per standard practice. NAP data (address /
// phone) comes from the same data/mock.js the Footer already displays, so
// the schema always matches what visitors see. NOTE: that phone number
// looks like placeholder data (+41 61 123 45 67) — replace with the real
// number before this goes live, since schema mismatched to reality hurts
// rather than helps local SEO.
const HOME_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#organization`,
      name: 'Zebick',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/og-image.png`,
      email: companyInfo.email,
      telephone: companyInfo.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Stellimattweg 36',
        postalCode: '4125',
        addressLocality: 'Riehen',
        addressCountry: 'CH',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Zebick',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEFAULT_HOME = {
  hero_badge: 'Digitalagentur & Cyber Security seit 2024',
  hero_description:
    'Von innovativen Webanwendungen bis zu sicheren Enterprise-Lösungen – wir sind Ihr Partner für digitale Transformation.',
};

const iconMap = {
  Code, Smartphone, Shield, Palette, Gamepad2, Bot, Server, TrendingUp, PenTool, Layers, Cloud,
};

/* =========================================================
   Hilfs-Komponente: Logo-Tile mit Fallback
   ========================================================= */
const LogoTile = ({ name, src, Component, height = 32, white = false }) => {
  const [errored, setErrored] = useState(false);
  return (
    <div title={name} data-testid={`logo-${name.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: `${height + 8}px`, padding: '4px 8px',
        opacity: 0.7, transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {Component ? <Component size={height} /> : (
        !errored && src ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            onError={() => setErrored(true)}
            style={{ height: `${height}px`, maxWidth: '100%', objectFit: 'contain', filter: white ? 'brightness(0) invert(1)' : 'none' }}
          />
        ) : (
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{name}</span>
        )
      )}
    </div>
  );
};

/* =========================================================
   2) VERTRAUENSBEREICH — Bilder & Logos, weniger Glow
   ========================================================= */
const TrustSection = () => {
  const stats = [
    {
      value: '50+', label: 'Projekte umgesetzt', sub: 'seit 2024',
      icon: Rocket,
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80&auto=format&fit=crop',
    },
    {
      value: '50+', label: 'Zufriedene Kunden', sub: 'Wiederkehrerrate 87%',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80&auto=format&fit=crop',
    },
    {
      value: '24/7', label: 'Support', sub: 'Reaktionszeit < 2h',
      icon: Headphones,
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80&auto=format&fit=crop',
    },
    {
      value: '2+', label: 'Jahre Erfahrung', sub: 'seit 2024',
      icon: Award,
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80&auto=format&fit=crop',
    },
  ];

  // Echte Logos
  const trustedLogos = [
    { name: 'Microsoft',    Component: MicrosoftLogo, height: 26 },
    { name: 'AWS',          Component: AWSLogo,       height: 24 },
    { name: 'Azure',        Component: AzureLogo,     height: 26 },
    { name: 'Google Cloud', src: 'https://cdn.simpleicons.org/googlecloud/4285F4', height: 26 },
    { name: 'Stripe',       src: 'https://cdn.simpleicons.org/stripe/635BFF',       height: 24 },
    { name: 'Docker',       src: 'https://cdn.simpleicons.org/docker/2496ED',       height: 26 },
    { name: 'GitHub',       src: 'https://cdn.simpleicons.org/github/ffffff',       height: 26 },
    { name: 'Vercel',       src: 'https://cdn.simpleicons.org/vercel/ffffff',       height: 22 },
  ];

  return (
    <section data-testid="trust-section" style={{
      padding: 'clamp(70px, 10vw, 120px) 16px',
      background: '#0a0a0a',
      position: 'relative',
      borderTop: '1px solid rgba(255, 107, 0, 0.06)',
      borderBottom: '1px solid rgba(255, 107, 0, 0.06)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Header — schlicht, ohne Gradient */}
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 5vw, 56px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '7px 14px', background: 'rgba(255, 107, 0, 0.08)',
            borderRadius: '6px', marginBottom: '16px',
          }}>Vertrauen</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#fff' }}>
            Zahlen, die für sich sprechen
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.7 }}>
            Hinter jeder Zahl steht echte Arbeit, echte Menschen und echte Ergebnisse.
          </p>
        </Reveal>

        {/* Stats mit Bildern — auf Mobil ausgeblendet, siehe .stat-grid unten */}
        <div className="stat-grid" data-keep-grid style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(14px, 2vw, 20px)',
          marginBottom: 'clamp(40px, 5vw, 56px)',
        }}>
          {stats.map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 0.08} data-testid={`stat-card-${i}`} style={{
              position: 'relative',
              background: '#111',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'border-color 0.25s ease, transform 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Bild-Header */}
              <div style={{
                position: 'relative', height: '120px', overflow: 'hidden',
              }}>
                <img src={s.image} alt={s.label} loading="lazy" style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block', filter: 'brightness(0.7) saturate(0.85)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(17,17,17,1) 100%)',
                }} />
                {/* Icon overlay */}
                <div style={{
                  position: 'absolute', top: '14px', left: '14px',
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(10, 10, 10, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 107, 0, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon size={18} color="#FF6B00" />
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: '18px 22px 22px' }}>
                <div style={{
                  fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#FF6B00',
                  lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.02em',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginBottom: '3px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {s.sub}
                </div>
              </div>
            </Reveal>
          ))}
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
          {/* Linkes Bild */}
          <Reveal direction="left" style={{
            position: 'relative',
            minHeight: '380px',
            background: '#0a0a0a',
          }}>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
              alt="Unser Team"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
            }} />
            {/* Floating "Seit 2024" Badge */}
            <div style={{
              position: 'absolute', top: '20px', left: '20px',
              padding: '6px 14px',
              background: '#FF6B00',
              borderRadius: '50px',
              fontSize: '11px', fontWeight: 700, color: '#000',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Seit 2024
            </div>
            {/* Floating Mini-Photos Strip */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '20px', right: '20px',
              padding: '14px 16px',
              background: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              {/* Avatar stack */}
              <div style={{ display: 'flex' }}>
                {[
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop',
                ].map((src, i) => (
                  <img key={i} src={src} alt={`Team ${i+1}`} loading="lazy" style={{
                    width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover',
                    border: '2px solid #0a0a0a',
                    marginLeft: i === 0 ? 0 : '-10px',
                  }} />
                ))}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
                  border: '2px solid #0a0a0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: '#000',
                  marginLeft: '-10px',
                }}>+46</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>50+ Expert:innen</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>im Team</div>
              </div>
            </div>
          </Reveal>

          {/* Rechts: Text + Logos */}
          <Reveal direction="right" style={{
            padding: 'clamp(24px, 3vw, 40px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            gap: '24px',
          }}>
            <div>
              <h3 style={{
                fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800,
                marginBottom: '14px', color: '#fff', lineHeight: 1.3,
              }}>
                Ein Team. Eine Mission. Seit 2024.
              </h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Seit 2024 entwickeln wir digitale Lösungen für Unternehmen jeder Größe. Wir arbeiten nicht
                <em style={{ color: '#FF6B00', fontStyle: 'normal', fontWeight: 600 }}>&nbsp;für&nbsp;</em>
                unsere Kunden, sondern
                <em style={{ color: '#FF6B00', fontStyle: 'normal', fontWeight: 600 }}>&nbsp;mit&nbsp;</em>
                ihnen — mit persönlicher Beratung, klaren Prozessen und ehrlicher Kommunikation.
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                Das spiegelt sich auch in unserer Wiederkehrerrate von <strong style={{ color: '#FF6B00' }}>87%</strong>
                &nbsp;wider — neun von zehn Kunden arbeiten nach dem ersten Projekt weiter mit uns.
              </p>
            </div>

            {/* Logo-Wand */}
            <div style={{
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{
                fontSize: '10px', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700,
                marginBottom: '14px',
              }}>
                Unsere Technologie-Partner
              </div>
              {/* Desktop (>768px): static grid, unchanged. */}
              <div className="tp-grid" data-keep-grid style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px 18px', alignItems: 'center',
              }}>
                {trustedLogos.map((p, i) => (
                  <div key={i} title={p.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '34px', opacity: 0.6,
                    transition: 'opacity 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}
                  >
                    {p.Component ? <p.Component size={p.height} /> : (
                      <img src={p.src} alt={p.name} loading="lazy" style={{ height: `${p.height}px`, maxWidth: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile (<=768px): auto-sliding marquee, same technique as
                  the "Lieblings-Tools" strip above — list rendered twice,
                  track scrolls exactly -50%. Hidden on desktop. */}
              <div className="tp-marquee" aria-hidden="true">
                <div className="tp-marquee-track">
                  {[...trustedLogos, ...trustedLogos].map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '34px', flexShrink: 0, opacity: 0.6,
                    }}>
                      {p.Component ? <p.Component size={p.height} /> : (
                        <img src={p.src} alt="" loading="lazy" style={{ height: `${p.height}px`, maxWidth: 'none', objectFit: 'contain' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media screen and (max-width: 900px) {
          .trust-story { grid-template-columns: 1fr !important; }
          .trust-story > div:first-child { min-height: 280px !important; }
        }

        /* Desktop: marquee stays hidden, the static grid above is used. */
        .tp-marquee { display: none; }

        /* Mobile: auto-slide instead of a cramped 4-column logo grid. */
        @media screen and (max-width: 768px) {
          .stat-grid { display: none !important; }

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

      `}</style>
    </section>
  );
};

/* =========================================================
   2b) PARTNER & TECHNOLOGIES — Eigene Sektion mit ECHTEN Logos
   ========================================================= */
const PartnersSection = () => {
  // Tech-Partner: Cloud, Tools, Plattformen — die wir wirklich nutzen
  const techPartners = [
    { name: 'AWS',          Component: AWSLogo, height: 28 },
    { name: 'Microsoft',    Component: MicrosoftLogo, height: 32 },
    { name: 'Azure',        Component: AzureLogo, height: 32 },
    { name: 'Google Cloud', src: 'https://cdn.simpleicons.org/googlecloud/4285F4', height: 32 },
    { name: 'OpenAI',       Component: OpenAILogo, height: 30 },
    { name: 'Stripe',       src: 'https://cdn.simpleicons.org/stripe/635BFF', height: 28 },
    { name: 'Docker',       src: 'https://cdn.simpleicons.org/docker/2496ED', height: 30 },
    { name: 'Kubernetes',   src: 'https://cdn.simpleicons.org/kubernetes/326CE5', height: 30 },
    { name: 'GitHub',       src: 'https://cdn.simpleicons.org/github/ffffff', height: 30, white: false },
    { name: 'Vercel',       src: 'https://cdn.simpleicons.org/vercel/ffffff', height: 26 },
    { name: 'MongoDB',      src: 'https://cdn.simpleicons.org/mongodb/47A248', height: 30 },
    { name: 'Cloudflare',   src: 'https://cdn.simpleicons.org/cloudflare/F38020', height: 30 },
  ];

  // Tools wir verwenden für Zusammenarbeit
  const toolPartners = [
    { name: 'Slack',        Component: SlackLogo, height: 28 },
    { name: 'Salesforce',   Component: SalesforceLogo, height: 28 },
    { name: 'HubSpot',      src: 'https://cdn.simpleicons.org/hubspot/FF7A59', height: 28 },
    { name: 'Notion',       src: 'https://cdn.simpleicons.org/notion/ffffff', height: 26 },
    { name: 'Figma',        src: 'https://cdn.simpleicons.org/figma/F24E1E', height: 28 },
    { name: 'Jira',         src: 'https://cdn.simpleicons.org/jira/0052CC', height: 28 },
    { name: 'Asana',        src: 'https://cdn.simpleicons.org/asana/F06A6A', height: 28 },
    { name: 'Mailchimp',    src: 'https://cdn.simpleicons.org/mailchimp/FFE01B', height: 28 },
    { name: 'WordPress',    src: 'https://cdn.simpleicons.org/wordpress/21759B', height: 28 },
    { name: 'Shopify',      src: 'https://cdn.simpleicons.org/shopify/7AB55C', height: 28 },
    { name: 'Webflow',      src: 'https://cdn.simpleicons.org/webflow/146EF5', height: 28 },
    { name: 'GitLab',       src: 'https://cdn.simpleicons.org/gitlab/FC6D26', height: 28 },
  ];

  return (
    <section data-testid="partners-section" style={{
      padding: 'clamp(60px, 10vw, 100px) 16px',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '900px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(255, 107, 0, 0.06) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '8px', marginBottom: '16px',
          }}>Partner & Technologien</span>
          <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 42px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '12px' }}>
            Vertraut von Kunden & Partnern
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
            Wir arbeiten mit den führenden Plattformen, Cloud-Anbietern und Tools der Welt –
            damit Ihre Lösung auf Enterprise-Standard läuft.
          </p>
        </Reveal>

        {/* Tech-Partner */}
        <Reveal direction="left" style={{
          padding: 'clamp(24px, 4vw, 40px)',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '24px', marginBottom: '20px',
        }}>
          <p style={{
            fontSize: '11px', color: '#FF6B00',
            textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700,
            marginBottom: '24px', textAlign: 'center',
          }}>
            Cloud, Infrastruktur & KI
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'clamp(16px, 2vw, 28px)',
            alignItems: 'center', justifyItems: 'center',
          }}>
            {techPartners.map((p, i) => (
              <LogoTile key={i} {...p} />
            ))}
          </div>
        </Reveal>

        {/* Tool-Partner */}
        <Reveal direction="right" style={{
          padding: 'clamp(24px, 4vw, 40px)',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '24px',
        }}>
          <p style={{
            fontSize: '11px', color: '#FF6B00',
            textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700,
            marginBottom: '24px', textAlign: 'center',
          }}>
            Tools, Plattformen & Integrationen
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'clamp(16px, 2vw, 28px)',
            alignItems: 'center', justifyItems: 'center',
          }}>
            {toolPartners.map((p, i) => (
              <LogoTile key={i} {...p} />
            ))}
          </div>
        </Reveal>

        {/* Trust-Footer */}
        <Reveal direction="up" style={{
          marginTop: '32px', textAlign: 'center',
          padding: '20px',
          background: 'rgba(255, 107, 0, 0.05)',
          border: '1px solid rgba(255, 107, 0, 0.15)',
          borderRadius: '16px',
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          flexWrap: 'wrap', justifyContent: 'center',
          width: '100%', boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#FF6B00" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Enterprise-grade Stack
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#FF6B00" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              DSGVO-konform
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* =========================================================
   3) UNSERE DIENSTLEISTUNGEN — wie ServicesPage (Bento mit Bildern)
   ========================================================= */
const ServicesGrid = () => {
  const [hovered, setHovered] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Wir nutzen exakt dieselbe Datenquelle wie die ServicesPage
  const allServices = mockServices.slice(0, 9);
  const services = activeCategory === 'all'
    ? allServices
    : allServices.filter((s) => s.id === activeCategory);

  // Fallback Features pro Service (wie auf ServicesPage)
  const featureMap = {
    'web-development':  ['SaaS-Plattformen', 'Online-Shops', 'Web-Apps', 'Kundenportale'],
    'app-development':  ['iOS & Android', 'React Native', 'Flutter', 'App Store Launch'],
    'cyber-security':   ['Penetration Tests', 'Security Audits', 'DSGVO-Beratung', 'Incident Response'],
    'ui-ux':            ['User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
    'gaming':           ['Unity & Unreal', 'VR/AR Games', 'Multiplayer', 'Cross-Platform'],
    'chatbot':          ['KI-Agenten', 'GPT-4 Integration', 'Lead-Bots', '24/7 Support'],
    'server':           ['Cloud Hosting', 'DevOps', 'Monitoring', 'Backups & Wartung'],
    'marketing':        ['SEO', 'Google Ads', 'Content', 'Conversion'],
    'graphic-design':   ['Brand Identity', 'Logo Design', 'Print & Digital', 'Motion Graphics'],
  };

  return (
    <section data-testid="services-grid" style={{
      padding: 'clamp(70px, 12vw, 140px) 16px',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0d0d0d 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '8px', marginBottom: '16px',
          }}>Services</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
            <SplitLineHeading line1="Unsere" line2="Dienstleistungen" line2Gradient={true} />
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-muted)',
            maxWidth: '700px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Von der ersten Idee bis zum erfolgreichen Launch – wir decken das gesamte Spektrum digitaler Services ab.
          </p>
        </Reveal>

        {/* Filter-Pills — wie bei "Projekte, die überzeugen" weiter unten: man wählt eine Kategorie. */}
        <div className="services-grid-filters" style={{
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
          gap: '8px', marginBottom: 'clamp(24px, 4vw, 40px)',
          overflowX: 'auto', paddingBottom: '4px',
        }}>
          {serviceCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`services-grid-filter-${cat.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px',
                  background: isActive ? '#FF6B00' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? '#FF6B00' : 'var(--border-subtle)',
                  borderRadius: '6px', cursor: 'pointer',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                }}
              >
                <IconComponent size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(16px, 3vw, 24px)',
        }}>
          {services.map((service, idx) => {
            const IconComponent = iconMap[service.icon] || Code;
            const isHovered = hovered === service.id;
            const features = featureMap[service.id] || [];

            return (
              <Reveal key={service.id} direction="up" delay={idx * 0.08}>
              <Link
                to={service.link || `/services/${service.id}`}
                data-testid={`service-card-${service.id}`}
                onMouseEnter={() => setHovered(service.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', borderRadius: 'clamp(16px, 2vw, 24px)',
                  overflow: 'hidden', textDecoration: 'none',
                  minHeight: 'clamp(280px, 40vw, 380px)',
                  display: 'flex', flexDirection: 'column',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 30px 60px rgba(255, 107, 0, 0.18)' : 'none',
                }}
              >
                {/* Background Image */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${service.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  opacity: isHovered ? 0.18 : 0.08,
                  transition: 'opacity 0.5s ease',
                }} />
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isHovered
                    ? 'linear-gradient(180deg, rgba(255, 107, 0, 0.12) 0%, rgba(0,0,0,0.92) 100%)'
                    : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.82) 100%)',
                  transition: 'background 0.5s ease',
                }} />
                {/* Top Accent Line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #FF6B00, #FF8533)',
                  transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left', transition: 'transform 0.5s ease',
                }} />

                {/* Content */}
                <div style={{
                  position: 'relative', zIndex: 1, padding: 'clamp(24px, 3vw, 32px)',
                  display: 'flex', flexDirection: 'column', height: '100%',
                }}>
                  <div style={{
                    width: '72px', height: '72px',
                    background: isHovered
                      ? 'linear-gradient(135deg, #FF6B00, #cc5500)'
                      : 'rgba(255, 107, 0, 0.1)',
                    border: isHovered ? 'none' : '1px solid rgba(255, 107, 0, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '20px', marginBottom: '24px',
                    transition: 'all 0.4s ease',
                    boxShadow: isHovered ? '0 10px 40px rgba(255, 107, 0, 0.4)' : 'none',
                  }}>
                    <IconComponent size={32} color={isHovered ? '#000' : '#FF6B00'} />
                  </div>

                  <h3 style={{
                    fontSize: 'clamp(20px, 2.4vw, 26px)', fontWeight: 700,
                    marginBottom: '12px', color: 'var(--text-primary)',
                  }}>
                    {service.title}
                  </h3>

                  <p style={{
                    fontSize: '15px', lineHeight: 1.7, color: 'var(--text-muted)',
                    marginBottom: '24px', flex: 1,
                  }}>
                    {service.description}
                  </p>

                  {/* Features auf Hover */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
                    marginBottom: '24px',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.4s ease',
                    maxHeight: isHovered ? '200px' : '0', overflow: 'hidden',
                  }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={14} color="#FF6B00" />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}>
                    <span style={{
                      fontSize: '14px', fontWeight: 600, color: '#FF6B00',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      Mehr erfahren
                      <ArrowRight size={16} style={{
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        transition: 'transform 0.3s ease',
                      }} />
                    </span>
                  </div>
                </div>
              </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal direction="up" style={{ textAlign: 'center', marginTop: 'clamp(40px, 5vw, 56px)' }}>
          <Link to="/services" className="btn-primary" style={{
            padding: '18px 40px', fontSize: '16px', display: 'inline-flex',
            alignItems: 'center', gap: '10px',
          }}>
            Alle Services entdecken <ArrowRight size={20} />
          </Link>
        </Reveal>
      </div>

      <style>{`
        /* Filter-Pills nur auf Mobil — auf PC/Tablet zeigt das Grid immer
           alle Services (Default-Zustand von activeCategory bleibt "all"). */
        .services-grid-filters { display: none !important; }
        @media screen and (max-width: 768px) {
          .services-grid-filters { display: flex !important; }
        }
      `}</style>
    </section>
  );
};

/* =========================================================
   4) WARUM UNS WÄHLEN — mit Bildern & Logos, weniger Glow
   ========================================================= */
const WhyUsSection = () => {
  const reasons = [
    {
      icon: Sparkles, title: 'Individuelle Lösungen', stat: '100%',
      statLabel: 'maßgeschneidert',
      desc: 'Keine Templates – jedes Projekt wird komplett individuell entwickelt und auf Ihre Bedürfnisse zugeschnitten.',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80&auto=format&fit=crop',
    },
    {
      icon: Layers, title: 'Moderne Technologien', stat: '30+',
      statLabel: 'Frameworks',
      desc: 'React, Next.js, Flutter, Node.js, Python, AWS, Azure und mehr – wir nutzen, was langfristig funktioniert.',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80&auto=format&fit=crop',
    },
    {
      icon: Zap, title: 'Schnelle Umsetzung', stat: '14 Tage',
      statLabel: 'bis zum Prototyp',
      desc: 'Klare Prozesse, agile Methoden und transparente Kommunikation – damit Ihr Projekt zügig live geht.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop',
    },
    {
      icon: Heart, title: 'Langfristige Betreuung', stat: '87%',
      statLabel: 'Wiederkehrerrate',
      desc: 'Support, Wartung und Weiterentwicklung nach Projektabschluss – wir bleiben an Ihrer Seite.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80&auto=format&fit=crop',
    },
    {
      icon: Lock, title: 'Volle Datenkontrolle', stat: 'DSGVO',
      statLabel: 'konform',
      desc: 'Ihre Daten bleiben in der EU. DSGVO-konform und verschlüsselt. Sicherheit ist kein Add-on.',
      image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80&auto=format&fit=crop',
    },
    {
      icon: BadgeCheck, title: 'Zufriedenheitsgarantie', stat: '98%',
      statLabel: 'Kundenzufriedenheit',
      desc: 'Wir liefern nicht ab, bis Sie wirklich zufrieden sind. Fester Ansprechpartner, klare Reportings.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&auto=format&fit=crop',
    },
  ];

  const comparison = [
    { feature: 'Festpreis-Garantie',           us: true, them: false },
    { feature: 'Fester Ansprechpartner',        us: true, them: false },
    { feature: 'Code-Eigentum bei Ihnen',       us: true, them: false },
    { feature: 'Daten in der EU (DSGVO)',       us: true, them: false },
    { feature: 'Wartung & Support nach Launch', us: true, them: false },
    { feature: 'Transparente Reportings',       us: true, them: 'manchmal' },
  ];

  // Kunden-Logos (Social Proof unten)
  const clientLogos = [
    { name: 'Microsoft',    Component: MicrosoftLogo, height: 22 },
    { name: 'AWS',          Component: AWSLogo,       height: 20 },
    { name: 'Google',       Component: GoogleLogo,    height: 22 },
    { name: 'Slack',        Component: SlackLogo,     height: 22 },
    { name: 'Stripe',       src: 'https://cdn.simpleicons.org/stripe/635BFF', height: 22 },
    { name: 'Notion',       src: 'https://cdn.simpleicons.org/notion/ffffff', height: 22 },
    { name: 'HubSpot',      src: 'https://cdn.simpleicons.org/hubspot/FF7A59', height: 22 },
    { name: 'Shopify',      src: 'https://cdn.simpleicons.org/shopify/7AB55C', height: 22 },
  ];

  return (
    <section data-testid="why-us-section" style={{
      padding: 'clamp(70px, 10vw, 120px) 16px',
      background: '#080808',
      position: 'relative',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Header — schlicht */}
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 5vw, 56px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '7px 14px', background: 'rgba(255, 107, 0, 0.08)',
            borderRadius: '6px', marginBottom: '16px',
          }}>Warum Zebick?</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#fff' }}>
            Sechs Gründe, warum Unternehmen uns vertrauen
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-muted)',
            maxWidth: '680px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Wir sind nicht die größte Agentur — aber wir nehmen uns Zeit für Sie und liefern messbare Ergebnisse.
          </p>
        </Reveal>

        {/* 6 Reason-Cards mit Bild-Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 'clamp(14px, 2vw, 20px)', marginBottom: 'clamp(32px, 4vw, 48px)',
        }}>
          {reasons.map((r, i) => (
            <Reveal key={i} direction="up" delay={i * 0.08} data-testid={`reason-card-${i}`} style={{
              background: '#111',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'border-color 0.25s ease, transform 0.25s ease',
              display: 'flex', flexDirection: 'column',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Bild-Header */}
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img src={r.image} alt={r.title} loading="lazy" style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: 'brightness(0.65) saturate(0.85)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(17,17,17,0.95) 100%)',
                }} />
                {/* Icon */}
                <div style={{
                  position: 'absolute', top: '14px', left: '14px',
                  width: '40px', height: '40px', borderRadius: '11px',
                  background: 'rgba(10, 10, 10, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 107, 0, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <r.icon size={20} color="#FF6B00" />
                </div>
                {/* Stat */}
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  padding: '6px 12px',
                  background: 'rgba(255, 107, 0, 0.95)',
                  borderRadius: '50px',
                  display: 'flex', alignItems: 'baseline', gap: '6px',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#000' }}>
                    {r.stat}
                  </span>
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                  fontSize: '18px', fontWeight: 700,
                  marginBottom: '10px', color: '#fff',
                }}>
                  {r.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '14px', flex: 1 }}>
                  {r.desc}
                </p>
                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '11px', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
                }}>
                  {r.statLabel}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Vergleichstabelle */}
        <Reveal direction="up" style={{
          background: '#0e0e0e',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: 'clamp(24px, 3vw, 32px)',
        }}>
          <div style={{
            padding: 'clamp(20px, 3vw, 28px) clamp(24px, 3vw, 32px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#0a0a0a',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ZebickMark size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 700, color: '#fff', margin: 0 }}>
                Andere Agenturen vs. Zebick
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Was Sie bei uns standardmäßig bekommen
              </p>
            </div>
          </div>

          {/* Tabelle — scrollt auf Mobile horizontal statt die Spalten zu quetschen (siehe .cmp-* Regeln unten) */}
          <div className="cmp-scroll" style={{ padding: 'clamp(8px, 2vw, 16px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)' }}>
            {/* Header-Zeile */}
            <div className="cmp-row" style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 110px',
              gap: '12px', alignItems: 'center',
              padding: '14px 8px',
              fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--text-muted)', fontWeight: 700,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div></div>
              <div style={{ textAlign: 'center' }}>Andere</div>
              <div style={{ textAlign: 'center', color: '#FF6B00' }}>Zebick</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className="cmp-row" style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 110px',
                gap: '12px', alignItems: 'center',
                padding: '14px 8px',
                borderBottom: i < comparison.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {row.feature}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {row.them === false ? (
                    <X size={18} color="rgba(239, 68, 68, 0.7)" style={{ display: 'inline-block' }} />
                  ) : row.them === true ? (
                    <Check size={18} color="rgba(34, 197, 94, 0.7)" style={{ display: 'inline-block' }} />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.them}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Check size={20} color="#FF6B00" style={{ display: 'inline-block' }} strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Social Proof: Kunden-Logos */}
        <Reveal direction="up" style={{
          background: '#0e0e0e',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: 'clamp(24px, 3vw, 32px)',
          marginBottom: 'clamp(24px, 3vw, 32px)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{
              fontSize: '10px', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700,
              marginBottom: '6px',
            }}>
              Vertraut von ihren Lieblings-Tools
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Wir integrieren mit allen großen Plattformen
            </p>
          </div>
          {/* Desktop (>768px): static grid, unchanged. */}
          <div className="logos-scroll" data-keep-grid style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 'clamp(16px, 2vw, 28px)',
            alignItems: 'center', justifyItems: 'center',
          }}>
            {clientLogos.map((p, i) => (
              <div key={i} className="logo-item" title={p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '32px', opacity: 0.55,
                transition: 'opacity 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; }}
              >
                {p.Component ? <p.Component size={p.height} /> : (
                  <img src={p.src} alt={p.name} loading="lazy" style={{ height: `${p.height}px`, maxWidth: '100%', objectFit: 'contain' }} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile (<=768px): auto-sliding marquee — hidden on desktop (see
              .logos-marquee display:none below, flipped on in the media
              query). The logo list is rendered twice back-to-back and the
              track scrolls exactly half its width, so the loop seams
              invisibly (see .logos-marquee-track @keyframes below). */}
          <div className="logos-marquee" aria-hidden="true">
            <div className="logos-marquee-track">
              {[...clientLogos, ...clientLogos].map((p, i) => (
                <div key={i} className="logo-item" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '32px', flexShrink: 0, opacity: 0.6,
                }}>
                  {p.Component ? <p.Component size={p.height} /> : (
                    <img src={p.src} alt="" loading="lazy" style={{ height: `${p.height}px`, maxWidth: 'none', objectFit: 'contain' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA-Banner — schlicht, ohne Glow-Kreise */}
        <Reveal direction="up" style={{
          padding: 'clamp(28px, 3vw, 36px)',
          background: '#0e0e0e',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          borderRadius: '20px',
          display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '260px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(255, 107, 0, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ZebickMark size={38} />
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                30-Tage Zufriedenheitsgarantie
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                Nicht zufrieden? Wir erstatten die Anzahlung vollständig zurück – ohne Wenn und Aber.
              </p>
            </div>
          </div>
          <Link to="/contact" data-testid="why-cta" className="btn-fill btn-fill-dark" style={{
            padding: '14px 28px', fontSize: '14px', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#FF6B00',
            borderRadius: '10px', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
          >
            Kostenlos beraten lassen <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>

      <style>{`
        /* Desktop (>768px): logos-marquee stays hidden, the static grid
           above renders as before. */
        .logos-marquee { display: none; }

        /* Mobile: scroll sideways instead of squeezing the comparison
           columns, and auto-slide the logos instead of wrapping into many
           short rows. Desktop (>768px) is untouched above. */
        @media screen and (max-width: 768px) {
          .cmp-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .cmp-row {
            min-width: 480px !important;
            grid-template-columns: 1fr 110px 110px !important;
          }

          .logos-scroll { display: none !important; }

          .logos-marquee {
            display: block;
            overflow: hidden;
            mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
          }
          .logos-marquee-track {
            display: flex;
            width: max-content;
            gap: 32px;
            animation: logos-slide 22s linear infinite;
          }
          .logo-item {
            flex: 0 0 auto !important;
          }
          @keyframes logos-slide {
            from { transform: translateX(0); }
            /* Content is rendered twice, so -50% is exactly one full loop —
               the seam is invisible. */
            to { transform: translateX(-50%); }
          }
        }
      `}</style>
    </section>
  );
};



/* =========================================================
   5) UNSER PROZESS — Vertikale Zigzag Timeline mit Scroll
   ========================================================= */
// Flowing wave: a smooth curve that touches down exactly at each bubble's
// measured center and bulges up/down between consecutive bubbles. Shared by
// the desktop pinned track and the mobile swipeable one — same visual
// language, different scroll mechanic driving `progress`.
const buildWavePath = (points, amp = 36) => {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i], p2 = points[i + 1];
    const dir = i % 2 === 0 ? -1 : 1;
    const cp1x = p1.x + (p2.x - p1.x) * 0.3;
    const cp2x = p1.x + (p2.x - p1.x) * 0.7;
    const cpY = (p1.y + p2.y) / 2 + dir * amp;
    d += ` C ${cp1x} ${cpY}, ${cp2x} ${cpY}, ${p2.x} ${p2.y}`;
  }
  return d;
};

const ProcessSection = () => {
  const steps = [
    { n: '01', icon: Search,       title: 'Analyse & Strategie',    desc: 'Wir verstehen Ihre Ziele, Zielgruppe und Marktposition – die Grundlage für jeden Erfolg.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop' },
    { n: '02', icon: Palette,      title: 'Design & Prototyping',   desc: 'Wireframes, Mockups und interaktive Prototypen – Sie sehen Ihr Projekt, bevor es entsteht.',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80&auto=format&fit=crop' },
    { n: '03', icon: Code,         title: 'Entwicklung',            desc: 'Modernste Technologien, sauberer Code und agile Iterationen für höchste Qualität.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&auto=format&fit=crop' },
    { n: '04', icon: FlaskConical, title: 'Testing & Sicherheit',   desc: 'Funktionstests, Last-Tests, Security-Audits – nichts geht live ohne unsere Qualitätskontrolle.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop' },
    { n: '05', icon: Rocket,       title: 'Launch',                 desc: 'Deployment, Monitoring und kontrollierter Go-Live – Ihr Projekt erblickt das Licht der Welt.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop' },
    { n: '06', icon: TrendingUp,   title: 'Betreuung & Optimierung',desc: 'Updates, Support und kontinuierliche Verbesserung – damit Ihr Projekt nachhaltig erfolgreich ist.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop' },
  ];

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window === 'undefined' || window.innerWidth > 768
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 768);
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(!!mq?.matches);
    window.addEventListener('resize', onResize);
    mq?.addEventListener?.('change', onMotionChange);
    return () => {
      window.removeEventListener('resize', onResize);
      mq?.removeEventListener?.('change', onMotionChange);
    };
  }, []);

  return (
    <section data-testid="process-section" style={{
      padding: 'clamp(70px, 12vw, 140px) 0',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(255, 107, 0, 0.06) 0%, transparent 60%)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '8px', marginBottom: '16px',
          }}>Prozess</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
            So entsteht Ihr Projekt
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)',
            maxWidth: '650px', margin: '0 auto', lineHeight: 1.7,
          }}>
            In 6 klaren Schritten vom ersten Gespräch bis zum laufenden Erfolg – scrollen Sie mit.
          </p>
        </Reveal>
      </div>

      <HomeHorizontalTrack steps={steps} reducedMotion={reducedMotion} isDesktop={isDesktop} />

      <style>{`
        .timeline-card { min-height: 340px; }
        .timeline-card-image { border-radius: inherit; }
        @media (max-width: 768px) {
          .timeline-card h3 { font-size: 20px; line-height: 1.25; }
          .timeline-card p { font-size: 15px; line-height: 1.6; max-width: 100%; }
          .timeline-icon { width: 36px !important; height: 36px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .timeline-card, .timeline-card img, .timeline-icon, .timeline::before {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

/* =========================================================
   DESKTOP — pinned horizontal scroll track with a flowing
   wave line connecting each step bubble (same mechanic as
   components/services/ModernTimeline.jsx's HorizontalTrack —
   position:fixed/absolute "fake pin", not position:sticky: this
   site wraps every page in a div with overflow-x:hidden, and per
   the CSS spec any ancestor with overflow other than visible
   becomes sticky's containing block — even one that never
   actually scrolls — which silently breaks position:sticky here).
   ========================================================= */
const HomeHorizontalTrack = ({ steps, reducedMotion, isDesktop }) => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const bubbleRefs = useRef([]);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [pinMode, setPinMode] = useState('before');
  const [points, setPoints] = useState([]);
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const measure = () => {
      if (!trackRef.current) return;
      const mt = Math.max(0, trackRef.current.scrollWidth - window.innerWidth);
      setMaxTranslate(mt);
      const trackRect = trackRef.current.getBoundingClientRect();
      setTrackSize({ width: trackRef.current.scrollWidth, height: trackRect.height });
      setPoints(
        bubbleRefs.current
          .filter(Boolean)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.left - trackRect.left + r.width / 2, y: r.top - trackRect.top + r.height / 2 };
          })
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [steps.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || maxTranslate <= 0) return;
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const raw = -rect.top;
      setTranslateX(Math.max(0, Math.min(maxTranslate, raw)));
      if (rect.top > 0) setPinMode('before');
      else if (raw >= maxTranslate) setPinMode('after');
      else setPinMode('pinned');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [maxTranslate, reducedMotion]);

  if (reducedMotion) {
    return (
      <div style={{ overflowX: 'auto', padding: '8px 16px 24px' }}>
        <div style={{ display: 'flex', gap: '100px', width: 'max-content', margin: '0 auto', padding: '70px 8px 0' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flexShrink: 0, width: 'clamp(300px, 32vw, 400px)' }}>
              <div className="timeline-bubble" style={bubbleStyle}>{s.n}</div>
              <StepCard step={s} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const progress = maxTranslate > 0 ? translateX / maxTranslate : 0;
  const pinStyle = pinMode === 'pinned'
    ? { position: 'fixed', top: 0, left: 0, width: '100%' }
    : pinMode === 'after'
      ? { position: 'absolute', bottom: 0, left: 0, width: '100%' }
      : { position: 'absolute', top: 0, left: 0, width: '100%' };

  const pathD = buildWavePath(points, isDesktop ? 36 : 22);
  const dashLen = Math.max(isDesktop ? 1200 : 800, trackSize.width * 1.3);

  return (
    <div
      ref={sectionRef}
      data-testid="timeline-h-wrap"
      style={{ height: maxTranslate > 0 ? `calc(100vh + ${maxTranslate}px)` : 'auto', position: 'relative' }}
    >
      <div style={{ ...pinStyle, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          ref={trackRef}
          style={{
            position: 'relative', display: 'flex', alignItems: 'flex-start', gap: isDesktop ? '140px' : '28px',
            padding: isDesktop ? '110px 8vw 0' : '64px 24px 0', width: 'max-content',
            transform: `translateX(${-translateX}px)`, willChange: 'transform',
          }}
        >
          {pathD && (
            <svg
              aria-hidden
              width={trackSize.width} height={trackSize.height}
              viewBox={`0 0 ${trackSize.width} ${trackSize.height}`}
              style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
            >
              <path d={pathD} fill="none" stroke="rgba(255, 107, 0, 0.15)" strokeWidth="3" strokeLinecap="round" />
              <path
                d={pathD} fill="none" stroke="url(#homeWaveGrad)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={dashLen} strokeDashoffset={dashLen - dashLen * progress}
                style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.5))' }}
              />
              <defs>
                <linearGradient id="homeWaveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FF8533" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {steps.map((s, i) => (
            <div key={i} data-testid={`process-step-${i}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isDesktop ? '24px' : '18px', flexShrink: 0, width: isDesktop ? 'clamp(300px, 32vw, 400px)' : 'clamp(240px, 78vw, 340px)' }}>
              <div ref={(el) => { bubbleRefs.current[i] = el; }} className="timeline-bubble" style={isDesktop ? bubbleStyle : bubbleStyleMobile}>
                {s.n}
              </div>
              <StepCard step={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const bubbleStyle = {
  width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
  background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
  border: '4px solid #0a0a0a',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', fontWeight: 900, color: '#000',
  boxShadow: '0 0 0 4px rgba(255, 107, 0, 0.25), 0 12px 30px rgba(255, 107, 0, 0.5)',
};

const bubbleStyleMobile = {
  ...bubbleStyle,
  width: '44px', height: '44px', border: '3px solid #0a0a0a', fontSize: '14px',
};

const StepCard = ({ step }) => (
  <div className="timeline-card" style={{
    background: 'linear-gradient(145deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    border: '1px solid rgba(255, 107, 0, 0.25)',
    borderRadius: '20px', overflow: 'hidden',
    transition: 'all 0.3s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#FF6B00'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.25)'; }}
  >
    {/* Mini-Bild */}
    <div className="timeline-card-image" style={{
      position: 'relative', height: '140px', overflow: 'hidden',
    }}>
      <img src={step.image} alt={step.title} loading="lazy" style={{
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        opacity: 0.75,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.7) 100%)',
      }} />
      <div className="timeline-icon" style={{
        position: 'absolute', bottom: '12px', left: '16px',
        width: '40px', height: '40px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(255, 107, 0, 0.4)',
      }}>
        <step.icon size={20} color="#000" />
      </div>
    </div>
    <div style={{ padding: '26px 28px 30px' }}>
      <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
        {step.title}
      </h3>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
        {step.desc}
      </p>
    </div>
  </div>
);

/* =========================================================
   6) PORTFOLIO (BLEIBT)
   ========================================================= */
const serviceCategories = [
  { id: 'all', name: 'Alle', icon: LayoutGrid },
  { id: 'web-development', name: 'Webentwicklung', icon: Code },
  { id: 'app-development', name: 'App-Entwicklung', icon: Smartphone },
  { id: 'cyber-security', name: 'Cyber Security', icon: Shield },
  { id: 'ui-ux', name: 'UI/UX Design', icon: Palette },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
  { id: 'chatbot', name: 'KI & Chatbots', icon: Bot },
  { id: 'server', name: 'Cloud & DevOps', icon: Cloud },
  { id: 'marketing', name: 'Marketing & SEO', icon: TrendingUp },
  { id: 'graphic-design', name: 'Grafikdesign', icon: PenTool },
];

const PortfolioShowcase = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lade Projekte aus Backend (Admin gepflegt)
  useEffect(() => {
    fetch(`${API_URL}/api/portfolio/projects?limit=50`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          // Fallback: lokale Mock-Daten (legacy)
          setProjects(portfolioProjects.map(p => ({
            ...p,
            cover_image: p.image,
            service_id: p.serviceId,
            website_url: p.website_url || null,
          })));
        }
      })
      .catch(() => {
        setProjects(portfolioProjects.map(p => ({
          ...p,
          cover_image: p.image,
          service_id: p.serviceId,
          website_url: p.website_url || null,
        })));
      });
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  // Service-Mapping: alte "serviceId" → neue "service_id"
  const getProjectServiceId = (p) => p.service_id || p.serviceId || '';

  const filteredProjects = activeCategory === 'all'
    ? projects.slice(0, isMobile ? 4 : 9)
    : projects.filter(p => getProjectServiceId(p) === activeCategory).slice(0, isMobile ? 4 : 6);

  // Klick-Handler: Immer zur internen Projekt-Detail-Seite navigieren.
  // Die externe website_url ist nur ein CTA innerhalb der Detail-Seite.
  const openProject = (project) => {
    if (project.slug) {
      window.location.href = `/portfolio/${project.slug}`;
    }
  };

  return (
    <section className="section" data-testid="portfolio-showcase" style={{
      padding: isMobile ? '60px 16px' : isTablet ? '80px 24px' : '120px 0',
      background: 'var(--bg-primary)',
      position: 'relative',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: isMobile ? '0' : '0 48px', position: 'relative', zIndex: 1,
      }}>
        <Reveal direction="up" style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '32px',
          flexWrap: 'wrap',
          marginBottom: isMobile ? '32px' : '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ maxWidth: '640px' }}>
            <span style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF6B00',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255,107,0,0.4)',
              marginBottom: '14px',
            }}>Portfolio</span>
            <h2 style={{
              fontSize: isMobile ? '28px' : isTablet ? '36px' : '44px',
              fontWeight: 800, marginBottom: '14px', lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              <SplitLineHeading line1="Projekte, die" line2="überzeugen" line2Gradient={true} />
            </h2>
            <p style={{
              fontSize: isMobile ? '14px' : '16px', color: 'var(--text-muted)',
              margin: 0, lineHeight: 1.65,
            }}>
              Von Web & App bis KI & Security – Arbeiten aus allen Servicebereichen.
            </p>
          </div>
          <Link to="/portfolio" data-testid="portfolio-showcase-all-link" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '13px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Alle ansehen <ArrowRight size={14} />
          </Link>
        </Reveal>

        <div style={{
          display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-start',
          gap: '8px', marginBottom: isMobile ? '24px' : '32px',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? '8px' : '0', flexWrap: isMobile ? 'nowrap' : 'wrap',
        }}>
          {serviceCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`portfolio-filter-${cat.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: isMobile ? '9px 14px' : '10px 18px',
                  background: isActive ? '#FF6B00' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? '#FF6B00' : 'var(--border-subtle)',
                  borderRadius: '6px', cursor: 'pointer',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#FF6B00'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <IconComponent size={15} />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(12, 1fr)',
          gridAutoRows: isMobile ? 'auto' : '180px',
          gap: isMobile ? '16px' : '20px',
        }}>
          {filteredProjects.map((project, idx) => {
            const gridStyles = [
              { gridColumn: 'span 8', gridRow: 'span 2' },
              { gridColumn: 'span 4', gridRow: 'span 2' },
              { gridColumn: 'span 4', gridRow: 'span 2' },
              { gridColumn: 'span 4', gridRow: 'span 2' },
              { gridColumn: 'span 4', gridRow: 'span 2' },
              { gridColumn: 'span 6', gridRow: 'span 2' },
              { gridColumn: 'span 6', gridRow: 'span 2' },
              { gridColumn: 'span 4', gridRow: 'span 2' },
              { gridColumn: 'span 8', gridRow: 'span 2' },
            ];
            const desktopStyle = gridStyles[idx % gridStyles.length];
            const isHovered = hoveredProject === project.id;
            const mobileStyle = { minHeight: '280px' };
            const tabletStyle = { gridColumn: 'span 1', gridRow: 'span 2' };
            const cardStyle = isMobile ? mobileStyle : isTablet ? tabletStyle : desktopStyle;

            return (
              <Reveal
                key={project.id}
                direction="up"
                delay={(idx % 6) * 0.06}
                style={cardStyle}
                data-testid={`portfolio-project-${project.id}`}
                onClick={() => openProject(project)}
                onMouseEnter={() => !isMobile && setHoveredProject(project.id)}
                onMouseLeave={() => !isMobile && setHoveredProject(null)}
              >
              <div
                style={{
                  position: 'relative', height: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid',
                  borderColor: !isMobile && isHovered ? 'rgba(255,107,0,0.5)' : 'var(--border-subtle)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  transform: !isMobile && isHovered ? 'translateY(-3px)' : 'translateY(0)',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${project.cover_image || project.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  transition: 'transform 0.6s ease',
                  transform: !isMobile && isHovered ? 'scale(1.1)' : 'scale(1)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isMobile
                    ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)'
                    : isHovered
                      ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: isMobile ? '14px' : '16px', left: isMobile ? '14px' : '16px',
                  padding: '6px 12px', background: 'rgba(8, 8, 8, 0.85)',
                  border: '1px solid rgba(255, 107, 0, 0.45)',
                  borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                  color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.08em',
                  opacity: 1,
                  transition: 'opacity 0.2s ease',
                }}>
                  {project.category}
                </div>

                {/* Website-Link Badge (oben rechts) */}
                {project.website_url && (
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '14px' : '16px', right: isMobile ? '14px' : '16px',
                    width: '32px', height: '32px', borderRadius: '6px',
                    background: 'rgba(8, 8, 8, 0.85)',
                    border: '1px solid rgba(255, 107, 0, 0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.2s ease',
                  }}>
                    <ExternalLink size={14} color="#FF6B00" />
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: isMobile ? '20px' : '28px',
                }}>
                  <div style={{
                    display: 'flex', gap: '6px', marginBottom: isMobile ? '10px' : '14px',
                    flexWrap: 'wrap',
                  }}>
                    {(project.tags || []).slice(0, 3).map((tag, tidx) => (
                      <span key={tidx} style={{
                        padding: '4px 10px', background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '11px', fontWeight: 600, color: 'white',
                        borderRadius: '4px',
                      }}>{tag}</span>
                    ))}
                  </div>
                  <h3 style={{
                    fontSize: isMobile ? '20px' : (cardStyle.gridColumn === 'span 8' ? '26px' : '20px'),
                    fontWeight: 800, marginBottom: '10px', color: 'white', lineHeight: 1.2,
                  }}>
                    {project.title}
                  </h3>
                  <p style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
                    maxHeight: isMobile ? '60px' : (isHovered ? '80px' : '0'),
                    overflow: 'hidden', opacity: isHovered || isMobile ? 1 : 0,
                    transition: 'all 0.4s ease',
                  }}>
                    {(project.description || '').substring(0, 120)}{(project.description || '').length > 120 ? '...' : ''}
                  </p>
                  {project.website_url && (isHovered || isMobile) && (
                    <div style={{
                      marginTop: '12px',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 700, color: '#FF6B00',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Website besuchen <ExternalLink size={13} />
                    </div>
                  )}
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   7) KUNDENBEWERTUNGEN
   ========================================================= */
const TestimonialsSection = ({ testimonials, onOpenReview }) => {
  const fallback = [
    {
      name: 'Sandra Müller', role: 'Geschäftsführerin, Müller Solutions GmbH',
      rating: 5,
      content: 'Professionelle Zusammenarbeit und hervorragende Ergebnisse. Das Team von Zebick hat unsere Erwartungen weit übertroffen.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop',
    },
    {
      name: 'Marco Becker', role: 'Marketing Director, Becker AG',
      rating: 5,
      content: 'Unsere neue Website generiert seit dem Launch deutlich mehr Anfragen – +47% in den ersten 3 Monaten.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop',
    },
    {
      name: 'Laura Fischer', role: 'COO, Fischer & Partner',
      rating: 5,
      content: 'Der KI-Chatbot spart unserem Support-Team täglich Stunden und unsere Kunden bekommen 24/7 Antworten. Genial!',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop',
    },
  ];
  const items = (testimonials && testimonials.length >= 3 ? testimonials : fallback).map((t) => ({
    ...t,
    role: t.role || (t.position && t.company ? `${t.position} bei ${t.company}` : t.position || t.company || ''),
  }));

  return (
    <section data-testid="testimonials-section" style={{
      padding: 'clamp(70px, 12vw, 140px) 16px',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '8px', marginBottom: '16px',
          }}>Testimonials</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
            Kundenbewertungen
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)',
            maxWidth: '650px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Was unsere Kunden über die Zusammenarbeit mit uns sagen.
          </p>
        </Reveal>

        <TestimonialsMarquee items={items} />

        <Reveal direction="up" style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={onOpenReview} data-testid="write-review-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 28px', background: 'transparent',
            border: '2px solid #FF6B00', borderRadius: '50px',
            color: '#FF6B00', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.3s ease', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF6B00'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF6B00'; }}
          >
            <Plus size={18} /> Bewertung schreiben
          </button>
        </Reveal>
      </div>
    </section>
  );
};

/* =========================================================
   8) TECHNOLOGIE STACK — Device Mockup + echte Logos
   ========================================================= */
const TechStackSection = () => {
  // Stack mit echten Logos. Manche brauchen Inline-Komponenten (Trademark-Brands)
  const stacks = [
    { name: 'React',        src: 'https://cdn.simpleicons.org/react/61DAFB' },
    { name: 'Next.js',      src: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
    { name: 'Vue.js',       src: 'https://cdn.simpleicons.org/vuedotjs/4FC08D' },
    { name: 'TypeScript',   src: 'https://cdn.simpleicons.org/typescript/3178C6' },
    { name: 'Node.js',      src: 'https://cdn.simpleicons.org/nodedotjs/5FA04E' },
    { name: 'Python',       src: 'https://cdn.simpleicons.org/python/3776AB' },
    { name: 'Laravel',      src: 'https://cdn.simpleicons.org/laravel/FF2D20' },
    { name: 'Flutter',      src: 'https://cdn.simpleicons.org/flutter/02569B' },
    { name: 'React Native', src: 'https://cdn.simpleicons.org/react/61DAFB' },
    { name: 'AWS',          Component: AWSLogo },
    { name: 'Azure',        Component: AzureLogo },
    { name: 'Docker',       src: 'https://cdn.simpleicons.org/docker/2496ED' },
    { name: 'Kubernetes',   src: 'https://cdn.simpleicons.org/kubernetes/326CE5' },
    { name: 'OpenAI',       Component: OpenAILogo },
    { name: 'TensorFlow',   src: 'https://cdn.simpleicons.org/tensorflow/FF6F00' },
    { name: 'MongoDB',      src: 'https://cdn.simpleicons.org/mongodb/47A248' },
  ];

  const groups = [
    { title: 'Frontend',  techs: ['React', 'Next.js', 'Vue.js', 'TypeScript'] },
    { title: 'Backend',   techs: ['Node.js', 'Python', 'Laravel', 'MongoDB'] },
    { title: 'Mobile',    techs: ['Flutter', 'React Native'] },
    { title: 'Cloud & DevOps', techs: ['AWS', 'Azure', 'Docker', 'Kubernetes'] },
    { title: 'AI & ML',   techs: ['OpenAI', 'TensorFlow'] },
  ];

  const renderLogo = (tech, size = 26) => {
    if (tech.Component) return <tech.Component size={size} />;
    return <img src={tech.src} alt={tech.name} loading="lazy" style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} />;
  };

  return (
    <section data-testid="tech-stack-section" style={{
      padding: 'clamp(70px, 12vw, 140px) 16px',
      background: 'linear-gradient(180deg, #080808 0%, #0d0d0d 50%, #080808 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '900px', height: '900px',
        background: 'radial-gradient(circle, rgba(255, 107, 0, 0.06) 0%, transparent 60%)',
        filter: 'blur(120px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '8px', marginBottom: '16px',
          }}>Technologien</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
            Modernster Tech-Stack
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)',
            maxWidth: '650px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Wir setzen ausschließlich auf bewährte und zukunftssichere Technologien.
          </p>
        </Reveal>

        <div className="tech-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'clamp(24px, 4vw, 48px)', alignItems: 'center',
        }}>
          {/* Device Mockup mit umkreisenden Logos */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto',
            aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Orbit Rings */}
            <div aria-hidden style={{
              position: 'absolute', width: '95%', height: '95%',
              borderRadius: '50%', border: '1px dashed rgba(255, 107, 0, 0.2)',
              animation: 'spin 60s linear infinite',
            }} />
            <div aria-hidden style={{
              position: 'absolute', width: '70%', height: '70%',
              borderRadius: '50%', border: '1px dashed rgba(255, 107, 0, 0.15)',
              animation: 'spin 40s linear infinite reverse',
            }} />

            {/* Floating Tech Logos in Orbit */}
            {stacks.slice(0, 8).map((tech, i) => {
              const angle = (i / 8) * 2 * Math.PI;
              const radius = 47; // % of container
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return (
                <div key={i} title={tech.name} style={{
                  position: 'absolute',
                  top: `${y}%`, left: `${x}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '56px', height: '56px',
                  background: 'rgba(20, 20, 20, 0.9)',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
                  animation: `floatLogo 4s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  zIndex: 2,
                }}>
                  {renderLogo(tech, 28)}
                </div>
              );
            })}

            {/* Inner Tech Logos */}
            {stacks.slice(8, 12).map((tech, i) => {
              const angle = (i / 4) * 2 * Math.PI + Math.PI / 4;
              const radius = 28;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return (
                <div key={i + 'i'} title={tech.name} style={{
                  position: 'absolute',
                  top: `${y}%`, left: `${x}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '42px', height: '42px',
                  background: 'rgba(20, 20, 20, 0.9)',
                  border: '1px solid rgba(255, 107, 0, 0.25)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                  animation: `floatLogo 5s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  zIndex: 2,
                }}>
                  {renderLogo(tech, 22)}
                </div>
              );
            })}

            {/* Center: Laptop Mockup */}
            <div style={{
              position: 'relative', width: '52%', zIndex: 1,
            }}>
              {/* Screen */}
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '16/10',
                background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                border: '3px solid #1a1a1a',
                borderRadius: '14px 14px 4px 4px',
                padding: '6px',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 107, 0, 0.2)',
              }}>
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
                  borderRadius: '8px',
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '6px',
                }}>
                  {/* Code-Look */}
                  <div aria-hidden style={{ position: 'absolute', inset: 0, padding: '14px', fontSize: '7px', fontFamily: 'monospace', color: 'rgba(255, 107, 0, 0.4)', lineHeight: 1.4, overflow: 'hidden' }}>
                    <div><span style={{color:'#888'}}>1</span>  <span style={{color:'#FF6B00'}}>import</span> React <span style={{color:'#FF6B00'}}>from</span> 'react';</div>
                    <div><span style={{color:'#888'}}>2</span>  <span style={{color:'#FF6B00'}}>import</span> {'{'} useState {'}'} <span style={{color:'#FF6B00'}}>from</span> 'react';</div>
                    <div><span style={{color:'#888'}}>3</span></div>
                    <div><span style={{color:'#888'}}>4</span>  <span style={{color:'#FF6B00'}}>const</span> App = () =&gt; {'{'}</div>
                    <div><span style={{color:'#888'}}>5</span>    <span style={{color:'#FF6B00'}}>return</span> &lt;<span style={{color:'#fff'}}>Hello</span>/&gt;;</div>
                    <div><span style={{color:'#888'}}>6</span>  {'}'};</div>
                  </div>
                  {/* Logo overlay */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(255, 107, 0, 0.5)',
                    position: 'relative', zIndex: 1,
                  }}>
                    <Code size={24} color="#000" />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1, letterSpacing: '0.1em' }}>
                    zebick.com
                  </div>
                </div>
              </div>
              {/* Laptop Base */}
              <div style={{
                width: '120%', height: '8px',
                background: 'linear-gradient(180deg, #1a1a1a, #0a0a0a)',
                marginLeft: '-10%',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
              }} />
            </div>
          </div>

          {/* Stack Liste rechts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {groups.map((g, i) => (
              <Reveal key={i} direction="right" delay={i * 0.08} data-testid={`tech-group-${i}`} style={{
                padding: '20px 24px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
                border: '1px solid rgba(255, 107, 0, 0.15)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.15)'; }}
              >
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: '#FF6B00',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '12px',
                }}>
                  {g.title}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {g.techs.map((techName, ti) => {
                    const tech = stacks.find(s => s.name === techName);
                    if (!tech) return null;
                    return (
                      <div key={ti} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '50px',
                        transition: 'all 0.2s ease',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 107, 0, 0.12)'; e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
                      >
                        {renderLogo(tech, 18)}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {tech.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatLogo {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
      `}</style>
    </section>
  );
};

/* =========================================================
   9) FAQ
   ========================================================= */
const FAQ = () => {
  const items = [
    { q: 'Wie lange dauert ein Projekt?',         a: 'Je nach Umfang zwischen 2 und 12 Wochen. Kleinere Websites sind in 2-4 Wochen umsetzbar, komplexere Web-/App-Projekte benötigen 8-12 Wochen.' },
    { q: 'Bieten Sie Wartung an?',                a: 'Ja, wir bieten umfassende Wartungspakete inklusive Monitoring, Sicherheits-Updates, Backups und kontinuierlicher Optimierung.' },
    { q: 'Entwickeln Sie individuelle Lösungen?', a: 'Ja, alle Projekte werden maßgeschneidert umgesetzt. Wir arbeiten nicht mit Templates – jedes Projekt ist einzigartig.' },
    { q: 'Gibt es Support nach dem Launch?',      a: 'Ja, langfristige Betreuung ist ein zentraler Teil unseres Service. Unser Support-Team ist 24/7 erreichbar.' },
    { q: 'Was kostet ein Projekt?',               a: 'Die Kosten hängen vom Projektumfang ab. Wir bieten transparente Festpreise sowie agile Time-and-Material-Verträge.' },
    { q: 'Arbeiten Sie auch mit Startups?',       a: 'Absolut! Für junge Unternehmen bieten wir spezielle MVP-Pakete und flexible Zahlungsmodelle an.' },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section data-testid="faq-section" style={{
      padding: 'clamp(70px, 12vw, 140px) 16px',
      background: 'linear-gradient(180deg, #080808 0%, #0a0a0a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal direction="up" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B00',
            padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '8px', marginBottom: '16px',
          }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
            Häufige Fragen
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)',
            maxWidth: '600px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Antworten auf die Fragen, die unsere Kunden uns am häufigsten stellen.
          </p>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} direction="up" delay={i * 0.06} data-testid={`faq-${i}`} style={{
                background: isOpen
                  ? 'linear-gradient(145deg, rgba(255, 107, 0, 0.08), rgba(255, 107, 0, 0.02))'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isOpen ? 'rgba(255, 107, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease',
              }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} data-testid={`faq-trigger-${i}`} style={{
                  width: '100%', padding: 'clamp(18px, 2.5vw, 24px)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '16px', textAlign: 'left', color: 'var(--text-primary)',
                  fontSize: 'clamp(15px, 1.8vw, 17px)', fontWeight: 600,
                  fontFamily: 'inherit',
                }}>
                  <span>{item.q}</span>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: isOpen ? '#FF6B00' : 'rgba(255, 107, 0, 0.15)',
                    border: `1px solid ${isOpen ? '#FF6B00' : 'rgba(255, 107, 0, 0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.3s ease',
                  }}>
                    {isOpen ? <Minus size={16} color="#000" /> : <Plus size={16} color="#FF6B00" />}
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? '300px' : '0',
                  overflow: 'hidden', transition: 'max-height 0.4s ease',
                }}>
                  <div style={{
                    padding: '0 clamp(18px, 2.5vw, 24px) clamp(18px, 2.5vw, 24px)',
                    fontSize: '15px', lineHeight: 1.7, color: 'var(--text-muted)',
                  }}>
                    {item.a}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   10) FINAL CTA
   ========================================================= */
const FinalCTA = () => (
  <section data-testid="final-cta" style={{
    padding: 'clamp(80px, 14vw, 160px) 16px',
    background: 'linear-gradient(180deg, #0a0a0a 0%, rgba(255, 107, 0, 0.12) 50%, #080808 100%)',
    position: 'relative', overflow: 'hidden',
  }}>
    {[800, 600, 400].map((size, i) => (
      <div key={i} aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${size}px`, height: `${size}px`,
        border: `1px solid rgba(255, 107, 0, ${0.06 + i * 0.02})`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />
    ))}
    <div aria-hidden style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: '500px', height: '500px',
      background: 'radial-gradient(circle, rgba(255, 107, 0, 0.18) 0%, transparent 70%)',
      filter: 'blur(80px)', pointerEvents: 'none',
    }} />

    <Reveal direction="up" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
      <h2 style={{
        fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900,
        lineHeight: 1.15, marginBottom: '24px', letterSpacing: '-0.02em',
      }}>
        Bereit für Ihr nächstes
        <span style={{
          display: 'block',
          background: 'linear-gradient(135deg, #FF6B00, #FF8533)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          digitales Projekt?
        </span>
      </h2>
      <p style={{
        fontSize: 'clamp(15px, 2vw, 19px)', lineHeight: 1.7,
        color: 'var(--text-muted)', marginBottom: '40px',
        maxWidth: '650px', margin: '0 auto 40px',
      }}>
        Lassen Sie uns gemeinsam Ihre Idee in eine erfolgreiche Lösung verwandeln.
        Kostenlose Erstberatung und unverbindliches Angebot.
      </p>

      <div style={{
        display: 'flex', gap: '14px', justifyContent: 'center',
        marginBottom: '48px', flexWrap: 'wrap',
      }}>
        <Link to="/contact" data-testid="cta-primary" className="btn-fill btn-fill-dark" style={{
          padding: '18px 40px', fontSize: '16px', fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
          borderRadius: '50px', textDecoration: 'none',
          boxShadow: '0 12px 40px rgba(255, 107, 0, 0.35)',
        }}>
          Jetzt kostenlos beraten lassen <ArrowRight size={18} />
        </Link>
      </div>

      <div style={{
        display: 'flex', gap: 'clamp(24px, 4vw, 48px)', justifyContent: 'center',
        flexWrap: 'wrap', paddingTop: '32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <a href="tel:+41000000000" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', color: 'var(--text-secondary)',
          fontSize: '15px', fontWeight: 500,
        }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'rgba(255, 107, 0, 0.15)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Phone size={18} color="#FF6B00" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Telefon</div>
            <div>+41 XX XXX XX XX</div>
          </div>
        </a>
        <a href="mailto:info@zebick.ch" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', color: 'var(--text-secondary)',
          fontSize: '15px', fontWeight: 500,
        }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'rgba(255, 107, 0, 0.15)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mail size={18} color="#FF6B00" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>E-Mail</div>
            <div>info@zebick.ch</div>
          </div>
        </a>
      </div>
    </Reveal>
  </section>
);

/* =========================================================
   HOMEPAGE — Composition
   ========================================================= */
const HomePage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [home, setHome] = useState(DEFAULT_HOME);

  useEffect(() => {
    fetch(`${API_URL}/api/content/home`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setHome({ ...DEFAULT_HOME, ...d }); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_URL}/api/testimonials/approved`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setTestimonials(data);
          } else {
            setTestimonials(staticTestimonials);
          }
        } else {
          setTestimonials(staticTestimonials);
        }
      } catch (error) {
        setTestimonials(staticTestimonials);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="page-transition">
      <Seo
        title="Digitalagentur für Webentwicklung, App-Entwicklung & Cyber Security"
        description="Zebick entwickelt schnelle, moderne und sichere digitale Produkte – von Websites über Apps bis Cyber Security, UI/UX und KI-Automatisierung."
        path="/"
        jsonLd={HOME_JSONLD}
      />
      {/* Fills the area under the fixed header (fixes the black gap above the hero) */}
      <div className="hero-top-glow" aria-hidden="true" />
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />

      {/* 1) HERO — UNCHANGED */}
      <section className="hero" data-testid="hero-section" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'flex-start',
        paddingTop: 'clamp(92px, 11vh, 128px)',
        paddingBottom: 'clamp(60px, 10vh, 100px)',
        paddingLeft: '16px', paddingRight: '16px',
        position: 'relative',
        background: 'radial-gradient(ellipse 85% 55% at 50% 0%, rgba(255, 107, 0, 0.10) 0%, rgba(255, 107, 0, 0.03) 35%, transparent 62%), linear-gradient(180deg, #0a0a0a 0%, #050505 14%, #000000 50%, #080808 100%)',
      }}>
        {/* Top ambient glow — blends the header with the hero (fixes dark gap) */}
        <div className="hide-mobile" style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: 'clamp(500px, 75vw, 1200px)', height: 'clamp(320px, 42vh, 560px)',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 107, 0, 0.12) 0%, rgba(255, 107, 0, 0.045) 42%, transparent 72%)',
          filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="hide-mobile" style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 'clamp(200px, 30vw, 500px)', height: 'clamp(200px, 30vw, 500px)',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.12) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        <div className="hide-mobile" style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: 'clamp(150px, 25vw, 400px)', height: 'clamp(150px, 25vw, 400px)',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div className="hero-bg">
          <HeroSVG />
          <div className="grid-pattern"></div>
        </div>
        <div className="hide-mobile" style={{
          position: 'absolute', top: '20%', right: '10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.15) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animation: 'pulse 8s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div className="show-mobile" style={{
          position: 'absolute', top: '10%', right: '-20%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.2) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="animate-fadeInUp" style={{ maxWidth: '750px' }}>
            <div data-testid="hero-badge" style={{
              marginBottom: 'clamp(20px, 4vw, 32px)',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)',
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 107, 0, 0.3)', borderRadius: '50px',
              fontSize: 'clamp(11px, 1.5vw, 14px)', fontWeight: 600, color: '#FF6B00',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00',
                boxShadow: '0 0 12px rgba(255, 107, 0, 0.6)',
                animation: 'badgePulse 2.4s ease-in-out infinite',
              }} />
              {home.hero_badge}
            </div>

            <h1 className="hero-heading" style={{
              fontSize: 'clamp(32px, 7vw, 72px)', lineHeight: 1.1,
              marginBottom: 'clamp(16px, 3vw, 28px)',
              fontWeight: 900, letterSpacing: '-0.02em',
            }}>
              <SplitLineHeading line1="Wir entwickeln" line2="digitale Lösungen," line2Gradient={true} />
              <div style={{ overflow: 'hidden', marginTop: '8px' }}>
                <div className="animate-text-reveal" style={{ animationDelay: '0.3s' }}>
                  die begeistern
                </div>
              </div>
            </h1>

            <p className="hero-subtitle" style={{
              fontSize: 'clamp(14px, 2vw, 19px)', lineHeight: 1.7,
              maxWidth: '600px', marginBottom: 'clamp(28px, 5vw, 40px)',
              color: 'var(--text-muted)',
            }}>
              {home.hero_description}
            </p>

            <div className="hero-buttons" style={{
              display: 'flex', flexDirection: 'column', gap: '12px',
              marginBottom: 'clamp(28px, 5vw, 48px)',
            }}>
              <Link to="/contact" className="btn-primary" data-testid="hero-cta-primary" style={{
                padding: 'clamp(16px, 2.5vw, 20px) clamp(28px, 4vw, 40px)',
                fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
                borderRadius: '50px', textDecoration: 'none',
                width: '100%', maxWidth: '300px',
              }}>
                Projekt starten <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="btn-secondary" data-testid="hero-cta-secondary" style={{
                padding: 'clamp(16px, 2.5vw, 20px) clamp(28px, 4vw, 40px)',
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50px', textDecoration: 'none',
                width: '100%', maxWidth: '300px',
              }}>
                Services ansehen
              </Link>
            </div>
          </div>
        </div>

        <style>{`
          @media screen and (min-width: 769px) {
            .hero-buttons { flex-direction: row !important; }
            .hero-buttons a { width: auto !important; }
          }
          @media screen and (max-width: 768px) {
            .hero-buttons { flex-direction: row !important; flex-wrap: nowrap !important; }
            .hero-buttons a {
              width: auto !important; max-width: none !important; flex: 1 1 0 !important;
              padding: 14px 10px !important; font-size: 13px !important; gap: 6px !important;
            }
          }
          /* Hero-SVG auch auf sehr kleinen Handys zeigen — eine generische
             Projekt-Regel blendet .hero-bg/.grid-pattern sonst bei <=480px aus. */
          @media screen and (max-width: 480px) {
            [data-testid="hero-section"] .hero-bg,
            [data-testid="hero-section"] .grid-pattern {
              display: block !important;
            }
          }

          /* Überschrift + Untertitel auf Mobil kleiner als die clamp()-Untergrenze. */
          @media screen and (max-width: 768px) {
            .hero-heading { font-size: 26px !important; }
            .hero-subtitle { font-size: 13.5px !important; }
          }
          @media screen and (max-width: 480px) {
            .hero-heading { font-size: 22px !important; }
            .hero-subtitle { font-size: 13px !important; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.05; }
            50% { transform: scale(1.2); opacity: 0.1; }
          }
          @keyframes badgePulse {
            0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 12px rgba(255, 107, 0, 0.6); }
            50% { transform: scale(1.25); opacity: 0.85; box-shadow: 0 0 18px rgba(255, 107, 0, 0.9); }
          }
        `}</style>
      </section>

      <TrustSection />
      <ServicesGrid />
      <WhyUsSection />
      <ProcessSection />
      <PortfolioShowcase />
      <TestimonialsSection testimonials={testimonials} onOpenReview={() => setShowReviewForm(true)} />
      <TechStackSection />
      <FAQ />
      <FinalCTA />

      <Footer />
      <Chatbot />
    </div>
  );
};

export default HomePage;
