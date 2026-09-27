import React, { useState, useEffect } from 'react';
import { FolderKanban, FolderPlus, Film, Play, ExternalLink, Plus } from 'lucide-react';
import { MediaItem, api } from '../api';

interface CollectionsViewProps {
  mediaItems: MediaItem[];
  onOpenMedia: (id: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  mediaItems,
  onOpenMedia
}) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    api.listCollections().then(setCollections).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createCollection(newTitle, newDesc, selectedIds);
      api.listCollections().then(setCollections);
      setIsCreating(false);
      setNewTitle('');
      setNewDesc('');
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
            ORGANIZATIONAL ONTOLOGY
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Collections
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Thematic workspaces clustering related deep dives, research papers, and technical recordings.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsCreating(true)} style={{ gap: '6px' }}>
          <FolderPlus size={14} /> New Collection
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="command-overlay" onClick={() => setIsCreating(false)}>
          <div className="command-modal" style={{ width: '560px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Create New Collection
              </h3>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Collection Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="media-input-field"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of research scope..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Select Media Items to Include:
                </label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {mediaItems.map(m => {
                    const isSelected = selectedIds.includes(m.id);
                    return (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', background: isSelected ? 'var(--surface-hover)' : 'transparent', cursor: 'pointer', fontSize: '12px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIds(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]);
                          }}
                          style={{ accentColor: 'var(--accent-lime)' }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {collections.map(col => (
          <div key={col.id} className="technical-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stage-pill active" style={{ fontSize: '10px' }}>
                  COLLECTION
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {col.media_ids?.length || 0} Assets
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                {col.name}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                {col.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {col.media_ids?.slice(0, 3).map((mid: string) => {
                const item = mediaItems.find(m => m.id === mid);
                return (
                  <div
                    key={mid}
                    onClick={() => onOpenMedia(mid)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '3px', background: 'var(--surface-secondary)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      {item ? item.title : mid}
                    </span>
                    <Play size={11} color="var(--accent-lime)" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
