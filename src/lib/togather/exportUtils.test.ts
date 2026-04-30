import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  slugifySessionName,
  buildCsvRows,
  generateCsvContent,
  downloadCsv,
  downloadJson,
} from './exportUtils';
import type { Group, Participant, SessionState } from './types';

const PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Alice', ageGroup: 'U10', willingToCoach: false },
  { id: 'p2', name: 'Bob', ageGroup: 'U10', willingToCoach: true },
  { id: 'p3', name: 'Carol', ageGroup: 'U12', willingToCoach: false },
];

const GROUPS: Group[] = [
  { id: 'g1', name: 'Team 1', color: '#3B82F6', memberIds: ['p1', 'p2'], headCoachId: 'p2' },
  { id: 'g2', name: 'Team 2', color: '#8B5CF6', memberIds: ['p3'], headCoachId: null },
];

describe('slugifySessionName', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugifySessionName('Spring 2025 T-Ball League')).toBe('spring-2025-t-ball-league');
  });

  it('collapses multiple consecutive non-alphanumeric characters to a single hyphen', () => {
    expect(slugifySessionName('My  League!!!')).toBe('my-league');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugifySessionName('   League   ')).toBe('league');
  });

  it('returns an empty string for an empty input', () => {
    expect(slugifySessionName('')).toBe('');
  });

  it('passes through an already-slugged string unchanged', () => {
    expect(slugifySessionName('my-session-2025')).toBe('my-session-2025');
  });
});

describe('buildCsvRows', () => {
  it('includes the header row as the first entry', () => {
    const rows = buildCsvRows(GROUPS, PARTICIPANTS);
    expect(rows[0]).toEqual(['participant_name', 'age_group', 'group_name', 'head_coach']);
  });

  it('includes one data row per participant', () => {
    const rows = buildCsvRows(GROUPS, PARTICIPANTS);
    expect(rows).toHaveLength(PARTICIPANTS.length + 1); // header + 3 participants
  });

  it('includes correct field values for a participant with a coach', () => {
    const rows = buildCsvRows(GROUPS, PARTICIPANTS);
    const aliceRow = rows.find((r) => r[0] === 'Alice');
    expect(aliceRow).toEqual(['Alice', 'U10', 'Team 1', 'Bob']);
  });

  it('includes correct field values for a participant with no coach', () => {
    const rows = buildCsvRows(GROUPS, PARTICIPANTS);
    const carolRow = rows.find((r) => r[0] === 'Carol');
    expect(carolRow).toEqual(['Carol', 'U12', 'Team 2', '']);
  });

  it('includes the coach in their own row with themselves as head_coach', () => {
    const rows = buildCsvRows(GROUPS, PARTICIPANTS);
    const bobRow = rows.find((r) => r[0] === 'Bob');
    expect(bobRow).toEqual(['Bob', 'U10', 'Team 1', 'Bob']);
  });

  it('skips memberIds that are not in the participant list', () => {
    const groupsWithGhost: Group[] = [
      { id: 'g1', name: 'Team 1', color: '#000', memberIds: ['p1', 'ghost-id'], headCoachId: null },
    ];
    const rows = buildCsvRows(groupsWithGhost, PARTICIPANTS);
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(1);
    expect(dataRows[0][0]).toBe('Alice');
  });

  it('returns only the header when all groups are empty', () => {
    const emptyGroups: Group[] = [
      { id: 'g1', name: 'Team 1', color: '#000', memberIds: [], headCoachId: null },
    ];
    const rows = buildCsvRows(emptyGroups, PARTICIPANTS);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(['participant_name', 'age_group', 'group_name', 'head_coach']);
  });

  it('returns only the header when groups array is empty', () => {
    const rows = buildCsvRows([], PARTICIPANTS);
    expect(rows).toHaveLength(1);
  });
});

describe('generateCsvContent', () => {
  it('returns a string containing the header as the first line', () => {
    const csv = generateCsvContent(GROUPS, PARTICIPANTS);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('participant_name,age_group,group_name,head_coach');
  });

  it('includes all participant names in the output', () => {
    const csv = generateCsvContent(GROUPS, PARTICIPANTS);
    expect(csv).toContain('Alice');
    expect(csv).toContain('Bob');
    expect(csv).toContain('Carol');
  });

  it('includes group names in the output', () => {
    const csv = generateCsvContent(GROUPS, PARTICIPANTS);
    expect(csv).toContain('Team 1');
    expect(csv).toContain('Team 2');
  });
});

describe('downloadCsv', () => {
  let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAnchor = { href: '', download: '', click: vi.fn() };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLElement;
      return originalCreateElement(tag);
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets the correct slugified filename', () => {
    downloadCsv('Spring 2025 League', GROUPS, PARTICIPANTS);
    expect(mockAnchor.download).toBe('spring-2025-league-groups.csv');
  });

  it('triggers a click on the anchor element', () => {
    downloadCsv('My League', GROUPS, PARTICIPANTS);
    expect(mockAnchor.click).toHaveBeenCalledOnce();
  });

  it('revokes the object URL after triggering the download', () => {
    downloadCsv('My League', GROUPS, PARTICIPANTS);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets the anchor href to the created object URL', () => {
    downloadCsv('My League', GROUPS, PARTICIPANTS);
    expect(mockAnchor.href).toBe('blob:mock-url');
  });
});

describe('downloadJson', () => {
  let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

  const SESSION_STATE: SessionState = {
    session: { name: 'Test Session', groupCount: 2, maxGroupSize: 5 },
    participants: PARTICIPANTS,
    affinities: [],
    groups: GROUPS,
    meta: { assignedBy: 'algorithm', satisfactionScore: 0.75, coachCoverage: 1 },
  };

  beforeEach(() => {
    mockAnchor = { href: '', download: '', click: vi.fn() };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLElement;
      return originalCreateElement(tag);
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-json-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets the correct slugified filename', () => {
    downloadJson('Test Session', SESSION_STATE);
    expect(mockAnchor.download).toBe('test-session-session.json');
  });

  it('triggers a click on the anchor element', () => {
    downloadJson('My League', SESSION_STATE);
    expect(mockAnchor.click).toHaveBeenCalledOnce();
  });

  it('revokes the object URL after triggering the download', () => {
    downloadJson('My League', SESSION_STATE);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-json-url');
  });

  it('creates a blob with the full session state serialized as JSON', () => {
    const blobSpy = vi.spyOn(globalThis, 'Blob');
    downloadJson('My League', SESSION_STATE);
    expect(blobSpy).toHaveBeenCalled();
    const callArgs = blobSpy.mock.calls[0];
    const content = callArgs[0]?.[0] as string;
    const parsed = JSON.parse(content);
    expect(parsed.session.name).toBe('Test Session');
    expect(parsed.participants).toHaveLength(3);
  });
});
