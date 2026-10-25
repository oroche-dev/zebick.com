import React, { useState } from 'react';

const baseCard = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
};

const ChannelCard = ({ service, delay = 0, featured = false }) => {
  const Icon = service.icon;
  const accent = service.brandColor || '#FF6B00';
  const [logoFailed, setLogoFailed] = useState(false);
  const badgeSize = featured ? 64 : 52;
  const photoSeed = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div data-reveal data-testid={`channel-card-${service.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      style={{
        ...baseCard, padding: featured ? '36px' : '28px', position: 'relative', overflow: 'hidden',
        gridColumn: featured ? 'span 2' : 'span 1', gridRow: featured ? 'span 2' : 'span 1',
        display: 'flex', flexDirection: 'column', justifyContent: featured ? 'center' : 'flex-start',
        opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${delay}s ease, border-color 0.3s, box-shadow 0.3s, transform 0.3s`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${accent}33`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      {/* background photo — a curated, topic-matched image when the item
          provides one, otherwise a seeded placeholder (stays stable across
          reloads) so cards never render blank while content is filled in */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${service.image || `https://picsum.photos/seed/${photoSeed}/700/700`})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'grayscale(55%) brightness(0.65) contrast(1.05)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(145deg, ${accent}40 0%, rgba(10,10,14,0.88) 55%, rgba(10,10,14,0.96) 100%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ width: badgeSize, height: badgeSize, borderRadius: 'var(--radius-md)', background: `${accent}1a`, border: `1px solid ${accent}4d`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          {service.logo && !logoFailed ? (
            <img src={service.logo} alt={service.title} loading="lazy" style={{ width: '58%', height: '58%', objectFit: 'contain' }} onError={() => setLogoFailed(true)} />
          ) : (
            <Icon size={featured ? 28 : 24} color={accent} />
          )}
        </div>
        <h3 style={{ fontSize: featured ? '23px' : '17px', fontWeight: 700, marginBottom: '8px' }}>{service.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: featured ? '15px' : '14px', lineHeight: 1.65, marginBottom: service.features ? '16px' : 0 }}>{service.desc}</p>
        {service.features && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
            {service.features.slice(0, featured ? service.features.length : 3).map((f) => (
              <span key={f} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: `${accent}14`, border: `1px solid ${accent}33`, color: accent }}>{f}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Tabbed, bento-style service grid: a pill tab bar groups `services` by
 * `tabId`, each card gets a real (seeded) photo background. The first
 * service in every tab is shown as the large "featured" card.
 * - tabs: [{ id, label }]
 * - services: [{ tabId, icon, title, desc, features?, logo?, brandColor? }]
 */
const ServiceTabsGrid = ({ tabs, services }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const featuredTitles = new Set(
    tabs.map((t) => services.find((s) => s.tabId === t.id)?.title).filter(Boolean)
  );

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
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
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gridAutoFlow: 'dense', gap: '20px' }}>
        {services.map((s, i) => (
          <div key={s.title} style={{ display: s.tabId === activeTab ? 'contents' : 'none' }}>
            <ChannelCard service={s} delay={i * 0.06} featured={featuredTitles.has(s.title)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ServiceTabsGrid;
