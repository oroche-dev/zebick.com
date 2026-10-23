import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const authHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const input = {
  width: '100%', padding: '11px 14px',
  background: '#0f0f0f',
  border: '1px solid #2a2a2a', borderRadius: 6,
  color: '#fff', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
};
export const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 18px', background: '#FF6B00', color: '#000',
  border: '1px solid #FF6B00', borderRadius: 6, fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
};
export const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 16px', background: '#161616', color: '#e5e5e5',
  border: '1px solid #2a2a2a', borderRadius: 6,
  fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
};
export const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 12px', background: 'transparent', color: '#9a9a9a',
  border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
};
export const btnDanger = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 12px', background: '#1c1010', color: '#d85a5a',
  border: '1px solid #3a1f1f', borderRadius: 6,
  fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
};

export const AdminShell = ({ title, subtitle, actions, children }) => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => navigate('/zb-panel-8x2k')} style={{ ...btnGhost, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
            {subtitle && <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

export const Section = ({ title, children }) => (
  <div style={{
    background: '#111111', border: '1px solid #222222',
    borderRadius: 8, padding: '22px',
  }}>
    <h2 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a9a9a' }}>{title}</h2>
    {children}
  </div>
);

export const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{hint}</div>}
  </div>
);

export const ImagePicker = ({ value, onChange }) => {
  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { alert('Datei zu groß (max 25 MB)'); return; }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${BACKEND_URL}/api/admin/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || res.statusText);
      const data = await res.json();
      onChange(data.url);
    } catch (e) {
      alert('Upload fehlgeschlagen: ' + e.message);
    }
  };
  return (
    <>
      <div style={{ aspectRatio: '16/10', background: '#111', borderRadius: 'var(--radius-md)', marginBottom: '10px', overflow: 'hidden', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={40} color="var(--text-muted)" />}
      </div>
      <input style={input} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Bild-URL…" />
      <label style={{ ...btnSecondary, display: 'inline-flex', cursor: 'pointer', marginTop: '10px' }}>
        <Upload size={14} /> Datei hochladen
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      </label>
    </>
  );
};

export const Icons = { Save, ArrowLeft, Plus, Trash2, Loader2 };
