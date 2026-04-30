'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationGuard from '@/components/togather/NavigationGuard';
import { useTogetherStore } from '@/lib/togather/store';
import { callAlgorithm } from '@/lib/togather/algorithmClient';
import type { AlgorithmGroupResult, AlgorithmWarningResponse } from '@/lib/togather/algorithmTypes';
import type { Group } from '@/lib/togather/types';

const GROUP_COLORS = [
  '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
  '#EF4444', '#06B6D4', '#F97316', '#84CC16',
  '#EC4899', '#14B8A6', '#F43F5E', '#A855F7',
];

function toStoreGroups(apiGroups: AlgorithmGroupResult[]): Group[] {
  return apiGroups.map((g, i) => ({
    id: g.id,
    name: `Team ${i + 1}`,
    color: GROUP_COLORS[i % GROUP_COLORS.length],
    memberIds: g.memberIds,
    headCoachId: g.headCoachId,
  }));
}

function GroupsScreen() {
  const router = useRouter();
  const session = useTogetherStore((state) => state.session);
  const participants = useTogetherStore((state) => state.participants);
  const affinities = useTogetherStore((state) => state.affinities);
  const groups = useTogetherStore((state) => state.groups);
  const applyAlgorithmResult = useTogetherStore((state) => state.applyAlgorithmResult);

  const [isRunning, setIsRunning] = useState(false);
  const [showRerunConfirm, setShowRerunConfirm] = useState(false);
  const [fallbackToast, setFallbackToast] = useState<string | null>(null);
  const [coachWarning, setCoachWarning] = useState<AlgorithmWarningResponse | null>(null);
  const [pendingGroups, setPendingGroups] = useState<AlgorithmGroupResult[] | null>(null);

  const hasExistingGroups = groups.length > 0 && groups.some((g) => g.memberIds.length > 0);

  async function executeAlgorithm() {
    if (!session) return;

    setIsRunning(true);
    setFallbackToast(null);

    try {
      const { response, usedFallback } = await callAlgorithm({
        session: { groupCount: session.groupCount, maxGroupSize: session.maxGroupSize },
        participants: participants.map((p) => ({
          id: p.id,
          willingToCoach: p.willingToCoach,
          childId: p.childId,
        })),
        affinities: affinities.map((a) => ({
          fromId: a.fromId,
          toId: a.toId,
          weight: a.weight,
        })),
      });

      if (usedFallback) {
        setFallbackToast(
          'Algorithm service unavailable — using local fallback. Results may be less optimal for large leagues.',
        );
        setTimeout(() => setFallbackToast(null), 6000);
      }

      if (response.status === 'coach_coverage_warning') {
        setCoachWarning(response);
        setPendingGroups(response.groups);
      } else {
        applyAlgorithmResult(toStoreGroups(response.groups));
      }
    } finally {
      setIsRunning(false);
    }
  }

  function handleRunClick() {
    if (hasExistingGroups) {
      setShowRerunConfirm(true);
    } else {
      executeAlgorithm();
    }
  }

  function handleConfirmRerun() {
    setShowRerunConfirm(false);
    executeAlgorithm();
  }

  function handleApplyCoachWarning() {
    if (pendingGroups) {
      applyAlgorithmResult(toStoreGroups(pendingGroups));
    }
    setCoachWarning(null);
    setPendingGroups(null);
  }

  function handleDismissCoachWarning() {
    setCoachWarning(null);
    setPendingGroups(null);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* Fallback toast */}
      {fallbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
        >
          {fallbackToast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Groups {hasExistingGroups ? `(${groups.length})` : ''}
        </h2>
        <Button onClick={handleRunClick} disabled={isRunning || participants.length === 0}>
          <Play size={14} />
          {isRunning ? 'Running…' : hasExistingGroups ? 'Re-run Algorithm' : 'Run Algorithm'}
        </Button>
      </div>

      {/* Empty state */}
      {!hasExistingGroups && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Run the algorithm to assign participants to groups.
        </p>
      )}

      {/* Groups placeholder — board view comes in SIM-56 */}
      {hasExistingGroups && (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3"
            >
              <span
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-sm font-medium text-foreground">{group.name}</span>
              <span className="text-xs text-muted-foreground">
                {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                {group.headCoachId ? '' : ' · no coach'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => router.push('/products/togather/app/participants')}
        >
          ← Back
        </Button>
        <Button
          disabled={!hasExistingGroups}
          onClick={() => router.push('/products/togather/app/results')}
        >
          Next →
        </Button>
      </div>

      {/* Re-run confirmation dialog */}
      {showRerunConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rerun-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-background border border-border p-6 space-y-4 shadow-lg">
            <h3 id="rerun-title" className="text-base font-semibold text-foreground">
              Re-run algorithm?
            </h3>
            <p className="text-sm text-muted-foreground">
              Re-running will overwrite your manual changes. Continue?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRerunConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmRerun}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coach coverage warning dialog */}
      {coachWarning && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-warning-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-background border border-border p-6 space-y-4 shadow-lg">
            <h3 id="coach-warning-title" className="text-base font-semibold text-foreground">
              Not enough coaches
            </h3>
            <p className="text-sm text-muted-foreground">
              The algorithm found{' '}
              <span className="font-medium text-foreground">
                {coachWarning.availableCoaches} coach volunteer
                {coachWarning.availableCoaches !== 1 ? 's' : ''}
              </span>{' '}
              for{' '}
              <span className="font-medium text-foreground">
                {coachWarning.requiredCoaches} group
                {coachWarning.requiredCoaches !== 1 ? 's' : ''}
              </span>
              . Some groups will not have a head coach. You can assign coaches manually
              after applying the results.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleDismissCoachWarning}>
                Go back to participants
              </Button>
              <Button onClick={handleApplyCoachWarning}>
                Proceed anyway
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function GroupsPage() {
  return (
    <NavigationGuard require="participants">
      <GroupsScreen />
    </NavigationGuard>
  );
}
