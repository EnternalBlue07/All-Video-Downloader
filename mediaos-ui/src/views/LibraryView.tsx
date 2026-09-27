import React, { useState } from 'react';
import { Search, LayoutList, LayoutGrid, Clock, Film, Sparkles, Filter, ChevronRight, CheckSquare, Square, FolderPlus } from 'lucide-react';
import { MediaItem } from '../api';

interface LibraryViewProps {
  mediaItems: MediaItem[];
  availableTopics: string[];
  onSelectMedia: (id: string) => void;
  onBuildCourseWithSelection: (selectedIds: string[]) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  mediaItems,
  availableTopics,
  onSelectMedia,
  onBuildCourseWithSelection
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filterTabs = ['All', 'Analyzed', 'Videos', '4K / 2K', 'Clips'];

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic = selectedTopic === 'All' || item.topics?.includes(selectedTopic);

    let matchesType = true;
    if (activeFilter === 'Analyzed') matchesType = item.ai_status === 'indexed';
    if (activeFilter === '4K / 2K') matchesType = item.resolution.includes('2160p') || item.resolution.includes('1440p');

    return matchesSearch && matchesTopic && matchesType;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
          <div className="media-input-bar" style={{ flex: 1, padding: '8px 14px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              className="media-input-field"
              placeholder="Search title, creator, topic, transcripts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Action Controls & View Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => onBuildCourseWithSelection(selectedIds)}
            >
              <FolderPlus size={14} />
              Build Course ({selectedIds.length})
            </button>
          )}

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '4px 8px',
                borderRadius: '3px',
                background: viewMode === 'list' ? 'var(--surface-hover)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              title="List View"
            >
              <LayoutList size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '4px 8px',
                borderRadius: '3px',
                background: viewMode === 'grid' ? 'var(--surface-hover)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '4px 8px',
                borderRadius: '3px',
                background: viewMode === 'timeline' ? 'var(--surface-hover)' : 'transparent',
                color: viewMode === 'timeline' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              title="Timeline View"
            >
              <Clock size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Topic Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', gap: '16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: activeFilter === tab ? 'var(--surface-secondary)' : 'transparent',
                color: activeFilter === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                border: activeFilter === tab ? '1px solid var(--border-focus)' : '1px solid transparent'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Topic filter dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TOPIC:</span>
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              padding: '3px 8px',
              borderRadius: '4px'
            }}
          >
            <option value="All">All Topics</option>
            {availableTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Count Indicator */}
      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        SHOWING {filteredItems.length} OF {mediaItems.length} INDEXED ASSETS
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div style={{ background: 'var(--surface-primary)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            NO MEDIA ASSETS MATCH YOUR QUERY
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Adjust your topic filter or search terms, or paste a new URL to ingest media.
          </p>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="technical-card">
          <div style={{ display: 'grid', gridTemplateColumns: '40px 100px 2fr 1.2fr 100px 120px 80px', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            <span></span>
            <span>ASSET</span>
            <span>TITLE & SUMMARY</span>
            <span>CREATOR</span>
            <span>DURATION</span>
            <span>TOPICS</span>
            <span style={{ textAlign: 'right' }}>DNA</span>
          </div>

          {filteredItems.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 100px 2fr 1.2fr 100px 120px 80px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  borderBottom: idx < filteredItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--surface-hover)' : 'transparent',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Checkbox */}
                <div onClick={e => toggleSelect(item.id, e)}>
                  {isSelected ? (
                    <CheckSquare size={16} color="var(--accent-lime)" />
                  ) : (
                    <Square size={16} color="var(--text-muted)" />
                  )}
                </div>

                {/* Thumbnail */}
                <div style={{ width: '84px', height: '48px', borderRadius: '4px', background: '#1c2025', overflow: 'hidden' }}>
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={16} color="var(--text-muted)" />
                    </div>
                  )}
                </div>

                {/* Title & Summary */}
                <div style={{ paddingRight: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {item.summary}
                  </div>
                </div>

                {/* Creator */}
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.creator}
                </div>

                {/* Duration & Resolution */}
                <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <div>{Math.floor(item.duration / 60)}m {item.duration % 60}s</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{item.resolution}</div>
                </div>

                {/* Topics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {item.topics?.slice(0, 1).map((t, tidx) => (
                    <span key={tidx} className="stage-pill passed" style={{ fontSize: '9.5px' }}>
                      {t}
                    </span>
                  ))}
                  {(item.topics?.length || 0) > 1 && (
                    <span className="stage-pill passed" style={{ fontSize: '9.5px' }}>
                      +{item.topics.length - 1}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div style={{ textAlign: 'right' }}>
                  <span className="stage-pill active" style={{ fontSize: '9.5px' }}>
                    INDEXED
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="technical-card"
              onClick={() => onSelectMedia(item.id)}
              style={{ cursor: 'pointer', transition: 'border-color 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <div style={{ position: 'relative', width: '100%', height: '140px', background: '#1c2025' }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Film size={24} color="var(--text-muted)" />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(8, 9, 11, 0.85)', padding: '2px 6px', borderRadius: '3px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                  {Math.floor(item.duration / 60)}m {item.duration % 60}s
                </div>
              </div>

              <div style={{ padding: '14px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '4px' }}>
                  {item.title}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {item.creator}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.resolution}</span>
                  <span className="stage-pill active" style={{ fontSize: '9px' }}>DNA VERIFIED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE VIEW */}
      {viewMode === 'timeline' && filteredItems.length > 0 && (
        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="technical-card"
              onClick={() => onSelectMedia(item.id)}
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', marginBottom: '4px' }}>
                INGESTED // {item.created_at}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
