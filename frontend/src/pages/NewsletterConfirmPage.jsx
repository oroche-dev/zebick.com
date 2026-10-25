import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Seo from '../components/common/Seo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NewsletterConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    // Guard against React StrictMode's dev-only double-invoke (and any other
    // double-fire) — the token is single-use, so a second call would always
    // fail and incorrectly flip a just-confirmed page to the error state.
    if (calledRef.current) return;
    calledRef.current = true;
    axios
      .get(`${BACKEND_URL}/api/newsletter/confirm`, { params: { token } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <div className="page-transition">
      <Seo title="Newsletter bestätigen" description="Bestätige deine Newsletter-Anmeldung." path="/newsletter/bestaetigen" noindex />
      <Header />
      <section className="hero" style={{ minHeight: '80vh' }}>
        <div className="hero-bg">
          <div className="grid-pattern"></div>
          <div className="ambient-glow ambient-glow-top-right"></div>
        </div>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: isLoading
                ? 'rgba(255,255,255,0.08)'
                : isSuccess
                ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))'
                : 'linear-gradient(135deg, #EF4444, #991B1B)',
              borderRadius: '50%',
              margin: '0 auto 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isLoading ? 'none' : isSuccess
                ? '0 20px 60px rgba(255, 107, 0, 0.4)'
                : '0 20px 60px rgba(239, 68, 68, 0.35)',
            }}>
              {isLoading ? (
                <Loader2 size={48} color="var(--text-primary)" className="spin" />
              ) : isSuccess ? (
                <CheckCircle size={56} color="var(--bg-primary)" />
              ) : (
                <XCircle size={56} color="#fff" />
              )}
            </div>
            <h1 className="heading-1" style={{ fontSize: '48px', marginBottom: '20px' }}>
              {isLoading ? 'Einen Moment …' : isSuccess ? 'Anmeldung bestätigt!' : 'Link ungültig'}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.7 }}>
              {isLoading
                ? 'Deine Newsletter-Anmeldung wird bestätigt.'
                : isSuccess
                ? 'Deine E-Mail-Adresse wurde bestätigt. Du erhältst ab sofort unseren Newsletter.'
                : 'Dieser Bestätigungslink ist ungültig oder abgelaufen. Melde dich gerne erneut über das Formular auf der Website an.'}
            </p>
            {!isLoading && (
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '18px 36px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '16px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                Zur Startseite
              </Link>
            )}
          </div>
        </div>
      </section>
      <Footer />
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default NewsletterConfirmPage;
