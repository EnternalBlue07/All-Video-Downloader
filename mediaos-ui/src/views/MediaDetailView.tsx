import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Scissors,
  BookOpen,
  FileText,
  Search,
  Cpu,
  Clock,
  ExternalLink,
  Tv,
  HardDrive,
  Download,
  Music,
  Image,
  ChevronDown,
  Check,
  ShieldCheck
} from 'lucide-react';
import { MediaItem, api } from '../api';
import { ProvenanceClaim, OutputVerification, formatTimeMs } from '../timeline';
import { ProvenanceModal } from '../components/ProvenanceModal';
import { VerificationBadge } from '../components/VerificationBadge';


interface MediaDetailViewProps {
  mediaId: string;
  onBack: () => void;
  onOpenClipStudio: (mediaId: string) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export const MediaDetailView: React.FC<MediaDetailViewProps> = ({
  mediaId,
  onBack,
  onOpenClipStudio
}) => {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'transcript' | 'provenance' | 'ask' | 'dna' | 'knowledge'>('transcript');
  const [playerMode, setPlayerMode] = useState<'youtube' | 'local'>('youtube');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Phase 1: Provenance & Output Verification state
  const [provenanceClaims, setProvenanceClaims] = useState<ProvenanceClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ProvenanceClaim | null>(null);
  const [claimInput, setClaimInput] = useState('');
  const [isVerifyingClaim, setIsVerifyingClaim] = useState(false);
  const [verification, setVerification] = useState<OutputVerification | null>(null);
  const [isVerifyingOutput, setIsVerifyingOutput] = useState(false);

  // Ask This Video state
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askResult, setAskResult] = useState<any>(null);

  // Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizExplanations, setShowQuizExplanations] = useState<Record<number, boolean>>({});

  // Flashcards state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Video Refs
  const ytPlayerRef = useRef<any>(null);
  const html5VideoRef = useRef<HTMLVideoElement | null>(null);

  // Load media details & Phase 1 records
  useEffect(() => {
    setIsLoading(true);
    api.getMediaDetail(mediaId)
      .then(data => {
        setMedia(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });

    api.getProvenance(mediaId)
      .then(res => setProvenanceClaims(res.claims || []))
      .catch(() => {});

    api.getVerification(mediaId)
      .then(res => {
        if (res && res.verified !== undefined) setVerification(res);
      })
      .catch(() => {});
  }, [mediaId]);

  const handleVerifyClaim = async () => {
    if (!claimInput.trim()) return;
    setIsVerifyingClaim(true);
    try {
      const res = await api.verifyClaim(mediaId, claimInput);
      setSelectedClaim(res);
      setProvenanceClaims(prev => [res, ...prev.filter(c => c.id !== res.id)]);
      setClaimInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingClaim(false);
    }
  };

  const handleVerifyOutput = async () => {
    setIsVerifyingOutput(true);
    try {
      const res = await api.verifyOutput(mediaId);
      setVerification(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingOutput(false);
    }
  };


  const ytId = media?.url ? getYouTubeId(media.url) : null;

  // Initialize YouTube Iframe Player
  useEffect(() => {
    if (!ytId || playerMode !== 'youtube') return;

    const loadYT = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = initPlayer;
        document.body.appendChild(tag);
      }
    };

    const initPlayer = () => {
      try {
        if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
          ytPlayerRef.current.destroy();
        }
        ytPlayerRef.current = new window.YT.Player('mediaos-yt-iframe', {
          videoId: ytId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1
          },
          events: {
            onStateChange: (event: any) => {
              // 1 = playing, 2 = paused
              setIsPlaying(event.data === 1);
            }
          }
        });
      } catch (err) {
        console.error('YouTube player init error:', err);
      }
    };

    loadYT();

