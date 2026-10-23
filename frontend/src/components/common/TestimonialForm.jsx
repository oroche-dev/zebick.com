import React, { useState } from 'react';
import { Star, Send, CheckCircle, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TestimonialForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
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

  const resetForm = () => {
    setFormData({ name: '', company: '', position: '', content: '', rating: 0 });
    setIsSubmitted(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(8px)'
    }} data-testid="testimonial-modal">
      <div style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          data-testid="close-modal-btn"
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(76, 175, 80, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={32} color="#4caf50" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              Vielen Dank!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Ihre Bewertung wurde eingereicht und wird nach Prüfung veröffentlicht.
            </p>
            <button
              onClick={handleClose}
              className="btn-fill btn-fill-dark"
              style={{
                padding: '12px 24px',
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              data-testid="close-success-btn"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px', paddingRight: '40px' }}>
              Bewertung schreiben
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Teilen Sie Ihre Erfahrung mit uns
            </p>

            {/* Rating */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                Ihre Bewertung *
              </label>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
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
                      padding: '2px',
                      transition: 'transform 0.15s',
                      transform: (hoveredRating >= star || formData.rating >= star) ? 'scale(1.15)' : 'scale(1)'
                    }}
                    data-testid={`modal-star-${star}`}
                  >
                    <Star
                      size={32}
                      fill={(hoveredRating >= star || formData.rating >= star) ? 'var(--accent-primary)' : 'transparent'}
                      color="var(--accent-primary)"
                      opacity={(hoveredRating >= star || formData.rating >= star) ? 1 : 0.3}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
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
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
                data-testid="modal-name-input"
              />
            </div>

            {/* Company & Position */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                  Firma
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  data-testid="modal-company-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  data-testid="modal-position-input"
                />
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                Ihre Erfahrung *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Erzählen Sie von Ihrer Erfahrung..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit'
                }}
                data-testid="modal-content-input"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                {formData.content.length}/1000 Zeichen
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #f44336',
                borderRadius: '6px',
                color: '#f44336',
                fontSize: '13px',
                marginBottom: '16px'
              }} data-testid="modal-error-message">
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
                padding: '14px',
                background: isSubmitting ? 'rgba(255, 107, 0, 0.5)' : 'var(--accent-primary)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              data-testid="modal-submit-btn"
            >
              {isSubmitting ? 'Wird gesendet...' : (
                <>
                  <Send size={16} />
                  Bewertung absenden
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestimonialForm;
