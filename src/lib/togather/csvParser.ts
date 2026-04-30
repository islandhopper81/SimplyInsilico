import type { Participant } from './types';

export interface CsvParseSuccess {
  ok: true;
  participants: Participant[];
}

export interface CsvParseError {
  ok: false;
  message: string;
}

export type CsvParseResult = CsvParseSuccess | CsvParseError;

const REQUIRED_COLUMNS = ['name', 'age_group'] as const;
const OPTIONAL_COLUMNS = ['contact_email', 'willing_to_coach'] as const;

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (insideQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

function parseWillingToCoach(value: string): boolean {
  return ['true', 'yes', '1'].includes(value.toLowerCase().trim());
}

export function parseCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { ok: false, message: 'CSV must have a header row and at least one data row.' };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());

  for (const required of REQUIRED_COLUMNS) {
    if (!headers.includes(required)) {
      return {
        ok: false,
        message: `Column '${required}' is required but was not found. Check that your CSV header row uses the exact column name.`,
      };
    }
  }

  const colIndex = (name: string): number => headers.indexOf(name);

  const participants: Participant[] = [];

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const fields = parseCsvLine(lines[rowIndex]);

    const name = fields[colIndex('name')] ?? '';
    const ageGroup = fields[colIndex('age_group')] ?? '';

    if (!name || !ageGroup) {
      return {
        ok: false,
        message: `Row ${rowIndex + 1} is missing a required value. Both 'name' and 'age_group' must be present on every row.`,
      };
    }

    const contactEmailIndex = colIndex('contact_email');
    const willingToCoachIndex = colIndex('willing_to_coach');

    participants.push({
      id: crypto.randomUUID(),
      name,
      ageGroup,
      contactEmail:
        contactEmailIndex >= 0 && fields[contactEmailIndex]
          ? fields[contactEmailIndex]
          : undefined,
      willingToCoach:
        willingToCoachIndex >= 0
          ? parseWillingToCoach(fields[willingToCoachIndex] ?? '')
          : false,
    });
  }

  return { ok: true, participants };
}

// Exported for documentation purposes only — not used at runtime
export const CSV_COLUMN_SPEC = {
  required: REQUIRED_COLUMNS,
  optional: OPTIONAL_COLUMNS,
  willingToCoachValues: ['true', 'false', 'yes', 'no', '1', '0'],
};
