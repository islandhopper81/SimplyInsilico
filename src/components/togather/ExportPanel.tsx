'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCsv, downloadJson } from '@/lib/togather/exportUtils';
import { useTogetherStore } from '@/lib/togather/store';
import type { SessionState } from '@/lib/togather/types';

const DISABLED_TOOLTIP = 'Run the algorithm or assign participants manually before exporting.';

export default function ExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const session = useTogetherStore((state) => state.session);
  const participants = useTogetherStore((state) => state.participants);
  const affinities = useTogetherStore((state) => state.affinities);
  const groups = useTogetherStore((state) => state.groups);
  const meta = useTogetherStore((state) => state.meta);

  const hasGroups = groups.some((g) => g.memberIds.length > 0);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  function handleCsvDownload() {
    if (!session) return;
    downloadCsv(session.name, groups, participants);
    setIsOpen(false);
  }

  function handleJsonDownload() {
    if (!session) return;
    const sessionState: SessionState = { session, participants, affinities, groups, meta };
    downloadJson(session.name, sessionState);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        disabled={!hasGroups}
        title={!hasGroups ? DISABLED_TOOLTIP : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Download size={14} />
        Export
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Export options"
          className="absolute right-0 mt-1 w-52 rounded-lg border border-border bg-background shadow-lg py-1 z-10"
        >
          <button
            role="menuitem"
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={handleCsvDownload}
          >
            Download CSV
          </button>
          <button
            role="menuitem"
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
            onClick={handleJsonDownload}
          >
            <span className="block text-foreground">Download JSON</span>
            <span className="block text-xs text-muted-foreground">re-importable</span>
          </button>
        </div>
      )}
    </div>
  );
}
