import React from 'react';
import { FileText, Scale, Users, CreditCard, Copyright, ShieldAlert, Gavel, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import Seo from '../components/common/Seo';

const AGBPage = () => {
  const sections = [
    {
      icon: Scale,
      title: '1. Geltungsbereich',
      content: `
        <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Zebick (nachfolgend "Zebick" oder "wir") und ihren Kunden (nachfolgend "Kunde") über die Erbringung von Dienstleistungen in den Bereichen Webentwicklung, App-Entwicklung, UI/UX-Design, Chatbot-Entwicklung, Server-Infrastruktur, Marketing/SEO, Grafikdesign, Cyber Security, Gaming-Entwicklung und Automatisierung/KI.</p>
        <p>Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, Zebick stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
      `,
    },
    {
      icon: FileText,
      title: '2. Vertragsschluss und Leistungsumfang',
      content: `
        <p>Ein Vertrag kommt durch die schriftliche Bestätigung eines Angebots durch den Kunden (z.B. per E-Mail oder Unterschrift) zustande. Der genaue Leistungsumfang, Liefertermine und Preise werden im jeweiligen Angebot bzw. Projektvertrag individuell festgehalten.</p>
        <p>Änderungen oder Erweiterungen des vereinbarten Leistungsumfangs bedürfen der schriftlichen Vereinbarung und können zu einer Anpassung von Preis und Zeitplan führen.</p>
      `,
    },
    {
      icon: Users,
      title: '3. Mitwirkungspflichten des Kunden',
      content: `
        <p>Der Kunde stellt die für die Leistungserbringung erforderlichen Informationen, Inhalte, Zugänge und Feedback rechtzeitig zur Verfügung. Verzögerungen, die auf fehlende Mitwirkung des Kunden zurückzuführen sind, verlängern vereinbarte Liefertermine entsprechend.</p>
      `,
    },
    {
      icon: CreditCard,
      title: '4. Preise und Zahlungsbedingungen',
      content: `
        <p>Alle Preise verstehen sich, sofern nicht anders angegeben, in Schweizer Franken (CHF) exklusive gesetzlicher Mehrwertsteuer. Rechnungen sind, sofern nicht anders vereinbart, innert 30 Tagen nach Rechnungsdatum ohne Abzug zur Zahlung fällig.</p>
        <p>Bei Zahlungsverzug ist Zebick berechtigt, Verzugszinsen gemäss den gesetzlichen Bestimmungen zu berechnen sowie die Weiterarbeit am Projekt bis zum Ausgleich offener Forderungen einzustellen.</p>
      `,
    },
    {
      icon: Copyright,
      title: '5. Nutzungsrechte und Urheberrecht',
      content: `
        <p>Nach vollständiger Bezahlung erhält der Kunde die vertraglich vereinbarten Nutzungsrechte an den im Rahmen des Projekts erstellten Werken (z.B. Quellcode, Design, Texte). Bis zur vollständigen Bezahlung verbleiben sämtliche Rechte bei Zebick.</p>
        <p>Zebick behält sich das Recht vor, erstellte Arbeiten zu Referenz- und Marketingzwecken (z.B. im Portfolio) zu nennen und zu zeigen, sofern der Kunde dem nicht ausdrücklich schriftlich widerspricht.</p>
        <p>Für vom Kunden bereitgestellte Inhalte (Texte, Bilder, Logos etc.) garantiert der Kunde, dass er über die erforderlichen Rechte zur Nutzung verfügt und stellt Zebick von Ansprüchen Dritter diesbezüglich frei.</p>
      `,
    },
    {
      icon: ShieldAlert,
      title: '6. Gewährleistung und Haftung',
      content: `
        <p>Zebick erbringt die vereinbarten Leistungen mit der im Berufsstand üblichen Sorgfalt. Offensichtliche Mängel sind unverzüglich, spätestens innert 10 Tagen nach Abnahme, schriftlich zu rügen.</p>
        <p>Die Haftung von Zebick für leichte Fahrlässigkeit wird, soweit gesetzlich zulässig, ausgeschlossen. Für Schäden aus grober Fahrlässigkeit oder Vorsatz haftet Zebick im gesetzlich vorgesehenen Umfang. Die Haftung für indirekte Schäden, Folgeschäden und entgangenen Gewinn ist ausgeschlossen, soweit gesetzlich zulässig.</p>
        <p>Zebick übernimmt keine Haftung für Ausfälle oder Störungen, die auf Drittanbieter (Hosting, APIs, externe Dienste) zurückzuführen sind.</p>
      `,
    },
    {
      icon: Gavel,
      title: '7. Kündigung und Vertragsbeendigung',
      content: `
        <p>Projektverträge können von beiden Parteien aus wichtigem Grund fristlos gekündigt werden. Bereits erbrachte Leistungen sind in jedem Fall zu vergüten. Bei laufenden Verträgen (z.B. Wartung, Hosting, Retainer) gilt, sofern nicht anders vereinbart, eine Kündigungsfrist von 30 Tagen auf Ende eines Kalendermonats.</p>
      `,
    },
    {
      icon: Scale,
      title: '8. Schlussbestimmungen',
      content: `
        <p>Es gilt ausschliesslich Schweizer Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand für sämtliche Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist, soweit gesetzlich zulässig, der Sitz von Zebick.</p>
        <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.</p>
      `,
    },
  ];

  return (
    <>
      <Seo title="AGB" description="Allgemeine Geschäftsbedingungen von Zebick: Vertragsbedingungen für Webentwicklung, App-Entwicklung, Cyber Security und weitere Dienstleistungen." path="/agb" />
      <Header />

      {/* Hero Section */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '60px',
        background: 'var(--bg-primary)',
      }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              marginBottom: '24px',
            }}>
              <Scale size={16} />
              Rechtliches
            </span>

            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              marginBottom: '16px',
            }}>
              Allgemeine Geschäftsbedingungen
            </h1>

            <p style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
            }}>
              Gültig für alle Projekte und Dienstleistungen von Zebick
            </p>
          </div>
        </div>
      </section>

      {/* Draft notice */}
      <section style={{ background: 'var(--bg-primary)', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{
            maxWidth: '900px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '20px 24px',
            background: 'rgba(255, 107, 0, 0.08)',
            border: '1px solid rgba(255, 107, 0, 0.25)',
            borderRadius: '14px',
          }}>
            <AlertTriangle size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Hinweis:</strong> Dies ist ein generischer AGB-Entwurf auf Basis branchenüblicher Klauseln für Digitalagenturen. Er ersetzt keine individuelle Rechtsberatung. Bitte vor Veröffentlichung von einer Anwältin/einem Anwalt prüfen und an die konkreten Geschäftsverhältnisse von Zebick anpassen lassen.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{
        padding: '40px 0 100px',
        background: 'var(--bg-secondary)',
      }}>
        <div className="container">
          <div style={{
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}>
            {sections.map((section, idx) => (
              <div
                key={idx}
                style={{
                  padding: '40px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '20px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(255, 107, 0, 0.15)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <section.icon size={28} color="var(--accent-primary)" />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{section.title}</h2>
                </div>

                <div
                  style={{
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    fontSize: '15px',
                  }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                  className="legal-content"
                />
              </div>
            ))}

            {/* Stand */}
            <p style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px',
              marginTop: '20px',
            }}>
              Stand: Januar 2026
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .legal-content h4 {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .legal-content h4:first-child {
          margin-top: 0;
        }
        .legal-content p {
          margin-bottom: 12px;
        }
        .legal-content ul {
          margin: 12px 0;
          padding-left: 24px;
        }
        .legal-content li {
          margin-bottom: 8px;
        }
      `}</style>

      <Footer />
      <Chatbot />
    </>
  );
};

export default AGBPage;
