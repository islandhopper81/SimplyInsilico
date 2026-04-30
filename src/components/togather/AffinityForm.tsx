'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Affinity, Participant } from '@/lib/togather/types';

interface AffinityFormProps {
  participants: Participant[];
  existingAffinities: Affinity[];
  onSave: (affinity: Affinity) => void;
  onCancel: () => void;
}

export default function AffinityForm({
  participants,
  existingAffinities,
  onSave,
  onCancel,
}: AffinityFormProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [weight, setWeight] = useState('1.0');
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!fromId) return 'Select a "from" participant.';
    if (!toId) return 'Select a "to" participant.';
    if (fromId === toId) return 'A participant cannot have a friendship with themselves.';
    const alreadyExists = existingAffinities.some(
      (a) => a.fromId === fromId && a.toId === toId
    );
    if (alreadyExists) return 'This friendship already exists.';
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return 'Weight must be a positive number.';
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSave({
      fromId,
      toId,
      weight: parseFloat(weight),
      system: false,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-muted/40 border border-border rounded-lg p-4 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* From participant */}
        <div className="space-y-1.5">
          <label htmlFor="affinity-from" className="block text-sm font-medium text-foreground">
            From participant
          </label>
          <select
            id="affinity-from"
            value={fromId}
            onChange={(e) => { setFromId(e.target.value); setError(null); }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select…</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* To participant */}
        <div className="space-y-1.5">
          <label htmlFor="affinity-to" className="block text-sm font-medium text-foreground">
            To participant
          </label>
          <select
            id="affinity-to"
            value={toId}
            onChange={(e) => { setToId(e.target.value); setError(null); }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select…</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <label htmlFor="affinity-weight" className="block text-sm font-medium text-foreground">
            Weight
          </label>
          <input
            id="affinity-weight"
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setError(null); }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Add Friendship
        </Button>
      </div>
    </form>
  );
}
