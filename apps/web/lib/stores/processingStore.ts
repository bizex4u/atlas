'use client';

import { create } from 'zustand';

// ── Stage definition ──────────────────────────────────────────────────────────

export type PipelineStage =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'validating'
  | 'geocoding'
  | 'plotting'
  | 'building_heatmap'
  | 'building_knowledge'
  | 'ready'
  | 'error';

export const STAGE_ORDER: PipelineStage[] = [
  'uploading',
  'parsing',
  'validating',
  'geocoding',
  'plotting',
  'building_heatmap',
  'building_knowledge',
  'ready',
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  idle:               'Idle',
  uploading:          'Uploading file…',
  parsing:            'Parsing file…',
  validating:         'Validating data…',
  geocoding:          'Geocoding dealers…',
  plotting:           'Plotting dealers…',
  building_heatmap:   'Building heatmap…',
  building_knowledge: 'Building knowledge index…',
  ready:              'Ready',
  error:              'Error',
};

// ── Event log ─────────────────────────────────────────────────────────────────

export interface PipelineEvent {
  id: string;
  ts: Date;
  message: string;
  stage: PipelineStage;
}

const MAX_EVENTS = 100;

// ── State ─────────────────────────────────────────────────────────────────────

export interface ProcessingState {
  stage: PipelineStage;
  completedStages: PipelineStage[];
  isBusy: boolean;

  // Progress
  progress: number; // 0–100

  // Dealer counts
  dealerTotal: number;
  dealerValid: number;
  dealerSkipped: number;

  // Geocoding
  geocodeTotal: number;
  geocodeResolved: number;
  geocodeFailed: number;

  // Meta
  warningCount: number;
  errorCount: number;
  stageErrors: Partial<Record<PipelineStage, string>>;

  // Timing
  startedAt: Date | null;
  finishedAt: Date | null;

  // Event log
  events: PipelineEvent[];
}

// ── Actions ───────────────────────────────────────────────────────────────────

export interface ProcessingActions {
  // Lifecycle
  startUpload: () => void;
  startParsing: () => void;
  parseDone: (total: number, valid: number, skipped: number) => void;
  startGeocoding: (total: number) => void;
  geocodeProgress: (resolved: number, failed: number) => void;
  geocodeDone: () => void;
  startPlotting: () => void;
  plotDone: () => void;
  startHeatmap: () => void;
  heatmapDone: () => void;
  startKnowledge: () => void;
  knowledgeDone: () => void;
  setReady: () => void;
  setError: (stage: PipelineStage, message: string) => void;
  reset: () => void;

