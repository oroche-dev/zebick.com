import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Mail, Phone, Send, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { baseCard, inputStyle, labelStyle, submitLead } from './toolStyles';

/**
 * DynamicAdvisor — renders an advisor flow purely from backend config.
 * config: { title, description, questions: [{key, q, options:[{v,l,icon}]}], recommendations: {key: text, _default: text} }
 */
const Icon = ({ name, ...rest }) => {
  const Cmp = (name && Icons[name]) || Icons.Sparkles;
  return <Cmp {...rest} />;
};

const DynamicAdvisor = ({ config, compact = false }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const questions = Array.isArray(config?.questions) ? config.questions : [];
  const totalSteps = questions.length;
  const showResult = step >= totalSteps;

  const setVal = (k, v) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
    setStep(step + 1);
  };

  const goBack = () => setStep(Math.max(0, step - 1));
  const reset = () => { setStep(0); setAnswers({}); setEmail(''); setSent(false); };

  // Pick recommendation by FIRST answer key value (most decisive question)
  const firstKey = questions[0]?.key;
  const firstVal = answers[firstKey];
  const recommendation = (config?.recommendations?.[firstVal])
    || config?.recommendations?._default
    || 'Maßgeschneiderte Lösung – wir beraten Sie individuell.';

  const cardStyle = compact
    ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,107,0,0.18)', borderRadius: 16, padding: 24 }
    : { ...baseCard, padding: 32 };

  return (
    <div data-testid={`advisor-${config?.slug}`} style={cardStyle}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
        {Array.from({ length: totalSteps + 1 }).map((_, s) => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 999,
            background: s <= step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      {!showResult ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Frage {step + 1} / {totalSteps}
            </div>
            {step > 0 && (
              <button
                onClick={goBack}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <ArrowLeft size={12} /> Zurück
              </button>
            )}
          </div>
          <h3 style={{ fontSize: compact ? 18 : 22, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
            {questions[step]?.q}
          </h3>
          <div data-keep-grid className="advisor-options-grid" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${compact ? '180px' : '220px'}, 1fr))`,
            gap: 10,
          }}>
            {(questions[step]?.options || []).map((o) => (
              <button
                key={o.v}
                onClick={() => setVal(questions[step].key, o.v)}
                data-testid={`advisor-opt-${questions[step].key}-${o.v}`}
                className="advisor-option"
                style={{
                  padding: compact ? 14 : 18,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'inherit',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.15s ease',
                }}
              >
                <Icon name={o.icon} size={compact ? 18 : 22} color="var(--accent-primary)" />
                <span style={{ fontSize: compact ? 13 : 14, fontWeight: 600, lineHeight: 1.4 }}>{o.l}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div data-testid="advisor-result">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255,107,0,0.18), rgba(255,107,0,0.05))',
              border: '1px solid rgba(255,107,0,0.35)',
              display: 'grid', placeItems: 'center',
            }}>
              <Sparkles size={20} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Unsere Empfehlung für Sie
            </h3>
          </div>

          <div style={{
            padding: '24px 26px',
            background: 'linear-gradient(135deg, rgba(255,107,0,0.10) 0%, rgba(255,107,0,0.02) 100%)',
            border: '1px solid rgba(255,107,0,0.28)',
            borderRadius: 14,
            marginBottom: 22,
          }}>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {recommendation}
            </p>
          </div>

          {/* Summary of choices */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {questions.map((q) => {
              const a = answers[q.key];
              const opt = q.options?.find((o) => o.v === a);
              if (!opt) return null;
              return (
                <span key={q.key} style={{
                  fontSize: 11, padding: '4px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 999, color: 'var(--text-muted)',
                }}>
                  {q.q.replace('?', '')}: <strong style={{ color: 'var(--text-primary)' }}>{opt.l}</strong>
                </span>
              );
            })}
          </div>

          {sent ? (
            <div style={{
              padding: 18,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 10,
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ color: '#22d39a', fontSize: 14, fontWeight: 600 }}>
                Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitLead({
                  tool: config?.title || 'Berater',
                  payload: answers,
                  email,
                  phone,
                  name: `${config?.title || 'Berater'}-Lead`,
                  message: `Empfehlung: ${recommendation}`,
                  onSuccess: () => setSent(true),
                });
              }}
            >
              <label style={labelStyle}><Mail size={14} /> Detail-Konzept anfordern</label>
              <input
                required
                type="email"
                placeholder="ihre@firma.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="advisor-email"
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <label style={labelStyle}><Phone size={14} /> Telefon (optional)</label>
              <input
                type="tel"
                placeholder="+49 …"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="advisor-phone"
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={!email}
                  data-testid="advisor-submit"
                  className="btn-primary"
                  style={{ flex: 1, minWidth: 200, justifyContent: 'center', opacity: !email ? 0.5 : 1 }}
                >
                  Detail-Konzept anfordern <Send size={18} />
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    padding: '14px 20px', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >
                  Neu starten
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <style>{`
        .advisor-option:hover {
          border-color: rgba(255, 107, 0, 0.55) !important;
          background: rgba(255, 107, 0, 0.06) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 480px) {
          .advisor-options-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .advisor-option { padding: 12px !important; gap: 6px !important; }
          .advisor-option span { font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
};

export default DynamicAdvisor;
