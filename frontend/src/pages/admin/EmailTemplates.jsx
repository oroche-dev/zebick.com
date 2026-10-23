import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Shield, Code, Smartphone, Palette, Gamepad2, 
  Bot, Server, TrendingUpIcon, PenTool, LogOut, Send, Copy, Eye
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const emailTemplates = {
  'Cyber Security': {
    icon: Shield,
    color: '#FF6B00',
    subject: 'Ihre Cyber Security Lösung von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

vielen Dank für Ihr Interesse an unseren Cyber Security Lösungen.

Wir bieten Ihnen umfassenden Schutz für Ihre digitale Infrastruktur:
• Penetration Testing & Security Audits
• 24/7 Security Monitoring
• Incident Response & Recovery
• Security Consulting & Training

Unser Expertenteam steht bereit, Ihre Systeme vor Bedrohungen zu schützen.

Nächste Schritte:
1. Kostenlose Security-Analyse
2. Maßgeschneidertes Sicherheitskonzept
3. Implementation & Support

Lassen Sie uns in einem persönlichen Gespräch Ihre Anforderungen besprechen.`
  },
  'Web Development': {
    icon: Code,
    color: '#FF8C32',
    subject: 'Ihre professionelle Website von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

danke für Ihr Interesse an unseren Web Development Services.

Wir entwickeln moderne, performante Websites:
• Responsive Design für alle Geräte
• SEO-optimiert & schnell
• Content Management Systeme
• E-Commerce Lösungen

Unsere Technologien: React, Next.js, Node.js, WordPress

Ihre Vorteile:
✓ Professionelles Design
✓ Optimale User Experience
✓ Höhere Conversion-Raten
✓ Wartung & Support

Gerne erstellen wir Ihnen ein individuelles Angebot.`
  },
  'App Development': {
    icon: Smartphone,
    color: '#FFA050',
    subject: 'Ihre Mobile App von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

vielen Dank für Ihr Interesse an unserer App-Entwicklung.

Wir entwickeln native & cross-platform Apps:
• iOS & Android Development
• React Native & Flutter
• Progressive Web Apps
• App Design & UX

Unser Prozess:
1. Konzept & Design
2. Entwicklung & Testing
3. Launch & Marketing
4. Updates & Maintenance

Ihre App in den App Stores - professionell und termingerecht.

Lassen Sie uns Ihre App-Idee besprechen!`
  },
  'UI/UX': {
    icon: Palette,
    color: '#FF781E',
    subject: 'Ihr UI/UX Design von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

danke für Ihr Interesse an unseren UI/UX Design Services.

Wir gestalten benutzerfreundliche Interfaces:
• User Research & Testing
• Wireframing & Prototyping
• Visual Design & Branding
• Design Systems

Unser Ansatz:
→ Nutzer im Mittelpunkt
→ Datengetriebene Entscheidungen
→ Moderne Design-Trends
→ Barrierefreiheit

Besseres Design = Höhere Conversion

Lassen Sie uns Ihr Projekt besprechen!`
  },
  'Gaming Development': {
    icon: Gamepad2,
    color: '#F59E0B',
    subject: 'Ihre Game-Entwicklung mit Zebick',
    template: `Sehr geehrte/r [Kunde Name],

vielen Dank für Ihr Interesse an unserer Game Development.

Wir entwickeln Games für alle Plattformen:
• Mobile Games (iOS/Android)
• PC & Console Games
• Web-based Games
• VR/AR Experiences

Technologien: Unity, Unreal Engine, Godot

Von der Idee zum fertigen Game:
1. Game Design & Konzept
2. Grafik & Animation
3. Entwicklung & Testing
4. Launch & Marketing

Lassen Sie uns Ihre Game-Idee zum Leben erwecken!`
  },
  'Chatbot Development': {
    icon: Bot,
    color: '#FB923C',
    subject: 'Ihr KI-Chatbot von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

danke für Ihr Interesse an unseren Chatbot-Lösungen.

Intelligente Chatbots für Ihr Business:
• 24/7 Kundensupport
• Lead-Generierung
• FAQ-Automatisierung
• Multi-Channel Integration

Technologien: GPT-4, Custom AI, NLP

Ihre Vorteile:
✓ Kosteneinsparung im Support
✓ Schnellere Antwortzeiten
✓ Bessere Kundenzufriedenheit
✓ Skalierbarkeit

Automatisieren Sie Ihren Kundenservice!

Lassen Sie uns Ihren Chatbot planen.`
  },
  'Server System': {
    icon: Server,
    color: '#FFB464',
    subject: 'Ihre Server-Lösung von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

vielen Dank für Ihr Interesse an unseren Server-Services.

Professionelle Server-Lösungen:
• Cloud Server Setup (AWS, Azure, Google Cloud)
• Dedicated Server Management
• Load Balancing & Scaling
• Backup & Disaster Recovery

Services:
→ 24/7 Monitoring
→ Security Updates
→ Performance Optimization
→ Technical Support

Zuverlässige Infrastruktur für Ihr Business.

Ihre Systeme in sicheren Händen!

Lassen Sie uns Ihre Infrastruktur besprechen.`
  },
  'Digital Marketing SEO': {
    icon: TrendingUpIcon,
    color: '#F97316',
    subject: 'Ihr Digital Marketing von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

danke für Ihr Interesse an unserem Digital Marketing.

Wir bringen Sie nach vorne:
• SEO - Suchmaschinenoptimierung
• Google Ads & Social Media Ads
• Content Marketing
• Analytics & Reporting

Unsere Services:
✓ Höhere Rankings bei Google
✓ Mehr Website-Traffic
✓ Bessere Conversion-Raten
✓ Transparentes Reporting

ROI-fokussiertes Marketing für messbaren Erfolg.

Mehr Sichtbarkeit = Mehr Kunden

Lassen Sie uns Ihre Marketing-Strategie entwickeln!`
  },
  'Graphic Design': {
    icon: PenTool,
    color: '#EAB308',
    subject: 'Ihr Grafikdesign von Zebick',
    template: `Sehr geehrte/r [Kunde Name],

vielen Dank für Ihr Interesse an unserem Grafikdesign.

Kreative Design-Lösungen:
• Logo & Corporate Design
• Printmedien (Flyer, Broschüren)
• Social Media Graphics
• Packaging Design

Unser Designprozess:
1. Briefing & Konzept
2. Design-Entwürfe
3. Feedback & Revision
4. Finale Dateien

Professionelles Design, das überzeugt.

Ihre Marke verdient das beste Design!

Lassen Sie uns Ihr Design-Projekt starten.`
  }
};

const EmailTemplates = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('Cyber Security');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentTemplate = emailTemplates[selectedService];
  const Icon = currentTemplate.icon;

  React.useEffect(() => {
    setCustomSubject(currentTemplate.subject);
    setCustomContent(currentTemplate.template);
  }, [currentTemplate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/zb-panel-8x2k/login');
  };

  const personalizeTemplate = () => {
    return customContent.replace('[Kunde Name]', customerName || '[Kunde Name]');
  };

  const getEmailHTML = () => {
    const personalizedContent = personalizeTemplate();
    const logoUrl = `${window.location.origin}/logo.png`;
    return `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; background: #f5f5f5;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, ${currentTemplate.color} 0%, #F97316 100%); padding: 44px 30px 40px; text-align: center;">
          <img src="${logoUrl}" alt="Zebick" height="56" style="display:inline-block;height:56px;width:auto;filter:brightness(0) invert(1);margin-bottom:18px" />
          <h1 style="color: #fff; margin: 0 0 6px; font-size: 28px; font-weight: 700; font-family: Georgia, serif; letter-spacing: -0.5px;">${currentTemplate.subject}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">DIGITALAGENTUR &middot; CYBER SECURITY</p>
        </div>
        
        <!-- Content -->
        <div style="background: #fff; padding: 40px 30px;">
          <div style="display: inline-block; background: ${currentTemplate.color}20; padding: 12px; border-radius: 12px; margin-bottom: 24px;">
            <span style="font-size: 32px;">${selectedService === 'Cyber Security' ? '🛡️' : selectedService === 'Web Development' ? '💻' : selectedService === 'App Development' ? '📱' : selectedService === 'UI/UX' ? '🎨' : selectedService === 'Gaming Development' ? '🎮' : selectedService === 'Chatbot Development' ? '🤖' : selectedService === 'Server System' ? '🖥️' : selectedService === 'Digital Marketing SEO' ? '📈' : '🖌️'}</span>
          </div>
          
          <div style="color: #333; line-height: 1.8; white-space: pre-wrap;">
            ${personalizedContent}
          </div>
        </div>
        
        <!-- Signature -->
        <div style="background: #fff; padding: 30px; border-top: 3px solid ${currentTemplate.color};">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding-right: 20px; border-right: 2px solid #eee; vertical-align: top;">
                <img src="${logoUrl}" alt="Zebick" height="34" style="display:block;height:34px;width:auto;margin-bottom:8px" />
                <p style="margin: 0; font-weight: 700; font-size: 16px; color: ${currentTemplate.color};">Zebick Digital Agency</p>
                <p style="margin: 5px 0; color: #666; font-size: 13px;">Digitale Lösungen die begeistern</p>
                <p style="margin: 5px 0; color: #666; font-size: 13px;">Seit 2012</p>
              </td>
              <td style="padding-left: 20px;">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
                  📧 <a href="mailto:admin@zebick.com" style="color: ${currentTemplate.color}; text-decoration: none;">admin@zebick.com</a>
                </p>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
                  🌐 <a href="${window.location.origin}" style="color: ${currentTemplate.color}; text-decoration: none;">www.zebick.com</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 3px solid ${currentTemplate.color};">
          <p style="margin: 0 0 8px 0; color: ${currentTemplate.color}; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">Zebick</p>
          <p style="margin: 0; color: #555; font-size: 11px;">
            © ${new Date().getFullYear()} Zebick. Alle Rechte vorbehalten.
          </p>
        </div>
      </body>
      </html>
    `;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmailHTML());
    alert('✅ HTML-Code in Zwischenablage kopiert!');
  };

  const sendEmail = async () => {
    if (!recipientEmail || !customerName) {
      alert('Bitte füllen Sie Empfänger-E-Mail und Kundenname aus');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${BACKEND_URL}/api/send-email`, {
        to_email: recipientEmail,
        subject: customSubject,
        html_content: getEmailHTML(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`✅ E-Mail an ${recipientEmail} gesendet!`);
    } catch (error) {
      console.error('Send error:', error);
      const detail = error?.response?.data?.detail;
      alert(`❌ Fehler beim Versenden${detail ? `: ${detail}` : ''}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #fff 0%, #999 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              📧 E-Mail Templates
            </h1>
            <p style={{ color: '#888', fontSize: '16px' }}>
              Professionelle E-Mail-Vorlagen für alle Service-Bereiche
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/zb-panel-8x2k/dashboard')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={18} />
              Abmelden
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
          {/* Service Selection */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Service Auswählen
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(emailTemplates).map((service) => {
                const template = emailTemplates[service];
                const ServiceIcon = template.icon;
                return (
                  <button
                    key={service}
                    onClick={() => setSelectedService(service)}
                    style={{
                      padding: '16px',
                      background: selectedService === service 
                        ? `linear-gradient(135deg, ${template.color}30 0%, ${template.color}10 100%)`
                        : 'rgba(255, 255, 255, 0.03)',
                      border: selectedService === service 
                        ? `2px solid ${template.color}`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s',
                    }}
                  >
                    <ServiceIcon size={20} color={template.color} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{service}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Editor */}
          <div>
            <div style={{
              background: `linear-gradient(135deg, ${currentTemplate.color}15 0%, ${currentTemplate.color}05 100%)`,
              border: `2px solid ${currentTemplate.color}40`,
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: `${currentTemplate.color}30`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={28} color={currentTemplate.color} />
                </div>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                    {selectedService}
                  </h2>
                  <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 0 0' }}>
                    E-Mail-Vorlage mit Signatur
                  </p>
                </div>
              </div>

              {/* Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                    Kundenname:
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="z.B. Herr Müller"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                    Empfänger E-Mail:
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="kunde@beispiel.de"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                  Betreff:
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                  E-Mail-Inhalt:
                </label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Eye size={18} />
                  {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
                </button>
                <button
                  onClick={copyToClipboard}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Copy size={18} />
                  HTML kopieren
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sending || !recipientEmail || !customerName}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: `linear-gradient(135deg, ${currentTemplate.color} 0%, #F97316 100%)`,
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000',
                    fontWeight: 700,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: (!recipientEmail || !customerName) ? 0.5 : 1,
                  }}
                >
                  <Send size={18} />
                  {sending ? 'Sendet...' : 'E-Mail senden'}
                </button>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}>
                <div style={{ padding: '20px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    <strong>Vorschau:</strong> So sieht die E-Mail aus
                  </p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: getEmailHTML() }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;
