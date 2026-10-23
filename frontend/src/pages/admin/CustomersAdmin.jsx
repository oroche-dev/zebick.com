import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Phone, Mail, Plus, Search, Building, Tag,
  Trash2, Loader2, Save, X, Edit2,
} from 'lucide-react';
import { AdminShell, Section, Field, input, btnPrimary, btnSecondary, btnGhost, btnDanger, authHeaders, BACKEND_URL } from './_adminShared';

const STATUS_COLORS = {
  active: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: 'Aktiv' },
  archived: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'Archiviert' },
};

const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#111', border: '1px solid var(--border-subtle)', borderRadius: '14px',
        maxWidth: '560px', width: '100%', maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ ...btnGhost, padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>{footer}</div>}
      </div>
    </div>
  );
};

const CustomersAdmin = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailOpen, setDetailOpen] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/customers`, {
        headers: authHeaders(),
        params: { q: search, limit: 500 },
      });
      setCustomers(res.data.customers || []);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) navigate('/zb-panel-8x2k/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, search]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/zb-panel-8x2k/login'); return; }
    fetchCustomers();
  }, [fetchCustomers, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
    setCreating(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '', email: c.email || '', phone: c.phone || '',
      company: c.company || '', address: c.address || '', notes: c.notes || '',
    });
    setCreating(true);
  };

  const saveCustomer = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert('Name und E-Mail sind Pflicht'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`${BACKEND_URL}/api/admin/customers/${editing.id}`, form, { headers: authHeaders() });
      } else {
        await axios.post(`${BACKEND_URL}/api/admin/customers`, form, { headers: authHeaders() });
      }
      setCreating(false);
      fetchCustomers();
    } catch (e) {
      alert(e.response?.data?.detail || 'Fehler');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (c) => {
    if (!window.confirm(`Kunde "${c.name}" wirklich löschen?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/customers/${c.id}`, { headers: authHeaders() });
      fetchCustomers();
    } catch (e) {
      alert(e.response?.data?.detail || 'Fehler');
    }
  };

  const openDetail = async (c) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/customers/${c.id}`, { headers: authHeaders() });
      setDetailOpen(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminShell
      title="Kunden (CRM)"
      subtitle="Kundenliste mit Kontaktdaten, Anfragenhistorie und Notizen"
      actions={
        <button onClick={openCreate} style={btnPrimary} data-testid="customer-new-btn">
          <Plus size={16} /> Neuer Kunde
        </button>
      }
    >
      <Section title="Suchen & Filtern">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              style={{ ...input, paddingLeft: '38px' }}
              placeholder="Name, E-Mail oder Firma suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="customer-search"
            />
          </div>
          <button type="submit" style={btnSecondary}>Suchen</button>
        </form>
      </Section>

      <div style={{ height: '20px' }} />

      <Section title={`Kunden (${customers.length})`}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spin" /> Wird geladen…
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <div>Noch keine Kunden. Lege jetzt deinen ersten Kunden an oder konvertiere eine Anfrage.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {customers.map((c) => {
              const sc = STATUS_COLORS[c.status] || STATUS_COLORS.active;
              return (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px',
                  padding: '16px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)', borderRadius: '10px',
                  alignItems: 'center',
                }} data-testid={`customer-row-${c.id}`}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '15px' }}>{c.name}</strong>
                      <span style={{
                        fontSize: '10px', padding: '3px 8px', borderRadius: '99px',
                        background: sc.bg, color: sc.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{sc.label}</span>
                      {c.tags?.map((t) => (
                        <span key={t} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,107,0,0.1)', color: '#FF8C32' }}>
                          <Tag size={9} style={{ display: 'inline', marginRight: 3 }} />{t}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '12px', flexWrap: 'wrap' }}>
                      <span><Mail size={11} style={{ display: 'inline', marginRight: 4 }} />{c.email}</span>
                      {c.phone && <span><Phone size={11} style={{ display: 'inline', marginRight: 4 }} />{c.phone}</span>}
                      {c.company && <span><Building size={11} style={{ display: 'inline', marginRight: 4 }} />{c.company}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Anfragen: <strong style={{ color: '#fff' }}>{c.request_count || 0}</strong></span>
                      <span>Umsatz: <strong style={{ color: '#22c55e' }}>€{(c.total_revenue || 0).toLocaleString('de-DE')}</strong></span>
                      <span>Seit: {new Date(c.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openDetail(c)} style={btnSecondary} data-testid={`customer-view-${c.id}`}>Details</button>
                    <button onClick={() => openEdit(c)} style={btnGhost} data-testid={`customer-edit-${c.id}`}><Edit2 size={14} /></button>
                    <button onClick={() => deleteCustomer(c)} style={btnDanger} data-testid={`customer-delete-${c.id}`}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Create / Edit Modal */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={editing ? 'Kunden bearbeiten' : 'Neuer Kunde'}
        footer={
          <>
            <button onClick={() => setCreating(false)} style={btnSecondary}>Abbrechen</button>
            <button onClick={saveCustomer} disabled={saving} style={btnPrimary} data-testid="customer-save-btn">
              {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              Speichern
            </button>
          </>
        }
      >
        <Field label="Name *"><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="customer-form-name" /></Field>
        <Field label="E-Mail *"><input type="email" style={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="customer-form-email" /></Field>
        <Field label="Telefon"><input style={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Firma"><input style={input} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
        <Field label="Adresse"><input style={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Notizen"><textarea style={{ ...input, minHeight: '80px', resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!detailOpen}
        onClose={() => setDetailOpen(null)}
        title={detailOpen?.customer?.name || 'Kunde'}
      >
        {detailOpen && (
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>KONTAKT</div>
              <div style={{ fontSize: '14px' }}>
                <div>📧 {detailOpen.customer.email}</div>
                {detailOpen.customer.phone && <div>📞 {detailOpen.customer.phone}</div>}
                {detailOpen.customer.company && <div>🏢 {detailOpen.customer.company}</div>}
                {detailOpen.customer.address && <div>📍 {detailOpen.customer.address}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(34,197,94,0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700, marginBottom: '4px' }}>UMSATZ</div>
                <div style={{ fontSize: '22px', fontWeight: 800 }}>€{(detailOpen.customer.total_revenue || 0).toLocaleString('de-DE')}</div>
              </div>
              <div style={{ background: 'rgba(255,107,0,0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,107,0,0.2)' }}>
                <div style={{ fontSize: '11px', color: '#FF8C32', fontWeight: 700, marginBottom: '4px' }}>ANFRAGEN</div>
                <div style={{ fontSize: '22px', fontWeight: 800 }}>{detailOpen.requests?.length || 0}</div>
              </div>
            </div>
            {detailOpen.customer.notes && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>NOTIZEN</div>
                <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{detailOpen.customer.notes}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anfragen-Historie</div>
              {detailOpen.requests?.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Keine verknüpften Anfragen.</div>
              ) : (
                <div style={{ display: 'grid', gap: '6px' }}>
                  {detailOpen.requests.map((r) => (
                    <div key={r.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px' }}>{r.service || 'Allgemein'}</strong>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,107,0,0.15)', color: '#FF8C32', textTransform: 'uppercase' }}>{r.status}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(r.submitted_at).toLocaleString('de-DE')} • Budget: {r.budget || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
};

export default CustomersAdmin;
