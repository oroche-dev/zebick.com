import React, { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2, Clock, CheckCircle, XCircle, MessageSquare, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/testimonials/all?status=${filter}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  }, [filter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/testimonials/stats`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTestimonials(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchTestimonials, fetchStats]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/api/testimonials/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await Promise.all([fetchTestimonials(), fetchStats()]);
      }
    } catch (error) {
      console.error('Error approving testimonial:', error);
    }
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/api/testimonials/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await Promise.all([fetchTestimonials(), fetchStats()]);
      }
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Möchten Sie diese Bewertung wirklich löschen?')) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await Promise.all([fetchTestimonials(), fetchStats()]);
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', icon: Clock },
      approved: { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', icon: CheckCircle },
      rejected: { bg: 'rgba(244, 67, 54, 0.15)', color: '#f44336', icon: XCircle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        background: style.bg,
        color: style.color,
        fontSize: '12px',
        fontWeight: 600
      }}>
        <Icon size={14} />
        {status === 'pending' ? 'Ausstehend' : status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Bewertungen verwalten
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Kundenbewertungen prüfen und freigeben
            </p>
          </div>
          <button
            onClick={() => { fetchTestimonials(); fetchStats(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '8px',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
            data-testid="refresh-testimonials-btn"
          >
            <RefreshCw size={16} />
            Aktualisieren
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Gesamt', value: stats.total, color: '#fff', icon: MessageSquare },
            { label: 'Ausstehend', value: stats.pending, color: '#ffc107', icon: Clock },
            { label: 'Genehmigt', value: stats.approved, color: '#4caf50', icon: CheckCircle },
            { label: 'Abgelehnt', value: stats.rejected, color: '#f44336', icon: XCircle },
            { label: 'Ø Bewertung', value: stats.average_rating || '-', color: 'var(--accent-primary)', icon: Star }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }} data-testid={`stat-${stat.label.toLowerCase().replace(/[^a-z]/g, '')}`}>
              <stat.icon size={24} style={{ color: stat.color, marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { value: 'all', label: 'Alle' },
            { value: 'pending', label: 'Ausstehend' },
            { value: 'approved', label: 'Genehmigt' },
            { value: 'rejected', label: 'Abgelehnt' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '10px 20px',
                background: filter === tab.value ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: filter === tab.value ? 'var(--accent-primary)' : 'var(--border-subtle)',
                borderRadius: '8px',
                color: filter === tab.value ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              data-testid={`filter-${tab.value}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Laden...
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Keine Bewertungen vorhanden</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.2s'
                }}
                data-testid={`testimonial-card-${testimonial.id}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>{testimonial.name}</h3>
                      {getStatusBadge(testimonial.status)}
                    </div>
                    {(testimonial.company || testimonial.position) && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {testimonial.position}{testimonial.position && testimonial.company && ' bei '}{testimonial.company}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < testimonial.rating ? 'var(--accent-primary)' : 'transparent'}
                        color="var(--accent-primary)"
                        opacity={i < testimonial.rating ? 1 : 0.3}
                      />
                    ))}
                  </div>
                </div>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  marginBottom: '20px',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--accent-primary)'
                }}>
                  "{testimonial.content}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Eingereicht am: {formatDate(testimonial.submitted_at)}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {testimonial.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(testimonial.id)}
                          disabled={actionLoading === testimonial.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'rgba(76, 175, 80, 0.15)',
                            border: '1px solid #4caf50',
                            borderRadius: '6px',
                            color: '#4caf50',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                          data-testid={`approve-btn-${testimonial.id}`}
                        >
                          <Check size={16} />
                          Genehmigen
                        </button>
                        <button
                          onClick={() => handleReject(testimonial.id)}
                          disabled={actionLoading === testimonial.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'rgba(244, 67, 54, 0.15)',
                            border: '1px solid #f44336',
                            borderRadius: '6px',
                            color: '#f44336',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                          data-testid={`reject-btn-${testimonial.id}`}
                        >
                          <X size={16} />
                          Ablehnen
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      disabled={actionLoading === testimonial.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                      data-testid={`delete-btn-${testimonial.id}`}
                    >
                      <Trash2 size={16} />
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TestimonialsAdmin;
