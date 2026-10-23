import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import ZebickLogoB from '../components/brand/ZebickLogoB';
import Seo from '../components/common/Seo';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 25% 20%, rgba(255, 107, 0, 0.10) 0%, transparent 55%), radial-gradient(circle at 75% 80%, rgba(255, 107, 0, 0.06) 0%, transparent 55%), #0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: '#fff',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Seo title="Seite nicht gefunden" description="Die aufgerufene Seite existiert nicht oder wurde verschoben." noindex />
      {/* Decorative grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 107, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 107, 0, 0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 560 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-block', marginBottom: 40 }} aria-label="Zebick Startseite">
          <ZebickLogoB height={56} variant="outfit" />
        </Link>

        {/* Big 404 */}
        <div style={{
          fontSize: 'clamp(120px, 22vw, 220px)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(180deg, #FF6B00 0%, rgba(255, 107, 0, 0.3) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 16,
        }}>
          404
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: 'rgba(255, 107, 0, 0.1)',
          border: '1px solid rgba(255, 107, 0, 0.25)',
          borderRadius: 50,
          fontSize: 11,
          fontWeight: 700,
          color: '#FF6B00',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          <Compass size={12} /> Seite nicht gefunden
        </div>

        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 34px)',
          fontWeight: 800,
          margin: '0 0 14px',
          letterSpacing: '-0.02em',
        }}>
          Hier scheint nichts zu sein.
        </h1>

        <p style={{
          fontSize: 16,
          color: '#9a9a9a',
          lineHeight: 1.6,
          margin: '0 auto 32px',
          maxWidth: 440,
        }}>
          Die gesuchte Seite existiert nicht mehr oder wurde verschoben.
          Kein Problem — kehren Sie einfach zur Startseite zurück.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="nf-primary btn-fill btn-fill-dark"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 24px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #e35e00 100%)',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 8px 20px -6px rgba(255, 107, 0, 0.5)',
            }}
          >
            <Home size={16} /> Zur Startseite
          </Link>
          <button
            onClick={() => window.history.back()}
            className="nf-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 24px',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              color: '#cfcfcf',
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
            }}
          >
            <ArrowLeft size={16} /> Zurück
          </button>
        </div>

        <div style={{ marginTop: 48, fontSize: 12, color: '#6a6a6a' }}>
          Fehlercode <code style={{
            background: '#161616',
            padding: '2px 8px',
            borderRadius: 4,
            color: '#FF6B00',
            fontFamily: "'JetBrains Mono', monospace",
          }}>404 · NOT_FOUND</code>
        </div>
      </div>

      <style>{`
        .nf-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(255, 107, 0, 0.6);
        }
        .nf-secondary:hover {
          background: rgba(255, 107, 0, 0.08);
          border-color: rgba(255, 107, 0, 0.35);
          color: #FF6B00;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
