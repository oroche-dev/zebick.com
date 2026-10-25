import React, { useState } from 'react';
import {
  FileText, Lock, Cookie, Eye, CheckCircle, User, Database, AlertCircle,
  Mail, Phone, Send,
} from 'lucide-react';
import { baseCard, inputStyle, labelStyle, submitLead } from './toolStyles';

const QUESTIONS = [
  { id: 'imprint',   q: 'Hat Ihre Website ein vollständiges Impressum mit allen Pflichtangaben?', icon: FileText },
  { id: 'privacy',   q: 'Verfügt Ihre Website über eine aktuelle, vollständige Datenschutz­erklärung?', icon: Lock },
  { id: 'cookie',    q: 'Nutzt Ihre Website ein Cookie-Consent-Banner (Opt-In) gemäß TTDSG?', icon: Cookie },
  { id: 'avv',       q: 'Haben Sie AV-Verträge (AVV) mit allen externen Dienstleistern (Hosting, Analytics, …)?', icon: FileText },
  { id: 'ssl',       q: 'Ist Ihre Website durchgehend über HTTPS / SSL erreichbar?', icon: Lock },
  { id: 'analytics', q: 'Werden Tracking-Tools (z.B. GA4, Meta Pixel) nur nach Einwilligung geladen?', icon: Eye },
  { id: 'forms',     q: 'Haben Ihre Kontaktformulare eine Datenschutz-Checkbox & Double-Opt-In bei Newslettern?', icon: CheckCircle },
  { id: 'dpo',       q: 'Haben Sie einen Datenschutzbeauftragten benannt (falls erforderlich)?', icon: User },
  { id: 'register',  q: 'Führen Sie ein Verzeichnis der Verarbeitungstätigkeiten (Art. 30 DSGVO)?', icon: Database },
  { id: 'breach',    q: 'Existiert ein dokumentierter Prozess für Datenschutz-Vorfälle (Meldepflicht)?', icon: AlertCircle },
];

const DsgvoCheck = () => {
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const yesCount = Object.values(answers).filter((v) => v === 'yes').length;
  const score = Math.round((yesCount / QUESTIONS.length) * 100);
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  return (
    <div data-testid="tool-dsgvo-check" style={{ ...baseCard, padding: '32px' }}>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Beantworten Sie 10 kurze Fragen – Sie erhalten sofort einen Score & eine Empfehlung.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {QUESTIONS.map((q) => (
          <div key={q.id} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
            <q.icon size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            {/* flex-basis (not the bare "1") gives this a real minimum before
                the row wraps, so on narrow phones the fixed-width button
                group below drops to its own line instead of squeezing this
                text down to single-character-wide lines. */}
            <span style={{ flex: '1 1 200px', fontSize: '14px', color: 'var(--text-secondary)' }}>{q.q}</span>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {['yes', 'no', 'unknown'].map((v) => (
                <button
                  key={v}
                  onClick={() => setAnswers({ ...answers, [q.id]: v })}
                  data-testid={`dsgvo-${q.id}-${v}`}
                  style={{
                    padding: '6px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '999px', cursor: 'pointer',
                    background: answers[q.id] === v ? (v === 'yes' ? 'rgba(16,185,129,0.25)' : v === 'no' ? 'rgba(239,68,68,0.25)' : 'rgba(255,107,0,0.25)') : 'rgba(255,255,255,0.03)',
                    border: answers[q.id] === v ? `1px solid ${v === 'yes' ? '#10B981' : v === 'no' ? '#EF4444' : 'var(--accent-primary)'}` : '1px solid var(--border-subtle)',
                    color: answers[q.id] === v ? (v === 'yes' ? '#10B981' : v === 'no' ? '#EF4444' : 'var(--accent-primary)') : 'var(--text-muted)',
                  }}
                >
                  {v === 'yes' ? 'Ja' : v === 'no' ? 'Nein' : 'Unklar'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div data-testid="dsgvo-result" style={{
          padding: '24px',
          background: score >= 80 ? 'rgba(16,185,129,0.08)' : score >= 50 ? 'rgba(255,107,0,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${score >= 80 ? 'rgba(16,185,129,0.3)' : score >= 50 ? 'rgba(255,107,0,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 'var(--radius-lg)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px',
        }}>
          <div style={{ fontSize: '52px', fontWeight: 900, color: score >= 80 ? '#10B981' : score >= 50 ? 'var(--accent-primary)' : '#EF4444' }}>{score}%</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
              {score >= 80 ? 'Sehr gut!' : score >= 50 ? 'Handlungsbedarf' : 'Hohes Risiko'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {score >= 80
                ? 'Ihre Website wirkt überwiegend DSGVO-konform. Wir prüfen gerne im Detail.'
                : score >= 50
                  ? 'Es gibt Lücken, die zu Abmahnungen oder Bußgeldern führen können. Lassen Sie uns das gemeinsam angehen.'
                  : 'Sie tragen ein erhebliches Risiko. Wir empfehlen eine sofortige Prüfung.'}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitLead({
            tool: 'DSGVO-Check',
            payload: { score, answers },
            email,
            phone,
            name: 'DSGVO-Lead',
            message: 'Bitte senden Sie mir den DSGVO-Detailbericht.',
            onSuccess: () => setSubmitted(true),
          });
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}><Mail size={14} /> Detaillierten Bericht erhalten</label>
            <input
              required
              type="email" placeholder="ihre@firma.de" value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="dsgvo-email" style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={!email || !allAnswered || submitted}
            data-testid="dsgvo-send"
            className="btn-primary"
            style={{ padding: '14px 24px', opacity: (!email || !allAnswered || submitted) ? 0.5 : 1 }}
          >
            {submitted ? <><CheckCircle size={16} /> Gesendet</> : <>Bericht senden <Send size={16} /></>}
          </button>
        </div>
        <div>
          <label style={labelStyle}><Phone size={14} /> Telefon (optional)</label>
          <input
            type="tel" placeholder="+49 …" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="dsgvo-phone" style={inputStyle}
          />
        </div>
      </form>
    </div>
  );
};

export default DsgvoCheck;
