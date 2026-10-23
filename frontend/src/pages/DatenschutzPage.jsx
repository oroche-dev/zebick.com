import React from 'react';
import { Shield, Database, Cookie, Lock, Eye, Users, Mail, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import Seo from '../components/common/Seo';

const DatenschutzPage = () => {
  const sections = [
    {
      icon: Eye,
      title: '1. Datenschutz auf einen Blick',
      content: `
        <h4>Allgemeine Hinweise</h4>
        <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
        
        <h4>Datenerfassung auf unserer Website</h4>
        <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
        <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>
        
        <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
        <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
      `
    },
    {
      icon: Database,
      title: '2. Hosting und Content Delivery Networks (CDN)',
      content: `
        <p>Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Webseitenzugriffe und sonstige Daten, die über eine Website generiert werden, handeln.</p>
        
        <p>Der Einsatz des Hosters erfolgt im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter.</p>
      `
    },
    {
      icon: Lock,
      title: '3. Allgemeine Hinweise und Pflichtinformationen',
      content: `
        <h4>Datenschutz</h4>
        <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
        
        <h4>Hinweis zur verantwortlichen Stelle</h4>
        <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
        <p>
          Zebick<br/>
          Stellimattweg 36<br/>
          4125 Riehen<br/>
          Schweiz
        </p>
        <p>
          Telefon: +41 61 123 45 67<br/>
          E-Mail: kontakt@zebick.com
        </p>
        
        <h4>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h4>
        <p>Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns.</p>
        
        <h4>SSL- bzw. TLS-Verschlüsselung</h4>
        <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
      `
    },
    {
      icon: Users,
      title: '4. Datenerfassung auf unserer Website',
      content: `
        <h4>Cookies</h4>
        <p>Unsere Internetseiten verwenden so genannte "Cookies". Cookies sind kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.</p>
        
        <p>Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschliessen sowie das automatische Löschen der Cookies beim Schliessen des Browsers aktivieren.</p>
        
        <h4>Server-Log-Dateien</h4>
        <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
        <ul>
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p>Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
        
        <h4>Kontaktformular</h4>
        <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
      `
    },
    {
      icon: Cookie,
      title: '5. Analyse-Tools und Werbung',
      content: `
        <h4>Google Analytics</h4>
        <p>Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. Anbieter ist die Google Ireland Limited ("Google"), Gordon House, Barrow Street, Dublin 4, Irland.</p>
        
        <p>Google Analytics verwendet so genannte "Cookies". Das sind Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen. Die durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert.</p>
        
        <p><strong>Browser Plugin</strong></p>
        <p>Sie können die Speicherung der Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern. Sie können darüber hinaus die Erfassung der durch den Cookie erzeugten und auf Ihre Nutzung der Website bezogenen Daten (inkl. Ihrer IP-Adresse) an Google sowie die Verarbeitung dieser Daten durch Google verhindern, indem Sie das unter dem folgenden Link verfügbare Browser-Plugin herunterladen und installieren: <a href="https://tools.google.com/dlpage/gaoptout?hl=de" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary)">https://tools.google.com/dlpage/gaoptout</a></p>
        
        <p><strong>IP-Anonymisierung</strong></p>
        <p>Wir haben auf dieser Website die Funktion IP-Anonymisierung aktiviert. Dadurch wird Ihre IP-Adresse von Google innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den Europäischen Wirtschaftsraum vor der Übermittlung in die USA gekürzt.</p>
      `
    },
    {
      icon: Mail,
      title: '6. Newsletter',
      content: `
        <h4>Newsletterdaten</h4>
        <p>Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind.</p>
        
        <p>Die von Ihnen zum Zwecke des Newsletter-Bezugs bei uns hinterlegten Daten werden von uns bis zu Ihrer Austragung aus dem Newsletter gespeichert und nach der Abbestellung des Newsletters gelöscht. Daten, die zu anderen Zwecken bei uns gespeichert wurden, bleiben hiervon unberührt.</p>
        
        <p><strong>Widerrufsrecht</strong></p>
        <p>Sie können den Newsletter jederzeit über den entsprechenden Link im Newsletter oder per E-Mail an kontakt@zebick.com abbestellen.</p>
      `
    },
    {
      icon: Shield,
      title: '7. Ihre Rechte',
      content: `
        <h4>Auskunft, Sperrung, Löschung und Berichtigung</h4>
        <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.</p>
        
        <p>Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.</p>
        
        <h4>Recht auf Datenübertragbarkeit</h4>
        <p>Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.</p>
        
        <h4>Widerspruch gegen Werbe-E-Mails</h4>
        <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.</p>
      `
    },
  ];

  return (
    <>
      <Seo title="Datenschutz" description="Datenschutzerklärung von Zebick: wie wir personenbezogene Daten beim Besuch unserer Website erheben, verarbeiten und schützen." path="/datenschutz" />
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
              <Shield size={16} />
              Datenschutz
            </span>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              marginBottom: '16px',
            }}>
              Datenschutzerklärung
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
            }}>
              Informationen zum Umgang mit Ihren personenbezogenen Daten
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{
        padding: '60px 0 100px',
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
        .legal-content a {
          color: var(--accent-primary);
          text-decoration: none;
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
      `}</style>

      <Footer />
      <Chatbot />
    </>
  );
};

export default DatenschutzPage;
