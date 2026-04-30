export interface Session {
  name: string;
  groupCount: number;
  maxGroupSize: number;
}

export interface Participant {
  id: string;
  name: string;
  ageGroup: string;
  contactEmail?: string;
  willingToCoach: boolean;
  coachingNotes?: string;
  childId?: string;
}

export interface Affinity {
  fromId: string;
  toId: string;
  weight: number;
  system: boolean;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  headCoachId: string | null;
}

export interface SessionMeta {
  assignedBy: 'algorithm' | 'manual' | null;
  satisfactionScore: number;
  coachCoverage: number;
}

export interface SessionState {
  session: Session | null;
  participants: Participant[];
  affinities: Affinity[];
  groups: Group[];
  meta: SessionMeta;
}

export interface TogetherStore extends SessionState {
  initSession: (setup: Session) => void;
  importSession: (state: SessionState) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  addAffinity: (affinity: Affinity) => void;
  removeAffinity: (fromId: string, toId: string) => void;
  applyAlgorithmResult: (groups: Group[]) => void;
  moveParticipant: (participantId: string, toGroupId: string) => void;
  promoteToHeadCoach: (participantId: string, groupId: string) => void;
  demoteHeadCoach: (groupId: string) => void;
  renameGroup: (groupId: string, newName: string) => void;
}
