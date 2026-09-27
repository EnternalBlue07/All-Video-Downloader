import React from 'react';
import { DownloadCloud, Play, StopCircle, RefreshCw, Film, ExternalLink, Cpu } from 'lucide-react';
import { IngestJob, api } from '../api';

interface DownloadCenterViewProps {
  jobs: IngestJob[];
  onInspectUrl: () => void;
  onOpenMedia: (mediaId: string) => void;
  onRefresh: () => void;
}

export const DownloadCenterView: React.FC<DownloadCenterViewProps> = ({
  jobs,
  onInspectUrl,
  onOpenMedia,
  onRefresh
}) => {
  const stages = [
    'resolving',
    'extracting',
    'downloading',
    'merging',
    'processing',
    'transcribing',
    'analyzing',
    'indexing',
    'completed'
  ];

  const handleCancel = async (jobId: string) => {
    try {
      await api.cancelJob(jobId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* OS Process Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
            DAEMON PROCESS MANAGER // FFMPEG & YT-DLP
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Active Operations & Ingestion Queue
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Continuous asynchronous worker pools executing network stream pulls, SVT-AV1 transcoding, Whisper speech extraction, and vector indexing.
          </p>
        </div>

        <button className="btn-primary" onClick={onInspectUrl} style={{ gap: '6px' }}>
          <DownloadCloud size={14} /> Ingest Media URL
        </button>
      </div>

      {/* Operational Table */}
      <div className="technical-card">
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          <span>ACTIVE PROCESS POOL ({jobs.length} JOBS)</span>
          <span>DISPATCHER: LOCALHOST:8000 // 4 DEDICATED WORKERS</span>
        </div>

        {jobs.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active jobs in queue. Paste a URL or playlist to initiate an operational ingestion job.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {jobs.map((job, idx) => {
              const stageLower = job.stage.toLowerCase();
              const isCompleted = stageLower === 'completed' || stageLower === 'indexed';
              const isFailed = stageLower === 'failed';
              const isCancelled = stageLower === 'cancelled';
              const currentStageIndex = stages.indexOf(stageLower);

              return (
                <div
                  key={job.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < jobs.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: isCompleted ? 'transparent' : 'var(--surface-hover)'
                  }}
                >
                  {/* Process Metrics Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, paddingRight: '16px' }}>
                      <div style={{ width: '48px', height: '32px', borderRadius: '3px', background: '#1c2025', overflow: 'hidden', flexShrink: 0 }}>
                        {job.thumbnail ? (
                          <img src={job.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Film size={14} color="var(--text-muted)" />
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>PID: {job.id}</span>
                          <span>•</span>
                          <span>SOURCE: {job.source}</span>
                          <span>•</span>
                          <span>WORKER: {job.worker || 'worker-svt01'}</span>
                          <span>•</span>
                          <span>TARGET: {job.quality || '1080p'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isCompleted ? (
                        <button
                          className="btn-primary"
                          style={{ padding: '4px 12px', fontSize: '11px' }}
                          onClick={() => onOpenMedia(job.media_id)}
                        >
                          <Play size={11} /> Open Media
                        </button>
                      ) : isFailed ? (
                        <span style={{ fontSize: '11px', color: 'var(--danger-color)', fontFamily: 'var(--font-mono)' }}>
                          FAILED: {job.error_message || 'Access error'}
                        </span>
                      ) : isCancelled ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          CANCELLED BY USER
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="font-mono" style={{ fontSize: '13px', color: 'var(--accent-lime)' }}>
                            {job.progress.toFixed(0)}%
                          </span>
                          <button
                            className="btn-secondary"
                            onClick={() => handleCancel(job.id)}
                            style={{ padding: '3px 8px', fontSize: '11px', gap: '4px' }}
                            title="Cancel Process"
                          >
                            <StopCircle size={12} color="var(--danger-color)" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* One Continuous Visual Progress Pipeline */}
                  <div className="pipeline-stages" style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: '4px' }}>
                    {stages.map((st, sidx) => {
                      const isActive = stageLower === st;
                      const isPassed = currentStageIndex > sidx || isCompleted;
                      return (
                        <div
                          key={st}
                          style={{
                            padding: '4px 6px',
                            textAlign: 'center',
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono)',
                            borderRadius: '2px',
                            background: isActive ? 'var(--accent-lime-dim)' : isPassed ? 'var(--surface-secondary)' : 'var(--surface-primary)',
                            color: isActive ? 'var(--accent-lime)' : isPassed ? 'var(--text-secondary)' : 'var(--text-muted)',
                            border: isActive ? '1px solid var(--accent-lime)' : '1px solid var(--border-color)',
                            textTransform: 'uppercase'
                          }}
                        >
                          {st}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Line */}
                  <div style={{ width: '100%', height: '3px', background: 'var(--surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: isCompleted ? '100%' : `${job.progress}%`,
                        height: '100%',
                        backgroundColor: isFailed ? 'var(--danger-color)' : isCancelled ? 'var(--text-muted)' : 'var(--accent-lime)',
                        transition: 'width 0.25s ease'
                      }}
                    />
                  </div>

                  {/* Telemetry info row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>
                      {isCompleted ? 'INDEXED // Vector embeddings & transcript generated' : `PAYLOAD SIZE: ${job.size || '580 MB'}`}
                    </span>
                    {!isCompleted && !isFailed && !isCancelled && (
                      <span>THROUGHPUT: {job.speed || '34 MB/s'} • TIME REMAINING: {job.eta || '00:10'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
