'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Session, SessionState } from '@/lib/togather/types';

interface SessionSetupFormProps {
  onSubmit: (setup: Session) => void;
  onImport: (session: SessionState) => void;
}

interface FormErrors {
  name?: string;
  groupCount?: string;
  maxGroupSize?: string;
  import?: string;
}

function parsePositiveInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = parseInt(trimmed, 10);
  return parsed > 0 ? parsed : null;
}

function isValidSessionState(data: unknown): data is SessionState {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.session === 'object' &&
    d.session !== null &&
    typeof (d.session as Record<string, unknown>).name === 'string' &&
    typeof (d.session as Record<string, unknown>).groupCount === 'number' &&
    typeof (d.session as Record<string, unknown>).maxGroupSize === 'number' &&
    Array.isArray(d.participants) &&
    Array.isArray(d.affinities) &&
    Array.isArray(d.groups) &&
    typeof d.meta === 'object'
  );
}

export default function SessionSetupForm({ onSubmit, onImport }: SessionSetupFormProps) {
  const [name, setName] = useState('');
  const [groupCount, setGroupCount] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateName(): boolean {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Session name is required' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: undefined }));
    return true;
  }

  function validateGroupCount(): boolean {
    if (parsePositiveInteger(groupCount) === null) {
      setErrors((prev) => ({ ...prev, groupCount: 'Must be a whole number greater than 0' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, groupCount: undefined }));
    return true;
  }

  function validateMaxGroupSize(): boolean {
    if (parsePositiveInteger(maxGroupSize) === null) {
      setErrors((prev) => ({ ...prev, maxGroupSize: 'Must be a whole number greater than 0' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, maxGroupSize: undefined }));
    return true;
  }

  const isFormValid =
    name.trim().length > 0 &&
    parsePositiveInteger(groupCount) !== null &&
    parsePositiveInteger(maxGroupSize) !== null &&
    !errors.name &&
    !errors.groupCount &&
    !errors.maxGroupSize;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nameValid = validateName();
    const groupCountValid = validateGroupCount();
    const maxGroupSizeValid = validateMaxGroupSize();
    if (!nameValid || !groupCountValid || !maxGroupSizeValid) return;

    onSubmit({
      name: name.trim(),
      groupCount: parsePositiveInteger(groupCount)!,
      maxGroupSize: parsePositiveInteger(maxGroupSize)!,
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!isValidSessionState(parsed)) {
          throw new Error('Invalid session format');
        }
        setErrors((prev) => ({ ...prev, import: undefined }));
        onImport(parsed);
      } catch {
        setErrors((prev) => ({
          ...prev,
          import: 'Could not read this file. Make sure it was exported from Togather.',
        }));
      }
    };
    reader.readAsText(file);

    // Reset so the same file can be re-selected if the user corrects and retries
    e.target.value = '';
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">New Session</h1>

      {/* Session name */}
      <div className="space-y-1.5">
        <label htmlFor="session-name" className="block text-sm font-medium text-foreground">
          Session name <span className="text-destructive">*</span>
        </label>
        <input
          id="session-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={validateName}
          placeholder="Spring 2025 T-Ball League"
          aria-describedby={errors.name ? 'session-name-error' : undefined}
          aria-invalid={!!errors.name}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
        />
        {errors.name && (
          <p id="session-name-error" className="text-xs text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Number of groups */}
      <div className="space-y-1.5">
        <label htmlFor="group-count" className="block text-sm font-medium text-foreground">
          Number of groups <span className="text-destructive">*</span>
        </label>
        <input
          id="group-count"
          type="text"
          inputMode="numeric"
          value={groupCount}
          onChange={(e) => setGroupCount(e.target.value)}
          onBlur={validateGroupCount}
          placeholder="6"
          aria-describedby={errors.groupCount ? 'group-count-error' : undefined}
          aria-invalid={!!errors.groupCount}
          className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
        />
        {errors.groupCount && (
          <p id="group-count-error" className="text-xs text-destructive" role="alert">
            {errors.groupCount}
          </p>
        )}
      </div>

      {/* Max group size */}
      <div className="space-y-1.5">
        <label htmlFor="max-group-size" className="block text-sm font-medium text-foreground">
          Max participants per group <span className="text-destructive">*</span>
        </label>
        <input
          id="max-group-size"
          type="text"
          inputMode="numeric"
          value={maxGroupSize}
          onChange={(e) => setMaxGroupSize(e.target.value)}
          onBlur={validateMaxGroupSize}
          placeholder="8"
          aria-describedby={errors.maxGroupSize ? 'max-group-size-error' : undefined}
          aria-invalid={!!errors.maxGroupSize}
          className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
        />
        {errors.maxGroupSize && (
          <p id="max-group-size-error" className="text-xs text-destructive" role="alert">
            {errors.maxGroupSize}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <div className="flex-1 h-px bg-border" />
        or
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* JSON import */}
      <div className="space-y-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Import previous session JSON file"
          tabIndex={-1}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload size={14} />
          Import previous session
        </Button>
        {errors.import && (
          <p className="text-xs text-destructive" role="alert">
            {errors.import}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={!isFormValid} size="lg">
          Next →
        </Button>
      </div>
    </form>
  );
}
