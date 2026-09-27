import React, { useState, useEffect } from 'react';
import { Search, Download, Sparkles, FolderPlus, Scissors, Video, Settings, Database, ArrowRight, CornerDownLeft, FileText, Check, Cpu } from 'lucide-react';
import { api, NaturalPlanResult } from '../api';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string, payload?: any) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [planResult, setPlanResult] = useState<NaturalPlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const commands = [
    { id: 'ingest', title: 'Download & Ingest Media', category: 'Actions', icon: Download, hint: 'Inspect formats via yt-dlp' },
    { id: 'transcripts', title: 'Deep Transcript Search', category: 'Navigation', icon: FileText, hint: 'Search spoken lines' },
    { id: 'ask-library', title: 'Ask Your Library', category: 'Intelligence', icon: Sparkles, hint: 'Flagship semantic brain' },
    { id: 'library', title: 'Media Library', category: 'Navigation', icon: Video, hint: 'Browse indexed filesystem' },
    { id: 'clips', title: 'AI Clip Studio', category: 'Creation', icon: Scissors, hint: 'Generate 9:16 vertical shorts' },
    { id: 'courses', title: 'Build Structured Course', category: 'Creation', icon: FolderPlus, hint: 'Compile multi-video curriculum' },
    { id: 'downloads', title: 'Active Process Manager', category: 'System', icon: Download, hint: 'Monitor real pipeline stages' },
    { id: 'storage', title: 'Storage Intelligence', category: 'System', icon: Database, hint: 'Duplicates & disk reclamation' },
    { id: 'settings', title: 'Engine & Developer Settings', category: 'System', icon: Settings, hint: 'FFmpeg, yt-dlp, models & FTS5' },
  ];

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const isUrl = query.trim().startsWith('http://') || query.trim().startsWith('https://');
  const isNaturalLanguage = query.trim().length > 7 && !isUrl;

  // Plan generation debounce
  useEffect(() => {
    if (!isNaturalLanguage) {
      setPlanResult(null);
      return;
    }
    const timer = setTimeout(() => {
      setIsPlanning(true);
      api.planCommand(query.trim())
        .then(res => {
          setPlanResult(res);
          setIsPlanning(false);
        })
        .catch(() => setIsPlanning(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isNaturalLanguage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' && !planResult) {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp' && !planResult) {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (planResult) {
          executePlan(planResult);
        } else if (isUrl) {
          onSelectAction('inspect-url', query.trim());
          onClose();
        } else if (filtered[selectedIndex]) {
          onSelectAction(filtered[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, query, isUrl, planResult]);

  const executePlan = (plan: NaturalPlanResult) => {
    if (plan.intent_type === 'semantic_search') {
      onSelectAction('ask-library', plan.raw_query);
    } else if (plan.intent_type === 'create_clip') {
      onSelectAction('clips', plan.raw_query);
    } else if (plan.intent_type === 'build_course') {
      onSelectAction('courses');
    } else {
      // Direct ingest with plan parameters
      onSelectAction('execute-plan', plan);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-modal" style={{ width: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="command-input-wrapper">
          <Search size={18} color="var(--accent-lime)" />
          <input
            autoFocus
            type="text"
            className="command-input"
            placeholder="Type a command, paste a URL, or describe what you want..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="kbd-shortcut">ESC</span>
        </div>

        {/* URL Target Detection */}
        {isUrl && (
          <div style={{ padding: '12px 18px', background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Download size={15} color="var(--accent-lime)" />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Inspect Media Source: <span className="font-mono" style={{ color: 'var(--accent-lime)' }}>{query.slice(0, 48)}...</span>
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Inspect Source <CornerDownLeft size={12} />
            </span>
          </div>
        )}

        {/* Natural Language Raycast-Grade Plan Card */}
        {isNaturalLanguage && planResult && (
          <div style={{ padding: '18px 20px', background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={14} color="var(--accent-lime)" />
                <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', textTransform: 'uppercase' }}>
                  MEDIAOS EXECUTION PLAN
                </span>
              </div>
              <span className="kbd-shortcut">↵ EXECUTE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px', background: 'var(--surface-primary)', padding: '14px', borderRadius: '5px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Source:</span> <strong style={{ color: 'var(--text-primary)' }}>{planResult.plan.source_detected}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Video:</span> <strong style={{ color: 'var(--text-primary)' }}>{planResult.plan.video_quality}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Container:</span> <strong style={{ color: 'var(--text-primary)' }}>{planResult.plan.container}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Audio:</span> <strong style={{ color: 'var(--text-primary)' }}>{planResult.plan.audio_profile}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Subtitles:</span> <strong style={{ color: 'var(--text-primary)' }}>{planResult.plan.subtitles}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>AI Analysis:</span> <strong style={{ color: 'var(--accent-lime)' }}>Enabled (Knowledge Index)</strong></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Target intent: <span style={{ color: 'var(--text-primary)' }}>{planResult.intent_type.replace('_', ' ')}</span>
              </span>
              <button
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={() => executePlan(planResult)}
              >
                Execute Plan <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Regular Command List */}
        {!planResult && (
          <div className="command-list">
            {filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectAction(item.id);
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={16} className="command-item-icon" />
                    <span>{item.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.hint}</span>
                    <span className="kbd-shortcut" style={{ fontSize: '9px' }}>{item.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="command-footer">
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd className="kbd-shortcut">↑</kbd> <kbd className="kbd-shortcut">↓</kbd> Navigate</span>
            <span><kbd className="kbd-shortcut">↵</kbd> Select</span>
            <span><kbd className="kbd-shortcut">ESC</kbd> Dismiss</span>
          </div>
          <span>MEDIAOS // RAYCAST INTERFACE</span>
        </div>
      </div>
    </div>
  );
};
