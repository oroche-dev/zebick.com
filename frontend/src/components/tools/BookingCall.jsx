import React, { useState } from 'react';
import {
  User, Mail, Phone, Clock, Activity, Calendar, CheckCircle,
} from 'lucide-react';
import { baseCard, inputStyle, labelStyle, submitLead } from './toolStyles';

const SLOTS = ['Vormittags (9 – 12)', 'Nachmittags (12 – 17)', 'Abends (17 – 19)'];

const BookingCall = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: '', preferred: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    submitLead({
      tool: 'Erstgespräch',
      payload: form,
      email: form.email,
      name: form.name,
      message: `Wunschthema: ${form.topic}\nZeitfenster: ${form.preferred}\nTelefon: ${form.phone}`,
      onSuccess: () => setSent(true),
    });
  };

  return (
    <form onSubmit={submit} data-testid="tool-erstgespraech" style={{ ...baseCard, padding: '32px' }}>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        30 Minuten unverbindliche Strategie-Session. Wir hören zu, analysieren und geben Ihnen konkrete nächste Schritte.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}><User size={14} /> Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="book-name" style={inputStyle} placeholder="Max Mustermann" />
        </div>
        <div>
          <label style={labelStyle}><Mail size={14} /> E-Mail *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="book-email" style={inputStyle} placeholder="ihre@firma.de" />
        </div>
        <div>
          <label style={labelStyle}><Phone size={14} /> Telefon</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="book-phone" style={inputStyle} placeholder="+49 …" />
        </div>
        <div>
          <label style={labelStyle}><Clock size={14} /> Wunsch-Zeitfenster</label>
          <select value={form.preferred} onChange={(e) => setForm({ ...form, preferred: e.target.value })} data-testid="book-slot" style={{ ...inputStyle, appearance: 'none' }}>
            <option value="">Bitte wählen…</option>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}><Activity size={14} /> Worum geht es? *</label>
        <textarea
          required rows={4} value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          data-testid="book-topic"
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          placeholder="Erzählen Sie uns kurz von Ihrem Projekt …"
        />
      </div>
      <button type="submit" disabled={sent} data-testid="book-submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: sent ? 0.5 : 1 }}>
        {sent ? <><CheckCircle size={18} /> Termin-Anfrage gesendet!</> : <>Termin anfragen <Calendar size={18} /></>}
      </button>
    </form>
  );
};

export default BookingCall;
