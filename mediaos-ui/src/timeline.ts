/**
 * ==============================================================================
 *   MEDIAOS CANONICAL TIMELINE CLIENT
 *   Frame-Accurate Millisecond Timeline Engine for React UI
 *   Built by Mohammad Zumaan Sayyed
 * ==============================================================================
 */

export interface CanonicalTimelineSegment {
  id: string;
  segment_index: number;
  start_ms: number;
  end_ms: number;
  duration_ms: number;
  time_str: string;
  end_str: string;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface ProvenanceClaim {
  id: string;
  source_media_id: string;
  media_dna: string;
  claim_text: string;
  transcript_segment_ids: string[];
  start_ms: number;
  end_ms: number;
  start_str?: string;
  end_str?: string;
  confidence: number;
  evidence_text: string;
  transcription_model: string;
  analysis_model: string;
  status: 'VERIFIED' | 'HIGH_CONFIDENCE' | 'MEDIUM_CONFIDENCE' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_EVIDENCE';
  created_at: string;
}


export interface OutputVerification {
  id: string;
  asset_type: 'media' | 'clip' | 'export';
  asset_id: string;
  file_path: string;
  file_size: number;
  format_name: string;
  duration_ms: number;
  has_video: boolean;
  has_audio: boolean;
  video_codec: string;
  audio_codec: string;
  video_resolution: string;
  stream_count: number;
  verified: boolean;
  error_message?: string;
  verified_at: string;
}

/**
 * Formats integer milliseconds into `hh:mm:ss.mmm` or `mm:ss.mmm`.
 */
export function formatTimeMs(ms: number, includeHours: boolean = false): string {
  if (!ms || ms < 0 || isNaN(ms)) return '00:00.000';
  const totalSeconds = Math.floor(ms / 1000);
  const remMs = Math.floor(ms % 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const msPad = remMs.toString().padStart(3, '0');
  const secPad = seconds.toString().padStart(2, '0');
  const minPad = minutes.toString().padStart(2, '0');

  if (hours > 0 || includeHours) {
    const hrPad = hours.toString().padStart(2, '0');
    return `${hrPad}:${minPad}:${secPad}.${msPad}`;
  }
  return `${minPad}:${secPad}.${msPad}`;
}

/**
 * Parses timestamp string or second float into integer milliseconds.
 */
export function parseTimeToMs(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') {
    // If clearly in seconds (e.g. video.currentTime = 142.3), convert to ms
    return Math.round(input * 1000);
  }

  const str = input.trim();
  if (!str) return 0;

  if (str.toLowerCase().endsWith('ms')) {
    const val = parseFloat(str.slice(0, -2));
    return isNaN(val) ? 0 : Math.round(val);
  }
  if (str.toLowerCase().endsWith('s')) {
    const val = parseFloat(str.slice(0, -1));
    return isNaN(val) ? 0 : Math.round(val * 1000);
  }

  const parts = str.split(':');
  try {
    if (parts.length === 3) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const secParts = parts[2].split('.');
      const s = parseInt(secParts[0], 10) || 0;
      const ms = secParts.length > 1 ? parseInt(secParts[1].padEnd(3, '0').slice(0, 3), 10) || 0 : 0;
      return (h * 3600 + m * 60 + s) * 1000 + ms;
    } else if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const secParts = parts[1].split('.');
      const s = parseInt(secParts[0], 10) || 0;
      const ms = secParts.length > 1 ? parseInt(secParts[1].padEnd(3, '0').slice(0, 3), 10) || 0 : 0;
      return (m * 60 + s) * 1000 + ms;
    } else if (parts.length === 1) {
      const num = parseFloat(parts[0]);
      return isNaN(num) ? 0 : Math.round(num * 1000);
    }
  } catch {
    return 0;
  }
  return 0;
}
