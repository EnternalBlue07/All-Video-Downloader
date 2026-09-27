import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldAlert, Cpu, Film, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { InspectResult, api } from '../api';

interface MediaInspectorModalProps {
  inspectData: InspectResult | null;
  isLoading: boolean;
  onClose: () => void;
  onProcessStarted: (jobId: string) => void;
}

export const MediaInspectorModal: React.FC<MediaInspectorModalProps> = ({
  inspectData,
  isLoading,
  onClose,
  onProcessStarted
}) => {
  const [selectedFormatId, setSelectedFormatId] = useState<string>('');
  const [selectedContainer, setSelectedContainer] = useState('MP4');
  const [selectedAudio, setSelectedAudio] = useState('opus');
  const [selectedSubtitles, setSelectedSubtitles] = useState('en');
  const [sponsorBlock, setSponsorBlock] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamSort, setStreamSort] = useState<'res_desc' | 'bitrate_desc'>('res_desc');

  if (!inspectData && !isLoading) return null;

  const currentFormats = inspectData?.formats || [];
  const selectedFormat = currentFormats.find(f => f.format_id === selectedFormatId) || currentFormats[0];

  const handleStartProcessing = async (downloadOnly: boolean = false) => {
    if (!inspectData || !inspectData.url) return;
    setIsSubmitting(true);
    try {
      const res = await api.processMedia({
        url: inspectData.url,
        title: inspectData.title || 'Untitled Media',
        creator: inspectData.creator || 'Unknown Creator',
        thumbnail: inspectData.thumbnail || '',
        quality: selectedFormat ? selectedFormat.label : '1080p',
        container: selectedContainer,
        audio: selectedAudio,
        subtitles: selectedSubtitles,
        sponsorblock: sponsorBlock,
        ai_analysis: !downloadOnly && aiAnalysis,
        duration: inspectData.duration || 300
      });
      if (res.job_id) {
        onProcessStarted(res.job_id);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="command-overlay" onClick={onClose}>
      <div
        className="command-modal"
        style={{ width: '820px', maxWidth: '94vw' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-lime)" />
            <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
              MEDIA PROFILE INSPECTOR // YT-DLP CORE
            </span>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              <span className="status-dot" /> Resolving source manifest & codec matrix...
            </div>
            <p style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Executing yt-dlp probe across adaptive AV1/VP9 video and Opus audio payloads
            </p>
          </div>
        )}

        {/* Error State */}
        {inspectData && !inspectData.success && inspectData.error && (
          <div style={{ padding: '24px' }}>
            <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger-color)', fontWeight: 600, fontSize: '13.5px', fontFamily: 'var(--font-mono)' }}>
                <ShieldAlert size={18} />
                {inspectData.error.title}
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <strong>Reason:</strong> {inspectData.error.reason}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <strong>Suggested Action:</strong> {inspectData.error.suggested_action}
              </div>
              <div style={{ marginTop: '14px', background: 'var(--surface-primary)', padding: '10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', overflowX: 'auto' }}>
                Technical Details: {inspectData.error.raw_details}
              </div>
            </div>
            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={onClose}>Dismiss</button>
            </div>
          </div>
        )}

        {/* Successful Inspection View */}
        {inspectData && inspectData.success && (
          <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Duplicate Warning */}
            {inspectData.duplicate_warning && (
              <div style={{ background: 'rgba(255, 176, 32, 0.08)', border: '1px solid var(--warning-color)', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={18} color="var(--warning-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning-color)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>DUPLICATE DETECTED</span>
                    <span className="stage-pill active" style={{ fontSize: '9px', background: 'var(--warning-color)', color: '#08090B' }}>
                      MATCH CONFIDENCE: {inspectData.duplicate_warning.confidence}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {inspectData.duplicate_warning.message} Existing version in library: <strong>{inspectData.duplicate_warning.resolution}</strong> ({Math.round(inspectData.duplicate_warning.duration / 60)}m).
                  </div>
                </div>
              </div>
            )}

            {/* Media Profile Metadata Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px' }}>
              <div style={{ height: '90px', borderRadius: '4px', overflow: 'hidden', background: '#1c2025' }}>
                {inspectData.thumbnail ? (
                  <img src={inspectData.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Film size={24} color="var(--text-muted)" />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {inspectData.title}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {inspectData.creator}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <span>DURATION: {Math.floor((inspectData.duration || 0) / 60)}m {(inspectData.duration || 0) % 60}s</span>
                  <span>•</span>
                  <span>UPLOAD DATE: {inspectData.upload_date}</span>
                  <span>•</span>
                  <span>SOURCE: YOUTUBE</span>
                </div>
              </div>
            </div>

            {/* Technical Stream Resources */}
            <div className="technical-card">
              <div className="technical-card-header">
                <span className="technical-card-title">
                  <SlidersHorizontal size={13} /> VIDEO STREAM MATRIX
                </span>
                <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  SELECT TECHNICAL RESOURCE
                </span>
              </div>

              {/* Streams Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>
                      <th style={{ padding: '8px 12px' }}>TARGET</th>
                      <th style={{ padding: '8px 12px' }}>RESOLUTION</th>
                      <th style={{ padding: '8px 12px' }}>CODEC</th>
                      <th style={{ padding: '8px 12px' }}>FPS</th>
                      <th style={{ padding: '8px 12px' }}>HDR</th>
                      <th style={{ padding: '8px 12px' }}>BITRATE</th>
                      <th style={{ padding: '8px 12px' }}>EST. SIZE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFormats.map((f, idx) => {
                      const isSelected = selectedFormat?.format_id === f.format_id;
                      return (
                        <tr
                          key={f.format_id || idx}
                          onClick={() => setSelectedFormatId(f.format_id)}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--accent-lime-dim)' : 'transparent',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="radio"
                              name="formatSelect"
                              checked={isSelected}
                              onChange={() => setSelectedFormatId(f.format_id)}
                              style={{ accentColor: 'var(--accent-lime)' }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: isSelected ? 600 : 400 }}>{f.label}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--accent-lime)' : 'inherit' }}>{f.codec}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{f.fps}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{f.hdr}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{f.bitrate}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{f.estimated_size}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audio, Subtitles & Container Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              {/* Audio Stream Selection */}
              <div className="technical-card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  AUDIO PROFILE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inspectData.audio_options?.map(a => (
                    <label
                      key={a.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: selectedAudio === a.id ? 'var(--surface-hover)' : 'transparent',
                        border: selectedAudio === a.id ? '1px solid var(--accent-lime)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => setSelectedAudio(a.id)}
                    >
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.channels} • {a.bitrate}</div>
                      </div>
                      {a.recommended && (
                        <span className="stage-pill active" style={{ fontSize: '9px' }}>RECOMMENDED</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Subtitles & Container */}
              <div className="technical-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    SUBTITLE STREAM
                  </div>
                  <select
                    value={selectedSubtitles}
                    onChange={e => setSelectedSubtitles(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }}
                  >
                    {inspectData.subtitles?.map(s => (
                      <option key={s.code} value={s.code}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    CONTAINER FORMAT
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['MP4', 'MKV', 'WEBM'].map(c => (
                      <button
                        key={c}
                        type="button"
                        className={selectedContainer === c ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => setSelectedContainer(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ingestion Options Bar */}
            <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={sponsorBlock}
                    onChange={e => setSponsorBlock(e.target.checked)}
                    style={{ accentColor: 'var(--accent-lime)' }}
                  />
                  <span>SponsorBlock Filters</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={aiAnalysis}
                    onChange={e => setAiAnalysis(e.target.checked)}
                    style={{ accentColor: 'var(--accent-lime)' }}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} color="var(--accent-lime)" /> Neural Understanding & Semantic Indexing
                  </span>
                </label>
              </div>

              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-lime)' }}>
                PAYLOAD: {selectedFormat?.estimated_size || '1.2 GB'}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleStartProcessing(true)}
                  disabled={isSubmitting}
                >
                  Download Only
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleStartProcessing(false)}
                  disabled={isSubmitting}
                  style={{ gap: '8px' }}
                >
                  <Sparkles size={14} />
                  {isSubmitting ? 'INITIATING ENGINE...' : 'PROCESS MEDIA'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
