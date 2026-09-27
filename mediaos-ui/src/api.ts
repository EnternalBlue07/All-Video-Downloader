export const API_BASE = typeof window !== 'undefined' && window.location.port === '5173'
  ? '/api'
  : 'http://127.0.0.1:8000/api';

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  creator: string;
  duration: number;
  resolution: string;
  thumbnail: string;
  file_size?: number;
  created_at: string;
  ai_status: string;
  topics: string[];
  summary: string;
  chapters?: Array<{ title: string; start_time: number; time_str: string }>;
  transcript?: Array<{ start: number; end: number; timestamp: string; text: string }>;
  dna?: {
    source_identity?: {
      source_id: string;
      title: string;
      creator: string;
      duration_seconds: number;
      platform: string;
    };
    content_identity?: {
      fingerprint: string;
      checksum: string;
      video_codec: string;
      audio_codec: string;
      resolution: string;
      container: string;
      fps: number;
      hdr: string;
      bitrate: string;
      channels: string;
      visual_hash: string;
    };
    fingerprint?: string;
    verified?: boolean;
  };
  knowledge?: {
    difficulty: string;
    prerequisites: string[];
    key_concepts: string[];
    notes: string[];
    glossary: Array<{ term: string; definition: string }>;
    quiz: Array<{ question: string; options: string[]; answer_index: number; explanation: string }>;
    flashcards: Array<{ front: string; back: string }>;
  };
  clip_candidates?: Array<{
    id: string;
    title: string;
    start_time: number;
    end_time: number;
    duration: number;
    why: string;
    hook: string;
  }>;
}

export interface IngestJob {
  id: string;
  media_id: string;
  url: string;
  title: string;
  thumbnail: string;
  source: string;
  stage: string;
  progress: number;
  speed: string;
  eta: string;
  size: string;
  quality: string;
  error_message?: string;
  worker?: string;
  created_at: string;
}

export interface InspectResult {
  success: boolean;
  url?: string;
  title?: string;
  creator?: string;
  duration?: number;
  thumbnail?: string;
  upload_date?: string;
  description?: string;
  formats?: Array<{
    format_id: string;
    height: number;
    label: string;
    codec: string;
    raw_codec: string;
    fps: string;
    hdr: string;
    bitrate: string;
    estimated_size: string;
    ext: string;
  }>;
  audio_options?: Array<{
    id: string;
    name: string;
    codec: string;
    bitrate: string;
    channels: string;
    recommended: boolean;
  }>;
  subtitles?: Array<{ code: string; label: string }>;
  duplicate_warning?: {
    confidence: 'EXACT' | 'LIKELY' | 'POSSIBLE';
    type: string;
    existing_id: string;
    title: string;
    creator: string;
    duration: number;
    resolution: string;
    file_size: number;
    created_at: string;
    message: string;
  } | null;
  error?: {
    title: string;
    reason: string;
    suggested_action: string;
    raw_details: string;
  };
}

export interface NaturalPlanResult {
  raw_query: string;
  intent_type: string;
  plan: {
    source_detected: string;
    video_quality: string;
    container: string;
    audio_profile: string;
    subtitles: string;
    sponsorblock: boolean;
    ai_analysis: boolean;
    stages: string[];
  };
}

export interface TranscriptSearchResult {
  media_id: string;
  media_title: string;
  media_creator: string;
  thumbnail: string;
  start: number;
  end: number;
  timestamp: string;
  text: string;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getOverview() {
    const res = await fetch(`${API_BASE}/overview`);
    return res.json();
  },

