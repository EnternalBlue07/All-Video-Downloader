import React, { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, Check, Trash2, ArrowUpRight, Cpu, Layers } from 'lucide-react';
import { api } from '../api';

export const StorageView: React.FC = () => {
  const [storageData, setStorageData] = useState<any>(null);
  const [cleanedItems, setCleanedItems] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<any>(null);

  useEffect(() => {
    api.getStorage().then(setStorageData).catch(console.error);
  }, []);

  const handleExecuteCleanup = (candidate: any) => {
    setConfirmDialog(candidate);
  };

  const confirmCleanup = () => {
    if (confirmDialog) {
      setCleanedItems(prev => [...prev, confirmDialog.id]);
      setConfirmDialog(null);
    }
  };

  if (!storageData) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span className="status-dot" /> Calculating storage telemetry & duplicate media footprints...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
          STORAGE INTELLIGENCE & DISK RECLAMATION
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Media Storage
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Inspect disk allocation, identify identical Media DNA duplicates, and transcode oversized streams.
        </p>
      </div>

      {/* Main Stats Card */}
      <div className="technical-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TOTAL DISK FOOTPRINT
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', marginTop: '2px' }}>
              {storageData.total_used_gb} GB <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>used</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', textTransform: 'uppercase' }}>
              POTENTIAL SAVINGS
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
              {storageData.potential_savings}
            </div>
          </div>
        </div>

        {/* Visual Storage Bar */}
        <div style={{ width: '100%', height: '10px', background: 'var(--surface-secondary)', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginBottom: '20px' }}>
          <div style={{ width: '75%', height: '100%', background: 'var(--accent-lime)' }} title="Videos" />
          <div style={{ width: '12%', height: '100%', background: '#3A82F6' }} title="Audio" />
          <div style={{ width: '5%', height: '100%', background: '#10B981' }} title="Clips" />
          <div style={{ width: '4%', height: '100%', background: '#F59E0B' }} title="Subtitles" />
          <div style={{ width: '4%', height: '100%', background: '#8B5CF6' }} title="Metadata" />
        </div>

        {/* Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-lime)' }} /> Videos
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {storageData.breakdown.videos}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3A82F6' }} /> Audio
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {storageData.breakdown.audio}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10B981' }} /> Clips
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {storageData.breakdown.clips}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#F59E0B' }} /> Subtitles
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {storageData.breakdown.subtitles}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8B5CF6' }} /> Metadata & DNA
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {storageData.breakdown.metadata}
            </div>
          </div>
        </div>
      </div>

      {/* Stored Physical Files on Disk */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            PHYSICAL MEDIA ON LOCAL STORAGE ({storageData.file_count || storageData.stored_files?.length || 0})
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
            PATH: {storageData.storage_path || 'downloads/'}
          </div>
        </div>

        {storageData.stored_files && storageData.stored_files.length > 0 ? (
          storageData.stored_files.map((file: any, idx: number) => (
            <div
              key={idx}
              className="technical-card"
              style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HardDrive size={18} color="var(--accent-lime)" />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {file.path}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="font-mono" style={{ fontSize: '13px', color: 'var(--accent-lime)', fontWeight: 600 }}>
                  {file.size_mb} MB
                </span>
                <span className="stage-pill active" style={{ fontSize: '10px' }}>
                  ON DISK
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="technical-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No physical video files downloaded yet. Paste a URL on Overview or click "Download to Storage".
          </div>
        )}
      </div>

      {/* Recommendations & Cleanup Candidates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          STORAGE OPTIMIZATION RECOMMENDATIONS (USER CONFIRMATION REQUIRED)
        </div>

        {storageData.cleanup_candidates?.map((cand: any, idx: number) => {
          const isDone = cleanedItems.includes(cand.id);
          return (
            <div
              key={idx}
              className="technical-card"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} color="var(--warning-color)" />
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cand.title}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {cand.reason || 'Duplicate audio/video stream identified by Media DNA hash'} • Potential savings: <span style={{ color: 'var(--accent-lime)' }}>{cand.savings_potential}</span>
                </div>
              </div>

              {isDone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-lime)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <Check size={14} /> RECLAIMED
                </div>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => handleExecuteCleanup(cand)}
                  style={{ gap: '6px', fontSize: '11.5px' }}
                >
                  <Trash2 size={13} /> Reclaim Space
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="command-overlay" onClick={() => setConfirmDialog(null)}>
          <div className="command-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Confirm Disk Reclamation
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to reclaim <strong>{confirmDialog.savings_potential}</strong> by purging duplicate media streams for "{confirmDialog.title}"? Your indexed transcripts will remain preserved in the knowledge base.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => setConfirmDialog(null)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={confirmCleanup}>
                  Confirm & Purge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
