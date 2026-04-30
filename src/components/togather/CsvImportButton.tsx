'use client';

import { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseCsv } from '@/lib/togather/csvParser';
import type { Participant } from '@/lib/togather/types';

interface CsvImportButtonProps {
  onImport: (participants: Participant[]) => void;
}

export default function CsvImportButton({ onImport }: CsvImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseCsv(text);
      if (result.ok) {
        setError(null);
        onImport(result.participants);
      } else {
        setError(result.message);
      }
    };
    reader.readAsText(file);

    e.target.value = '';
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Import participants from CSV file"
        tabIndex={-1}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setError(null);
          fileInputRef.current?.click();
        }}
      >
        <FileUp size={14} />
        Import CSV
      </Button>
      {error && (
        <p className="mt-1.5 text-xs text-destructive max-w-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
