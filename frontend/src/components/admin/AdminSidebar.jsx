import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Sparkles, MessageSquare, Briefcase, Image,
  Users, Receipt, Settings, Bot, Shield, BarChart3, LogOut, Wrench,
  UserCog, Megaphone, Newspaper, Inbox, Mail, Target, Gamepad2, DatabaseBackup
} from 'lucide-react';
import ZebickLogoB from '../brand/ZebickLogoB';

// `tier` gates visibility to match the backend's actual authorization:
//   undefined  -> any staff role (get_current_user)
//   'crm'      -> admin/superadmin/support (require_crm_access)
//   'superadmin' -> superadmin only (require_superadmin)
const items = [
  { to: '/zb-panel-8x2k/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/zb-panel-8x2k/leads', label: 'Leads', icon: Target },
  { to: '/zb-panel-8x2k/categories', label: 'Kategorien', icon: FolderTree },
  { to: '/zb-panel-8x2k/services-catalog', label: 'Services', icon: Sparkles },
  { to: '/zb-panel-8x2k/tools', label: 'Tools & Berater', icon: Wrench },
  { to: '/zb-panel-8x2k/service-pricing', label: 'Service-Preise & Tools', icon: Receipt },
  { to: '/zb-panel-8x2k/contacts', label: 'Anfragen', icon: MessageSquare },
  { to: '/zb-panel-8x2k/funnel', label: 'Sales-Funnel', icon: Megaphone },
  { to: '/zb-panel-8x2k/projects-mgmt', label: 'Projekte', icon: Briefcase },
  { to: '/zb-panel-8x2k/portfolio', label: 'Portfolio', icon: Image },
  { to: '/zb-panel-8x2k/blog', label: 'Blog / SEO', icon: Newspaper },
  { to: '/zb-panel-8x2k/customers', label: 'Kunden', icon: Users },
  { to: '/zb-panel-8x2k/offers', label: 'Angebote & Rechnungen', icon: Receipt },
  { to: '/zb-panel-8x2k/chatbot', label: 'Chatbot', icon: Bot },
  { to: '/zb-panel-8x2k/achievements', label: 'Games & Achievements', icon: Gamepad2 },
  { to: '/zb-panel-8x2k/newsletter', label: 'Newsletter', icon: Mail, tier: 'crm' },
  { to: '/zb-panel-8x2k/inbox', label: 'Posteingang', icon: Inbox, tier: 'crm' },
  { to: '/zb-panel-8x2k/users', label: 'Team & Rollen', icon: UserCog, tier: 'crm' },
  { to: '/zb-panel-8x2k/security', label: 'Sicherheit', icon: Shield, tier: 'superadmin' },
  { to: '/zb-panel-8x2k/backups', label: 'Backups', icon: DatabaseBackup, tier: 'superadmin' },
  { to: '/zb-panel-8x2k/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/zb-panel-8x2k/settings', label: 'Einstellungen', icon: Settings },
];

const CRM_ROLES = new Set(['admin', 'superadmin', 'support']);

export default function AdminSidebar({ active, open, onClose, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const current = active || location.pathname;
  const adminEmail = (typeof window !== 'undefined' && localStorage.getItem('admin_email')) || 'admin@zebick.com';
  const visibleItems = items.filter((item) => {
    if (!item.tier) return true;
    if (!role) return true; // role not resolved yet — don't flash-hide items
    if (item.tier === 'superadmin') return role === 'superadmin';
    if (item.tier === 'crm') return CRM_ROLES.has(role);
    return true;
  });

  const go = (to) => {
    navigate(to);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/zb-panel-8x2k/login');
    if (onClose) onClose();
  };

  return (
    <aside
      data-testid="admin-sidebar"
      className={`admin-sidebar${open ? ' is-open' : ''}`}
      style={{
        width: 240, minHeight: '100vh',
        background: '#0d0d0d',
        borderRight: '1px solid #1f1f1f',
        padding: '20px 12px',
        position: 'sticky', top: 0,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}
    >
      {/* Brand Header */}
      <div
        onClick={() => go('/zb-panel-8x2k/dashboard')}
        style={{
          padding: '8px 10px 16px',
          borderBottom: '1px solid #1a1a1a',
          marginBottom: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
        title="Zum Dashboard"
      >
        <ZebickLogoB height={28} variant="outfit" />
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#FF6B00',
          background: 'rgba(255, 107, 0, 0.1)',
          padding: '2px 7px',
          borderRadius: 4,
          textTransform: 'uppercase',
        }}>
          Admin
        </span>
      </div>

      <nav className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
        {visibleItems.map(({ to, label, icon: Icon }) => {
          const isActive = current.startsWith(to);
          return (
            <button
              key={to}
              data-testid={`sidebar-${to.split('/').pop()}`}
              onClick={() => go(to)}
              className={`admin-nav-item${isActive ? ' is-active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 6,
                background: isActive ? 'rgba(255, 107, 0, 0.10)' : 'transparent',
                border: '1px solid ' + (isActive ? 'rgba(255, 107, 0, 0.30)' : 'transparent'),
                color: isActive ? '#FF6B00' : '#b5b5b5',
                fontSize: 13, fontWeight: 600,
                textAlign: 'left', cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          background: '#111',
          borderRadius: 6,
          border: '1px solid #1f1f1f',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B00, #c54f00)',
            display: 'grid', placeItems: 'center',
            color: '#000', fontWeight: 800, fontSize: 12,
            flexShrink: 0,
          }}>
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{adminEmail}</div>
            <div style={{ fontSize: 10, color: '#7a7a7a', textTransform: 'capitalize' }}>{role || '...'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="sidebar-logout"
          className="admin-logout-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
            padding: '10px 12px', borderRadius: 6,
            background: 'transparent', border: '1px solid #2a2a2a',
            color: '#a5a5a5', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
          }}
        >
          <LogOut size={16} /> Abmelden
        </button>
      </div>

      <style>{`
        .admin-nav-item:not(.is-active):hover {
          background: #161616 !important;
          color: #fff !important;
        }
        .admin-logout-btn:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          border-color: rgba(239, 68, 68, 0.35) !important;
          color: #ef6b6b !important;
        }
        .admin-nav::-webkit-scrollbar { width: 6px; }
        .admin-nav::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
        .admin-nav::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </aside>
  );
}

export function AdminLayout({ children, title, actions }) {
  return (
    <div style={{ padding: '28px 28px 60px', minWidth: 0 }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
          {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
