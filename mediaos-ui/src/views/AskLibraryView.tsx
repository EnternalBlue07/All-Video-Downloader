import React, { useState } from 'react';
import { Sparkles, Play, FolderPlus, Scissors, ExternalLink, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { api } from '../api';

interface AskLibraryViewProps {
  onOpenMediaAtTimestamp: (mediaId: string, seconds: number) => void;
  onCreateCollectionFromSources: (title: string, mediaIds: string[]) => void;
  onOpenClipStudio: (mediaId: string) => void;
}

export const AskLibraryView: React.FC<AskLibraryViewProps> = ({
  onOpenMediaAtTimestamp,
  onCreateCollectionFromSources,
  onOpenClipStudio
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.askLibrary(query);
      setSearchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQuestions = [
    'Where did I learn about JWT refresh tokens?',
    'What did the speakers explain regarding ingestion architecture?',
    'Find comparisons between synchronous and event-driven patterns',
    'Where are React server components and hydration discussed?'
  ];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
          FLAGSHIP INTELLIGENCE ENGINE
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Ask Your Library
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Semantic vector and transcript index across all downloaded and ingested media. Answers cite exact timestamp locations.
        </p>
      </div>

      {/* Primary Query Bar */}
      <div className="technical-card" style={{ padding: '20px' }}>
        <form onSubmit={handleAsk}>
          <div className="media-input-bar">
            <Sparkles size={18} color="var(--accent-lime)" />
            <input
              type="text"
              className="media-input-field"
              placeholder="Ask anything across your entire media library (e.g. Where did I learn about JWT refresh tokens?)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={isSearching} style={{ padding: '6px 14px' }}>
              {isSearching ? 'Synthesizing...' : 'Search Library'}
            </button>
          </div>
        </form>

        {/* Suggestion Prompts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              style={{ fontSize: '11.5px', padding: '4px 10px', color: 'var(--text-secondary)' }}
              onClick={() => {
                setQuery(q);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis & Results */}
      {searchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Synthesis */}
          <div className="technical-card" style={{ padding: '18px', borderLeft: '3px solid var(--accent-lime)' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '6px' }}>
              CROSS-MEDIA SYNTHESIS // {searchResult.sources?.length || 0} RELEVANT SOURCES IDENTIFIED
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {searchResult.synthesized_summary}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
                onClick={() => {
                  const mediaIds = searchResult.sources.map((s: any) => s.media_id);
                  onCreateCollectionFromSources(`Research: ${query.slice(0, 30)}`, mediaIds);
                }}
              >
                <FolderPlus size={13} /> Create Collection From Results
              </button>
            </div>
          </div>

          {/* Sources List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CITED MEDIA LOCATIONS & TIMESTAMPS
            </div>

            {searchResult.sources?.map((src: any, idx: number) => (
              <div
                key={idx}
                className="technical-card"
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '84px', height: '52px', borderRadius: '4px', background: '#1c2025', overflow: 'hidden', flexShrink: 0 }}>
                    {src.thumbnail ? (
                      <img src={src.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={16} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontSize: '11.5px', color: 'var(--accent-lime)', background: 'var(--accent-lime-dim)', padding: '1px 6px', borderRadius: '3px' }}>
                        {src.timestamp}
                      </span>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {src.title}
                      </h4>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      "{src.snippet}"
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {src.creator} • {src.resolution}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11.5px' }}
                    onClick={() => onOpenMediaAtTimestamp(src.media_id, src.start_seconds)}
                  >
                    <Play size={12} /> Play From Here
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '11.5px' }}
                    onClick={() => onOpenClipStudio(src.media_id)}
                    title="Create clip from this moment"
                  >
                    <Scissors size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
