import React from 'react';
import { Search, Activity, Cpu, Sparkles, Terminal } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
  onOpenCommandBar: () => void;
  onNewInspect: () => void;
  onOpenGuide: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ pageTitle, onOpenCommandBar, onNewInspect, onOpenGuide }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
        {/* Interactive Video Guide Button */}
        <button
          onClick={onOpenGuide}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(59, 130, 246, 0.25))',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#f8fafc',
            padding: '6px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
        >
          <Sparkles size={14} color="#c084fc" />
          <span>🎬 Interactive Guide</span>
        </button>

        {/* Engine status indicator */}
        <div className="engine-status-pill" title="Local Python yt-dlp & FFmpeg 8.1 Engine Running">
          <span className="status-dot" />
          <span>yt-dlp active • FFmpeg 8.1</span>
        </div>

        {/* Global Command palette trigger */}
        <button className="command-trigger-btn" onClick={onOpenCommandBar}>
          <Search size={14} />
          <span>Search or command...</span>
          <span className="kbd-shortcut">⌘K</span>
        </button>

        {/* Download trigger button */}
        <button
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
          onClick={onNewInspect}
        >
          <span>⬇️ Download URL</span>
        </button>
      </div>
    </header>
  );
};

