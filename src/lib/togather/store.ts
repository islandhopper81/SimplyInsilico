import { create } from 'zustand';
import type {
  Affinity,
  Group,
  Participant,
  Session,
  SessionMeta,
  SessionState,
  TogetherStore,
} from './types';

const INITIAL_META: SessionMeta = {
  assignedBy: null,
  satisfactionScore: 0,
  coachCoverage: 0,
};

function computeSatisfactionScore(
  affinities: Affinity[],
  groups: Group[]
): number {
  const membershipMap = new Map<string, string>();
  for (const group of groups) {
    for (const memberId of group.memberIds) {
      membershipMap.set(memberId, group.id);
    }
  }

  const userAffinities = affinities.filter((a) => !a.system);
  if (userAffinities.length === 0) return 0;

  const satisfiedCount = userAffinities.filter(
    (a) => membershipMap.get(a.fromId) === membershipMap.get(a.toId)
  ).length;

  return satisfiedCount / userAffinities.length;
}

function computeCoachCoverage(groups: Group[]): number {
  return groups.filter((g) => g.headCoachId !== null).length;
}

function recomputeMeta(
  affinities: Affinity[],
  groups: Group[],
  assignedBy: SessionMeta['assignedBy']
): SessionMeta {
  return {
    assignedBy,
    satisfactionScore: computeSatisfactionScore(affinities, groups),
    coachCoverage: computeCoachCoverage(groups),
  };
}

export const useTogetherStore = create<TogetherStore>((set) => ({
  session: null,
  participants: [],
  affinities: [],
  groups: [],
  meta: INITIAL_META,

  initSession: (setup: Session) =>
    set({
      session: setup,
      participants: [],
      affinities: [],
      groups: [],
      meta: INITIAL_META,
    }),

  importSession: (state: SessionState) =>
    set({
      session: state.session,
      participants: state.participants,
      affinities: state.affinities,
      groups: state.groups,
      meta: state.meta,
    }),

  addParticipant: (participant: Participant) =>
    set((state) => {
      const participants = [...state.participants, participant];
      let affinities = state.affinities;

      if (participant.willingToCoach && participant.childId) {
        const childExists = participants.some((p) => p.id === participant.childId);
        if (childExists) {
          affinities = [
            ...affinities,
            { fromId: participant.id, toId: participant.childId, weight: 2.0, system: true },
          ];
        }
      }

      const meta = recomputeMeta(affinities, state.groups, state.meta.assignedBy);
      return { participants, affinities, meta };
    }),

  updateParticipant: (id: string, updates: Partial<Participant>) =>
    set((state) => {
      const participants = state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );

      const updatedParticipant = participants.find((p) => p.id === id)!;

      // Remove any existing system affinity where this participant is the coach
      let affinities = state.affinities.filter(
        (a) => !(a.system && a.fromId === id)
      );

      // Recreate system affinity if coach flag is on and a valid child is linked
      if (updatedParticipant.willingToCoach && updatedParticipant.childId) {
        const childExists = participants.some((p) => p.id === updatedParticipant.childId);
        if (childExists) {
          affinities = [
            ...affinities,
            { fromId: id, toId: updatedParticipant.childId, weight: 2.0, system: true },
          ];
        }
      }

      const meta = recomputeMeta(affinities, state.groups, state.meta.assignedBy);
      return { participants, affinities, meta };
    }),

  removeParticipant: (id: string) =>
    set((state) => {
      const participants = state.participants.filter((p) => p.id !== id);
      const affinities = state.affinities.filter(
        (a) => a.fromId !== id && a.toId !== id
      );
      const groups = state.groups.map((g) => ({
        ...g,
        memberIds: g.memberIds.filter((mId) => mId !== id),
        headCoachId: g.headCoachId === id ? null : g.headCoachId,
      }));
      const meta = recomputeMeta(affinities, groups, state.meta.assignedBy);
      return { participants, affinities, groups, meta };
    }),

  addAffinity: (affinity: Affinity) =>
    set((state) => {
      const affinities = [...state.affinities, affinity];
      const meta = recomputeMeta(affinities, state.groups, state.meta.assignedBy);
      return { affinities, meta };
    }),

  removeAffinity: (fromId: string, toId: string) =>
    set((state) => {
      const affinities = state.affinities.filter(
        (a) => !(a.fromId === fromId && a.toId === toId)
      );
      const meta = recomputeMeta(affinities, state.groups, state.meta.assignedBy);
      return { affinities, meta };
    }),

  applyAlgorithmResult: (groups: Group[]) =>
    set((state) => {
      const meta = recomputeMeta(state.affinities, groups, 'algorithm');
      return { groups, meta };
    }),

  moveParticipant: (participantId: string, toGroupId: string) =>
    set((state) => {
      const groups = state.groups.map((g) => {
        if (g.memberIds.includes(participantId)) {
          return {
            ...g,
            memberIds: g.memberIds.filter((id) => id !== participantId),
            headCoachId: g.headCoachId === participantId ? null : g.headCoachId,
          };
        }
        if (g.id === toGroupId) {
          return { ...g, memberIds: [...g.memberIds, participantId] };
        }
        return g;
      });
      const meta = recomputeMeta(state.affinities, groups, 'manual');
      return { groups, meta };
    }),

  promoteToHeadCoach: (participantId: string, groupId: string) =>
    set((state) => {
      const groups = state.groups.map((g) => {
        if (g.id === groupId) {
          return { ...g, headCoachId: participantId };
        }
        // Demote this participant as coach from any other group they were head coach of
        if (g.headCoachId === participantId) {
          return { ...g, headCoachId: null };
        }
        return g;
      });
      const meta = recomputeMeta(state.affinities, groups, 'manual');
      return { groups, meta };
    }),

  demoteHeadCoach: (groupId: string) =>
    set((state) => {
      const groups = state.groups.map((g) =>
        g.id === groupId ? { ...g, headCoachId: null } : g
      );
      const meta = recomputeMeta(state.affinities, groups, 'manual');
      return { groups, meta };
    }),

  renameGroup: (groupId: string, newName: string) =>
    set((state) => {
      const groups = state.groups.map((g) =>
        g.id === groupId ? { ...g, name: newName } : g
      );
      return { groups };
    }),
}));
