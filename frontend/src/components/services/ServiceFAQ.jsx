import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionHeader from './SectionHeader';

/**
 * ServiceFAQ — accordion FAQ section.
 * items: [{ question, answer }]
 */
const ServiceFAQ = ({ eyebrow = 'FAQ', title = 'Häufige Fragen', accentWord, subtitle, items = [], testid = 'service-faq' }) => {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section
      data-testid={testid}
      style={{
        padding: '120px 0',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ maxWidth: '880px' }}>
        <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.6s ease' }}>
          <SectionHeader eyebrow={eyebrow} title={title} accentWord={accentWord} subtitle={subtitle} testid={`${testid}-header`} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div
                key={idx}
                data-reveal
                style={{ opacity: 0, transform: 'translateY(30px)', transition: `opacity 0.6s ${0.04 * idx}s ease, transform 0.6s ${0.04 * idx}s ease` }}
              >
              <div
                data-testid={`${testid}-item-${idx}`}
                style={{
                  background: open ? 'rgba(255,107,0,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${open ? 'rgba(255,107,0,0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
              >
                <button
                  onClick={() => setOpenIdx(open ? -1 : idx)}
                  aria-expanded={open}
                  data-testid={`${testid}-toggle-${idx}`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 28px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={20}
                    color="var(--accent-primary)"
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: open ? 'rotate(180deg)' : 'rotate(0)',
                      flexShrink: 0,
                      marginLeft: '16px',
                    }}
                  />
                </button>
                <div
                  style={{
                    maxHeight: open ? '400px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease',
                  }}
                >
                  <div style={{ padding: '0 28px 24px', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {item.answer}
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceFAQ;