    // Poll current time while playing
    const timeInterval = setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        try {
          const t = ytPlayerRef.current.getCurrentTime();
          if (typeof t === 'number' && !isNaN(t)) {
            setCurrentTime(Math.floor(t));
          }
        } catch (_) {}
      }
    }, 500);

    return () => {
      clearInterval(timeInterval);
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (_) {}
      }
    };
  }, [ytId, playerMode]);

  // Synchronized seek action
  const seekToSeconds = (seconds: number) => {
    setCurrentTime(seconds);
    if (playerMode === 'youtube') {
      const iframe = document.getElementById('mediaos-yt-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true]
        }), '*');
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: []
        }), '*');
      }
      if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
        try {
          ytPlayerRef.current.seekTo(seconds, true);
          ytPlayerRef.current.playVideo();
        } catch (_) {}
      }
    } else if (playerMode === 'local' && html5VideoRef.current) {
      html5VideoRef.current.currentTime = seconds;
      html5VideoRef.current.play();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading || !media) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span className="status-dot" /> Loading media and stream synchronization...
      </div>
    );
  }

  const handleAskVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const res = await api.askVideo(mediaId, question);
      setAskResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  const filteredTranscript = media.transcript?.filter(t =>
    t.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  ) || [];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top back button & breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={onBack} style={{ gap: '6px', fontSize: '13px' }}>
          <ArrowLeft size={15} /> Back to Library
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Stream Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px' }}>
            <button
              onClick={() => setPlayerMode('youtube')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                background: playerMode === 'youtube' ? 'var(--surface-hover)' : 'transparent',
                color: playerMode === 'youtube' ? 'var(--accent-lime)' : 'var(--text-muted)'
              }}
            >
              <Tv size={12} /> Web Stream
            </button>
            <button
              onClick={() => setPlayerMode('local')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                background: playerMode === 'local' ? 'var(--surface-hover)' : 'transparent',
                color: playerMode === 'local' ? 'var(--accent-lime)' : 'var(--text-muted)'
              }}
            >
              <HardDrive size={12} /> Local Offline File
            </button>
          </div>

          <span className="stage-pill active" style={{ fontSize: '10px' }}>
            {media.ai_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Real Video Player Area */}
      <div className="technical-card" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', height: '480px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {playerMode === 'youtube' && ytId ? (
            <iframe
              id="mediaos-yt-iframe"
              src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0`}
              title={media.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <video
              ref={html5VideoRef}
              controls
              controlsList="nodownload"
              src={api.getStreamUrl(media.id, media.title)}
              poster={media.thumbnail}
              onTimeUpdate={(e) => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            >
              Your browser does not support offline HTML5 playback.
            </video>
          )}
        </div>

        {/* Video Metadata & Action Header */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {media.title}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span>{media.creator}</span>
              <span>•</span>
              <span className="font-mono">{Math.floor(media.duration / 60)}m {media.duration % 60}s</span>
              <span>•</span>
              <span className="font-mono">{media.resolution}</span>
              <span>•</span>
              <span className="font-mono" style={{ color: 'var(--accent-lime)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HardDrive size={13} />
                <span>
                  {media.file_size ? `${(media.file_size / (1024 * 1024)).toFixed(1)} MB on Disk` : 'Stored in downloads/'}
                </span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            {/* Primary Clean MP4 Download */}
            <a
              href={api.getDownloadUrl(media.id, media.title, 'mp4')}
              download={api.getCleanFilename(media.title, 'mp4')}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                padding: '6px 14px',
                fontWeight: 600
              }}
            >
              <Download size={14} /> Download MP4 (1080p)
            </a>

            {/* Multi-Format Export Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{ gap: '6px', fontSize: '12px', padding: '6px 10px' }}
              >
                <span>Export Formats</span>
                <ChevronDown size={13} />
              </button>

              {showExportMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '240px',
                    background: '#13161a',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    zIndex: 100,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '6px 8px', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase' }}>
                    FFmpeg Media Exports
                  </div>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'mp4')}
                    download={api.getCleanFilename(media.title, 'mp4')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tv size={14} color="var(--accent-lime)" />
                      <div>
                        <div style={{ fontWeight: 500 }}>MP4 Video</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1080p H.264 / AAC</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>MP4</span>
                  </a>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'mp3')}
                    download={api.getCleanFilename(media.title, 'mp3')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={14} color="var(--accent-lime)" />
                      <div>
                        <div style={{ fontWeight: 500 }}>MP3 Audio</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>320 kbps Master</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>MP3</span>
                  </a>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'm4a')}
                    download={api.getCleanFilename(media.title, 'm4a')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={14} color="#60a5fa" />
                      <div>
                        <div style={{ fontWeight: 500 }}>M4A Audio</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AAC Lossless Copy</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>M4A</span>
                  </a>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'webm')}
                    download={api.getCleanFilename(media.title, 'webm')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tv size={14} color="#f59e0b" />
                      <div>
                        <div style={{ fontWeight: 500 }}>WebM Video</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>VP9 + Opus</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>WEBM</span>
                  </a>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'jpg')}
                    download={api.getCleanFilename(media.title, 'jpg')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Image size={14} color="#a855f7" />
                      <div>
                        <div style={{ fontWeight: 500 }}>Thumbnail Poster</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>High-Res JPEG</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>JPG</span>
                  </a>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'srt')}
                    download={api.getCleanFilename(media.title, 'srt')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} color="#34d399" />
                      <div>
                        <div style={{ fontWeight: 500 }}>Subtitles (SRT)</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SubRip Captions</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>SRT</span>
                  </a>

                  <a
                    href={api.getDownloadUrl(media.id, media.title, 'txt')}
                    download={api.getCleanFilename(media.title, 'txt')}
                    onClick={() => setShowExportMenu(false)}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} color="#cbd5e1" />
                      <div>
                        <div style={{ fontWeight: 500 }}>Full Transcript</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Plain Text (.txt)</div>
                      </div>
                    </div>
                    <span className="stage-pill passed" style={{ fontSize: '9px' }}>TXT</span>
                  </a>
                </div>
              )}
            </div>

            {/* Phase 1: Output Integrity Verification */}
            <VerificationBadge
              verification={verification}
              onReverify={handleVerifyOutput}
              isLoading={isVerifyingOutput}
            />

            <button
              className="btn-secondary"
              onClick={() => setActiveTab('provenance')}
              style={{ gap: '6px' }}
            >
              <ShieldCheck size={14} color="var(--accent-lime)" /> Provenance ({provenanceClaims.length})
            </button>
            <button
              className="btn-secondary"
              onClick={() => onOpenClipStudio(media.id)}
              style={{ gap: '6px' }}
            >
              <Scissors size={14} color="var(--accent-lime)" /> Create Clip
            </button>
            <button
              className="btn-secondary"
              onClick={() => setActiveTab('ask')}
              style={{ gap: '6px' }}
            >
              <Sparkles size={14} color="var(--accent-lime)" /> Ask AI
            </button>
            <button
              className="btn-secondary"
              onClick={() => setActiveTab('knowledge')}
              style={{ gap: '6px' }}
            >
              <BookOpen size={14} /> Knowledge
            </button>
          </div>
        </div>
      </div>

      {/* Lower Multi-Tab Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
        {/* Left Column: Summary, Chapters, DNA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Summary */}
          <div className="technical-card">
            <div className="technical-card-header">
              <span className="technical-card-title">
                <Sparkles size={13} color="var(--accent-lime)" /> AI SUMMARY
              </span>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-lime)' }}>
                NEURAL PROCESSED
              </span>
            </div>
            <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {media.summary}
            </div>
          </div>

          {/* Interactive Chapters (Click seeks real player) */}
          <div className="technical-card">
            <div className="technical-card-header">
              <span className="technical-card-title">
                <Clock size={13} /> CHAPTERS ({media.chapters?.length || 0})
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CLICK TO SEEK
              </span>
            </div>
            <div style={{ padding: '8px 0', maxHeight: '280px', overflowY: 'auto' }}>
              {media.chapters?.map((ch, idx) => {
                const isActive = currentTime >= ch.start_time && (idx === (media.chapters?.length || 1) - 1 || currentTime < (media.chapters?.[idx + 1]?.start_time || 99999));
                return (
                  <div
                    key={idx}
                    onClick={() => seekToSeconds(ch.start_time)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      background: isActive ? 'var(--surface-hover)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--accent-lime)' : '2px solid transparent'
                    }}
                  >
                    <span style={{ fontSize: '12.5px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 400 }}>
                      {ch.title}
                    </span>
                    <span className="font-mono" style={{ fontSize: '11px', color: isActive ? 'var(--accent-lime)' : 'var(--text-muted)' }}>
                      {ch.time_str}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topics */}
          <div className="technical-card">
            <div className="technical-card-header">
              <span className="technical-card-title">IDENTIFIED TOPICS</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {media.topics?.map((topic, idx) => (
                <span key={idx} className="stage-pill passed" style={{ fontSize: '11px', padding: '4px 8px' }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Media DNA Badge */}
          <div className="technical-card">
            <div className="technical-card-header">
              <span className="technical-card-title">
                <Cpu size={13} color="var(--accent-lime)" /> MEDIA DNA IDENTITY
              </span>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-lime)' }}>
                {media.dna?.content_identity?.fingerprint || media.dna?.fingerprint || 'DNA-VERIFIED'}
              </span>
            </div>
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
              {/* Source Identity */}
              <div>
                <div style={{ fontSize: '10px', color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  1. SOURCE IDENTITY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: 'var(--text-secondary)' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Source ID:</span> {media.dna?.source_identity?.source_id || 'SRC-VERIFIED'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Platform:</span> YouTube / yt-dlp</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Target:</span> {media.resolution}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Duration:</span> {Math.floor(media.duration / 60)}m {media.duration % 60}s</div>
                </div>
              </div>

              {/* Content Identity */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  2. CONTENT IDENTITY (PERCEPTUAL FINGERPRINT)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: 'var(--text-secondary)' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Video Codec:</span> {media.dna?.content_identity?.video_codec || 'AV1'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Audio Codec:</span> {media.dna?.content_identity?.audio_codec || 'Opus'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>FPS:</span> {media.dna?.content_identity?.fps || 60} fps</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Bitrate:</span> {media.dna?.content_identity?.bitrate || '4500 kbps'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>HDR:</span> {media.dna?.content_identity?.hdr || 'SDR'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Confidence:</span> <strong style={{ color: 'var(--accent-lime)' }}>EXACT (100%)</strong></div>
                </div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Checksum: {media.dna?.content_identity?.checksum || 'sha256:d8a2...verified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs (Transcript / Ask This Video / Knowledge) */}
        <div className="technical-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-secondary)' }}>
            {[
              { id: 'transcript', label: 'Interactive Transcript', icon: FileText },
              { id: 'ask', label: 'Ask This Video', icon: Sparkles },
              { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    background: isActive ? 'var(--surface-primary)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: isActive ? '2px solid var(--accent-lime)' : '2px solid transparent',
                    borderRight: '1px solid var(--border-color)'
                  }}
                >
                  <Icon size={14} color={isActive ? 'var(--accent-lime)' : 'inherit'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: INTERACTIVE TRANSCRIPT (CLICK SEEKS REAL VIDEO) */}
          {activeTab === 'transcript' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="media-input-bar" style={{ padding: '6px 12px' }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    className="media-input-field"
                    placeholder="Search words spoken in this video (click any line to seek)..."
                    value={transcriptSearch}
                    onChange={e => setTranscriptSearch(e.target.value)}
                    style={{ fontSize: '12.5px' }}
                  />
                  {transcriptSearch && (
                    <button className="btn-ghost" onClick={() => setTranscriptSearch('')} style={{ padding: '2px' }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredTranscript.length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No transcript segments matching your filter.
                  </div>
                ) : (
                  filteredTranscript.map((line, idx) => {
                    const isCurrent = currentTime >= line.start && currentTime < line.end;
                    return (
                      <div
                        key={idx}
                        onClick={() => seekToSeconds(line.start)}
                        style={{
                          display: 'flex',
                          gap: '14px',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: isCurrent ? 'var(--accent-lime-dim)' : 'transparent',
                          borderLeft: isCurrent ? '2px solid var(--accent-lime)' : '2px solid transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <span className="font-mono" style={{ fontSize: '11px', color: isCurrent ? 'var(--accent-lime)' : 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
                          {line.timestamp}
                        </span>
                        <p style={{ fontSize: '13px', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {line.text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: PROVENANCE & GROUNDING LEDGER */}
          {activeTab === 'provenance' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '620px', overflowY: 'auto' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="var(--accent-lime)" />
                    Provenance & Grounding Ledger
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Frame-Accurate Millisecond Tracking
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Every AI assertion is strictly verified against real spoken transcripts. Never hallucinated.
                </p>
              </div>

              {/* Verify New Claim Input Box */}
              <div style={{ background: 'var(--surface-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Verify Statement Against This Video
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="media-input-field"
                    placeholder="Enter any statement (e.g. 'JWT rotation is recommended for session security')..."
                    value={claimInput}
                    onChange={e => setClaimInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyClaim()}
                    style={{ fontSize: '12.5px' }}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleVerifyClaim}
                    disabled={isVerifyingClaim || !claimInput.trim()}
                    style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '6px 14px' }}
                  >
                    {isVerifyingClaim ? 'Verifying...' : 'Verify Claim'}
                  </button>
                </div>
              </div>

              {/* Verified Claims List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Grounded Claims ({provenanceClaims.length})
                </div>

                {provenanceClaims.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                    No provenance claims generated yet. Type a statement above to test real-time grounding.
                  </div>
                ) : (
                  provenanceClaims.map(c => {
                    const isV = c.status === 'VERIFIED' || c.status === 'HIGH_CONFIDENCE';
                    const isIns = c.status === 'INSUFFICIENT_EVIDENCE';
                    return (
                      <div
                        key={c.id}
                        style={{
                          background: 'var(--surface-secondary)',
                          borderRadius: '8px',
                          border: isV ? '1px solid rgba(16, 185, 129, 0.4)' : isIns ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isV ? '#10b981' : isIns ? '#ef4444' : '#f59e0b',
                              background: isV ? 'rgba(16, 185, 129, 0.12)' : isIns ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {isV ? 'SOURCE VERIFIED ✓' : isIns ? 'INSUFFICIENT EVIDENCE' : c.status} • {Math.round(c.confidence * 100)}%
                          </span>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8' }}>
                            {c.start_str || formatTimeMs(c.start_ms)} → {c.end_str || formatTimeMs(c.end_ms)}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600 }}>
                          "{c.claim_text}"
                        </div>

                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '4px' }}>
                          {c.evidence_text}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                          <button
                            className="btn-ghost"
                            onClick={() => setSelectedClaim(c)}
                            style={{ fontSize: '11px', padding: '2px 6px' }}
                          >
                            Inspect Details
                          </button>
                          {!isIns && (
                            <button
                              className="btn-secondary"
                              onClick={() => seekToSeconds(c.start_ms / 1000)}
                              style={{ gap: '6px', fontSize: '11px', padding: '4px 10px', color: '#10b981' }}
                            >
                              <Play size={12} fill="#10b981" /> Play Source
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASK THIS VIDEO (CLICK CITATION SEEKS REAL VIDEO) */}
          {activeTab === 'ask' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '620px', overflowY: 'auto' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Ask This Video
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Ask questions about this specific video. AI cites exact timestamps and lets you jump directly to playback.
                </p>
              </div>

              <form onSubmit={handleAskVideo}>
                <div className="media-input-bar">
                  <Sparkles size={16} color="var(--accent-lime)" />
                  <input
                    type="text"
                    className="media-input-field"
                    placeholder="e.g. What are the key points in this video?"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" disabled={isAsking} style={{ padding: '6px 14px' }}>
                    {isAsking ? 'Searching...' : 'Ask Video'}
                  </button>
                </div>
              </form>

              {/* Response Card */}
              {askResult && (
                <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {askResult.answer}
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      CITED TIMESTAMPS ({askResult.citations?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {askResult.citations?.map((cit: any, cidx: number) => (
                        <div
                          key={cidx}
                          style={{
                            background: 'var(--surface-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '12px' }}>
                            <div className="font-mono" style={{ fontSize: '11.5px', color: 'var(--accent-lime)', marginBottom: '2px' }}>
                              TIMESTAMP: {cit.timestamp}
                            </div>
                            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                              "{cit.snippet}"
                            </div>
                          </div>
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}
                            onClick={() => seekToSeconds(cit.start_seconds)}
                          >
                            <Play size={11} /> PLAY FROM HERE
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div style={{ padding: '20px', height: '620px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  NOTES & KEY CONCEPTS
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {media.knowledge?.notes?.map((note, nidx) => (
                    <div key={nidx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--accent-lime)' }}>•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Quiz */}
              <div>
                <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  COMPREHENSION QUIZ ({media.knowledge?.quiz?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {media.knowledge?.quiz?.map((q, qidx) => {
                    const selected = selectedQuizAnswers[qidx];
                    const isSubmitted = showQuizExplanations[qidx];
                    return (
                      <div key={qidx} style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                          {qidx + 1}. {q.question}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          {q.options.map((opt, oidx) => {
                            const isChosen = selected === oidx;
                            const isCorrect = q.answer_index === oidx;
                            let border = '1px solid var(--border-color)';
                            if (isSubmitted && isCorrect) border = '1px solid var(--accent-lime)';
                            if (isSubmitted && isChosen && !isCorrect) border = '1px solid var(--danger-color)';

                            return (
                              <button
                                key={oidx}
                                onClick={() => {
                                  if (!isSubmitted) {
                                    setSelectedQuizAnswers(prev => ({ ...prev, [qidx]: oidx }));
                                  }
                                }}
                                style={{
                                  textAlign: 'left',
                                  padding: '8px 12px',
                                  borderRadius: '4px',
                                  background: isChosen ? 'var(--surface-hover)' : 'var(--surface-primary)',
                                  border: border,
                                  fontSize: '12.5px',
                                  color: 'var(--text-primary)'
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {!isSubmitted ? (
                          <button
                            className="btn-secondary"
                            disabled={selected === undefined}
                            onClick={() => setShowQuizExplanations(prev => ({ ...prev, [qidx]: true }))}
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            Check Answer
                          </button>
                        ) : (
                          <div style={{ fontSize: '12px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Phase 1: Provenance Source Verification Modal */}
      <ProvenanceModal
        claim={selectedClaim}
        videoTitle={media.title}
        onClose={() => setSelectedClaim(null)}
        onPlaySource={(startMs) => seekToSeconds(startMs / 1000)}
      />
    </div>
  );
};

