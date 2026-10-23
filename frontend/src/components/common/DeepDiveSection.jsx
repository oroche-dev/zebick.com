import React from 'react';
import {
  Server, Shield, Search, Database, GitBranch, BarChart, TrendingUp,
  Layers, Eye, MousePointer2, Target, Award, Wifi, Rocket, Zap, Users,
  BookOpen, FileImage,
} from 'lucide-react';

const ICONS = {
  Server, Shield, Search, Database, GitBranch, BarChart, TrendingUp,
  Layers, Eye, MousePointer2, Target, Award, Wifi, Rocket, Zap, Users,
  BookOpen, FileImage,
};

/**
 * DeepDiveSection — modular "Deep Dive" section used on every service page.
 *
 * Props:
 *  - testid: string (data-testid base for the section)
 *  - eyebrow: string (e.g. "Deep Dive")
 *  - title: string (large headline)
 *  - intro: string (descriptive paragraph)
 *  - stats: [{ k, v }]  — small inline stats (4 items recommended)
 *  - hero: { image, tag, num, title, desc }  — full-bleed image with overlay text
 *  - pillars: [{ num, tag, icon, title, desc, bullets:[] }]  — 3 text cards
 *  - workflow: { title, steps: [{ n, t, d }] }  — 5-step horizontal strip
 *  - quote: { text, author }
 */
const DeepDiveSection = ({
  testid = 'service-deepdive',
  eyebrow = 'Deep Dive',
  title,
  intro,
  stats = [],
  hero,
  pillars = [],
  workflow,
  quote,
}) => (
  <section className="section" data-testid={testid} style={{
    paddingTop: 'clamp(60px, 8vw, 100px)',
    paddingBottom: 'clamp(40px, 6vw, 80px)',
    background: 'var(--bg-primary)',
  }}>
    <div className="container">
      {/* Asymmetric intro */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
        gap: 'clamp(28px, 5vw, 64px)',
        alignItems: 'start',
        marginBottom: 'clamp(56px, 7vw, 88px)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--accent-primary)',
            marginBottom: '18px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
            {eyebrow}
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {title}
          </h2>
        </div>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.75, margin: 0 }}>
            {intro}
          </p>
          {stats.length > 0 && (
            <div style={{ marginTop: '22px', display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>{s.k}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{s.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero strip with overlay text */}
      {hero && (
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: 'clamp(56px, 7vw, 88px)',
          aspectRatio: '21 / 7',
        }}>
          <img
            src={hero.image}
            alt={hero.alt || hero.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'clamp(28px, 5vw, 56px)',
            maxWidth: '560px',
          }}>
            <div style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
              background: 'rgba(255, 107, 0, 0.18)', border: '1px solid rgba(255, 107, 0, 0.32)',
              color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px',
              width: 'fit-content',
            }}>
              {hero.num} · {hero.tag}
            </div>
            <h3 style={{
              fontSize: 'clamp(20px, 2.6vw, 30px)',
              fontWeight: 700,
              margin: '0 0 12px',
              lineHeight: 1.2,
              color: 'var(--text-primary)',
            }}>
              {hero.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
              {hero.desc}
            </p>
          </div>
        </div>
      )}

      {/* Pillar cards */}
      {pillars.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: 'clamp(56px, 7vw, 88px)',
        }}>
          {pillars.map((c, i) => {
            const Icon = c.icon || ICONS[c.iconName] || Server;
            return (
              <div key={i} style={{
                padding: 'clamp(20px, 3vw, 28px)',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    background: 'rgba(255, 107, 0, 0.1)',
                    border: '1px solid rgba(255, 107, 0, 0.22)',
                    borderRadius: '8px',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon size={15} color="var(--accent-primary)" />
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: 'var(--accent-primary)',
                  }}>
                    {c.num} · {c.tag}
                  </div>
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}>
                  {c.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                  {c.desc}
                </p>
                {c.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {c.bullets.map((b, bi) => (
                      <li key={bi} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                        <span style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: 'var(--accent-primary)', flexShrink: 0,
                        }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workflow strip */}
      {workflow && (
        <div style={{
          padding: 'clamp(24px, 4vw, 40px)',
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          marginBottom: 'clamp(56px, 7vw, 88px)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--accent-primary)',
            marginBottom: '20px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
            Workflow
          </div>
          <h3 style={{
            fontSize: 'clamp(20px, 2.4vw, 26px)',
            fontWeight: 700,
            margin: '0 0 28px',
            maxWidth: '600px',
            letterSpacing: '-0.01em',
          }}>
            {workflow.title}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(150, Math.floor(800 / workflow.steps.length))}px, 1fr))`,
            gap: '20px',
          }}>
            {workflow.steps.map((step, i) => (
              <div key={i}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)',
                  letterSpacing: '0.1em', marginBottom: '8px',
                }}>
                  {step.n}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {step.t}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {step.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pull quote */}
      {quote && (
        <div style={{
          maxWidth: '880px',
          margin: '0 auto',
          textAlign: 'left',
          borderLeft: '2px solid var(--accent-primary)',
          paddingLeft: 'clamp(20px, 3vw, 36px)',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}>
          <p style={{
            fontSize: 'clamp(18px, 2.4vw, 26px)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.45,
            margin: '0 0 14px',
            letterSpacing: '-0.01em',
          }}>
            {quote.text}
          </p>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {quote.author}
          </div>
        </div>
      )}
    </div>
  </section>
);

export default DeepDiveSection;

// Default placeholder Search/Shield icons re-exported for convenience
export { Server, Shield, Search };
