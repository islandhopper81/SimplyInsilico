import { describe, it, expect } from 'vitest';
import { parseCsv } from './csvParser';

describe('parseCsv', () => {
  describe('happy paths', () => {
    it('parses required columns only', () => {
      const csv = 'name,age_group\nAlice,U10\nBob,U12';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].name).toBe('Alice');
      expect(result.participants[0].ageGroup).toBe('U10');
      expect(result.participants[0].willingToCoach).toBe(false);
      expect(result.participants[0].contactEmail).toBeUndefined();
    });

    it('parses all optional columns', () => {
      const csv = 'name,age_group,contact_email,willing_to_coach\nAlice,U10,alice@example.com,true';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const p = result.participants[0];
      expect(p.contactEmail).toBe('alice@example.com');
      expect(p.willingToCoach).toBe(true);
    });

    it('accepts yes and 1 as willingToCoach truthy values', () => {
      const csv = 'name,age_group,willing_to_coach\nAlice,U10,yes\nBob,U12,1\nCarol,U10,false';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].willingToCoach).toBe(true);
      expect(result.participants[1].willingToCoach).toBe(true);
      expect(result.participants[2].willingToCoach).toBe(false);
    });

    it('assigns a unique id to each participant', () => {
      const csv = 'name,age_group\nAlice,U10\nBob,U12';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].id).not.toBe(result.participants[1].id);
    });

    it('treats column headers case-insensitively', () => {
      const csv = 'Name,Age_Group\nAlice,U10';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].name).toBe('Alice');
      expect(result.participants[0].ageGroup).toBe('U10');
    });

    it('handles quoted fields containing commas', () => {
      const csv = 'name,age_group\n"Smith, Jr.",U10';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].name).toBe('Smith, Jr.');
    });

    it('handles escaped double quotes inside quoted fields', () => {
      const csv = 'name,age_group\n"O""Brien",U10';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].name).toBe('O"Brien');
    });

    it('leaves contactEmail undefined when the column value is empty', () => {
      const csv = 'name,age_group,contact_email\nAlice,U10,';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].contactEmail).toBeUndefined();
    });

    it('handles Windows-style CRLF line endings', () => {
      const csv = 'name,age_group\r\nAlice,U10\r\nBob,U12';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants).toHaveLength(2);
    });

    it('ignores leading and trailing whitespace on fields', () => {
      const csv = 'name , age_group\n  Alice  , U10 ';
      const result = parseCsv(csv);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.participants[0].name).toBe('Alice');
      expect(result.participants[0].ageGroup).toBe('U10');
    });
  });

  describe('error paths', () => {
    it('errors on an empty string', () => {
      const result = parseCsv('');
      expect(result.ok).toBe(false);
    });

    it('errors on a CSV with a header row but no data rows', () => {
      const result = parseCsv('name,age_group');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.message).toMatch(/header row/i);
    });

    it('errors when the "name" column is missing', () => {
      const csv = 'age_group\nU10';
      const result = parseCsv(csv);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.message).toContain('name');
    });

    it('errors when the "age_group" column is missing', () => {
      const csv = 'name\nAlice';
      const result = parseCsv(csv);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.message).toContain('age_group');
    });

    it('errors when a data row has an empty name', () => {
      const csv = 'name,age_group\n,U10';
      const result = parseCsv(csv);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.message).toMatch(/row 2/i);
    });

    it('errors when a data row has an empty age_group', () => {
      const csv = 'name,age_group\nAlice,';
      const result = parseCsv(csv);
      expect(result.ok).toBe(false);
    });
  });
});
