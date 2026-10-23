import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * ServiceHero — premium hero block with badge, multi-line title with accent word,
 * description, CTA buttons and inline stats.
 */
const ServiceHero = ({
  badge,
  badgeIcon: BadgeIcon,
  titleLines = [],
  accentWord,
  description,
  primaryCta = { label: 'Beratung anfragen', to: '/contact' },
  secondaryCta,
  stats = [],
  bgImage,
}) => (
  <section className="hero" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }} data-testid="service-hero">
    <div className="hero-bg">
      <div className="grid-pattern" />
      <div className="ambient-glow ambient-glow-top-right" />
      {bgImage && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 60%, rgba(0,0,0,0.95) 100%), url(${bgImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.55,
          }}
        />
      )}
    </div>
    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
      <div className="hero-content" style={{ maxWidth: '960px' }}>
        {badge && (
          <div className="hero-badge animate-fadeInUp" data-testid="service-hero-badge">
            {BadgeIcon && <BadgeIcon size={16} />}
            {badge}
          </div>
        )}
        <h1 className="heading-display hero-title animate-fadeInUp delay-100" data-testid="service-hero-title">
          {titleLines.map((line, i) => (
            <React.Fragment key={i}>
              {line === accentWord ? <span className="text-gradient">{line}</span> : line}
              {i < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <p className="hero-description animate-fadeInUp delay-200" data-testid="service-hero-description">
          {description}
        </p>
        <div className="hero-buttons animate-fadeInUp delay-300">
          <Link to={primaryCta.to} className="btn-primary" data-testid="service-hero-primary-cta">
            {primaryCta.label}
            <ArrowRight size={18} />
          </Link>
          {secondaryCta && (
            <a href={secondaryCta.to} className="btn-secondary" data-testid="service-hero-secondary-cta">
              {secondaryCta.label}
            </a>
          )}
        </div>
        {stats.length > 0 && (
          <div
            className="animate-fadeInUp delay-400"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '80px' }}
            data-testid="service-hero-stats"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-card-static" style={{ padding: '28px 36px', textAlign: 'center', flex: '1 1 180px', minWidth: '160px' }}>
                <div style={{ fontSize: '34px', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1, textShadow: '0 0 40px rgba(255,107,0,0.4)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default ServiceHero;
