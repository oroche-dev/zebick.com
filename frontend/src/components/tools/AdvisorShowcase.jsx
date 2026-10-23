import React from 'react';
import * as Icons from 'lucide-react';
import DynamicAdvisor from './DynamicAdvisor';
import { baseCard } from './toolStyles';
import { ADVISOR_FACTS } from '../../data/advisorInfo';

const Icon = ({ name, ...rest }) => {
  const Cmp = (name && Icons[name]) || Icons.Sparkles;
  return <Cmp {...rest} />;
};

const iconBox = {
  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
  display: 'grid', placeItems: 'center',
  background: 'linear-gradient(135deg, rgba(255,107,0,0.18), rgba(255,107,0,0.05))',
  border: '1px solid rgba(255,107,0,0.35)',
};

const AdvisorShowcase = ({ tool }) => {
  const questions = Array.isArray(tool.questions) ? tool.questions : [];
  const first = questions[0];
  const recs = (first?.options || []).filter((o) => tool.recommendations?.[o.v]);
  const steps = [
    { title: questions.length ? `${questions.length} kurze Fragen` : 'Kurze Fragen', text: 'Wählen Sie die passenden Antworten – ein Klick pro Frage genügt.' },
    { title: 'Sofort-Empfehlung', text: 'Sie sehen direkt, welche Lösung zu Ihren Angaben passt.' },
    { title: 'Persönliches Konzept', text: 'Auf Wunsch melden wir uns innerhalb von 24 Stunden mit einem Detail-Konzept.' },
  ];

  return (
    <div data-testid="advisor-showcase">
      <div className="adv-grid">
        <div className="adv-tool">
          <DynamicAdvisor config={tool} />
        </div>
      </div>

      <div className="adv-steps" data-testid="advisor-steps">
        {steps.map((s, i) => (
          <div key={s.title} style={{ ...baseCard, padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: 'var(--accent-primary)', color: '#000', fontWeight: 800, fontSize: 15,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>{s.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>

      {recs.length > 0 && (
        <div style={{ marginTop: 48 }} data-testid="advisor-recommendations">
          <h3 style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            Mögliche Empfehlungen
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 20px' }}>
            Je nach Antwort auf die erste Frage („{first.q}“) sieht Ihre Empfehlung so aus:
          </p>
          <div className="adv-recs">
            {recs.map((o) => (
              <div key={o.v} style={{ ...baseCard, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={iconBox}><Icon name={o.icon} size={19} color="var(--accent-primary)" /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, color: 'var(--text-primary)' }}>{o.l}</div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-muted)' }}>
                  {tool.recommendations[o.v]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 22px', marginTop: 40 }}>
        {ADVISOR_FACTS.map((f) => (
          <span key={f.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <Icon name={f.icon} size={16} color="var(--accent-primary)" /> {f.text}
          </span>
        ))}
      </div>

      <style>{`
        .adv-grid { display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; }
        .adv-tool { width: 100%; max-width: 640px; }
        .adv-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 48px; }
        .adv-recs { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        @media (max-width: 900px) {
          .adv-steps { grid-template-columns: minmax(0, 1fr); margin-top: 32px; }
        }
      `}</style>
    </div>
  );
};

export default AdvisorShowcase;
