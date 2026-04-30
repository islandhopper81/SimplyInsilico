'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Participant } from '@/lib/togather/types';

interface ParticipantFormProps {
  initialValues: Participant | null;
  participants: Participant[];
  onSave: (participant: Participant) => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  ageGroup?: string;
}

const EMPTY_FORM = {
  name: '',
  ageGroup: '',
  contactEmail: '',
  willingToCoach: false,
  coachingNotes: '',
  childId: '',
};

export default function ParticipantForm({ initialValues, participants, onSave, onCancel }: ParticipantFormProps) {
  const [fields, setFields] = useState({
    name: initialValues?.name ?? EMPTY_FORM.name,
    ageGroup: initialValues?.ageGroup ?? EMPTY_FORM.ageGroup,
    contactEmail: initialValues?.contactEmail ?? EMPTY_FORM.contactEmail,
    willingToCoach: initialValues?.willingToCoach ?? EMPTY_FORM.willingToCoach,
    coachingNotes: initialValues?.coachingNotes ?? EMPTY_FORM.coachingNotes,
    childId: initialValues?.childId ?? EMPTY_FORM.childId,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = initialValues !== null;

  function validateName(): boolean {
    if (!fields.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Name is required' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: undefined }));
    return true;
  }

  function validateAgeGroup(): boolean {
    if (!fields.ageGroup.trim()) {
      setErrors((prev) => ({ ...prev, ageGroup: 'Age group is required' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, ageGroup: undefined }));
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nameValid = validateName();
    const ageGroupValid = validateAgeGroup();
    if (!nameValid || !ageGroupValid) return;

    onSave({
      id: initialValues?.id ?? crypto.randomUUID(),
      name: fields.name.trim(),
      ageGroup: fields.ageGroup.trim(),
      contactEmail: fields.contactEmail.trim() || undefined,
      willingToCoach: fields.willingToCoach,
      coachingNotes: fields.coachingNotes.trim() || undefined,
      childId: fields.willingToCoach && fields.childId ? fields.childId : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-muted/40 border border-border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="p-name" className="block text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="p-name"
            type="text"
            value={fields.name}
            onChange={(e) => setFields((prev) => ({ ...prev, name: e.target.value }))}
            onBlur={validateName}
            aria-describedby={errors.name ? 'p-name-error' : undefined}
            aria-invalid={!!errors.name}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
          />
          {errors.name && (
            <p id="p-name-error" className="text-xs text-destructive" role="alert">{errors.name}</p>
          )}
        </div>

        {/* Age Group */}
        <div className="space-y-1.5">
          <label htmlFor="p-age-group" className="block text-sm font-medium text-foreground">
            Age Group <span className="text-destructive">*</span>
          </label>
          <input
            id="p-age-group"
            type="text"
            value={fields.ageGroup}
            onChange={(e) => setFields((prev) => ({ ...prev, ageGroup: e.target.value }))}
            onBlur={validateAgeGroup}
            placeholder="U10"
            aria-describedby={errors.ageGroup ? 'p-age-group-error' : undefined}
            aria-invalid={!!errors.ageGroup}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
          />
          {errors.ageGroup && (
            <p id="p-age-group-error" className="text-xs text-destructive" role="alert">{errors.ageGroup}</p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label htmlFor="p-email" className="block text-sm font-medium text-foreground">
            Contact Email
          </label>
          <input
            id="p-email"
            type="email"
            value={fields.contactEmail}
            onChange={(e) => setFields((prev) => ({ ...prev, contactEmail: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Coaching Notes */}
        <div className="space-y-1.5">
          <label htmlFor="p-coaching-notes" className="block text-sm font-medium text-foreground">
            Coaching Notes
          </label>
          <input
            id="p-coaching-notes"
            type="text"
            value={fields.coachingNotes}
            onChange={(e) => setFields((prev) => ({ ...prev, coachingNotes: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Willing to coach */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            id="p-willing-to-coach"
            type="checkbox"
            checked={fields.willingToCoach}
            onChange={(e) => setFields((prev) => ({
              ...prev,
              willingToCoach: e.target.checked,
              childId: e.target.checked ? prev.childId : '',
            }))}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <label htmlFor="p-willing-to-coach" className="text-sm font-medium text-foreground">
            Willing to coach
          </label>
        </div>

        {fields.willingToCoach && (
          <div className="space-y-1.5 pl-6">
            <label htmlFor="p-child-id" className="block text-sm font-medium text-foreground">
              Linked child <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select
              id="p-child-id"
              value={fields.childId}
              onChange={(e) => setFields((prev) => ({ ...prev, childId: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">None</option>
              {participants
                .filter((p) => p.id !== initialValues?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <p className="text-xs text-muted-foreground">
              If this coach has a child in the session, select them here. A strong keep-together preference will be set automatically.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {isEditMode ? 'Save Changes' : 'Add Participant'}
        </Button>
      </div>
    </form>
  );
}
