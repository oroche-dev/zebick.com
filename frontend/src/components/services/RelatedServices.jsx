import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Compact internal-linking block for the bottom of each service page —
 * natural anchor text pointing at the 2-4 most related other services
 * (see App.js's route list for the canonical path of each service).
 */
const RelatedServices = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <section style={{ padding: '60px 16px', borderTop: '1px solid var(--border-subtle)' }} data-testid="related-services">
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Das könnte Sie auch interessieren
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '999px',
                border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
                fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {item.label} <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;
