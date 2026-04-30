'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationGuard from '@/components/togather/NavigationGuard';
import ParticipantForm from '@/components/togather/ParticipantForm';
import ParticipantList from '@/components/togather/ParticipantList';
import CsvImportButton from '@/components/togather/CsvImportButton';
import { useTogetherStore } from '@/lib/togather/store';
import type { Participant } from '@/lib/togather/types';

function ParticipantsScreen() {
  const router = useRouter();
  const participants = useTogetherStore((state) => state.participants);
  const addParticipant = useTogetherStore((state) => state.addParticipant);
  const updateParticipant = useTogetherStore((state) => state.updateParticipant);
  const removeParticipant = useTogetherStore((state) => state.removeParticipant);

  function handleCsvImport(imported: Participant[]) {
    imported.forEach(addParticipant);
  }

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingParticipant = editingId
    ? participants.find((p) => p.id === editingId) ?? null
    : null;

  function handleSave(participant: Participant) {
    if (editingId) {
      updateParticipant(editingId, participant);
      setEditingId(null);
    } else {
      addParticipant(participant);
      setShowForm(false);
    }
  }

  function handleEdit(id: string) {
    setShowForm(false);
    setEditingId(id);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  const isFormVisible = showForm || editingId !== null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* Participants section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Participants ({participants.length})
          </h2>
          {!isFormVisible && (
            <div className="flex items-center gap-2">
              <CsvImportButton onImport={handleCsvImport} />
              <Button size="sm" onClick={() => setShowForm(true)}>
                <UserPlus size={14} />
                Add
              </Button>
            </div>
          )}
        </div>

        {isFormVisible && (
          <ParticipantForm
            initialValues={editingParticipant}
            onSave={handleSave}
            onCancel={handleCancelForm}
          />
        )}

        <ParticipantList
          participants={participants}
          onEdit={handleEdit}
          onRemove={removeParticipant}
        />
      </section>

      {/* Friendships section — placeholder until SIM-49 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Friendships (0)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground py-4 text-center">
          {participants.length === 0
            ? 'Add participants first.'
            : 'Friendship entry coming soon.'}
        </p>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={() => router.push('/products/togather/app/setup')}>
          ← Back
        </Button>
        <Button
          disabled={participants.length === 0}
          onClick={() => router.push('/products/togather/app/groups')}
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
