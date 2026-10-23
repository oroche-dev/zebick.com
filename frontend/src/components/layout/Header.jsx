import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { navigationLinks } from '../../data/mock';
import ZebickLogoB from '../brand/ZebickLogoB';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Header */}
      <header style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled ? 'rgba(10, 10, 10, 0.96)' : 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.25s ease',
      }}>
        <div className="header-inner" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ zIndex: 1001, display: 'flex', alignItems: 'center' }} aria-label="Zebick Startseite">
            <ZebickLogoB height={34} variant="outfit" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '4px' }}>
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="desktop-cta" style={{ display: 'none' }}>
            <Link
              to="/contact"
              className="btn-fill btn-fill-dark"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                background: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '13.5px',
                borderRadius: '6px',
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              Projekt starten
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menü"
            aria-expanded={isMobileMenuOpen}
            className="mobile-menu-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              background: isMobileMenuOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              cursor: 'pointer',
              zIndex: 1001,
              padding: 0,
              transition: 'background 0.18s ease, border-color 0.18s ease',
            }}
            onTouchStart={() => {}}
          >
            {isMobileMenuOpen
              ? <X size={20} color="var(--text-primary)" />
              : <Menu size={20} color="var(--text-primary)" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          data-testid="mobile-menu-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        data-testid="mobile-menu-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(86%, 360px)',
          height: '100dvh',
          background: '#0a0a0a',
          borderLeft: '1px solid var(--border-subtle)',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Menu Header */}
        <div style={{
          padding: '76px 22px 18px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <ZebickLogoB height={30} variant="outfit" />
        </div>

        {/* Navigation Links */}
        <nav style={{
          flex: 1,
          padding: '14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`mobile-nav-${link.path.replace('/', '') || 'home'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: `2px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                  borderRadius: '0',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
              >
                <span style={{
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  letterSpacing: '-0.005em',
                }}>
                  {link.label}
                </span>
                <ChevronRight
                  size={15}
                  color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div style={{
          padding: '16px 18px',
          paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <Link
            to="/contact"
            data-testid="mobile-cta-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            className="btn-fill btn-fill-dark"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '15px 20px',
              background: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '6px',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            Projekt starten
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        .nav-link::after {
          content: '';
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 4px;
          height: 2px;
          background: var(--accent-primary);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.2s ease;
        }
        .nav-link:hover {
          color: var(--text-primary) !important;
        }
        .nav-link:hover::after,
        .nav-link-active::after {
          transform: scaleX(1);
        }
        .desktop-cta a:hover {
          background: #ff7d1f !important;
        }
        .mobile-menu-toggle:hover {
          border-color: var(--accent-primary) !important;
        }
        [data-testid="mobile-menu-panel"] nav a:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        @media screen and (min-width: 1024px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta {
            display: block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
