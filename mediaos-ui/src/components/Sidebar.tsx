import React from 'react';
import {
  LayoutDashboard,
  Film,
  DownloadCloud,
  Sparkles,
  Scissors,
  FolderKanban,
  FileText,
  HardDrive,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal,
  BrainCircuit
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  counts: { media: number; clips: number; collections: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  counts
}) => {
  const primaryDestinations = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'library', label: 'Library', icon: Film, count: counts.media },
    { id: 'downloads', label: 'Downloads', icon: DownloadCloud },
    { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    { id: 'clips', label: 'Clip Studio', icon: Scissors, count: counts.clips },
    { id: 'collections', label: 'Collections', icon: FolderKanban, count: counts.collections },
    { id: 'transcripts', label: 'Transcripts', icon: FileText },
  ];

  const systemDestinations = [
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <Terminal size={15} />
          </div>
          {!collapsed && (
            <div>
              <div className="brand-name">MEDIAOS</div>
              <div className="brand-tag">MEDIA INTELLIGENCE OS</div>
            </div>
          )}
        </div>
        <button
          className="btn-ghost"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ padding: '4px' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Primary Destinations Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">DESTINATIONS</div>}
        {primaryDestinations.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="nav-icon" />
              {!collapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="nav-badge">{item.count}</span>
                  )}
                </>
              )}
            </button>
          );
        })}

        <div style={{ margin: '10px 0', borderTop: '1px solid var(--border-color)' }} />

        {!collapsed && <div className="nav-section-title">SYSTEM</div>}
        {systemDestinations.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="nav-icon" />
              {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile: Mohammad Zumaan Sayyed */}
      <div className="sidebar-footer">
        <div className="user-card" title="Founder & Builder: Mohammad Zumaan Sayyed">
          <div className="user-avatar">
            MZ
          </div>
          {!collapsed && (
            <div className="user-details">
              <span className="user-name">Mohammad Zumaan Sayyed</span>
              <span className="user-role">Founder / Builder</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
