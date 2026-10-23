import React from 'react';

const WhatsAppButton = () => {
  // Ändern Sie diese Nummer zu Ihrer WhatsApp Business Nummer
  const phoneNumber = '41791234567'; // Format: Ländercode ohne +, dann Nummer
  const message = 'Hallo Zebick Team, ich interessiere mich für Ihre Dienstleistungen.';
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
        cursor: 'pointer',
        zIndex: 9999,
        transition: 'all 0.3s ease',
        animation: 'pulse 2s infinite',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 211, 102, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4)';
      }}
      aria-label="Chat on WhatsApp"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 2.825.739 5.482 2.032 7.784L0 32l8.448-2.016A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333c-2.56 0-4.992-.725-7.04-1.984l-.507-.299-5.12 1.227 1.28-4.8-.341-.544A13.261 13.261 0 0 1 2.667 16c0-7.36 5.973-13.333 13.333-13.333S29.333 8.64 29.333 16 23.36 29.333 16 29.333z"
          fill="#fff"
        />
        <path
          d="M23.147 19.36c-.395-.197-2.336-1.152-2.699-1.285-.363-.133-.627-.197-.891.197-.264.395-1.024 1.285-1.253 1.547-.23.264-.461.296-.856.099-.395-.198-1.667-.614-3.173-1.957-1.173-1.045-1.965-2.336-2.195-2.731-.23-.395-.024-.608.173-.805.177-.176.395-.461.592-.691.197-.23.264-.395.395-.659.133-.264.067-.494-.033-.691-.099-.197-.891-2.147-1.221-2.939-.323-.77-.651-.666-.891-.678-.23-.011-.494-.013-.758-.013-.264 0-.691.099-1.053.494-.363.395-1.387 1.355-1.387 3.307s1.419 3.835 1.616 4.099c.197.264 2.784 4.248 6.741 5.957.942.408 1.677.651 2.251.832.947.301 1.808.259 2.489.157.76-.113 2.336-.955 2.667-1.877.331-.923.331-1.712.23-1.877-.099-.165-.363-.264-.758-.461z"
          fill="#fff"
        />
      </svg>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
            }
            50% {
              box-shadow: 0 8px 32px rgba(37, 211, 102, 0.6), 0 0 0 10px rgba(37, 211, 102, 0.1);
            }
          }
        `}
      </style>
    </a>
  );
};

export default WhatsAppButton;
