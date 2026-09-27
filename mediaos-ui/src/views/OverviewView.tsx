import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, Cpu, Film, Clock, CheckCircle2, ChevronRight, Pause, Layers } from 'lucide-react';
import { IngestJob, MediaItem } from '../api';

interface OverviewViewProps {
  activeJobs: IngestJob[];
  recentMedia: MediaItem[];
  onInspectUrl: (url: string) => void;
  onDirectIngest: (url: string) => Promise<void>;
  onSelectMedia: (id: string) => void;
  onNavigateToView: (view: string) => void;
  onOpenGuide?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  activeJobs,
  recentMedia,
  onInspectUrl,
  onDirectIngest,
  onSelectMedia,
  onNavigateToView,
  onOpenGuide
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isIngestingDirectly, setIsIngestingDirectly] = useState(false);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isIngestingDirectly) return;
    
    // Default action on submit: direct save to library for immediate playback and storage
    setIsIngestingDirectly(true);
    try {
      await onDirectIngest(inputVal.trim());
      setInputVal('');
    } finally {
      setIsIngestingDirectly(false);
    }
  };

  const handleInspectClick = () => {
    if (!inputVal.trim() || isIngestingDirectly) return;
    onInspectUrl(inputVal.trim());
  };

  const samplePrompts = [
    { label: '⚡ Vichaar - UNDERDOG SHIT (Official Video)', val: 'https://youtu.be/v-r0YAtcpVU?si=0P0EGXfqgHSyEtmY' },
    { label: '⚡ Never Gonna Give You Up (4K Master)', val: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Search transcripts across library', action: 'transcripts' },
    { label: 'Ask AI intelligence core', action: 'intelligence' },
    { label: 'Create clips & shorts from media', action: 'clips' }
  ];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Editorial Welcome Header */}
      <div>
        <div style={{ fontSize: '13px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginBottom: '4px' }}>
          WORKSPACE // OPERATIONAL
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Good evening, Mohammad.
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Your media workspace is ready. yt-dlp & FFmpeg 8.1 are synchronized.
        </p>
      </div>

      {/* Interactive Video Tour Banner */}
      <div
        onClick={onOpenGuide}
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 25px rgba(168, 85, 247, 0.1)',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
            }}
          >
            <Play size={20} fill="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                New to MEDIAOS? Watch the Interactive System Guide
              </span>
              <span style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                HD ANIMATED
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              See how URL ingestion, Media DNA fingerprinting, Provenance grounding, and Clip Studio work together in 2 minutes.
            </p>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '12px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
          }}
        >
          <span>Launch Video Tour</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Primary Command Area */}
      <div className="technical-card" style={{ padding: '20px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            MEDIA INGESTION & PIPELINE ENGINE
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
            DIRECT LIBRARY STORAGE + CODEC PROBE
          </div>
        </div>

        <form onSubmit={handleCommandSubmit}>
          <div className="media-input-bar">
            <Sparkles size={18} color="var(--accent-lime)" />
            <input
              type="text"
              className="media-input-field"
              placeholder="Paste any YouTube or web media URL to store and analyze..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isIngestingDirectly}
            />
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleInspectClick}
                disabled={isIngestingDirectly || !inputVal.trim()}
                title="Inspect stream codecs, bitrates and format matrix"
              >
                Inspect Codecs
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '12px', gap: '6px', fontWeight: 600 }}
                disabled={isIngestingDirectly || !inputVal.trim()}
              >
                {isIngestingDirectly ? (
                  <>
                    <span className="status-dot" /> Downloading to Storage...
                  </>
                ) : (
                  <>
                    ⬇️ Download to Storage <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>📁 LOCAL STORAGE TARGET: downloads/ (Physical MP4 on Disk)</span>
            <span style={{ color: 'var(--accent-lime)' }}>✓ Real Video Download Active</span>
          </div>
        </form>

        {/* Suggestion Prompts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              style={{ fontSize: '11.5px', padding: '4px 10px', color: 'var(--text-secondary)' }}
              onClick={() => {
                if (p.action) {
                  onNavigateToView(p.action);
                } else if (p.val) {
                  setInputVal(p.val);
                  onDirectIngest(p.val);
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Processing Live Rows */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            ACTIVE PROCESSING ({activeJobs.length})
          </div>
          {activeJobs.length > 0 && (
            <button
              className="btn-ghost"
              style={{ fontSize: '11.5px', padding: '2px 8px' }}
              onClick={() => onNavigateToView('downloads')}
            >
              View Full Queue <ChevronRight size={13} />
            </button>
          )}
        </div>

        {activeJobs.length === 0 ? (
          <div style={{ background: 'var(--surface-primary)', border: '1px dashed var(--border-color)', borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No active downloads or transcode jobs currently queued.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeJobs.map(job => (
              <div
                key={job.id}
                className="technical-card"
                style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="status-dot" />
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {job.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-lime)' }}>
                      {job.progress.toFixed(1)}%
                    </span>
                    <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }}>
                      Details
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '4px', background: 'var(--surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${job.progress}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-lime)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Stage: {job.stage} • {job.quality || '1080p'} • {job.size || '2.4 GB'}
                  </span>
                  <span>
                    Speed: {job.speed || '38 MB/s'} • ETA: {job.eta || '00:15'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Intelligence Editorial Rows */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            RECENT INTELLIGENCE & INDEXED MEDIA
          </div>
          <button
            className="btn-ghost"
            style={{ fontSize: '11.5px', padding: '2px 8px' }}
            onClick={() => onNavigateToView('library')}
          >
            All Media <ChevronRight size={13} />
          </button>
        </div>

        <div className="technical-card">
          {recentMedia.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => onSelectMedia(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: idx < recentMedia.length - 1 ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, paddingRight: '16px' }}>
                <div style={{ width: '48px', height: '32px', borderRadius: '3px', background: '#1c2025', overflow: 'hidden', flexShrink: 0 }}>
                  {m.thumbnail ? (
                    <img src={m.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={14} color="var(--text-muted)" />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {m.creator} • {Math.floor(m.duration / 60)}m • {m.resolution}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {m.topics?.slice(0, 2).map((t, tidx) => (
                  <span key={tidx} className="stage-pill passed" style={{ fontSize: '10px' }}>
                    {t}
                  </span>
                ))}
                <span className="stage-pill active" style={{ fontSize: '10px' }}>
                  INDEXED
                </span>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
