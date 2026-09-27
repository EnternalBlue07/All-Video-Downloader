import React from 'react';
import { ShieldCheck, AlertTriangle, Play, X, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { ProvenanceClaim, formatTimeMs } from '../timeline';

interface ProvenanceModalProps {
  claim: ProvenanceClaim | null;
  videoTitle?: string;
  onClose: () => void;
  onPlaySource: (startMs: number) => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({
  claim,
  videoTitle,
  onClose,
  onPlaySource
}) => {
  if (!claim) return null;

  const isVerified = claim.status === 'VERIFIED' || claim.status === 'HIGH_CONFIDENCE';
  const isInsufficient = claim.status === 'INSUFFICIENT_EVIDENCE';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-container provenance-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '90%',
          background: 'var(--bg-card, #161922)',
          border: isVerified ? '1px solid #10b981' : isInsufficient ? '1px solid #ef4444' : '1px solid var(--border-color, #2a2e3d)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isVerified ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', color: '#10b981' }}>
                <ShieldCheck size={22} />
              </div>
            ) : isInsufficient ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '10px', color: '#ef4444' }}>
                <AlertTriangle size={22} />
              </div>
            ) : (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px', color: '#f59e0b' }}>
                <ShieldCheck size={22} />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isVerified ? 'SOURCE VERIFIED' : isInsufficient ? 'INSUFFICIENT SOURCE EVIDENCE' : 'PROVENANCE RECORD'}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                Deterministic Frame-Accurate Grounding
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Claim Text */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '10px', marginBottom: '16px', borderLeft: isVerified ? '3px solid #10b981' : '3px solid #ef4444' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted, #94a3b8)', marginBottom: '4px', fontWeight: 600 }}>
            Statement / Claim
          </div>
          <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: 500, lineHeight: 1.5 }}>
            "{claim.claim_text}"
          </div>
        </div>

        {/* Source Video & Timestamp Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>SOURCE MEDIA</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {videoTitle || claim.source_media_id}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>TIMESTAMPS (MS ACCURACY)</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
              {formatTimeMs(claim.start_ms, true)} → {formatTimeMs(claim.end_ms, true)}
            </div>
          </div>
        </div>

        {/* Transcript Evidence */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8' }}>
              GROUNDED TRANSCRIPT SPAN
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: isVerified ? '#10b981' : isInsufficient ? '#ef4444' : '#f59e0b' }}>
              {Math.round(claim.confidence * 100)}% Confidence
            </span>
          </div>
          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#e2e8f0',
              fontStyle: isInsufficient ? 'italic' : 'normal',
              maxHeight: '140px',
              overflowY: 'auto'
            }}
          >
            {claim.evidence_text}
          </div>
        </div>

        {/* Footer Meta & Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Media DNA: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{claim.media_dna}</span>
          </div>

          {!isInsufficient && (
            <button
              className="btn-primary"
              onClick={() => {
                onPlaySource(claim.start_ms);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#10b981',
                color: '#000',
                fontWeight: 700,
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Play size={14} fill="#000" />
              <span>PLAY SOURCE AT {formatTimeMs(claim.start_ms)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
