import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, LogIn, ShieldCheck, KeyRound } from 'lucide-react';
import axios from 'axios';
import ZebickLogoB from '../../components/brand/ZebickLogoB';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const inputStyle = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  background: '#0f0f0f',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { email, password };
      if (mfaRequired) payload.totp_code = totpCode;

      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, payload);

      if (response.data.mfa_required) {
        setMfaRequired(true);
        setError('Bitte geben Sie Ihren 2FA-Code ein.');
        setLoading(false);
        return;
      }

      if (response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
        localStorage.setItem('admin_email', response.data.email);
        navigate('/zb-panel-8x2k/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data.detail || 'Zu viele Fehlversuche. Bitte warten Sie einige Minuten.');
      } else if (err.response?.status === 401) {
        setError(err.response.data.detail || 'Ungültige E-Mail-Adresse oder ungültiges Passwort.');
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 0%, rgba(255, 107, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(255, 107, 0, 0.05) 0%, transparent 50%), #0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      color: '#fff',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <ZebickLogoB height={56} variant="outfit" />
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
            marginTop: 8,
          }}>
            <ShieldCheck size={12} /> Admin-Bereich
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '18px 0 6px', letterSpacing: '-0.01em' }}>
            Willkommen zurück
          </h1>
          <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>
            Bitte melden Sie sich an, um fortzufahren.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(180deg, #131313 0%, #0f0f0f 100%)',
          border: '1px solid #222222',
          borderRadius: 12,
          padding: 28,
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255, 107, 0, 0.04) inset',
        }}>
          {error && (
            <div role="alert" style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: 12,
              background: 'rgba(216, 90, 90, 0.08)',
              border: '1px solid rgba(216, 90, 90, 0.3)',
              borderRadius: 8,
              marginBottom: 18,
            }}>
              <AlertCircle size={16} color="#d85a5a" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: '#e07070', fontSize: 13, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#9a9a9a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                E-Mail-Adresse
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#6a6a6a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zebick.com"
                  required
                  autoComplete="email"
                  data-testid="admin-login-email"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#FF6B00'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: mfaRequired ? 14 : 22 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#9a9a9a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Passwort
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#6a6a6a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  data-testid="admin-login-password"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#FF6B00'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {mfaRequired && (
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', marginBottom: 6, color: '#9a9a9a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Zwei-Faktor-Code
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="#6a6a6a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="10"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\s/g, ''))}
                    placeholder="6-stelliger Code"
                    required
                    autoComplete="one-time-code"
                    data-testid="login-totp-input"
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      letterSpacing: '4px',
                      fontSize: 16,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#FF6B00'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="admin-login-submit"
              style={{
                width: '100%',
                padding: '13px 16px',
                background: loading ? '#3a2a1a' : 'linear-gradient(135deg, #FF6B00 0%, #e35e00 100%)',
                border: 'none',
                borderRadius: 8,
                color: loading ? '#7a7a7a' : '#000',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
                transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                boxShadow: loading ? 'none' : '0 8px 20px -6px rgba(255, 107, 0, 0.5)',
              }}
            >
              {loading ? 'Anmeldung läuft …' : <><LogIn size={16} />Anmelden</>}
            </button>
          </form>

          <div style={{
            marginTop: 18,
            padding: 12,
            background: '#0d0d0d',
            border: '1px solid #1f1f1f',
            borderRadius: 8,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <ShieldCheck size={14} color="#FF6B00" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: '#9a9a9a', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#FF6B00' }}>Sicherheitshinweis:</strong>{' '}
              Verwenden Sie ein starkes Passwort und aktivieren Sie nach dem ersten Login die Zwei-Faktor-Authentifizierung.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a
            href="/"
            className="back-to-site"
            style={{ color: '#6a6a6a', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s ease' }}
          >
            ← Zurück zur Website
          </a>
        </div>
      </div>

      <style>{`
        .admin-login-submit:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -8px rgba(255, 107, 0, 0.6);
        }
        .admin-login-submit:not(:disabled):active {
          transform: translateY(0);
        }
        .back-to-site:hover { color: #FF6B00 !important; }
      `}</style>
    </div>
  );
};

export default AdminLogin;
