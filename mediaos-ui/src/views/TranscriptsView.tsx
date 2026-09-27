import React, { useState, useEffect } from 'react';
import { FileText, Search, Play, Film, ExternalLink, ArrowRight } from 'lucide-react';
import { api, TranscriptSearchResult } from '../api';

interface TranscriptsViewProps {
  onOpenMediaAtTimestamp: (mediaId: string, seconds: number) => void;
}

export const TranscriptsView: React.FC<TranscriptsViewProps> = ({ onOpenMediaAtTimestamp }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TranscriptSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTranscripts = (q: string) => {
    setIsLoading(true);
    api.searchTranscripts(q)
      .then(res => {
        setResults(res || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTranscripts('');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTranscripts(query);
  };

  const sampleKeywords = ['architecture', 'ingestion', 'backpressure', 'tokens', 'memory', 'concurrency'];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
          DEEP VERBATIM TRANSCRIPT INDEX
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Transcripts
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Search spoken dialogue across all ingested media. Click any phrase to seek directly to that exact second.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="technical-card" style={{ padding: '18px' }}>
        <form onSubmit={handleSearch}>
          <div className="media-input-bar">
            <Search size={16} color="var(--accent-lime)" />
            <input
              type="text"
              className="media-input-field"
              placeholder="Search words spoken across all videos (e.g. backpressure, refresh tokens, hydration)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '6px 14px' }}>
              Search Lines
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>QUICK FILTERS:</span>
          {sampleKeywords.map(k => (
            <button
              key={k}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => {
                setQuery(k);
                fetchTranscripts(k);
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="technical-card">
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          <span>FOUND {results.length} SPOKEN SEGMENTS</span>
          <span>SUB-SECOND PRECISION SEEKING</span>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span className="status-dot" /> Searching transcript segments...
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No spoken transcript lines matching your query.
          </div>
        ) : (
          <div>
            {results.map((r, idx) => (
              <div
                key={idx}
                onClick={() => onOpenMediaAtTimestamp(r.media_id, r.start)}
                style={{
                  padding: '14px 18px',
                  borderBottom: idx < results.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '48px', height: '32px', borderRadius: '3px', background: '#1c2025', overflow: 'hidden', flexShrink: 0 }}>
                    {r.thumbnail ? (
                      <img src={r.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Film size={14} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-lime)', background: 'var(--accent-lime-dim)', padding: '1px 6px', borderRadius: '3px' }}>
                        {r.timestamp}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.media_title} • {r.media_creator}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
                      "{r.text}"
                    </div>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0, gap: '4px' }}
                >
                  <Play size={11} color="var(--accent-lime)" /> Seek
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
