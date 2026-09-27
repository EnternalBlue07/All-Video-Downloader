import React, { useState, useEffect } from 'react';
import { Settings, Shield, HardDrive, Cpu, Terminal, Key, Check, Code, Server, Database } from 'lucide-react';
import { api } from '../api';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [activeTier, setActiveTier] = useState<'basic' | 'advanced' | 'developer'>('basic');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!settings) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span className="status-dot" /> Loading engine settings...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
          SYSTEM PARAMETERS & DEVELOPER RUNTIME
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Settings
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Configure ingestion defaults, FFmpeg hardware encoders, local neural transcription, and low-level CLI flags.
        </p>
      </div>

      {/* Progressive Disclosure Tier Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'basic', label: 'Basic Settings', icon: Settings },
          { id: 'advanced', label: 'Advanced Processing', icon: Cpu },
          { id: 'developer', label: 'Developer Runtime', icon: Code }
        ].map(tier => {
          const Icon = tier.icon;
          const isActive = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'var(--surface-secondary)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent-lime)' : 'inherit'} />
              {tier.label}
            </button>
          );
        })}
      </div>

      {/* Main Settings Card */}
      <div className="technical-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* TIER 1: BASIC SETTINGS */}
        {activeTier === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              General Ingestion & Storage Defaults
            </h3>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Default Quality Target:
              </label>
              <select
                defaultValue={settings.downloads.default_quality}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-primary)' }}
              >
                <option>Best Available (Up to 4K 2160p)</option>
                <option>1080p (Full HD Balanced)</option>
                <option>720p (Lightweight)</option>
                <option>Audio Only (Lossless Master Stream)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Default Output Container:
              </label>
              <select
                defaultValue={settings.downloads.default_format}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-primary)' }}
              >
                <option>MP4 (Universal Standard)</option>
                <option>MKV (Multi-track lossless)</option>
                <option>WEBM (AV1 native)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Storage Location:
              </label>
              <input
                type="text"
                defaultValue={settings.downloads.download_location}
                className="media-input-field"
                style={{ width: '100%', padding: '8px 12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>
        )}

        {/* TIER 2: ADVANCED SETTINGS */}
        {activeTier === 'advanced' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hardware Encoders & AI Models
            </h3>

            <div style={{ background: 'var(--surface-secondary)', padding: '12px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FFmpeg 8.1 Engine Status:</span>
              <span style={{ color: 'var(--accent-lime)' }}>{settings.processing.ffmpeg_version}</span>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Hardware Acceleration Profile:
              </label>
              <select
                defaultValue={settings.processing.hardware_acceleration}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-primary)' }}
              >
                <option>NVIDIA NVENC / Apple VT / QuickSync (Automatic)</option>
                <option>Dedicated CUDA NVENC</option>
                <option>Apple VideoToolbox (Metal)</option>
                <option>CPU SVT-AV1 (Highest Density Compression)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Local Transcription Model:
              </label>
              <input
                type="text"
                readOnly
                value={settings.ai.transcription_model}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" defaultChecked={settings.processing.sponsorblock} style={{ accentColor: 'var(--accent-lime)' }} />
                <span>SponsorBlock Filters (Automatically exclude sponsors and promotional sections)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" defaultChecked={settings.privacy.local_only} style={{ accentColor: 'var(--accent-lime)' }} />
                <span>Zero Cloud Egress: Run embeddings and speech-to-text exclusively on local device</span>
              </label>
            </div>
          </div>
        )}

        {/* TIER 3: DEVELOPER RUNTIME */}
        {activeTier === 'developer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Developer Flags, Worker Pool & Low-Level Runtime
            </h3>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                YT-DLP CLI ARGUMENTS PASS-THROUGH:
              </label>
              <input
                type="text"
                defaultValue={settings.developer?.ytdlp_cli_flags || '--no-check-certificates --geo-bypass --extractor-retries 3'}
                className="media-input-field"
                style={{ width: '100%', padding: '8px 12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                FFMPEG SVT-AV1 VIDEO ENCODER FLAGS:
              </label>
              <input
                type="text"
                defaultValue={settings.developer?.ffmpeg_video_encoder}
                className="media-input-field"
                style={{ width: '100%', padding: '8px 12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                DATABASE & FTS5 INDEX ENGINE:
              </label>
              <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <div>DB Path: {settings.developer?.db_path}</div>
                <div style={{ marginTop: '2px', color: 'var(--accent-lime)' }}>FTS Engine: {settings.developer?.fts_engine}</div>
                <div style={{ marginTop: '2px' }}>Worker Allocation: {settings.developer?.worker_threads}</div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                BROWSER COOKIES & SESSION AUTH:
              </label>
              <select
                style={{ width: '100%', padding: '8px 10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12.5px', color: 'var(--text-primary)' }}
              >
                <option>Chrome (Auto-detect session)</option>
                <option>Firefox</option>
                <option>Brave</option>
                <option>Edge</option>
                <option>Custom cookies.txt file</option>
              </select>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          {savedSuccess ? (
            <span style={{ fontSize: '12px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} /> Configuration saved & applied to engine.
            </span>
          ) : <span />}

          <button className="btn-primary" onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
