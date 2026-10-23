import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, CheckCircle, Activity, Download,
  Lock, Eye, Clock, FileWarning, RefreshCw, ArrowLeft, KeyRound, Mail,
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const severityColors = {
  high: { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', color: '#EF4444' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', color: '#F59E0B' },
  low: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', color: '#3B82F6' },
};

const SecurityAdmin = () => {
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [mfaData, setMfaData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSetupPwd, setMfaSetupPwd] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [emailCurrentPwd, setEmailCurrentPwd] = useState('');
  const [emailNew, setEmailNew] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [backupList, setBackupList] = useState([]);
  const [backupRunning, setBackupRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, la, me] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/security/scan`, { headers }).catch(() => null),
        // Both superadmin-only — a lower staff role gets 403 here, which must
        // not block the rest of the page (MFA, email, password) from loading.
        axios.get(`${BACKEND_URL}/api/admin/audit-log?limit=50`, { headers }).catch(() => null),
        axios.get(`${BACKEND_URL}/api/admin/login-attempts?limit=50`, { headers }).catch(() => null),
        axios.get(`${BACKEND_URL}/api/admin/verify`, { headers }),
      ]);
      if (s) setScan(s.data);
      setAuditLog(a?.data.entries || []);
      setLoginAttempts(la?.data.attempts || []);
      setMfaEnabled(me.data.mfa_enabled || false);
      setCurrentEmail(me.data.email || '');
      try {
        const bl = await axios.get(`${BACKEND_URL}/api/admin/backup/list`, { headers });
        setBackupList(bl.data.backups || []);
      } catch { /* superadmin-only, ignore */ }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleBackup = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/backup/export`, {}, { headers });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zebick-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Backup heruntergeladen.');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Backup fehlgeschlagen');
    }
  };

  const runScheduledBackup = async () => {
    setBackupRunning(true);
    setMessage('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/backup/run-now`, {}, { headers, timeout: 60000 });
      const d = res.data;
      if (d.status === 'success') {
        setMessage(`Backup erstellt: ${d.local_path} (${(d.size_bytes / 1024).toFixed(1)} KB)${d.remote_key ? ` → R2: ${d.remote_key}` : ' (R2 nicht konfiguriert)'}`);
      } else {
        setMessage(`Backup fehlgeschlagen: ${d.error}`);
      }
      const bl = await axios.get(`${BACKEND_URL}/api/admin/backup/list`, { headers });
      setBackupList(bl.data.backups || []);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Automatisches Backup fehlgeschlagen');
    } finally {
      setBackupRunning(false);
    }
  };

  const emailBackupNow = async () => {
    setBackupRunning(true);
    setMessage('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/backup/email-now`, {}, { headers, timeout: 90000 });
      const d = res.data;
      if (d.status === 'success' && d.email_sent) {
        setMessage(`✉️ Backup per E-Mail versendet an admin@zebick.com (${(d.size_bytes / 1024).toFixed(1)} KB). Prüfe deinen Posteingang!`);
      } else if (d.status === 'success') {
        setMessage(`Backup erstellt, aber E-Mail-Versand fehlgeschlagen: ${d.email_error || 'SMTP nicht konfiguriert'}`);
      } else {
        setMessage(`Backup fehlgeschlagen: ${d.error}`);
      }
      const bl = await axios.get(`${BACKEND_URL}/api/admin/backup/list`, { headers });
      setBackupList(bl.data.backups || []);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'E-Mail-Backup fehlgeschlagen');
    } finally {
      setBackupRunning(false);
    }
  };

  const startMfaSetup = async () => {
    if (!mfaSetupPwd) { setMessage('Bitte aktuelles Passwort eingeben.'); return; }
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/mfa/setup`, { current_password: mfaSetupPwd }, { headers });
      setMfaData(res.data);
      setMfaSetupPwd('');
      setMessage('Scannen Sie den QR-Code und bestätigen Sie mit einem Code.');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'MFA Setup fehlgeschlagen');
    }
  };

  const confirmMfa = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/mfa/enable`, { code: mfaCode }, { headers });
      setMessage('2FA aktiviert!');
      setMfaData(null);
      setMfaCode('');
      setMfaEnabled(true);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Code ungültig');
    }
  };

  const disableMfa = async () => {
    if (!mfaCode) { setMessage('Bitte aktuellen 2FA-Code eingeben.'); return; }
    try {
      await axios.post(`${BACKEND_URL}/api/admin/mfa/disable`, { code: mfaCode }, { headers });
      setMessage('2FA deaktiviert.');
      setMfaEnabled(false);
      setMfaCode('');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Deaktivierung fehlgeschlagen');
    }
  };

  const changePassword = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/change-password`,
        { current_password: pwdCurrent, new_password: pwdNew }, { headers });
      setMessage('Passwort erfolgreich geändert.');
      setPwdCurrent(''); setPwdNew('');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Passwortänderung fehlgeschlagen');
    }
  };

  const changeEmail = async () => {
    if (!emailNew || !emailCurrentPwd) {
      setMessage('Bitte aktuelles Passwort und neue E-Mail eingeben.');
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/change-email`,
        { current_password: emailCurrentPwd, new_email: emailNew }, { headers });
      // Neues Token speichern, damit die Session nicht bricht
      if (res.data.access_token) {
        localStorage.setItem('admin_token', res.data.access_token);
        localStorage.setItem('admin_email', res.data.new_email);
      }
      setCurrentEmail(res.data.new_email);
      setMessage(`E-Mail erfolgreich auf ${res.data.new_email} geändert.`);
      setEmailCurrentPwd(''); setEmailNew('');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'E-Mail-Änderung fehlgeschlagen');
    }
  };

  const card = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <button
              onClick={() => navigate('/zb-panel-8x2k')}
              data-testid="security-back-btn"
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Zurück zum Dashboard
            </button>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={32} color="#FF6B00" />
              Sicherheitszentrale
            </h1>
            <p style={{ color: '#888', marginTop: '8px' }}>Übersicht, Audit, 2FA & Backups.</p>
          </div>
          <button
            onClick={loadAll}
            data-testid="security-refresh-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '10px', color: '#FF6B00', cursor: 'pointer' }}>
            <RefreshCw size={16} /> Neu laden
          </button>
        </div>

        {message && (
          <div data-testid="security-message" style={{ ...card, background: 'rgba(255, 107, 0, 0.08)', borderColor: '#FF6B00', padding: '16px' }}>
            {message}
          </div>
        )}

        {loading && <div style={{ color: '#888', padding: '40px', textAlign: 'center' }}>Lädt...</div>}

        {/* Security Scan */}
        {scan && (
          <div style={card} data-testid="security-scan-card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
              <FileWarning size={22} color="#F59E0B" /> Security Scan
            </h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', background: scan.total_findings === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', fontWeight: 700 }}>
                {scan.total_findings === 0 ? <CheckCircle size={18} style={{ display: 'inline', marginRight: 8 }} /> : <AlertTriangle size={18} style={{ display: 'inline', marginRight: 8 }} />}
                {scan.total_findings} Befund(e)
              </div>
              <div style={{ padding: '12px 18px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>
                Status: <strong style={{ color: scan.status === 'healthy' ? '#10B981' : '#F59E0B' }}>{scan.status}</strong>
              </div>
            </div>

            {scan.findings?.map((f, i) => {
              const c = severityColors[f.severity] || severityColors.low;
              return (
                <div key={i} style={{
                  padding: '14px 18px', marginBottom: '10px',
                  background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px',
                }}>
                  <strong style={{ color: c.color, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>
                    {f.severity} · {f.area}
                  </strong>
                  <div style={{ marginTop: '6px' }}>{f.issue}</div>
                </div>
              );
            })}

            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', fontSize: '14px' }}>
              <strong style={{ color: '#10B981' }}>Aktive Schutzmaßnahmen:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginTop: '12px' }}>
                {Object.entries(scan.checks || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                    <CheckCircle size={14} color="#10B981" />
                    <span>{k}: <strong style={{ color: '#fff' }}>{String(v)}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* E-Mail ändern */}
        <div style={card} data-testid="security-email-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
            <Mail size={22} color="#F59E0B" /> Admin E-Mail ändern
          </h2>
          <div style={{ marginBottom: '12px', color: '#aaa', fontSize: '14px' }}>
            Aktuell: <strong style={{ color: '#fff' }} data-testid="current-email-display">{currentEmail || '–'}</strong>
          </div>
          <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
            <input type="password" placeholder="Aktuelles Passwort (zur Bestätigung)"
              value={emailCurrentPwd} onChange={(e) => setEmailCurrentPwd(e.target.value)}
              data-testid="email-current-pwd-input"
              style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
            <input type="email" placeholder="Neue E-Mail (z.B. admin@zebick.com)"
              value={emailNew} onChange={(e) => setEmailNew(e.target.value)}
              data-testid="email-new-input"
              style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
            <button onClick={changeEmail} data-testid="email-submit-btn"
              style={{ padding: '12px', background: '#F59E0B', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
              E-Mail ändern
            </button>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Hinweis: Dein JWT-Token wird automatisch erneuert, du bleibst eingeloggt. 2FA-Setup bleibt aktiv (Google Authenticator-Label wird nach erneutem Scan aktualisiert).
            </div>
          </div>
        </div>

        {/* Passwort ändern */}
        <div style={card} data-testid="security-password-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
            <Lock size={22} color="#3B82F6" /> Passwort ändern
          </h2>
          <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
            <input type="password" placeholder="Aktuelles Passwort"
              value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)}
              data-testid="pwd-current-input"
              style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
            <input type="password" placeholder="Neues Passwort (min. 12 Zeichen)"
              value={pwdNew} onChange={(e) => setPwdNew(e.target.value)}
              data-testid="pwd-new-input"
              style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
            <button onClick={changePassword} data-testid="pwd-submit-btn"
              style={{ padding: '12px', background: '#FF6B00', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
              Passwort ändern
            </button>
          </div>
        </div>

        {/* 2FA */}
        <div style={card} data-testid="security-mfa-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
            <KeyRound size={22} color="#10B981" /> Zwei-Faktor-Authentifizierung
          </h2>
          <div style={{ marginBottom: '16px' }}>
            Status: <strong style={{ color: mfaEnabled ? '#10B981' : '#EF4444' }}>
              {mfaEnabled ? 'Aktiviert' : 'Deaktiviert'}
            </strong>
          </div>
          {!mfaEnabled && !mfaData && (
            <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
              <input type="password" placeholder="Aktuelles Passwort zur Bestätigung"
                value={mfaSetupPwd} onChange={(e) => setMfaSetupPwd(e.target.value)}
                data-testid="mfa-setup-pwd-input"
                style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
              <button onClick={startMfaSetup} data-testid="mfa-setup-btn"
                style={{ padding: '12px 20px', background: '#10B981', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                2FA einrichten
              </button>
            </div>
          )}
          {mfaData && (
            <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
              <img src={`data:image/png;base64,${mfaData.qr_code_png_base64}`} alt="QR Code"
                style={{ width: '220px', background: '#fff', padding: '10px', borderRadius: '10px' }} />
              <div style={{ fontSize: '13px', color: '#888' }}>
                Manuell: <code style={{ background: '#222', padding: '4px 8px', borderRadius: '4px' }}>{mfaData.secret}</code>
              </div>
              <input type="text" placeholder="6-stelliger Code"
                value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                data-testid="mfa-code-input"
                style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
              <button onClick={confirmMfa} data-testid="mfa-confirm-btn"
                style={{ padding: '12px', background: '#10B981', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                Bestätigen
              </button>
            </div>
          )}
          {mfaEnabled && (
            <div style={{ display: 'grid', gap: '12px', maxWidth: '500px', marginTop: '16px' }}>
              <input type="text" placeholder="Aktueller 2FA-Code zur Deaktivierung"
                value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                data-testid="mfa-disable-code-input"
                style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
              <button onClick={disableMfa} data-testid="mfa-disable-btn"
                style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '10px', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}>
                2FA deaktivieren
              </button>
            </div>
          )}
        </div>

        {/* Backup */}
        <div style={card} data-testid="security-backup-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
            <Download size={22} color="#A855F7" /> Backup
          </h2>
          <p style={{ color: '#888', marginBottom: '16px' }}>
            Automatisches tägliches Backup um 03:00 UTC (lokal) + wöchentlich sonntags 03:15 UTC per E-Mail an admin@zebick.com.
            Passwort-Hashes und 2FA-Secrets werden ausgeschlossen.
            Retention: 7 tägliche + 4 wöchentliche (Sonntag) + 12 monatliche (1. des Monats).
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button onClick={handleBackup} data-testid="backup-export-btn"
              style={{ padding: '12px 20px', background: '#A855F7', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Sofort downloaden (Browser)
            </button>
            <button onClick={runScheduledBackup} disabled={backupRunning} data-testid="backup-run-now-btn"
              style={{ padding: '12px 20px', background: backupRunning ? '#555' : '#10B981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: backupRunning ? 'wait' : 'pointer' }}>
              {backupRunning ? 'Läuft...' : 'Jetzt auf Server sichern'}
            </button>
            <button onClick={emailBackupNow} disabled={backupRunning} data-testid="backup-email-now-btn"
              style={{ padding: '12px 20px', background: backupRunning ? '#555' : '#F59E0B', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 700, cursor: backupRunning ? 'wait' : 'pointer' }}>
              ✉️ Jetzt per E-Mail senden
            </button>
          </div>

          {backupList.length > 0 && (
            <div data-testid="backup-list">
              <h3 style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>Server-Backups ({backupList.length})</h3>
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {backupList.map((b, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', marginBottom: '6px', borderRadius: '8px',
                    background: 'rgba(168, 85, 247, 0.08)', fontSize: '13px',
                    display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
                  }}>
                    <span style={{ color: '#A855F7', fontWeight: 700 }}>{b.filename}</span>
                    <span style={{ color: '#aaa' }}>{b.size_kb} KB</span>
                    <span style={{ color: '#666', marginLeft: 'auto', fontSize: '11px' }}>{b.modified_at}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Login Attempts */}
        <div style={card} data-testid="security-logins-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
            <Eye size={22} color="#EF4444" /> Letzte Login-Versuche ({loginAttempts.length})
          </h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loginAttempts.map((a, i) => (
              <div key={i} style={{
                padding: '10px 14px', marginBottom: '6px', borderRadius: '8px',
                background: a.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                fontSize: '13px', display: 'flex', gap: '12px', flexWrap: 'wrap',
              }}>
                <span style={{ color: a.success ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                  {a.success ? 'OK' : 'FEHL'}
                </span>
                <span style={{ color: '#fff' }}>{a.email}</span>
                <span style={{ color: '#888' }}>IP: {a.ip}</span>
                <span style={{ color: '#666', marginLeft: 'auto' }}>{a.timestamp}</span>
              </div>
            ))}
            {loginAttempts.length === 0 && <div style={{ color: '#666', padding: '16px' }}>Keine Einträge</div>}
          </div>
        </div>

        {/* Audit Log */}
        <div style={card} data-testid="security-audit-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '16px' }}>
            <Activity size={22} color="#FF6B00" /> Audit Log ({auditLog.length})
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {auditLog.map((e, i) => (
              <div key={i} style={{
                padding: '10px 14px', marginBottom: '6px', borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)', fontSize: '13px',
                display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
              }}>
                <Clock size={14} color="#888" />
                <span style={{ color: '#FF6B00', fontWeight: 700 }}>{e.action}</span>
                <span style={{ color: '#fff' }}>{e.actor || '–'}</span>
                <span style={{ color: '#888' }}>{e.ip || ''}</span>
                <span style={{ color: '#666', marginLeft: 'auto', fontSize: '11px' }}>{e.timestamp}</span>
              </div>
            ))}
            {auditLog.length === 0 && <div style={{ color: '#666', padding: '16px' }}>Keine Einträge</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAdmin;
