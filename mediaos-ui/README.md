# MEDIAOS Client Application (Frontend UI)

> **Next-Generation React 19 + TypeScript Media Intelligence Workspace**  
> *Crafted with meticulous attention to detail by **Mohammad Zumaan Sayyed***

---

## Architectural Principles & Highlights

**MEDIAOS UI** is a lightning-fast Single Page Application (SPA) designed to feel like a native desktop operating system for video creators, researchers, and media archivists.

* **Framework:** [React 19](https://react.dev/) utilizing modern hooks and concurrent rendering features.
* **Build Tooling:** [Vite 8](https://vitejs.dev/) with Sub-second Hot Module Replacement (HMR).
* **Type System:** Strict [TypeScript](https://www.typescriptlang.org/) with complete API request and response typings.
* **Iconography:** [Lucide React](https://lucide.dev/) for crisp, scalable UI icons.
* **Design Philosophy:** Dark cyber-luxurious aesthetic with custom CSS tokens, smooth glassmorphism, accent glow borders, and micro-interactions.

---

## Workspace Views

The application provides 13 dedicated workspace views accessible via the sidebar and global command palette:

1. **Overview Dashboard (`OverviewView`):** High-level KPI telemetry, storage usage meters, quick-access media cards, and recent download activities.
2. **Library Explorer (`LibraryView`):** Filterable, searchable grid and list view of all ingested media assets with resolution badges, duration pills, and bulk operations.
3. **Media Intelligence Studio (`MediaDetailView`):** Deep inspection interface featuring synchronized interactive transcripts, AI chapter scrubbers, key concept chips, flashcards, and instant multi-format exporters.
4. **Clip Studio (`ClipStudioView`):** Interactive vertical video editor (16:9 $\rightarrow$ 9:16) with drag-to-trim range sliders, caption toggle, and instant MP4 export.
5. **Ask Library Q&A (`AskLibraryView`):** Cross-video semantic RAG search allowing natural language questions across the entire media vault.
6. **Transcript Search (`TranscriptsView`):** High-speed regex and keyword search across millions of spoken words with 1-click jump-to-timestamp.
7. **Knowledge Base (`KnowledgeView`):** Curated concept graphs, flashcards, and automated mind maps generated from video transcripts.
8. **Course Builder (`CourseBuilderView`):** Organize scattered video lectures into structured, step-by-step masterclasses with progress tracking.
9. **Collections (`CollectionsView`):** Custom playlists and thematic project buckets.
10. **Download Center (`DownloadCenterView`):** Live queue monitoring with real-time download speeds (MB/s), dynamic ETAs, and cancel controls.
11. **Storage Radar (`StorageView`):** Disk consumption breakdown by codec, resolution, and duplicate candidates with 1-click space reclaim.
12. **System Intelligence (`IntelligenceView`):** Model status, processing queue metrics, and neural engine telemetry.
13. **Settings (`SettingsView`):** Ingestion preferences, default video codecs, SponsorBlock automation, and FFmpeg parameter overrides.

---

## Global Command Palette (`⌘K` / `Ctrl+K`)

Pressing `⌘K` (or clicking the search bar in the top navigation) launches the Spotlight-style command palette:
* Type any URL to inspect and download instantly.
* Execute system commands (e.g. `Navigate to Clip Studio`, `Reclaim Storage`, `Export Transcripts`).
* Search videos, creators, topics, and transcripts with keyboard navigation.

---

## Local Development & Production Build

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Preview production build
npm run preview
```
