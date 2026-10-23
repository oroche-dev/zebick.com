import React from 'react';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import ZebickLogoB from '../brand/ZebickLogoB';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Layout wrapper for ALL admin routes (except login).
 * Provides the unified left sidebar + main content area.
 * On mobile/tablet (<=768px) the sidebar collapses into an off-canvas drawer
 * toggled by a top bar hamburger.
 */
export default function AdminShellLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [role, setRole] = React.useState(() => localStorage.getItem('admin_role') || null);

  React.useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Resolve the current staff role once per mount so the sidebar can hide
  // nav items the backend won't allow this role to use anyway.
  React.useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    axios.get(`${BACKEND_URL}/api/admin/verify`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.role) {
          setRole(res.data.role);
          localStorage.setItem('admin_role', res.data.role);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="admin-backdrop"
          data-testid="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {/* Mobile top bar */}
        <div className="admin-topbar" data-testid="admin-topbar">
          <button
            className="admin-topbar-burger"
            data-testid="admin-menu-toggle"
            aria-label="Menü öffnen"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div
            onClick={() => navigate('/zb-panel-8x2k/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <ZebickLogoB height={24} variant="outfit" />
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#FF6B00',
              background: 'rgba(255, 107, 0, 0.1)', padding: '2px 6px', borderRadius: 4,
              textTransform: 'uppercase',
            }}>Admin</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
