'use client';

import { useTogetherStore } from '@/lib/togather/store';

export default function ScoreBar() {
  const meta = useTogetherStore((state) => state.meta);
  const groups = useTogetherStore((state) => state.groups);

  const totalGroups = groups.length;
  const { satisfactionScore, coachCoverage } = meta;

  const satisfactionPercent = Math.round(satisfactionScore * 100);
  const hasCoachGap = totalGroups > 0 && coachCoverage < totalGroups;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-border bg-card px-4 py-3 flex flex-wrap gap-4 items-center text-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-muted-foreground whitespace-nowrap">Friend satisfaction</span>
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${satisfactionPercent}%` }}
            />
          </div>
          <span className="font-medium text-foreground tabular-nums">{satisfactionPercent}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground whitespace-nowrap">Coach coverage</span>
        <span className="font-medium text-foreground tabular-nums">
          {coachCoverage}/{totalGroups}
        </span>
        {hasCoachGap && (
          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
            {totalGroups - coachCoverage} group{totalGroups - coachCoverage !== 1 ? 's' : ''} missing coach
          </span>
        )}
      </div>
    </div>
  );
}