  async listMedia(query?: string, topic?: string) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (topic && topic !== 'All') params.append('topic', topic);
    const res = await fetch(`${API_BASE}/media?${params.toString()}`);
    return res.json();
  },

  async getMediaDetail(id: string): Promise<MediaItem> {
    const res = await fetch(`${API_BASE}/media/${id}`);
    if (!res.ok) throw new Error('Failed to load media details');
    return res.json();
  },

  async planCommand(text: string): Promise<NaturalPlanResult> {
    const res = await fetch(`${API_BASE}/ai/plan-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async inspectUrl(url: string): Promise<InspectResult> {
    const res = await fetch(`${API_BASE}/ingest/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return res.json();
  },

  async directIngest(url: string, title?: string): Promise<{ success: boolean; media_id: string; title: string; creator: string; duration: number; thumbnail: string }> {
    const res = await fetch(`${API_BASE}/ingest/direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title })
    });
    if (!res.ok) throw new Error('Direct ingest failed');
    return res.json();
  },

  async processMedia(payload: {
    url: string;
    title: string;
    creator: string;
    thumbnail: string;
    quality: string;
    container: string;
    audio: string;
    subtitles: string;
    sponsorblock: boolean;
    ai_analysis: boolean;
    duration?: number;
  }) {
    const res = await fetch(`${API_BASE}/ingest/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async cancelJob(jobId: string) {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/cancel`, {
      method: 'POST'
    });
    return res.json();
  },

  async listJobs(): Promise<IngestJob[]> {
    const res = await fetch(`${API_BASE}/jobs`);
    return res.json();
  },

  async searchTranscripts(q: string): Promise<TranscriptSearchResult[]> {
    const res = await fetch(`${API_BASE}/transcripts?q=${encodeURIComponent(q)}`);
    return res.json();
  },

  async askVideo(mediaId: string, question: string) {
    const res = await fetch(`${API_BASE}/ai/ask-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, question })
    });
    return res.json();
  },

  async askLibrary(question: string) {
    const res = await fetch(`${API_BASE}/ai/ask-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    return res.json();
  },

  async createClip(payload: {
    media_id: string;
    media_title: string;
    title: string;
    start_time: number;
    end_time: number;
    aspect_ratio: string;
    captions_enabled: boolean;
  }) {
    const res = await fetch(`${API_BASE}/ai/create-clip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async listClips() {
    const res = await fetch(`${API_BASE}/clips`);
    return res.json();
  },

  async deleteClip(clipId: string) {
    const res = await fetch(`${API_BASE}/clips/${clipId}`, { method: 'DELETE' });
    return res.json();
  },

  async listCollections() {
    const res = await fetch(`${API_BASE}/collections`);
    return res.json();
  },

  async createCollection(name: string, description: string, media_ids: string[]) {
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, media_ids })
    });
    return res.json();
  },

  async listCourses() {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },

  async buildCourse(title: string, description: string, media_ids: string[]) {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, media_ids })
    });
    return res.json();
  },

  async getStorage() {
    const res = await fetch(`${API_BASE}/storage`);
    return res.json();
  },

  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  getCleanFilename(title: string, ext: string = 'mp4'): string {
    const clean = (title || 'media').replace(/[\x00-\x1f\x7f\\/*?:"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
    return `${clean.slice(0, 80)}.${ext}`;
  },

  getStreamUrl(mediaId: string, title?: string): string {
    const clean = (title || 'media').replace(/[\x00-\x1f\x7f\\/*?:"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
    const slug = `${clean.slice(0, 80)}.mp4`;
    return `${API_BASE}/media/${mediaId}/stream/${encodeURIComponent(slug)}`;
  },

  getDownloadUrl(mediaId: string, title?: string, format: string = 'mp4'): string {
    const clean = (title || 'media').replace(/[\x00-\x1f\x7f\\/*?:"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
    const slug = `${clean.slice(0, 80)}.${format}`;
    return `${API_BASE}/media/${mediaId}/download/${encodeURIComponent(slug)}?format=${encodeURIComponent(format)}`;
  },

  async getExportOptions(mediaId: string) {
    const res = await fetch(`${API_BASE}/media/${mediaId}/export-options`);
    return res.json();
  }
};
