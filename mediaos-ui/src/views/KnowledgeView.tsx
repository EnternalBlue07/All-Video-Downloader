import React, { useState } from 'react';
import { BookOpen, Sparkles, HelpCircle, Check, Play, ExternalLink } from 'lucide-react';
import { MediaItem } from '../api';

interface KnowledgeViewProps {
  mediaItems: MediaItem[];
  onOpenMedia: (id: string) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  mediaItems,
  onOpenMedia
}) => {
  const [selectedMediaId, setSelectedMediaId] = useState(mediaItems[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'flashcards' | 'glossary'>('notes');

  const currentMedia = mediaItems.find(m => m.id === selectedMediaId) || mediaItems[0];
  const knowledge = currentMedia?.knowledge;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
          MEDIA KNOWLEDGE RETRIEVAL & SYNTHESIS
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Video → Knowledge System
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Transform raw video streams into structured technical knowledge: notes, interactive quizzes, flashcards, and conceptual glossaries.
        </p>
      </div>

      {/* Target Media Picker */}
      <div className="technical-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            SELECT ASSET KNOWLEDGE PACKAGE:
          </label>
          <select
            value={selectedMediaId}
            onChange={e => setSelectedMediaId(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-primary)' }}
          >
            {mediaItems.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <button
          className="btn-secondary"
          onClick={() => onOpenMedia(currentMedia?.id)}
          style={{ height: '38px', marginTop: '16px', gap: '6px' }}
        >
          <Play size={13} /> Open Media Player
        </button>
      </div>

      {/* Knowledge Details Container */}
      {currentMedia && (
        <div className="technical-card">
          {/* Subtabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-secondary)' }}>
            {[
              { id: 'notes', label: 'Executive Notes & Concepts' },
              { id: 'quiz', label: `Interactive Quiz (${knowledge?.quiz?.length || 0})` },
              { id: 'flashcards', label: `Flashcards (${knowledge?.flashcards?.length || 0})` },
              { id: 'glossary', label: `Glossary (${knowledge?.glossary?.length || 0})` }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '12px 18px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    background: isActive ? 'var(--surface-primary)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: isActive ? '2px solid var(--accent-lime)' : '2px solid transparent',
                    borderRight: '1px solid var(--border-color)'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '24px' }}>
            {/* NOTES */}
            {activeTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    KEY TAKEAWAYS & PRINCIPLES
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {knowledge?.notes?.map((n, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent-lime)' }}>•</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    CORE CONCEPT MAP
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {knowledge?.key_concepts?.map((c, idx) => (
                      <span key={idx} className="stage-pill passed" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QUIZ */}
            {activeTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {knowledge?.quiz?.map((q, qidx) => (
                  <div key={qidx} style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                      {qidx + 1}. {q.question}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                      {q.options.map((opt, oidx) => (
                        <div
                          key={oidx}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            background: q.answer_index === oidx ? 'var(--accent-lime-dim)' : 'var(--surface-primary)',
                            border: q.answer_index === oidx ? '1px solid var(--accent-lime)' : '1px solid var(--border-color)',
                            fontSize: '13px',
                            color: q.answer_index === oidx ? 'var(--accent-lime)' : 'var(--text-secondary)'
                          }}
                        >
                          {opt} {q.answer_index === oidx && '✓ (Correct)'}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Explanation: {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {knowledge?.flashcards?.map((fc, idx) => (
                  <div key={idx} style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-lime)' }}>
                        CARD #{idx + 1}
                      </span>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {fc.front}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {fc.back}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GLOSSARY */}
            {activeTab === 'glossary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {knowledge?.glossary?.map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                      {item.term}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.definition}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
