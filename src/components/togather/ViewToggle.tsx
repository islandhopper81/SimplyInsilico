'use client';

export type ViewMode = 'board' | 'graph';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex rounded-md border border-border overflow-hidden text-sm"
    >
      <button
        type="button"
        onClick={() => onChange('board')}
        aria-pressed={view === 'board'}
        className={`px-3 py-1.5 font-medium transition-colors ${
          view === 'board'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:bg-muted'
        }`}
      >
        Board
      </button>
      <button
        type="button"
        onClick={() => onChange('graph')}
        aria-pressed={view === 'graph'}
        className={`px-3 py-1.5 font-medium border-l border-border transition-colors ${
          view === 'graph'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:bg-muted'
        }`}
      >
        Graph
      </button>
    </div>
  );
}
