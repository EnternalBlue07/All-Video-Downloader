import React, { useState, useEffect } from 'react';
import { 
  Scissors, Sparkles, Smartphone, Monitor, Square, Check, Play, 
  Download, Sliders, Layers, Trash2, Video, Flame, Loader2, ArrowRight
} from 'lucide-react';
import { MediaItem, api } from '../api';

interface ClipStudioViewProps {
  mediaItems: MediaItem[];
  preselectedMediaId?: string;
  onClipCreated: () => void;
}

interface RenderedClip {
  id: string;
  media_id: string;
  media_title: string;
  title: string;
  start_time: number;
  end_time: number;
  aspect_ratio: string;
  captions_enabled: number;
  status: string;
  created_at: string;
  file_path: string;
  file_size: number;
  stream_url: string;
  download_url: string;
}

export const ClipStudioView: React.FC<ClipStudioViewProps> = ({
  mediaItems,
  preselectedMediaId,
  onClipCreated
}) => {
  const [selectedMediaId, setSelectedMediaId] = useState(preselectedMediaId || (mediaItems[0]?.id || ''));
  const [prompt, setPrompt] = useState('Find the best viral 30-second moments explaining core architecture.');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [speakerCentering, setSpeakerCentering] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingCandidateId, setExportingCandidateId] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Rendered clips state
  const [renderedClips, setRenderedClips] = useState<RenderedClip[]>([]);
  const [activeClip, setActiveClip] = useState<RenderedClip | null>(null);
  const [isLoadingClips, setIsLoadingClips] = useState(false);

  const currentMedia = mediaItems.find(m => m.id === selectedMediaId) || mediaItems[0];

  // Fetch rendered clips from backend
  const loadClips = async () => {
    setIsLoadingClips(true);
    try {
      const data = await api.listClips();
      if (Array.isArray(data)) {
        setRenderedClips(data);
        if (data.length > 0 && !activeClip) {
          // Default to most recent clip for current media if available, or first
          const match = data.find((c: RenderedClip) => c.media_id === currentMedia?.id);
          setActiveClip(match || data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load clips:', err);
    } finally {
      setIsLoadingClips(false);
    }
  };

  useEffect(() => {
    loadClips();
  }, [currentMedia?.id]);

  const handleExportClip = async (candidate: any, overrideAspect?: '9:16' | '16:9' | '1:1') => {
    if (!currentMedia) return;
    const targetAspect = overrideAspect || aspectRatio;
    setIsExporting(true);
    setExportingCandidateId(candidate.id || candidate.title);

    try {
      const res = await api.createClip({
        media_id: currentMedia.id,
        media_title: currentMedia.title,
        title: candidate.title,
        start_time: candidate.start_time,
        end_time: candidate.end_time,
        aspect_ratio: targetAspect,
        captions_enabled: captionsEnabled
      });

      if (res && res.success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
        // Refresh clips list immediately
        const updatedClips = await api.listClips();
        if (Array.isArray(updatedClips)) {
          setRenderedClips(updatedClips);
          // Set newly created clip as active preview
          const newest = updatedClips.find((c: RenderedClip) => c.id === res.clip_id);
          if (newest) {
            setActiveClip(newest);
          }
        }
        onClipCreated();
      }
    } catch (err) {
      console.error('Error creating clip:', err);
    } finally {
      setIsExporting(false);
      setExportingCandidateId(null);
    }
  };

  const handleAutoClipCraziest = () => {
    if (!currentMedia?.clip_candidates?.length) return;
    // Pick the candidate with highest retention or #1
    const craziest = currentMedia.clip_candidates[0];
    handleExportClip(craziest, '9:16');
  };

  const handleDeleteClip = async (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this rendered clip?')) return;
    try {
      await api.deleteClip(clipId);
      setRenderedClips(prev => prev.filter(c => c.id !== clipId));
      if (activeClip?.id === clipId) {
        setActiveClip(null);
      }
    } catch (err) {
      console.error('Error deleting clip:', err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
            AI HIGHLIGHT EXTRACTOR & FORMAT COMPILER
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI Clip Studio
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Automatically extract viral highlights, compile 9:16 Shorts/Reels with FFmpeg, and download MP4s instantly.
          </p>
        </div>

        {currentMedia?.clip_candidates && currentMedia.clip_candidates.length > 0 && (
          <button
            onClick={handleAutoClipCraziest}
            disabled={isExporting}
            className="btn-primary"
            style={{ 
              padding: '10px 16px', 
              fontSize: '13px', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              background: 'var(--accent-lime)',
              color: '#08090b',
              boxShadow: '0 0 20px rgba(184, 255, 107, 0.25)'
            }}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} color="#e53e3e" />}
            <span>⚡ Auto-Clip Craziest Part (9:16)</span>
          </button>
        )}
      </div>

      {/* Target Selector & Prompt */}
      <div className="technical-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              SOURCE MEDIA ASSET:
            </label>
            <select
              value={selectedMediaId}
              onChange={e => setSelectedMediaId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12.5px', color: 'var(--text-primary)' }}
            >
              {mediaItems.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              EXTRACTION OBJECTIVE:
            </label>
            <div className="media-input-bar" style={{ padding: '6px 12px' }}>
              <Sparkles size={15} color="var(--accent-lime)" />
              <input
                type="text"
                className="media-input-field"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{ fontSize: '12.5px' }}
                placeholder="e.g. Find viral hooks, punchlines, core thesis..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {exportSuccess && (
        <div style={{ 
          background: 'rgba(184, 255, 107, 0.12)', 
          border: '1px solid var(--accent-lime)', 
          borderRadius: '6px', 
          padding: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: 'var(--accent-lime)', 
          fontSize: '13px', 
          fontFamily: 'var(--font-mono)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> 
            <span>Clip compiled successfully with FFmpeg! Ready for instant download below.</span>
          </div>
          {activeClip && (
            <a 
              href={activeClip.download_url} 
              download 
              className="btn-primary" 
              style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--accent-lime)', color: '#000', textDecoration: 'none' }}
            >
              ⬇️ Download {activeClip.title} Now
            </a>
          )}
        </div>
      )}

      {/* SECTION: RENDERED CLIPS READY FOR DOWNLOAD */}
      {renderedClips.length > 0 && (
        <div className="technical-card" style={{ padding: '18px', background: 'rgba(18, 22, 28, 0.7)', border: '1px solid rgba(184, 255, 107, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--accent-lime)' }}>⚡</span>
              <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rendered Clips Ready For Download ({renderedClips.length})
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
              PHYSICAL FFmpeg OUTPUTS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {renderedClips.map((clip) => {
              const isCurrentActive = activeClip?.id === clip.id;
              const aspect = clip.aspect_ratio || '9:16';

              return (
                <div 
                  key={clip.id}
                  onClick={() => setActiveClip(clip)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: isCurrentActive ? 'rgba(184, 255, 107, 0.08)' : 'var(--surface-secondary)',
                    border: isCurrentActive ? '1px solid var(--accent-lime)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="stage-pill active" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {aspect} {aspect === '9:16' ? 'REEL' : (aspect === '16:9' ? 'WIDE' : 'SQUARE')}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {formatBytes(clip.file_size)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteClip(clip.id, e)}
                      title="Delete Clip"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#e53e3e')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {clip.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      Source: {clip.media_title ? clip.media_title.slice(0, 35) + '...' : 'Video Asset'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveClip(clip);
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Play size={11} /> Preview
                    </button>

                    <a
                      href={clip.download_url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="btn-primary"
                      style={{
                        padding: '5px 12px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'var(--accent-lime)',
                        color: '#08090b',
                        fontWeight: 600,
                        textDecoration: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      <Download size={12} /> Download MP4
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Studio Workspace: Candidates (Left) & Live Preview (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        {/* Candidates List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CANDIDATE VIRAL SEGMENTS IDENTIFIED ({currentMedia?.clip_candidates?.length || 0})
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
              RANKED BY RETENTION
            </span>
          </div>

          {currentMedia?.clip_candidates && currentMedia.clip_candidates.length > 0 ? (
            currentMedia.clip_candidates.map((cand, idx) => {
              const isThisExporting = isExporting && exportingCandidateId === (cand.id || cand.title);
              const isFirst = idx === 0;

              return (
                <div
                  key={cand.id || idx}
                  className="technical-card"
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    borderColor: isFirst ? 'rgba(184, 255, 107, 0.4)' : undefined,
                    background: isFirst ? 'rgba(184, 255, 107, 0.02)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="stage-pill active" style={{ fontSize: '10px', background: isFirst ? 'var(--accent-lime)' : undefined, color: isFirst ? '#000' : undefined }}>
                        {isFirst ? '🔥 BEST MOMENT #1' : `CANDIDATE #${idx + 1}`}
                      </span>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {Math.floor(cand.start_time / 60)}:{(cand.start_time % 60).toString().padStart(2, '0')} → {Math.floor(cand.end_time / 60)}:{(cand.end_time % 60).toString().padStart(2, '0')} ({cand.duration}s)
                      </span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '11px', color: isFirst ? 'var(--accent-lime)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={12} color={isFirst ? '#e53e3e' : 'var(--accent-lime)'} /> {98 - idx * 4}/100 VIRAL SCORE
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cand.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Retention Rationale:</strong> {cand.why}
                    </p>
                    {cand.hook && (
                      <p style={{ fontSize: '12px', color: 'var(--accent-lime)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        Hook Quote: "{cand.hook}"
                      </p>
                    )}
                  </div>

                  {isThisExporting ? (
                    <div style={{ padding: '8px 12px', background: 'rgba(184, 255, 107, 0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                      <Loader2 size={14} className="animate-spin" />
                      <span>FFmpeg Compiling & Smart-Cropping to {aspectRatio}... Please wait (~4-8s)</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '11px' }}
                        disabled={isExporting}
                        onClick={() => handleExportClip(cand, '16:9')}
                      >
                        <Monitor size={11} /> 16:9 Wide
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '11px' }}
                        disabled={isExporting}
                        onClick={() => handleExportClip(cand, '1:1')}
                      >
                        <Square size={11} /> 1:1 Square
                      </button>
                      <button
                        className="btn-primary"
                        style={{ 
                          padding: '5px 14px', 
                          fontSize: '11px', 
                          gap: '5px',
                          background: 'var(--accent-lime)',
                          color: '#08090b',
                          fontWeight: 600
                        }}
                        disabled={isExporting}
                        onClick={() => handleExportClip(cand, '9:16')}
                      >
                        <Smartphone size={12} /> Render Reel (9:16) & Download
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="technical-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px' }}>No candidate segments generated yet for this media item.</p>
              <button 
                onClick={handleAutoClipCraziest}
                className="btn-primary" 
                style={{ marginTop: '12px', fontSize: '12px' }}
              >
                Scan & Generate Highlights
              </button>
            </div>
          )}
        </div>

        {/* Right Preview & Framing Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Rendered Clip Player (If Selected) */}
          {activeClip ? (
            <div className="technical-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', borderColor: 'var(--accent-lime)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={13} /> ACTIVE RENDERED CLIP
                </div>
                <span className="stage-pill active" style={{ fontSize: '10px' }}>
                  {activeClip.aspect_ratio}
                </span>
              </div>

              {/* Video Player */}
              <div style={{ background: '#000', borderRadius: '6px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                <video
                  key={activeClip.id}
                  controls
                  autoPlay
                  src={activeClip.stream_url}
                  style={{
                    maxHeight: activeClip.aspect_ratio === '9:16' ? '360px' : '220px',
                    width: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Clip Details */}
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeClip.title}
                </h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  <span>Size: {formatBytes(activeClip.file_size)}</span>
                  <span>•</span>
                  <span>Duration: {Math.round(activeClip.end_time - activeClip.start_time)}s</span>
                  <span>•</span>
                  <span>Status: READY</span>
                </div>
              </div>

              {/* DOWNLOAD BUTTON */}
              <a
                href={activeClip.download_url}
                download
                className="btn-primary"
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--accent-lime)',
                  color: '#08090b',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 4px 14px rgba(184, 255, 107, 0.3)'
                }}
              >
                <Download size={16} /> ⬇️ DOWNLOAD THIS CLIP (.MP4)
              </a>
            </div>
          ) : null}

          {/* Framing Preview Box */}
          <div className="technical-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                INTELLIGENT FRAMING PREVIEW
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                SPEAKER TRACKING ACTIVE
              </span>
            </div>

            {/* Aspect Ratio Selector */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: '9:16', label: '9:16 Reels', icon: Smartphone },
                { id: '16:9', label: '16:9 Wide', icon: Monitor },
                { id: '1:1', label: '1:1 Social', icon: Square }
              ].map(fmt => {
                const Icon = fmt.icon;
                const isSelected = aspectRatio === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setAspectRatio(fmt.id as any)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '4px',
                      background: isSelected ? 'var(--surface-hover)' : 'var(--surface-secondary)',
                      border: isSelected ? '1px solid var(--accent-lime)' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={14} color={isSelected ? 'var(--accent-lime)' : 'inherit'} />
                    <span>{fmt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mock Crop Preview Box */}
            <div style={{ display: 'flex', justifyContent: 'center', background: '#050607', borderRadius: '6px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  width: aspectRatio === '9:16' ? '180px' : (aspectRatio === '1:1' ? '220px' : '260px'),
                  height: aspectRatio === '9:16' ? '320px' : (aspectRatio === '1:1' ? '220px' : '146px'),
                  background: '#13161a',
                  border: '1px solid var(--accent-lime)',
                  borderRadius: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={currentMedia?.thumbnail}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.8
                  }}
                />

                {/* Dynamic speaker tracking grid line */}
                {speakerCentering && (
                  <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%, -50%)', border: '1px dashed var(--accent-lime)', width: '60px', height: '60px', borderRadius: '50%', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                      SPEAKER
                    </span>
                  </div>
                )}

                {/* Dynamic Captions Preview */}
                {captionsEnabled && (
                  <div style={{ position: 'absolute', bottom: '24px', left: '10px', right: '10px', background: 'rgba(8, 9, 11, 0.85)', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    "THE CRAZIEST VIRAL HIGHLIGHT..."
                  </div>
                )}
              </div>
            </div>

            {/* Neural Formatting Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={speakerCentering}
                  onChange={e => setSpeakerCentering(e.target.checked)}
                  style={{ accentColor: 'var(--accent-lime)' }}
                />
                <span>AI Face & Speaker Centering (Avoid Random Crop)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={captionsEnabled}
                  onChange={e => setCaptionsEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-lime)' }}
                />
                <span>Generate Kinetic Captions (Word-by-word highlight)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
