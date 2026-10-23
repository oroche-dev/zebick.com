import React, { useState } from 'react';
import { Star, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ReviewPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    content: '',
    rating: 0
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Bitte geben Sie Ihren Namen ein');
      return;
    }
    if (formData.rating === 0) {
      setError('Bitte wählen Sie eine Sternbewertung');
      return;
    }
    if (formData.content.trim().length < 10) {
      setError('Ihre Bewertung muss mindestens 10 Zeichen lang sein');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/testimonials/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          company: formData.company.trim() || null,
          position: formData.position.trim() || null,
          email: formData.email.trim() || null,
          content: formData.content.trim(),
          rating: formData.rating
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.detail || 'Ein Fehler ist aufgetreten');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '60px 40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }} data-testid="review-success-message">
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(76, 175, 80, 0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color="#4caf50" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Vielen Dank für Ihre Bewertung!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
            Ihre Bewertung wurde erfolgreich eingereicht und wird nach Prüfung auf unserer Website veröffentlicht.
          </p>
          <Link
            to="/"
            className="btn-fill btn-fill-dark"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: 'var(--accent-primary)',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px'
            }}
            data-testid="back-to-home-btn"
          >
            <ArrowLeft size={18} />
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
      padding: '60px 20px'
    }}>
      <Seo title="Bewertung abgeben" description="Teilen Sie Ihre Erfahrung mit Zebick." path="/bewertung-abgeben" noindex />
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '32px' }}>
            <span style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-1px'
            }}>
              ze<span style={{ color: 'var(--accent-primary)' }}>b</span>ick
            </span>
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Ihre Meinung zählt
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
            Teilen Sie Ihre Erfahrung mit zebick und helfen Sie anderen Kunden bei ihrer Entscheidung.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '40px'
        }} data-testid="review-form">
          {/* Rating */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <label style={{ display: 'block', color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Ihre Bewertung *
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.2s',
                    transform: (hoveredRating >= star || formData.rating >= star) ? 'scale(1.2)' : 'scale(1)'
                  }}
                  data-testid={`star-${star}`}
                >
                  <Star
                    size={40}
                    fill={(hoveredRating >= star || formData.rating >= star) ? 'var(--accent-primary)' : 'transparent'}
                    color="var(--accent-primary)"
                    opacity={(hoveredRating >= star || formData.rating >= star) ? 1 : 0.3}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p style={{ color: 'var(--accent-primary)', fontSize: '14px', marginTop: '12px' }}>
                {formData.rating === 5 ? 'Ausgezeichnet!' : 
                 formData.rating === 4 ? 'Sehr gut!' : 
                 formData.rating === 3 ? 'Gut' : 
                 formData.rating === 2 ? 'Verbesserungswürdig' : 'Nicht zufrieden'}
              </p>
            )}
          </div>

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              Ihr Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Max Mustermann"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              data-testid="review-name-input"
            />
          </div>

          {/* Company & Position in one row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                Firma (optional)
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Ihre Firma"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
                data-testid="review-company-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                Position (optional)
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="z.B. Geschäftsführer"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
                data-testid="review-position-input"
              />
            </div>
          </div>

          {/* Email (optional) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              E-Mail (optional) — für Bestätigung Ihrer Bewertung
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ihre@email.de"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none'
              }}
              data-testid="review-email-input"
            />
          </div>

          {/* Review Content */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              Ihre Bewertung *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Erzählen Sie von Ihrer Erfahrung mit zebick..."
              rows={5}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                fontFamily: 'inherit'
              }}
              data-testid="review-content-input"
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>
              Mindestens 10 Zeichen, maximal 1000 Zeichen ({formData.content.length}/1000)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: '8px',
              color: '#f44336',
              fontSize: '14px',
              marginBottom: '20px'
            }} data-testid="review-error-message">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-fill btn-fill-dark"
            style={{
              width: '100%',
              padding: '16px',
              background: isSubmitting ? 'rgba(255, 107, 0, 0.5)' : 'var(--accent-primary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            data-testid="submit-review-btn"
          >
            {isSubmitting ? (
              'Wird gesendet...'
            ) : (
              <>
                <Send size={18} />
                Bewertung absenden
              </>
            )}
          </button>

          <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            * Ihre Bewertung wird nach Prüfung veröffentlicht
          </p>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/"
            style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} />
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
