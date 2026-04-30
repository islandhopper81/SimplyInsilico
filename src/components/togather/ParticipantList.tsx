'use client';

import { Button } from '@/components/ui/button';
import type { Participant } from '@/lib/togather/types';

interface ParticipantListProps {
  participants: Participant[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ParticipantList({ participants, onEdit, onRemove }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Add your first participant above.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center justify-between gap-4 py-3 text-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-medium text-foreground truncate">{participant.name}</span>
            <span className="text-muted-foreground shrink-0">{participant.ageGroup}</span>
            {participant.willingToCoach && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                🧢 Coach
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(participant.id)}
              aria-label={`Edit ${participant.name}`}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(participant.id)}
              aria-label={`Remove ${participant.name}`}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
