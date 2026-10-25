import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, MailX } from 'lucide-react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Seo from '../components/common/Seo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NewsletterUnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/api/newsletter/unsubscribe`, { email });
      setDone(true);
    } catch (err) {
      setError('Abmeldung fehlgeschlagen. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-transition">
      <Seo title="Newsletter abmelden" description="Newsletter-Anmeldung kündigen." path="/newsletter/abmelden" noindex />
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
              background: done
                ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))'
                : 'rgba(255,255,255,0.05)',
              border: done ? 'none' : '1px solid var(--border-subtle)',
              borderRadius: '50%',
              margin: '0 auto 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: done ? '0 20px 60px rgba(255, 107, 0, 0.4)' : 'none',
            }}>
              {done
                ? <CheckCircle size={56} color="var(--bg-primary)" />
                : <MailX size={48} color="var(--text-muted)" />}
            </div>
            <h1 className="heading-1" style={{ fontSize: '48px', marginBottom: '20px' }}>
              {done ? 'Abgemeldet' : 'Newsletter abmelden'}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.7 }}>
              {done
                ? 'Du erhältst keine weiteren Newsletter-E-Mails mehr von uns.'
                : email
                ? <>Möchtest du dich mit <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> vom Newsletter abmelden?</>
                : 'Keine E-Mail-Adresse angegeben.'}
            </p>
            {error && (
              <p style={{ color: '#EF4444', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
            )}
            {!done && email && (
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '18px 36px',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  marginRight: '12px',
                }}
              >
                {isLoading ? 'Wird abgemeldet …' : 'Jetzt abmelden'}
              </button>
            )}
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
              }}
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NewsletterUnsubscribePage;
