import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Visual breadcrumb trail for deeper pages (e.g. service pages).
 * items: [{ label, path }] — path omitted on the last (current) item.
 * Kept low-key. Wraps on narrow phones instead of causing overflow.
 * inline: no own padding/width, for use inside PageIntro (which clears the fixed header).
 */
const Breadcrumbs = ({ items, inline = false }) => (
  <nav
    aria-label="Breadcrumb"
    data-testid="breadcrumbs"
    style={inline ? { position: 'relative', zIndex: 2 } : {
      position: 'relative',
      zIndex: 2,
      padding: '14px 16px 0',
      maxWidth: '1280px',
      margin: '0 auto',
    }}
  >
    <ol
      style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px',
        listStyle: 'none', margin: 0, padding: 0,
        fontSize: '13px', color: 'var(--text-muted)',
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i > 0 && <ChevronRight size={13} style={{ opacity: 0.5, flexShrink: 0 }} />}
            {isLast || !item.path ? (
              <span aria-current={isLast ? 'page' : undefined} style={{ color: isLast ? 'var(--text-secondary)' : 'inherit' }}>
                {item.label}
              </span>
            ) : (
              <Link to={item.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
