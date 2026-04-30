'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationGuard from '@/components/togather/NavigationGuard';
import ParticipantForm from '@/components/togather/ParticipantForm';
import ParticipantList from '@/components/togather/ParticipantList';
import CsvImportButton from '@/components/togather/CsvImportButton';
import AffinityForm from '@/components/togather/AffinityForm';
import AffinityList from '@/components/togather/AffinityList';
import { useTogetherStore } from '@/lib/togather/store';
import type { Affinity, Participant } from '@/lib/togather/types';

function ParticipantsScreen() {
  const router = useRouter();
  const participants = useTogetherStore((state) => state.participants);
  const affinities = useTogetherStore((state) => state.affinities);
  const addParticipant = useTogetherStore((state) => state.addParticipant);
  const updateParticipant = useTogetherStore((state) => state.updateParticipant);
  const removeParticipant = useTogetherStore((state) => state.removeParticipant);
  const addAffinity = useTogetherStore((state) => state.addAffinity);
  const removeAffinity = useTogetherStore((state) => state.removeAffinity);

  // Participant form state
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Affinity form state
  const [showAffinityForm, setShowAffinityForm] = useState(false);

  // Navigation warning state
  const [showCoachWarning, setShowCoachWarning] = useState(false);

  const editingParticipant = editingId
    ? participants.find((p) => p.id === editingId) ?? null
    : null;

  const isParticipantFormVisible = showParticipantForm || editingId !== null;
  const manualAffinityCount = affinities.filter((a) => !a.system).length;
  const hasCoachVolunteer = participants.some((p) => p.willingToCoach);

  function handleCsvImport(imported: Participant[]) {
    imported.forEach(addParticipant);
  }

  function handleParticipantSave(participant: Participant) {
    if (editingId) {
      updateParticipant(editingId, participant);
      setEditingId(null);
    } else {
      addParticipant(participant);
      setShowParticipantForm(false);
    }
  }

  function handleEdit(id: string) {
    setShowParticipantForm(false);
    setEditingId(id);
  }

  function handleCancelParticipantForm() {
    setShowParticipantForm(false);
    setEditingId(null);
  }

  function handleAffinitySave(affinity: Affinity) {
    addAffinity(affinity);
    setShowAffinityForm(false);
  }

  function handleNextClick() {
    if (!hasCoachVolunteer) {
      setShowCoachWarning(true);
    } else {
      router.push('/products/togather/app/groups');
    }
  }

  function handleProceedAnyway() {
    router.push('/products/togather/app/groups');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* Participants section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Participants ({participants.length})
          </h2>
          {!isParticipantFormVisible && (
            <div className="flex items-center gap-2">
              <CsvImportButton onImport={handleCsvImport} />
              <Button size="sm" onClick={() => setShowParticipantForm(true)}>
                <UserPlus size={14} />
                Add
              </Button>
            </div>
          )}
        </div>

        {isParticipantFormVisible && (
          <ParticipantForm
            initialValues={editingParticipant}
            participants={participants}
            onSave={handleParticipantSave}
            onCancel={handleCancelParticipantForm}
          />
        )}

        <ParticipantList
          participants={participants}
          onEdit={handleEdit}
          onRemove={removeParticipant}
        />
      </section>

      {/* Friendships section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Friendships ({manualAffinityCount})
          </h2>
          {participants.length >= 2 && !showAffinityForm && (
            <Button size="sm" variant="outline" onClick={() => setShowAffinityForm(true)}>
              <Link2 size={14} />
              Add friendship
            </Button>
          )}
        </div>

        {participants.length < 2 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Add at least two participants to record friendships.
          </p>
        ) : (
          <>
            {showAffinityForm && (
              <AffinityForm
                participants={participants}
                existingAffinities={affinities}
                onSave={handleAffinitySave}
                onCancel={() => setShowAffinityForm(false)}
              />
            )}
            <AffinityList
              affinities={affinities}
              participants={participants}
              onRemove={removeAffinity}
            />
          </>
        )}
      </section>

      {/* Coach warning */}
      {showCoachWarning && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 p-4 space-y-3"
        >
          <p className="text-sm text-amber-900 dark:text-amber-200">
            <span className="font-semibold">No coach volunteers added.</span>{' '}
            Every group will need a coach — add volunteers before running the algorithm, or proceed and assign coaches manually.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleProceedAnyway}>
              Proceed anyway
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCoachWarning(false)}>
              Go back
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={() => router.push('/products/togather/app/setup')}>
          ← Back
        </Button>
        <Button
          disabled={participants.length === 0}
          onClick={handleNextClick}
        >
          Next →
        </Button>
      </div>

    </div>
  );
}

export default function ParticipantsPage() {
  return (
    <NavigationGuard require="session">
      <ParticipantsScreen />
    </NavigationGuard>
  );
}
