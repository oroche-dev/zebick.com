import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Users, Shield, Trash2, Power, PowerOff, Mail, Calendar, RefreshCw, X, Check } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const UsersAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, []);

  const verifyCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAdmins(), verifyCurrentUser()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAdmins, verifyCurrentUser]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Name ist erforderlich');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('E-Mail ist erforderlich');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Passwort muss mindestens 6 Zeichen haben');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwörter stimmen nicht überein');
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'admin' });
        await fetchAdmins();
      } else {
        const data = await response.json();
        setFormError(data.detail || 'Fehler beim Erstellen');
      }
    } catch (error) {
      setFormError('Verbindungsfehler');
    }

    setFormLoading(false);
  };

  const handleToggleActive = async (admin) => {
    setActionLoading(admin.id);
    try {
      const endpoint = admin.is_active ? 'deactivate' : 'activate';
      const response = await fetch(`${API_URL}/api/admin/users/${admin.id}/${endpoint}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchAdmins();
      } else {
        const data = await response.json();
        alert(data.detail || 'Fehler');
      }
    } catch (error) {
      console.error('Error toggling admin:', error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Möchten Sie "${admin.name}" wirklich löschen?`)) return;

    setActionLoading(admin.id);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${admin.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchAdmins();
      } else {
        const data = await response.json();
        alert(data.detail || 'Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
    setActionLoading(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getRoleBadge = (role) => {
    const isSuperAdmin = role === 'superadmin';
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        background: isSuperAdmin ? 'rgba(255, 107, 0, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        color: isSuperAdmin ? 'var(--accent-primary)' : '#3B82F6',
        fontSize: '12px',
        fontWeight: 600
      }}>
        <Shield size={14} />
        {isSuperAdmin ? 'Super Admin' : 'Admin'}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Admin-Benutzer verwalten
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Erstellen und verwalten Sie Admin-Zugänge
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchAdmins}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              data-testid="refresh-admins-btn"
            >
              <RefreshCw size={16} />
              Aktualisieren
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
              data-testid="create-admin-btn"
            >
              <UserPlus size={16} />
              Neuer Admin
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Users size={24} style={{ color: 'var(--accent-primary)', marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{admins.length}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gesamt Admins</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Power size={24} style={{ color: '#4caf50', marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#4caf50' }}>
              {admins.filter(a => a.is_active).length}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aktive Admins</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Shield size={24} style={{ color: '#3B82F6', marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#3B82F6' }}>
              {admins.filter(a => a.role === 'superadmin').length}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Super Admins</div>
          </div>
        </div>

        {/* Admin List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Laden...
          </div>
        ) : admins.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Keine Admin-Benutzer vorhanden</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {admins.map((admin) => (
              <div
                key={admin.id}
                style={{
                  background: admin.is_active ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid',
                  borderColor: admin.is_active ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: admin.is_active ? 1 : 0.6
                }}
                data-testid={`admin-card-${admin.id}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: admin.role === 'superadmin' 
                      ? 'linear-gradient(135deg, var(--accent-primary) 0%, #FF8533 100%)'
                      : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {admin.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{admin.name}</span>
                      {getRoleBadge(admin.role)}
                      {!admin.is_active && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: 'rgba(244, 67, 54, 0.15)',
                          color: '#f44336',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          Deaktiviert
                        </span>
                      )}
                      {currentUser?.email === admin.email && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: 'rgba(76, 175, 80, 0.15)',
                          color: '#4caf50',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          Sie
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} />
                        {admin.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        Erstellt: {formatDate(admin.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions - hide for self and superadmin */}
                {currentUser?.email !== admin.email && admin.role !== 'superadmin' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleActive(admin)}
                      disabled={actionLoading === admin.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: admin.is_active ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid',
                        borderColor: admin.is_active ? '#f44336' : '#4caf50',
                        borderRadius: '6px',
                        color: admin.is_active ? '#f44336' : '#4caf50',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                      data-testid={`toggle-${admin.id}`}
                    >
                      {admin.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                      {admin.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      disabled={actionLoading === admin.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                      data-testid={`delete-${admin.id}`}
                    >
                      <Trash2 size={14} />
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(8px)'
          }} data-testid="create-admin-modal">
            <div style={{
              background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              maxWidth: '450px',
              width: '100%',
              position: 'relative'
            }}>
              <button
                onClick={() => { setShowCreateModal(false); setFormError(''); }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={20} />
              </button>

              <form onSubmit={handleCreateAdmin} style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Neuen Admin erstellen
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Zugangsdaten für den neuen Administrator
                </p>

                {/* Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Max Mustermann"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    data-testid="admin-name-input"
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@firma.de"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    data-testid="admin-email-input"
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                    Passwort *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mindestens 6 Zeichen"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    data-testid="admin-password-input"
                  />
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                    Passwort bestätigen *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Passwort wiederholen"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    data-testid="admin-confirm-password-input"
                  />
                </div>

                {/* Role */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                    Rolle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    data-testid="admin-role-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                {/* Error */}
                {formError && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid #f44336',
                    borderRadius: '6px',
                    color: '#f44336',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {formError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: formLoading ? 'rgba(255, 107, 0, 0.5)' : 'var(--accent-primary)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  data-testid="submit-admin-btn"
                >
                  {formLoading ? 'Wird erstellt...' : (
                    <>
                      <Check size={16} />
                      Admin erstellen
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersAdmin;
