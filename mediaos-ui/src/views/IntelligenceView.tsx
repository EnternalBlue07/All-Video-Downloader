import React, { useState } from 'react';
import { BrainCircuit, Sparkles, BookOpen, Layers, Play, Network, ChevronRight, GraduationCap } from 'lucide-react';
import { MediaItem } from '../api';
import { AskLibraryView } from './AskLibraryView';
import { KnowledgeView } from './KnowledgeView';
import { CourseBuilderView } from './CourseBuilderView';

interface IntelligenceViewProps {
  mediaItems: MediaItem[];
  onOpenMediaAtTimestamp: (mediaId: string, seconds: number) => void;
  onOpenMedia: (mediaId: string) => void;
  onCreateCollectionFromSources: (title: string, mediaIds: string[]) => void;
  onOpenClipStudio: (mediaId: string) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  mediaItems,
  onOpenMediaAtTimestamp,
  onOpenMedia,
  onCreateCollectionFromSources,
  onOpenClipStudio
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'ask' | 'graph' | 'knowledge' | 'courses'>('ask');

  // Aggregated topics and concept relationships
  const allTopics = Array.from(new Set(mediaItems.flatMap(m => m.topics || [])));

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ask', label: 'Ask Your Library', icon: Sparkles },
            { id: 'graph', label: 'Knowledge Graph & Ontology', icon: Network },
            { id: 'knowledge', label: 'Synthesized Knowledge & Notes', icon: BookOpen },
            { id: 'courses', label: 'Course Builder', icon: GraduationCap }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubtab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubtab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'var(--surface-secondary)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent'
                }}
              >
                <Icon size={14} color={isActive ? 'var(--accent-lime)' : 'inherit'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-lime)' }}>
          INTELLIGENCE LAYER // {allTopics.length} TOPICS MAPPED
        </span>
      </div>

      {/* Subtab 1: Ask Your Library */}
      {activeSubtab === 'ask' && (
        <AskLibraryView
          onOpenMediaAtTimestamp={onOpenMediaAtTimestamp}
          onCreateCollectionFromSources={onCreateCollectionFromSources}
          onOpenClipStudio={onOpenClipStudio}
        />
      )}

      {/* Subtab 2: Knowledge Graph & Ontology */}
      {activeSubtab === 'graph' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="technical-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '6px' }}>
              CROSS-MEDIA CONCEPT ONTOLOGY
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Evolving Knowledge Relationships
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              MEDIAOS autonomously correlates concepts across separate videos, identifying dependencies and complementary patterns.
            </p>

            {/* Concept Nodes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {allTopics.map((topic, idx) => {
                const relatedMedia = mediaItems.filter(m => m.topics?.includes(topic));
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-lime)' }}>
                          NODE #{idx + 1}
                        </span>
                        <span className="stage-pill active" style={{ fontSize: '9px' }}>
                          {relatedMedia.length} SOURCES
                        </span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {topic}
                      </h4>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {relatedMedia.slice(0, 2).map(m => (
                        <div
                          key={m.id}
                          onClick={() => onOpenMedia(m.id)}
                          style={{ fontSize: '11.5px', color: 'var(--text-muted)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          → {m.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Knowledge Notes & Quizzes */}
      {activeSubtab === 'knowledge' && (
        <KnowledgeView
          mediaItems={mediaItems}
          onOpenMedia={onOpenMedia}
        />
      )}

      {/* Subtab 4: Course Builder */}
      {activeSubtab === 'courses' && (
        <CourseBuilderView
          mediaItems={mediaItems}
          onOpenMedia={onOpenMedia}
        />
      )}
    </div>
  );
};
