import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { DatabaseBackup, RefreshCw, Clock, HardDrive, CheckCircle2, Loader2, FileJson } from 'lucide-react';
import { BACKEND_URL, authHeaders, btnPrimary, AdminShell } from './_adminShared';

const API = `${BACKEND_URL}/api`;

const fmtSize = (b) => {
  if (!b && b !== 0) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

export default function BackupsAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/admin/backups`, { headers: authHeaders() });
      setData(r.data);
    } catch {
      toast.error('Backups konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runNow = async () => {
    setRunning(true);
    try {
      const r = await axios.post(`${API}/admin/backups/run`, {}, { headers: authHeaders() });
      const cols = Object.values(r.data?.collections || {}).reduce((a, b) => a + b, 0);
      toast.success(`Backup erstellt · ${fmtSize(r.data?.size_bytes)} · ${cols} Datensätze`);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Backup fehlgeschlagen');
    } finally {
      setRunning(false);
    }
  };

  const last = data?.last_backup;

  return (
    <AdminShell
      title="Backups"
      subtitle="Automatische tägliche Datensicherung — inkl. Tools & Berater. Jederzeit manuell auslösbar."
      actions={
        <button onClick={runNow} disabled={running} style={btnPrimary} data-testid="btn-run-backup">
          {running ? <Loader2 size={15} className="spin" /> : <DatabaseBackup size={15} />}
          {running ? 'Sichere …' : 'Jetzt sichern'}
        </button>
      }
    >
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={22} className="spin" /> Lade …
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} data-testid="backups-admin">
          {/* Status cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Card icon={<Clock size={18} />} label="Letztes Backup"
              value={fmtDate(last?.modified_at)} testid="stat-last-backup" />
            <Card icon={<CheckCircle2 size={18} />} label="Zeitplan"
              value={data?.schedule || '—'} testid="stat-schedule" />
            <Card icon={<HardDrive size={18} />} label="Gespeicherte Backups"
              value={`${data?.count || 0} Dateien · ${fmtSize(data?.total_size_bytes)}`} testid="stat-count" />
          </div>

          {/* File list */}
          <div style={{
            background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #1f1f1f',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#FF6B00',
              textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <FileJson size={15} /> Backup-Dateien ({data?.count || 0})
            </div>
            {(data?.backups || []).length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Noch keine Backups vorhanden. Klicke „Jetzt sichern".
              </div>
            ) : (
              (data?.backups || []).map((f, i) => (
                <div key={f.name} data-testid={`backup-row-${i}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '14px 18px', borderBottom: i < data.backups.length - 1 ? '1px solid #161616' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(255,107,0,0.10)', color: '#FF6B00',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileJson size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}{i === 0 && <span style={{ marginLeft: 8, fontSize: 10, color: '#22c55e', fontWeight: 700 }}>NEUESTE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(f.modified_at)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{fmtSize(f.size_bytes)}</div>
                </div>
              ))
            )}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Speicherort: {data?.location}. Backups laufen automatisch täglich — eigene Tools werden bei einem Datenverlust automatisch aus dem neuesten Backup wiederhergestellt.
          </p>
        </div>
      )}
    </AdminShell>
  );
}

const Card = ({ icon, label, value, testid }) => (
  <div data-testid={testid} style={{
    background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 14, padding: 20,
    display: 'flex', flexDirection: 'column', gap: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF6B00' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
    </div>
    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{value}</div>
  </div>
);
