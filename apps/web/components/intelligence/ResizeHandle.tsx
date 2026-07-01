'use client';

import { useRef } from 'react';
import { usePanelStore, PANEL_MIN, PANEL_MAX } from '@/lib/stores/panelStore';

export function ResizeHandle() {
  const setPanelWidth = usePanelStore((s) => s.setPanelWidth);
  const panelWidth = usePanelStore((s) => s.panelWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current) return;
      const delta = startX.current - ev.clientX; // drag left → wider panel
      const next = Math.min(PANEL_MAX, Math.max(PANEL_MIN, startWidth.current + delta));
      setPanelWidth(next);
    }

    function onMouseUp() {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="group relative w-1 shrink-0 cursor-col-resize bg-zinc-800 hover:bg-blue-500/60 transition-colors duration-150"
      title="Drag to resize panel"
    >
      {/* Visual grip dots */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-blue-400" />
        ))}
      </div>
    </div>
  );
}
