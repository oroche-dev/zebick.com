import React from 'react';

/**
 * Legacy AdminLayout used by older admin pages (UsersAdmin, etc.).
 * Now a pass-through since the global AdminShellLayout already provides
 * the sidebar.
 */
const AdminLayout = ({ children }) => {
  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100%' }}>
      {children}
    </div>
  );
};

export default AdminLayout;
