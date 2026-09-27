import React from 'react';
import { Search, Activity, Cpu, Sparkles, Terminal } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
  onOpenCommandBar: () => void;
  onNewInspect: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ pageTitle, onOpenCommandBar, onNewInspect }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
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
