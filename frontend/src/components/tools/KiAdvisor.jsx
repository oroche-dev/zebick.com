import React, { useState } from 'react';
import {
  Bot, Target, Workflow, BrainCircuit, TrendingUp, Database, Globe,
  Sparkles, DollarSign, Mail, Send,
} from 'lucide-react';
import { baseCard, inputStyle, labelStyle, submitLead } from './toolStyles';

const QUESTIONS = [
  { key: 'goal', q: 'Was ist Ihr Hauptziel?', options: [
    { v: 'customer-service', l: 'Kundenservice automatisieren', icon: Bot },
    { v: 'lead-gen',         l: 'Mehr Leads generieren', icon: Target },
    { v: 'internal',         l: 'Interne Prozesse automatisieren', icon: Workflow },
    { v: 'knowledge',        l: 'Wissen schneller verfügbar machen', icon: BrainCircuit },
  ] },
  { key: 'volume', q: 'Wie viele Anfragen / Vorgänge pro Monat?', options: [
    { v: '<500',    l: 'Bis 500', icon: TrendingUp },
    { v: '500-2k',  l: '500 – 2.000', icon: TrendingUp },
    { v: '2k-10k',  l: '2.000 – 10.000', icon: TrendingUp },
    { v: '>10k',    l: 'Mehr als 10.000', icon: TrendingUp },
  ] },
  { key: 'integration', q: 'Welche Systeme sollen integriert werden?', options: [
    { v: 'crm',  l: 'CRM (HubSpot, Salesforce, …)', icon: Database },
    { v: 'shop', l: 'E-Commerce / Shop', icon: Globe },
    { v: 'erp',  l: 'ERP / interne Tools', icon: Workflow },
    { v: 'none', l: 'Standalone-Lösung', icon: Sparkles },
  ] },
  { key: 'budget', q: 'Welches Budget steht zur Verfügung?', options: [
    { v: '<5k',     l: '< 5.000 €', icon: DollarSign },
    { v: '5-15k',   l: '5.000 – 15.000 €', icon: DollarSign },
    { v: '15-50k',  l: '15.000 – 50.000 €', icon: DollarSign },
    { v: '>50k',    l: 'Mehr als 50.000 €', icon: DollarSign },
  ] },
];

const RECOMMENDATIONS = {
  'customer-service': 'KI-Kundenservice-Agent mit RAG-Wissensbasis – beantwortet bis zu 80 % aller Standard­anfragen automatisch.',
  'lead-gen': 'KI-Vertriebsagent + Lead-Automatisierung – qualifiziert Website-Besucher und übergibt heiße Leads ans Sales-Team.',
  'internal': 'Prozess-Automatisierung mit n8n & KI-Agenten – verbindet Ihre Tools und eliminiert Routinearbeit.',
  'knowledge': 'RAG-Wissensbasis – durchsucht Ihre Dokumente und liefert präzise Antworten in Sekunden.',
};

const KiAdvisor = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ goal: '', volume: '', integration: '', budget: '', email: '' });

  const setVal = (k, v) => { setData({ ...data, [k]: v }); setStep(step + 1); };

  return (
    <div data-testid="tool-ki-berater" style={{ ...baseCard, padding: '32px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
        {[0, 1, 2, 3, 4].map((s) => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '999px',
            background: s <= step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      {step < QUESTIONS.length ? (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '10px' }}>
            FRAGE {step + 1} / {QUESTIONS.length}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>{QUESTIONS[step].q}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {QUESTIONS[step].options.map((o) => (
              <button
                key={o.v}
                onClick={() => setVal(QUESTIONS[step].key, o.v)}
                data-testid={`ki-${QUESTIONS[step].key}-${o.v}`}
                style={{
                  padding: '20px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                  textAlign: 'left', cursor: 'pointer', color: 'inherit',
                  display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(255,107,0,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <o.icon size={22} color="var(--accent-primary)" />
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{o.l}</span>
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              data-testid="ki-back"
              style={{
                marginTop: '20px', padding: '10px 18px', background: 'transparent',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px',
              }}
            >
              ← Zurück
            </button>
          )}
        </div>
      ) : (
        <div data-testid="ki-result">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <Sparkles size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '24px', fontWeight: 800 }}>Unsere Empfehlung für Sie</h3>
          </div>
          <div style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,107,0,0.02))',
            border: '1px solid rgba(255,107,0,0.3)',
            borderRadius: 'var(--radius-lg)', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {RECOMMENDATIONS[data.goal] || 'Maßgeschneiderte KI-Lösung basierend auf Ihren Anforderungen.'}
            </p>
          </div>
          <div>
            <label style={labelStyle}><Mail size={14} /> Detail-Konzept anfordern</label>
            <input
              type="email" placeholder="ihre@firma.de" value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              data-testid="ki-email" style={{ ...inputStyle, marginBottom: '12px' }}
            />
            <button
              onClick={() => submitLead({
                tool: 'KI-Projektberater',
                payload: data,
                email: data.email,
                name: 'KI-Beratung-Lead',
                message: `Empfehlung für: ${RECOMMENDATIONS[data.goal] || 'Custom KI-Lösung'}.`,
              })}
              disabled={!data.email}
              data-testid="ki-submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: !data.email ? 0.5 : 1 }}
            >
              Detail-Konzept anfordern <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KiAdvisor;
