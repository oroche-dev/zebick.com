import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const baseCard = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
};

export const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '15px',
  outline: 'none',
  transition: 'all 0.3s ease',
};

export const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: 'var(--text-muted)',
  marginBottom: '8px',
  fontWeight: 600,
};

// Submit-Hilfsfunktion (Lead → Backend) mit verbessertem Error-Handling
export const submitLead = async ({ tool, payload, email, name, phone, budget, message, onSuccess }) => {
  try {
    await axios.post(`${API}/contact/submit`, {
      name: name || 'Tool-Lead',
      email,
      phone: phone || '',
      service: tool,
      budget: budget || undefined,
      message: `[${tool}]\n${message}\n\nResultat:\n${JSON.stringify(payload, null, 2)}`,
    });
    toast.success('Ergebnis gesendet! Wir melden uns innerhalb von 24 h.');
    onSuccess?.();
  } catch (e) {
    // Backend-Detail anzeigen, falls vorhanden (z.B. Validierungsfehler)
    const detail = e?.response?.data?.detail;
    const status = e?.response?.status;
    let msg = 'Fehler beim Senden. Bitte erneut versuchen.';
    if (typeof detail === 'string' && detail.trim()) {
      msg = detail;
    } else if (Array.isArray(detail) && detail.length > 0) {
      // FastAPI Pydantic-Validation-Errors
      msg = detail.map((d) => d.msg || JSON.stringify(d)).join(' · ');
    } else if (status === 429) {
      msg = 'Zu viele Anfragen – bitte einen Moment warten.';
    } else if (status >= 500) {
      msg = 'Server-Fehler. Bitte später erneut versuchen.';
    } else if (e?.message === 'Network Error') {
      msg = 'Verbindungsfehler – Internet prüfen.';
    }
    toast.error(msg);
  }
};
