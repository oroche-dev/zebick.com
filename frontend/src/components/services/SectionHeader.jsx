import React from 'react';

/**
 * SectionHeader — consistent eyebrow + headline + subtitle for service sections.
 */
const SectionHeader = ({ eyebrow, title, accentWord, subtitle, align = 'center', testid }) => {
  const renderTitle = () => {
    if (!accentWord) return title;
    const parts = title.split(accentWord);
    return (
      <>
        {parts[0]}
        <span className="text-gradient">{accentWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      data-testid={testid}
      style={{
        textAlign: align,
        marginBottom: '64px',
        maxWidth: align === 'center' ? '780px' : 'none',
        margin: align === 'center' ? '0 auto 64px' : '0 0 56px',
      }}
    >
      {eyebrow && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: 'rgba(255,107,0,0.10)',
            border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: '999px',
            marginBottom: '18px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontSize: 'clamp(30px, 4.4vw, 48px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.12,
          marginBottom: '16px',
          color: 'var(--text-primary)',
        }}
      >
        {renderTitle()}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '680px', margin: align === 'center' ? '0 auto' : 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
