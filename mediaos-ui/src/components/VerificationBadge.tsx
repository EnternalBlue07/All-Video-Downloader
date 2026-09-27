import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { OutputVerification } from '../timeline';

interface VerificationBadgeProps {
  verification: OutputVerification | null;
  onReverify?: () => void;
  isLoading?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verification,
  onReverify,
  isLoading
}) => {
  if (!verification) {
    return (
      <button
        onClick={onReverify}
        disabled={isLoading}
        className="verification-pill unverified"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'rgba(148, 163, 184, 0.1)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          cursor: 'pointer'
        }}
        title="Click to run ffprobe container verification"
      >
        <RefreshCw size={12} className={isLoading ? 'spin' : ''} />
        <span>Verify Output</span>
      </button>
    );
  }

  if (verification.verified) {
    return (
      <div
        className="verification-pill verified"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
        title={`Verified via ffprobe: ${verification.video_codec}/${verification.audio_codec} • ${verification.video_resolution} • ${verification.duration_ms}ms`}
      >
        <CheckCircle2 size={12} />
        <span>OUTPUT VERIFIED ✓</span>
      </div>
    );
  }

  return (
    <div
      className="verification-pill failed"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}
      title={verification.error_message || 'Container integrity check failed'}
    >
      <AlertCircle size={12} />
      <span>VERIFICATION FAILED</span>
    </div>
  );
};
