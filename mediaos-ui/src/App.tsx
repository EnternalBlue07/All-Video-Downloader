import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CommandBar } from './components/CommandBar';
import { MediaInspectorModal } from './components/MediaInspectorModal';
import { InteractiveGuideModal } from './components/InteractiveGuideModal';


import { OverviewView } from './views/OverviewView';
import { LibraryView } from './views/LibraryView';
import { MediaDetailView } from './views/MediaDetailView';
import { DownloadCenterView } from './views/DownloadCenterView';
import { IntelligenceView } from './views/IntelligenceView';
import { ClipStudioView } from './views/ClipStudioView';
import { CollectionsView } from './views/CollectionsView';
import { TranscriptsView } from './views/TranscriptsView';
import { StorageView } from './views/StorageView';
import { SettingsView } from './views/SettingsView';

import { api, MediaItem, IngestJob, InspectResult, NaturalPlanResult } from './api';

export function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);

  // Inspector modal state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorData, setInspectorData] = useState<InspectResult | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Quick Ingest Modal state
  const [isQuickIngestOpen, setIsQuickIngestOpen] = useState(false);
  const [quickIngestUrl, setQuickIngestUrl] = useState('');
  const [isQuickIngestSubmitting, setIsQuickIngestSubmitting] = useState(false);

  // Interactive Video Guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState(false);


  // State data
  const [activeJobs, setActiveJobs] = useState<IngestJob[]>([]);
  const [allJobs, setAllJobs] = useState<IngestJob[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [counts, setCounts] = useState({ media: 0, clips: 0, collections: 0 });

  // Initial and recurring data loading
  const refreshData = async () => {
    try {
      const overviewData = await api.getOverview();
      setActiveJobs(overviewData.active_jobs || []);
      setCounts(overviewData.counts || { media: 0, clips: 0, collections: 0 });

      const mediaData = await api.listMedia();
      setMediaItems(mediaData.items || []);
      setAvailableTopics(mediaData.available_topics || []);

      const jobsData = await api.listJobs();
      setAllJobs(jobsData || []);
    } catch (err) {
      console.error('Error refreshing MEDIAOS telemetry:', err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsCommandBarOpen(true);
      } else if (e.key.toLowerCase() === 'l') {
        setCurrentView('library');
      } else if (e.key.toLowerCase() === 'p') {
        setIsQuickIngestOpen(true);
      } else if (e.key.toLowerCase() === 'c') {
        setCurrentView('clips');
      } else if (e.key.toLowerCase() === 'i') {
        setCurrentView('intelligence');
      } else if (e.key.toLowerCase() === 't') {
        setCurrentView('transcripts');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Direct Ingest trigger (saves to library and immediately navigates to player)
  const handleDirectIngest = async (url: string) => {
    try {
      const res = await api.directIngest(url);
      await refreshData();
      if (res && res.media_id) {
        handleSelectMedia(res.media_id);
      }
    } catch (err) {
      console.error('Direct ingest error:', err);
      handleInspectUrl(url);
    }
  };

  // Ingest URL inspection trigger
  const handleInspectUrl = async (url: string) => {
    setIsInspectorOpen(true);
    setIsInspecting(true);
    setInspectorData(null);
    try {
      const data = await api.inspectUrl(url);
      setInspectorData(data);
    } catch (err) {
      console.error(err);
      setInspectorData({
        success: false,
        error: {
          title: 'SOURCE COULD NOT BE PROCESSED',
          reason: 'Network endpoint unreachable or server connection refused.',
          suggested_action: 'Ensure the backend server is running on port 8000.',
          raw_details: String(err)
        }
      });
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCommandAction = async (actionId: string, payload?: any) => {
    if (actionId === 'inspect-url' && payload) {
      handleInspectUrl(payload);
    } else if (actionId === 'execute-plan' && payload) {
      const plan: NaturalPlanResult = payload;
      await api.processMedia({
        url: 'https://www.youtube.com/watch?v=live_demo_event',
        title: plan.raw_query,
        creator: 'Media Pipeline',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        quality: plan.plan.video_quality,
        container: plan.plan.container,
        audio: plan.plan.audio_profile,
        subtitles: plan.plan.subtitles,
        sponsorblock: plan.plan.sponsorblock,
        ai_analysis: plan.plan.ai_analysis,
        duration: 360
      });
      refreshData();
      setCurrentView('downloads');
    } else if (actionId === 'ask-library') {
      setCurrentView('intelligence');
    } else if (actionId === 'ingest') {
      setIsQuickIngestOpen(true);
    } else {
      setCurrentView(actionId);
    }
  };

  const handleSelectMedia = (id: string) => {
    setSelectedMediaId(id);
    setCurrentView('detail');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'overview': return 'Overview';
      case 'library': return 'Media Library';
      case 'detail': return 'Media Detail & Player';
      case 'downloads': return 'Process Manager & Queue';
      case 'intelligence': return 'Intelligence';
      case 'clips': return 'AI Clip Studio';
      case 'collections': return 'Collections';
      case 'transcripts': return 'Transcripts';
      case 'storage': return 'Storage Intelligence';
      case 'settings': return 'Settings';
      default: return 'MEDIAOS';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView === 'detail' ? 'library' : currentView}
        onSelectView={view => {
          setCurrentView(view);
          setSelectedMediaId(null);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        counts={counts}
      />

      {/* Main Area */}
      <div className="main-area">
        <Topbar
          pageTitle={getPageTitle()}
          onOpenCommandBar={() => setIsCommandBarOpen(true)}
          onNewInspect={() => setIsQuickIngestOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />


        <main className="workspace-scroll">
          {currentView === 'overview' && (
            <OverviewView
              activeJobs={activeJobs}
              recentMedia={mediaItems.slice(0, 6)}
              onInspectUrl={handleInspectUrl}
              onDirectIngest={handleDirectIngest}
              onSelectMedia={handleSelectMedia}
              onNavigateToView={view => setCurrentView(view)}
              onOpenGuide={() => setIsGuideOpen(true)}
            />

          )}

          {currentView === 'library' && (
            <LibraryView
              mediaItems={mediaItems}
              availableTopics={availableTopics}
              onSelectMedia={handleSelectMedia}
              onBuildCourseWithSelection={() => setCurrentView('intelligence')}
            />
          )}

          {currentView === 'detail' && selectedMediaId && (
            <MediaDetailView
              mediaId={selectedMediaId}
              onBack={() => setCurrentView('library')}
              onOpenClipStudio={mediaId => {
                setSelectedMediaId(mediaId);
                setCurrentView('clips');
              }}
            />
          )}

          {currentView === 'downloads' && (
            <DownloadCenterView
              jobs={allJobs}
              onInspectUrl={() => handleInspectUrl('https://www.youtube.com/watch?v=live_demo_event')}
              onOpenMedia={handleSelectMedia}
              onRefresh={refreshData}
            />
          )}

          {currentView === 'intelligence' && (
            <IntelligenceView
              mediaItems={mediaItems}
              onOpenMediaAtTimestamp={(mediaId) => {
                setSelectedMediaId(mediaId);
                setCurrentView('detail');
              }}
              onOpenMedia={handleSelectMedia}
              onCreateCollectionFromSources={(title, mediaIds) => {
                api.createCollection(title, 'Synthesized collection cluster', mediaIds).then(() => {
                  refreshData();
                  setCurrentView('collections');
                });
              }}
              onOpenClipStudio={mediaId => {
                setSelectedMediaId(mediaId);
                setCurrentView('clips');
              }}
            />
          )}

          {currentView === 'clips' && (
            <ClipStudioView
              mediaItems={mediaItems}
              preselectedMediaId={selectedMediaId || undefined}
              onClipCreated={refreshData}
            />
          )}

          {currentView === 'collections' && (
            <CollectionsView
              mediaItems={mediaItems}
              onOpenMedia={handleSelectMedia}
            />
          )}

          {currentView === 'transcripts' && (
            <TranscriptsView
              onOpenMediaAtTimestamp={(mediaId) => {
                setSelectedMediaId(mediaId);
                setCurrentView('detail');
              }}
            />
          )}

          {currentView === 'storage' && (
            <StorageView />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Global Command Bar (⌘K / Ctrl+K) */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onSelectAction={handleCommandAction}
      />

      {/* Ingest / Media Inspector Modal */}
      {isInspectorOpen && (
        <MediaInspectorModal
          inspectData={inspectorData}
          isLoading={isInspecting}
          onClose={() => setIsInspectorOpen(false)}
          onProcessStarted={() => {
            refreshData();
            setCurrentView('downloads');
          }}
        />
      )}

      {/* Quick Ingest Modal */}
      {isQuickIngestOpen && (
        <div className="command-overlay" onClick={() => setIsQuickIngestOpen(false)}>
          <div
            className="command-modal"
            style={{ width: '600px', maxWidth: '94vw' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-dot" />
                <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  DOWNLOAD MEDIA TO STORAGE // YT-DLP CORE
                </span>
              </div>
              <button className="btn-ghost" onClick={() => setIsQuickIngestOpen(false)} style={{ padding: '4px' }}>✕</button>
            </div>

            <div style={{ padding: '22px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                Paste any YouTube or web media URL. MEDIAOS will download the full MP4 video with audio directly to your local storage (<strong>downloads/</strong> folder) and index it with real subtitles and AI intelligence.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!quickIngestUrl.trim() || isQuickIngestSubmitting) return;
                setIsQuickIngestSubmitting(true);
                try {
                  await handleDirectIngest(quickIngestUrl.trim());
                  setQuickIngestUrl('');
                  setIsQuickIngestOpen(false);
                } finally {
                  setIsQuickIngestSubmitting(false);
                }
              }}>
                <input
                  type="text"
                  className="media-input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={quickIngestUrl}
                  onChange={e => setQuickIngestUrl(e.target.value)}
                  style={{ width: '100%', marginBottom: '18px', padding: '10px 14px' }}
                  autoFocus
                  disabled={isQuickIngestSubmitting}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      const u = quickIngestUrl.trim();
                      setIsQuickIngestOpen(false);
                      if (u) handleInspectUrl(u);
                    }}
                    disabled={!quickIngestUrl.trim() || isQuickIngestSubmitting}
                  >
                    Inspect Codecs
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!quickIngestUrl.trim() || isQuickIngestSubmitting}
                    style={{ gap: '6px', fontWeight: 600 }}
                  >
                    {isQuickIngestSubmitting ? (
                      <>
                        <span className="status-dot" /> Downloading to Storage...
                      </>
                    ) : (
                      '⬇️ Download to Storage Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Interactive System Video Guide Modal */}
      <InteractiveGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateToView={view => setCurrentView(view)}
      />
    </div>
  );
}


export default App;
