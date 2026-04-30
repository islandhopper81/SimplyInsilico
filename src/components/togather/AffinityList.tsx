'use client';

import { Button } from '@/components/ui/button';
import type { Affinity, Participant } from '@/lib/togather/types';

interface AffinityListProps {
  affinities: Affinity[];
  participants: Participant[];
  onRemove: (fromId: string, toId: string) => void;
}

export default function AffinityList({ affinities, participants, onRemove }: AffinityListProps) {
  const nameById = new Map(participants.map((p) => [p.id, p.name]));

  if (affinities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No friendships added yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {affinities.map((affinity) => {
        const fromName = nameById.get(affinity.fromId) ?? affinity.fromId;
        const toName = nameById.get(affinity.toId) ?? affinity.toId;

        return (
          <div
            key={`${affinity.fromId}-${affinity.toId}`}
            className="flex items-center justify-between gap-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              {affinity.system && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                  Coach
                </span>
              )}
              <span className="text-foreground truncate">
                {fromName}
              </span>
              <span className="text-muted-foreground shrink-0">
                {affinity.system ? '↔' : '→'}
              </span>
              <span className="text-foreground truncate">
                {toName}
              </span>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {affinity.weight.toFixed(1)}
              </span>
            </div>

            {!affinity.system && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(affinity.fromId, affinity.toId)}
                aria-label={`Remove friendship from ${fromName} to ${toName}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
