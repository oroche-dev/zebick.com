import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 107, 0, 0.2)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <Globe size={18} />
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: -1,
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '160px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: i18n.language === lang.code 
                    ? 'rgba(255, 107, 0, 0.2)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: i18n.language === lang.code ? 600 : 400,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {i18n.language === lang.code && (
                  <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