  // Event log
  addEvent: (message: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEvent(message: string, stage: PipelineStage): PipelineEvent {
  return { id: `${Date.now()}-${Math.random()}`, ts: new Date(), message, stage };
}

function appendEvent(events: PipelineEvent[], message: string, stage: PipelineStage): PipelineEvent[] {
  const next = [...events, makeEvent(message, stage)];
  return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
}

function stageProgress(stage: PipelineStage): number {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx < 0) return 0;
  return Math.round((idx / (STAGE_ORDER.length - 1)) * 100);
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initial: ProcessingState = {
  stage: 'idle',
  completedStages: [],
  isBusy: false,
  progress: 0,
  dealerTotal: 0,
  dealerValid: 0,
  dealerSkipped: 0,
  geocodeTotal: 0,
  geocodeResolved: 0,
  geocodeFailed: 0,
  warningCount: 0,
  errorCount: 0,
  stageErrors: {},
  startedAt: null,
  finishedAt: null,
  events: [],
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useProcessingStore = create<ProcessingState & ProcessingActions>((set, get) => ({
  ...initial,

  startUpload: () =>
    set((s) => ({
      stage: 'uploading',
      completedStages: [],
      isBusy: true,
      progress: stageProgress('uploading'),
      startedAt: new Date(),
      finishedAt: null,
      stageErrors: {},
      warningCount: 0,
      errorCount: 0,
      events: appendEvent(s.events, 'Dealer upload started', 'uploading'),
    })),

  startParsing: () =>
    set((s) => ({
      stage: 'parsing',
      completedStages: [...s.completedStages, 'uploading'],
      progress: stageProgress('parsing'),
      events: appendEvent(s.events, 'Parsing file…', 'parsing'),
    })),

  parseDone: (total, valid, skipped) =>
    set((s) => ({
      stage: 'validating',
      completedStages: [...s.completedStages, 'parsing'],
      progress: stageProgress('validating'),
      dealerTotal: total,
      dealerValid: valid,
      dealerSkipped: skipped,
      warningCount: s.warningCount + (skipped > 0 ? 1 : 0),
      events: appendEvent(
        s.events,
        `Parsed ${total} rows — ${valid} valid, ${skipped} skipped`,
        'parsing',
      ),
    })),

  startGeocoding: (total) =>
    set((s) => ({
      stage: 'geocoding',
      completedStages: [...s.completedStages, 'validating'],
      progress: stageProgress('geocoding'),
      geocodeTotal: total,
      geocodeResolved: 0,
      geocodeFailed: 0,
      events: appendEvent(s.events, `Geocoding ${total} dealers…`, 'geocoding'),
    })),

  geocodeProgress: (resolved, failed) =>
    set((s) => {
      const pct = s.geocodeTotal > 0
        ? Math.round(((resolved + failed) / s.geocodeTotal) * 100)
        : 100;
      // Geocoding occupies ~20% of the full bar between its start and plotting
      const geoBase  = stageProgress('geocoding');
      const plotBase = stageProgress('plotting');
      const progress = Math.round(geoBase + (pct / 100) * (plotBase - geoBase));
      return { geocodeResolved: resolved, geocodeFailed: failed, progress };
    }),

  geocodeDone: () =>
    set((s) => ({
      events: appendEvent(
        s.events,
        `Geocoding complete — ${s.geocodeResolved} resolved, ${s.geocodeFailed} failed`,
        'geocoding',
      ),
    })),

  startPlotting: () =>
    set((s) => ({
      stage: 'plotting',
      completedStages: [...s.completedStages, 'geocoding'],
      progress: stageProgress('plotting'),
      events: appendEvent(s.events, `Plotting ${s.dealerValid} dealers on map…`, 'plotting'),
    })),

  plotDone: () =>
    set((s) => ({
      completedStages: [...s.completedStages, 'plotting'],
      events: appendEvent(s.events, 'Dealers plotted on map', 'plotting'),
    })),

  startHeatmap: () =>
    set((s) => ({
      stage: 'building_heatmap',
      completedStages: s.completedStages.includes('plotting')
        ? s.completedStages
        : [...s.completedStages, 'plotting'],
      progress: stageProgress('building_heatmap'),
      events: appendEvent(s.events, 'Building attention heatmap…', 'building_heatmap'),
    })),

  heatmapDone: () =>
    set((s) => ({
      completedStages: [...s.completedStages, 'building_heatmap'],
      events: appendEvent(s.events, 'Heatmap generated', 'building_heatmap'),
    })),

  startKnowledge: () =>
    set((s) => ({
      stage: 'building_knowledge',
      completedStages: s.completedStages.includes('building_heatmap')
        ? s.completedStages
        : [...s.completedStages, 'building_heatmap'],
      progress: stageProgress('building_knowledge'),
      events: appendEvent(s.events, 'Building knowledge index…', 'building_knowledge'),
    })),

  knowledgeDone: () =>
    set((s) => ({
      completedStages: [...s.completedStages, 'building_knowledge'],
      events: appendEvent(s.events, 'Knowledge index ready', 'building_knowledge'),
    })),

  setReady: () =>
    set((s) => ({
      stage: 'ready',
      isBusy: false,
      progress: 100,
      finishedAt: new Date(),
      completedStages: [...new Set([...s.completedStages, 'ready' as PipelineStage])],
      events: appendEvent(s.events, 'Atlas ready', 'ready'),
    })),

  setError: (stage, message) =>
    set((s) => ({
      errorCount: s.errorCount + 1,
      stageErrors: { ...s.stageErrors, [stage]: message },
      events: appendEvent(s.events, `Error in ${STAGE_LABELS[stage]}: ${message}`, stage),
    })),

  reset: () => set({ ...initial }),

  addEvent: (message) =>
    set((s) => ({
      events: appendEvent(s.events, message, get().stage),
    })),
}));
