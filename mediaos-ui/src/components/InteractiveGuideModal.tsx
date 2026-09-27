import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Search,
  X,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Terminal,
  Cpu,
  Layers,
  Film
} from 'lucide-react';

interface InteractiveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: string) => void;
}

interface GuideChapter {
  id: string;
  title: string;
  subtitle: string;
  targetView: string;
  durationMs: number;
  badge: string;
  color: string;
  icon: React.ReactNode;
  terminalLogs: string[];
}

const CHAPTERS: GuideChapter[] = [
  {
    id: 'ingest',
    title: '1. Autonomous Ingestion Engine',
    subtitle: 'Stream negotiation, 4K resolution extraction & yt-dlp core pipeline',
    targetView: 'downloads',
    durationMs: 7000,
    badge: 'yt-dlp Core + FFmpeg 8.1',
    color: '#10b981',
    icon: <Cpu size={16} />,
    terminalLogs: [
      '[INGEST] Handshaking yt-dlp extractor with TLS spoofing...',
      '[STREAM] Resolved adaptive streams: 3840x2160@60fps (AV01) + 160kbps (Opus)',
      '[DOWNLOAD] High-speed multi-threaded chunks: 48.7 MB/s [82%]',
      '[OUTPUT_VERIFY] ffprobe stream integrity checked: 0 packet drops ✓'
    ]
  },
  {
    id: 'dna',
    title: '2. Media DNA & Provenance Engine',
    subtitle: 'Dual-vector cryptographic fingerprinting & frame-accurate millisecond grounding',
    targetView: 'library',
    durationMs: 8000,
    badge: 'Zero Hallucination Grounding',
    color: '#38bdf8',
    icon: <ShieldCheck size={16} />,
    terminalLogs: [
      '[DNA] Hashing cryptographic content payload: SHA-256 + 64-bit perceptual hash',
      '[ALIGN] Aligning transcript segments to canonical timeline [30.00 fps]',
      '[PROVENANCE] Grounding claim against source span [00:14:22.500 - 00:15:01.200]',
      '[VERIFY] Status: SOURCE_VERIFIED (Confidence: 96.8%) ✓'
    ]
  },
  {
    id: 'semantic',
    title: '3. Neural Transcript & FTS5 Search',
    subtitle: 'Full-text BM25 index across millions of spoken words with 1-click playback seek',
    targetView: 'transcripts',
    durationMs: 7000,
    badge: 'SQLite FTS5 + BM25 Radar',
    color: '#a855f7',
    icon: <Search size={16} />,
    terminalLogs: [
      '[FTS5] Query: "PostgreSQL B-tree index logarithmic scan"',
      '[BM25] Matched 8 segment clusters in 1.2ms (Rank: -14.82)',
      '[SYNAPSE] Slicing video cue offset at exactly 00:14:20.500',
      '[INTERACT] Direct seek ready for instant multi-track playback'
    ]
  },
  {
    id: 'clip',
    title: '4. Vertical Clip Studio (16:9 → 9:16)',
    subtitle: 'Subject-aware portrait cropping, kinetic subtitle burning & viral moment extraction',
    targetView: 'clip_studio',
    durationMs: 8000,
    badge: 'Shorts / TikTok / Reels AI',
    color: '#f59e0b',
    icon: <Film size={16} />,
    terminalLogs: [
      '[CROP] Saliency scan: tracking subject face bounding box [x: 540, y: 960]',
      '[REFRAME] Dynamic 9:16 portrait viewport smoothing applied',
      '[CAPTIONS] Burning animated karaoke subtitles with drop shadow',
      '[ENCODE] Generating viral short: 1080x1920@60fps NVENC H.264 ✓'
    ]
  },
  {
    id: 'export',
    title: '5. Universal Transcoder & Exporter',
    subtitle: 'On-the-fly cross-container transmuxing with RFC 6266/5987 Unicode headers',
    targetView: 'storage',
    durationMs: 6500,
    badge: 'RFC 6266 Compliant',
    color: '#ec4899',
    icon: <Layers size={16} />,
    terminalLogs: [
      '[TRANSCODE] Transmuxing container: MP4 / MKV / MP3 / FLAC / SRT',
      '[RFC_6266] Encoding Content-Disposition UTF-8 filename header',
      '[AUDIO] Dynamic normalizer & 320kbps MP3 resampler initialized',
      '[PACKAGE] Artifact sealed and ready for high-speed download'
    ]
  }
];

