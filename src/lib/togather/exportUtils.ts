import { stringify } from 'csv-stringify/sync';
import type { Group, Participant, SessionState } from './types';

export function slugifySessionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCsvRows(
  groups: Group[],
  participants: Participant[]
): string[][] {
  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const header = ['participant_name', 'age_group', 'group_name', 'head_coach'];
  const rows: string[][] = [];

  for (const group of groups) {
    const headCoach = group.headCoachId ? participantMap.get(group.headCoachId) : null;
    const headCoachName = headCoach?.name ?? '';

    for (const memberId of group.memberIds) {
      const participant = participantMap.get(memberId);
      if (!participant) continue;
      rows.push([participant.name, participant.ageGroup, group.name, headCoachName]);
    }
  }

  return [header, ...rows];
}

export function generateCsvContent(groups: Group[], participants: Participant[]): string {
  return stringify(buildCsvRows(groups, participants));
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(
  sessionName: string,
  groups: Group[],
  participants: Participant[]
): void {
  const slug = slugifySessionName(sessionName);
  const content = generateCsvContent(groups, participants);
  triggerDownload(content, `${slug}-groups.csv`, 'text/csv');
}

export function downloadJson(sessionName: string, sessionState: SessionState): void {
  const slug = slugifySessionName(sessionName);
  const content = JSON.stringify(sessionState, null, 2);
  triggerDownload(content, `${slug}-session.json`, 'application/json');
}
