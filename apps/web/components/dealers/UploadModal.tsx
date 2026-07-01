'use client';

import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UploadCloud, X, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { parseDealerFile } from '@/lib/parseDealers';
import { useProcessingStore } from '@/lib/stores/processingStore';
import { isValidCoord } from '@/lib/geo/coordValidator';
import type { Dealer } from '@/types/dealer';
import type { ParseResult } from '@/types/dealer';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (dealers: Dealer[]) => Promise<void>;
  onFileSelected: (file: File) => void;
}

type ModalPhase =
  | 'idle'
  | 'parsing'
  | 'result'
  | 'importing'
  | 'error';

interface ModalState {
  phase: ModalPhase;
  file?: File;
  result?: ParseResult;
  errorMessage?: string;
}

// ── Stage row component ────────────────────────────────────────────────────────

type RowStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped';

function StageRow({ label, status, detail }: { label: string; status: RowStatus; detail?: string }) {
  const icon = {
    pending: <span className="h-3.5 w-3.5 rounded-full border border-zinc-700" />,
    running: <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B794F4]" />,
    done:    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />,
    error:   <AlertCircle className="h-3.5 w-3.5 text-red-400" />,
    skipped: <span className="h-3.5 w-3.5 rounded-full border border-zinc-800 bg-zinc-800/50" />,
  }[status];

  const textClass = {
    pending: 'text-zinc-600',
    running: 'text-zinc-300',
    done:    'text-zinc-400',
    error:   'text-red-400',
    skipped: 'text-zinc-700',
  }[status];

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={`text-xs ${textClass}`}>{label}</span>
      </div>
      {detail && (
        <span className="text-[11px] text-zinc-600 font-mono">{detail}</span>
      )}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────