export const InteractiveGuideModal: React.FC<InteractiveGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressMs, setProgressMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 1.5 | 2>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentChapter = CHAPTERS[activeChapterIndex];

  // Sound Synth Generator for futuristic UI audio feedback
  const playSynthSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted or supported; silent fallback
    }
  }, [isMuted]);

  // Main Animation / Progress Timer Loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = 40; // 25 FPS update cycle
    const timer = setInterval(() => {
      setProgressMs(prev => {
        const next = prev + interval * playbackSpeed;
        if (next >= currentChapter.durationMs) {
          // Play transition chime
          playSynthSound(587.33, 0.2, 'triangle');
          if (activeChapterIndex < CHAPTERS.length - 1) {
            setActiveChapterIndex(i => i + 1);
            return 0;
          } else {
            setActiveChapterIndex(0);
            return 0;
          }
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, activeChapterIndex, currentChapter.durationMs, playbackSpeed, playSynthSound]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
        playSynthSound(440, 0.1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveChapterIndex(i => (i < CHAPTERS.length - 1 ? i + 1 : 0));
        setProgressMs(0);
        playSynthSound(659.25, 0.15);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveChapterIndex(i => (i > 0 ? i - 1 : CHAPTERS.length - 1));
        setProgressMs(0);
        playSynthSound(523.25, 0.15);
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(m => !m);
      } else if (e.key.toLowerCase() === 'f') {
        setIsFullscreen(f => !f);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, playSynthSound]);

  const chapterProgressPercent = Math.min(100, (progressMs / currentChapter.durationMs) * 100);

  const handleSelectChapter = (index: number) => {
    setActiveChapterIndex(index);
    setProgressMs(0);
    setIsPlaying(true);
    playSynthSound(659.25, 0.15, 'triangle');
  };

  const handleRestart = () => {
    setActiveChapterIndex(0);
    setProgressMs(0);
    setIsPlaying(true);
    playSynthSound(440, 0.2);
  };

  const handleNextChapter = () => {
    setActiveChapterIndex(i => (i < CHAPTERS.length - 1 ? i + 1 : 0));
    setProgressMs(0);
    playSynthSound(659.25, 0.15);
  };

  const handlePrevChapter = () => {
    setActiveChapterIndex(i => (i > 0 ? i - 1 : CHAPTERS.length - 1));
    setProgressMs(0);
    playSynthSound(523.25, 0.15);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 1300,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(5, 7, 10, 0.88)'
      }}
    >
      <div
        ref={modalContainerRef}
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: isFullscreen ? '98vw' : '1080px',
          width: '95%',
          height: isFullscreen ? '96vh' : 'auto',
          background: 'linear-gradient(160deg, #0a0d14 0%, #111622 50%, #0d1017 100%)',
          border: `1px solid ${currentChapter.color}40`,
          borderRadius: isFullscreen ? '12px' : '22px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 30px 100px rgba(0,0,0,0.9), 0 0 50px ${currentChapter.color}20`,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${currentChapter.color}, #3b82f6)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 0 20px ${currentChapter.color}80`,
                transition: 'all 0.4s ease'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '0.05em', color: '#f8fafc' }}>
                  MEDIAOS SYSTEM TOUR & AI ENGINE GUIDE
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#94a3b8'
                  }}
                >
                  v2.6.4-TURBO
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Architected & Engineered by Mohammad Zumaan Sayyed
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setIsMuted(m => !m);
                playSynthSound(500, 0.1);
              }}
              style={{
                background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                border: isMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                color: isMuted ? '#ef4444' : '#cbd5e1',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Toggle Audio Feedback [M]"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? 'MUTED' : 'SYNTH ON'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Toggle Fullscreen [F]"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage with Visualizer and Cyberpunk HUD */}
        <div
          style={{
            position: 'relative',
            flex: isFullscreen ? 1 : 'none',
            height: isFullscreen ? 'auto' : '440px',
            background: '#070a0f',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Animated Scanline Laser Bar */}
          <div className="guide-scanline" />

          {/* Dynamic Grid Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle at 50% 50%, ${currentChapter.color}15 0%, transparent 65%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '100% 100%, 36px 36px, 36px 36px',
              transition: 'background-image 0.5s ease'
            }}
          />

          {/* HUD Top Coordinates & Metadata */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#64748b',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: currentChapter.color, fontWeight: 700 }}>● LIVE HUD</span>
              <span>RENDER: 60FPS</span>
              <span>TIME: {(progressMs / 1000).toFixed(2)}s / {(currentChapter.durationMs / 1000).toFixed(2)}s</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Synthetic Audio Waveform bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
                {[8, 14, 6, 12, 16, 9, 13, 7, 15, 11].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: isPlaying ? `${Math.max(3, (h * (progressMs % 1000)) / 600)}px` : '3px',
                      background: currentChapter.color,
                      borderRadius: '1px',
                      transition: 'height 0.08s ease'
                    }}
                  />
                ))}
              </div>
              <span>MODULE: 0{activeChapterIndex + 1}/05</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Chapter 1: Ingestion Engine Simulation */}
          {/* ======================================================== */}
          {activeChapterIndex === 0 && (
            <div style={{ position: 'relative', zIndex: 10, width: '88%', textAlign: 'center' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  padding: '14px 22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 0 35px rgba(16, 185, 129, 0.25)',
                  marginBottom: '24px'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#f1f5f9' }}>
                  https://www.youtube.com/watch?v=distributed-systems-masterclass
                </span>
                <span style={{ fontSize: '10px', background: '#10b981', color: '#000', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  PROBING STREAMS
                </span>
              </div>

              {/* Ingestion 4-Stage Horizontal Pipeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { label: 'Stream Probe', detail: '4K / 2160p AV1 Stream (Zero Re-encode)', done: chapterProgressPercent > 15 },
                  { label: 'Audio Demux', detail: 'Opus 160kbps VBR Lossless', done: chapterProgressPercent > 40 },
                  { label: 'SponsorBlock', detail: '3 Sponsor segments stripped via API', done: chapterProgressPercent > 65 },
                  { label: 'Output Verify', detail: 'ffprobe container validity guaranteed ✓', done: chapterProgressPercent > 90 }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: step.done ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                      border: step.done ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      boxShadow: step.done ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: step.done ? '#10b981' : '#64748b' }}>
                        STEP 0{idx + 1}
                      </span>
                      {step.done && <CheckCircle2 size={15} color="#10b981" />}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{step.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>{step.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Chapter 2: Media DNA & Provenance Engine Simulation */}
          {/* ======================================================== */}
          {activeChapterIndex === 1 && (
            <div style={{ position: 'relative', zIndex: 10, width: '88%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                {/* Cryptographic Dual-Vector Box */}
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid #38bdf8', borderRadius: '14px', padding: '20px', boxShadow: '0 0 30px rgba(56, 189, 248, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <ShieldCheck size={20} color="#38bdf8" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                      DUAL-VECTOR CRYPTOGRAPHIC MEDIA DNA
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>SOURCE ID: </span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>SRC-9F4B2E81A03C</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>CONTENT SHA-256: </span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>7c018a2df983ee52b14</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>PERCEPTUAL HASH: </span>
                      <span style={{ color: '#c084fc', fontWeight: 700 }}>phash_e8a201bf99a0</span>
                    </div>
                  </div>
                </div>

                {/* Grounding & Verification Radar */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', background: '#10b981', color: '#000', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        GROUNDING VERIFIED
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>96.8% Confidence</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#f8fafc', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
                      "JWT token rotation is mandatory to prevent replay attacks during distributed microservice handshakes..."
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
                    CANONICAL SPAN: 00:14:22.500 → 00:15:01.200 (Exact 30fps Seek)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Chapter 3: Semantic Search Simulation */}
          {/* ======================================================== */}
          {activeChapterIndex === 2 && (
            <div style={{ position: 'relative', zIndex: 10, width: '88%' }}>
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid #a855f7',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)'
                }}
              >
                <Search size={18} color="#a855f7" />
                <span style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: 600 }}>
                  What did the speaker explain about PostgreSQL B-tree index logarithmic scans?
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#a855f7', fontWeight: 800, border: '1px solid #a855f7', padding: '2px 8px', borderRadius: '4px' }}>
                  FTS5 BM25 RADAR
                </span>
              </div>

              {/* Waterfall search hits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    title: 'PostgreSQL Internals Masterclass',
                    time: '00:14:20.500',
                    text: '...PostgreSQL indexing speeds up query resolution using logarithmic scans over partitioned B-tree leaves...',
                    score: '0.982'
                  },
                  {
                    title: 'Storage Engine Optimization',
                    time: '00:38:12.120',
                    text: '...B-tree depth rarely exceeds 4 levels even with millions of tuples due to high fan-out ratios...',
                    score: '0.914'
                  }
                ].map((res, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{res.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>{res.text}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '100px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>{res.time}</span>
                      <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 800 }}>Relevance: {res.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Chapter 4: Clip Studio Simulation (16:9 to 9:16) */}
          {/* ======================================================== */}
          {activeChapterIndex === 3 && (
            <div style={{ position: 'relative', zIndex: 10, width: '88%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
              {/* 16:9 Landscape Frame */}
              <div
                style={{
                  width: '240px',
                  height: '135px',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                <span style={{ fontSize: '11px', color: '#64748b' }}>Original 16:9 Landscape (1080p)</span>
                {/* Animated Centroid Crop Window moving back and forth */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${70 + Math.sin(progressMs / 500) * 20}px`,
                    width: '76px',
                    border: '2px solid #f59e0b',
                    background: 'rgba(245, 158, 11, 0.25)',
                    boxShadow: '0 0 25px rgba(245, 158, 11, 0.5)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '6px'
                  }}
                >
                  <span style={{ fontSize: '8px', background: '#f59e0b', color: '#000', fontWeight: 800, padding: '1px 3px', borderRadius: '2px' }}>
                    FACE 99%
                  </span>
                </div>
              </div>

              <ArrowRight size={26} color="#f59e0b" />

              {/* 9:16 Vertical Smartphone Viewport */}
              <div
                style={{
                  width: '135px',
                  height: '240px',
                  background: '#090d16',
                  border: '2.5px solid #f59e0b',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  boxShadow: '0 0 35px rgba(245, 158, 11, 0.35)'
                }}
              >
                {/* Simulated subject in video */}
                <div
                  style={{
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
                  }}
                />
                {/* Kinetic Subtitles */}
                <div style={{ background: 'rgba(0,0,0,0.8)', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    DYNAMIC KARAOKE CAPTIONS 🔥
                  </span>
                </div>
              </div>

              {/* Details card */}
              <div style={{ textAlign: 'left', maxWidth: '260px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>
                  Smart AI Reframing (9:16)
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  Detects speaker faces and active visual saliency, crops widescreen content into vertical shorts, burns animated TikTok/Reels captions, and renders at 60 FPS in 60 seconds.
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Chapter 5: Universal Transcoder Simulation */}
          {/* ======================================================== */}
          {activeChapterIndex === 4 && (
            <div style={{ position: 'relative', zIndex: 10, width: '88%', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ec4899', marginBottom: '16px', letterSpacing: '0.04em' }}>
                UNIVERSAL TRANSMUXING & RFC 6266 EXPORT MATRIX
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {[
                  { ext: 'MP4', label: 'H.264 / AAC', use: 'Universal Video' },
                  { ext: 'MKV', label: 'AV1 / Opus', use: 'Master Archive' },
                  { ext: 'MP3', label: '320kbps MP3', use: 'Podcasts' },
                  { ext: 'FLAC', label: 'Lossless Audio', use: 'Studio Master' },
                  { ext: 'SRT', label: 'UTF-8 Captions', use: 'Subtitles' }
                ].map((fmt, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(236, 72, 153, 0.08)',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      borderRadius: '12px',
                      padding: '16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#ec4899' }}>{fmt.ext}</span>
                    <span style={{ fontSize: '11px', color: '#f1f5f9', fontWeight: 700 }}>{fmt.label}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{fmt.use}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Terminal Stream Output at bottom of stage */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '20px',
              right: '200px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              zIndex: 10
            }}
          >
            <Terminal size={13} color={currentChapter.color} />
            <span style={{ color: currentChapter.color, fontWeight: 700 }}>
              {currentChapter.terminalLogs[Math.min(currentChapter.terminalLogs.length - 1, Math.floor((progressMs / currentChapter.durationMs) * currentChapter.terminalLogs.length))]}
            </span>
          </div>

          {/* Quick Launch CTA Button */}
          <button
            onClick={() => {
              playSynthSound(880, 0.2, 'triangle');
              onNavigateToView(currentChapter.targetView);
              onClose();
            }}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '20px',
              background: currentChapter.color,
              color: '#000',
              fontWeight: 800,
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 0 20px ${currentChapter.color}80`,
              zIndex: 10
            }}
          >
            <span>LAUNCH FEATURE</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Progress Bar with Chapter Markers */}
          <div
            style={{
              height: '6px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '4px',
              marginBottom: '14px',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPercent = (e.clientX - rect.left) / rect.width;
              const targetChap = Math.min(CHAPTERS.length - 1, Math.floor(clickPercent * CHAPTERS.length));
              handleSelectChapter(targetChap);
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((activeChapterIndex + chapterProgressPercent / 100) / CHAPTERS.length) * 100}%`,
                background: currentChapter.color,
                borderRadius: '4px',
                transition: 'width 0.04s linear',
                boxShadow: `0 0 12px ${currentChapter.color}`
              }}
            />
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Skip Back */}
              <button
                onClick={handlePrevChapter}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Previous Module [←]"
              >
                <SkipBack size={16} />
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={() => {
                  setIsPlaying(p => !p);
                  playSynthSound(440, 0.1);
                }}
                style={{
                  background: currentChapter.color,
                  border: 'none',
                  color: '#000',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: `0 0 15px ${currentChapter.color}60`
                }}
                title="Play / Pause [Space]"
              >
                {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" />}
              </button>

              {/* Skip Forward */}
              <button
                onClick={handleNextChapter}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Next Module [→]"
              >
                <SkipForward size={16} />
              </button>

              {/* Restart */}
              <button
                onClick={handleRestart}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Restart System Tour"
              >
                <RotateCcw size={16} />
              </button>

              <div style={{ marginLeft: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  {currentChapter.title}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {currentChapter.subtitle}
                </div>
              </div>
            </div>

            {/* Playback Speed selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {([0.5, 1, 1.5, 2] as const).map(spd => (
                <button
                  key={spd}
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    playSynthSound(500, 0.08);
                  }}
                  style={{
                    background: playbackSpeed === spd ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: playbackSpeed === spd ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                    color: playbackSpeed === spd ? '#fff' : '#94a3b8',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapters Thumbnails Selector Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${CHAPTERS.length}, 1fr)`, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {CHAPTERS.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChapter(idx)}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  borderRight: idx < CHAPTERS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  borderBottom: isActive ? `3px solid ${ch.color}` : '3px solid transparent',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ color: isActive ? ch.color : '#64748b' }}>
                  {ch.icon}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '10px', color: isActive ? ch.color : '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    MODULE 0{idx + 1}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: isActive ? '#f8fafc' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ch.title.split('. ')[1]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