export function UploadModal({ open, onOpenChange, onImport, onFileSelected }: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<ModalState>({ phase: 'idle' });
  const [dragging, setDragging] = useState(false);

  const pipeline = useProcessingStore();

  function reset() {
    setModal({ phase: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleClose() {
    // Don't allow closing mid-import
    if (modal.phase === 'importing') return;
    onOpenChange(false);
    reset();
  }

  async function handleFile(file: File) {
    setModal({ phase: 'parsing', file });
    onFileSelected(file);
    try {
      const result = await parseDealerFile(file);
      setModal({ phase: 'result', file, result });
    } catch {
      setModal({ phase: 'error', errorMessage: 'Failed to parse file.' });
    }
  }

  async function handleImport() {
    if (modal.phase !== 'result' || !modal.result) return;
    setModal((s) => ({ ...s, phase: 'importing' }));
    try {
      await onImport(modal.result.dealers);
      // modal auto-closes via AtlasShell useEffect when stage === 'ready'
    } catch (e) {
      setModal((s) => ({
        ...s,
        phase: 'error',
        errorMessage: e instanceof Error ? e.message : 'Import failed.',
      }));
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const canImport =
    modal.phase === 'result' &&
    !!modal.result &&
    modal.result.missingColumns.length === 0 &&
    modal.result.dealers.length > 0;

  const mappableCount =
    modal.phase === 'result' && modal.result
      ? modal.result.dealers.filter((d) => isValidCoord(d.lat, d.lng)).length
      : 0;

  // ── Importing view: live pipeline stages ──────────────────────────────────

  function getStageStatus(
    stageName: typeof pipeline.stage,
    targetStages: (typeof pipeline.stage)[],
    completedCheck: (typeof pipeline.stage)[],
  ): RowStatus {
    if (completedCheck.some((s) => pipeline.completedStages.includes(s))) return 'done';
    if (targetStages.includes(pipeline.stage)) return 'running';
    return 'pending';
  }

  const geoDetail = pipeline.geocodeTotal > 0
    ? `${pipeline.geocodeResolved + pipeline.geocodeFailed} / ${pipeline.geocodeTotal}`
    : undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl outline-none"
          aria-describedby={undefined}
          onInteractOutside={(e) => { if (modal.phase === 'importing') e.preventDefault(); }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold text-white">
              {modal.phase === 'importing' ? 'Importing dealers…' : 'Upload Dealers'}
            </Dialog.Title>
            {modal.phase !== 'importing' && (
              <Dialog.Close asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            )}
          </div>

          {/* ── IDLE / ERROR: drop zone ── */}
          {(modal.phase === 'idle' || modal.phase === 'error') && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={[
                  'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 transition-colors',
                  dragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50',
                ].join(' ')}
              >
                <UploadCloud className="h-8 w-8 text-zinc-500" />
                <div className="text-center">
                  <p className="text-sm text-zinc-300">
                    Drop a file here or <span className="text-[#B794F4]">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">CSV or Excel (.xlsx)</p>
                </div>
              </div>
              {modal.phase === 'error' && (
                <p className="mt-3 text-xs text-red-400">{modal.errorMessage}</p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleInputChange}
              />
            </>
          )}

          {/* ── PARSING: spinner ── */}
          {modal.phase === 'parsing' && (
            <div className="flex items-center justify-center gap-3 py-12 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-[#B794F4]" />
              <span className="text-sm">Parsing file…</span>
            </div>
          )}

          {/* ── RESULT: validation summary ── */}
          {modal.phase === 'result' && modal.result && (
            <div className="space-y-4">
              {/* File name */}
              <div className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-2">
                <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                <span className="truncate text-sm text-zinc-300">{modal.file?.name}</span>
                <button
                  onClick={reset}
                  className="ml-auto shrink-0 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Blocking errors */}
              {modal.result.missingColumns.length > 0 && (
                <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-red-400">
                    <AlertCircle className="h-4 w-4" /> Missing required columns
                  </p>
                  <ul className="ml-1 list-disc list-inside space-y-0.5">
                    {modal.result.missingColumns.map((col) => (
                      <li key={col} className="text-xs text-red-300">{col}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary stats */}
              {modal.result.missingColumns.length === 0 && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Total rows', value: modal.result.totalRows },
                    { label: 'Valid dealers', value: modal.result.dealers.length },
                    { label: 'Will be mapped', value: mappableCount },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-md bg-zinc-800 px-3 py-2.5">
                      <div className="text-lg font-semibold text-white">{value}</div>
                      <div className="text-xs text-zinc-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skipped rows */}
              {modal.result.skipped.length > 0 && (
                <details className="rounded-md border border-zinc-700 bg-zinc-800/50">
                  <summary className="flex cursor-pointer select-none items-center gap-1.5 px-3 py-2 text-xs text-zinc-400">
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                    {modal.result.skipped.length} rows skipped
                  </summary>
                  <ul className="max-h-32 overflow-y-auto border-t border-zinc-700 px-3 py-2 space-y-1">
                    {modal.result.skipped.map((issue) => (
                      <li key={issue.row} className="text-xs text-zinc-400">
                        <span className="text-zinc-500">Row {issue.row}:</span> {issue.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Success */}
              {modal.result.dealers.length > 0 && modal.result.missingColumns.length === 0 && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {mappableCount} dealer{mappableCount !== 1 ? 's' : ''} will appear on the map
                </p>
              )}
            </div>
          )}

          {/* ── IMPORTING: live pipeline stages ── */}
          {modal.phase === 'importing' && (
            <div className="space-y-1 py-1">
              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-zinc-800 mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#6B21A8] transition-all duration-500"
                  style={{ width: `${pipeline.progress}%` }}
                />
              </div>

              <StageRow
                label="Parsing"
                status={getStageStatus(pipeline.stage, ['parsing'], ['validating', 'geocoding', 'plotting', 'building_heatmap', 'building_knowledge', 'ready'])}
              />
              <StageRow
                label="Validation"
                status={getStageStatus(pipeline.stage, ['validating'], ['geocoding', 'plotting', 'building_heatmap', 'building_knowledge', 'ready'])}
                detail={pipeline.dealerValid > 0 ? `${pipeline.dealerValid} valid` : undefined}
              />
              <StageRow
                label="Geocoding"
                status={getStageStatus(pipeline.stage, ['geocoding'], ['plotting', 'building_heatmap', 'building_knowledge', 'ready'])}
                detail={geoDetail}
              />
              <StageRow
                label="Plotting dealers"
                status={getStageStatus(pipeline.stage, ['plotting'], ['building_heatmap', 'building_knowledge', 'ready'])}
              />
              <StageRow
                label="Heatmap"
                status={getStageStatus(pipeline.stage, ['building_heatmap'], ['building_knowledge', 'ready'])}
              />
              <StageRow
                label="Knowledge index"
                status={getStageStatus(pipeline.stage, ['building_knowledge'], ['ready'])}
              />

              {/* Error summary */}
              {pipeline.errorCount > 0 && (
                <div className="mt-3 rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2">
                  <p className="text-[11px] text-red-400">
                    {pipeline.errorCount} stage{pipeline.errorCount !== 1 ? 's' : ''} had errors — Atlas continues with available data.
                  </p>
                </div>
              )}

              {pipeline.stage === 'ready' && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Atlas is ready — closing…
                </p>
              )}
            </div>
          )}

          {/* ── Actions (result phase only) ── */}
          {modal.phase === 'result' && (
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="rounded-md px-4 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleImport()}
                disabled={!canImport}
                className="rounded-md bg-[#6B21A8] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Import {modal.result && modal.result.dealers.length > 0 ? `${modal.result.dealers.length} dealers` : ''}
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
