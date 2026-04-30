import { describe, it, expect, beforeEach } from 'vitest';
import { useTogetherStore } from './store';
import type { Participant } from './types';

const INITIAL_STATE = {
  session: null,
  participants: [] as Participant[],
  affinities: [],
  groups: [],
  meta: { assignedBy: null as null, satisfactionScore: 0, coachCoverage: 0 },
};

beforeEach(() => {
  useTogetherStore.setState(INITIAL_STATE);
});

function participant(overrides: Partial<Participant> & { id: string }): Participant {
  return {
    name: 'Alice',
    ageGroup: 'U10',
    willingToCoach: false,
    ...overrides,
  };
}

describe('initSession', () => {
  it('sets the session and resets participants, affinities, and groups', () => {
    const { addParticipant, initSession } = useTogetherStore.getState();
    addParticipant(participant({ id: 'p1' }));

    initSession({ name: 'Spring 2025', groupCount: 4, maxGroupSize: 8 });

    const state = useTogetherStore.getState();
    expect(state.session).toEqual({ name: 'Spring 2025', groupCount: 4, maxGroupSize: 8 });
    expect(state.participants).toHaveLength(0);
    expect(state.affinities).toHaveLength(0);
    expect(state.groups).toHaveLength(0);
  });
});

describe('addParticipant', () => {
  it('appends the participant to the list', () => {
    useTogetherStore.getState().addParticipant(participant({ id: 'p1', name: 'Alice' }));

    const { participants } = useTogetherStore.getState();
    expect(participants).toHaveLength(1);
    expect(participants[0].name).toBe('Alice');
  });

  it('creates a system affinity when the coach has a linked child in the roster', () => {
    const { addParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'child1', name: 'Child' }));
    addParticipant(participant({ id: 'coach1', name: 'Coach', willingToCoach: true, childId: 'child1' }));

    const { affinities } = useTogetherStore.getState();
    expect(affinities).toHaveLength(1);
    expect(affinities[0]).toMatchObject({ fromId: 'coach1', toId: 'child1', weight: 2.0, system: true });
  });

  it('does not create an auto-affinity when willingToCoach is true but no childId is set', () => {
    useTogetherStore.getState().addParticipant(
      participant({ id: 'coach1', willingToCoach: true }),
    );

    expect(useTogetherStore.getState().affinities).toHaveLength(0);
  });

  it('does not create an auto-affinity when the childId does not exist in the roster', () => {
    useTogetherStore.getState().addParticipant(
      participant({ id: 'coach1', willingToCoach: true, childId: 'nonexistent' }),
    );

    expect(useTogetherStore.getState().affinities).toHaveLength(0);
  });
});

describe('updateParticipant', () => {
  it('updates participant fields', () => {
    const { addParticipant, updateParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'p1', name: 'Alice' }));

    updateParticipant('p1', { name: 'Alicia' });

    expect(useTogetherStore.getState().participants[0].name).toBe('Alicia');
  });

  it('removes the system affinity when willingToCoach is set to false', () => {
    const { addParticipant, updateParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'child1' }));
    addParticipant(participant({ id: 'coach1', willingToCoach: true, childId: 'child1' }));
    expect(useTogetherStore.getState().affinities).toHaveLength(1);

    updateParticipant('coach1', { willingToCoach: false, childId: undefined });

    expect(useTogetherStore.getState().affinities).toHaveLength(0);
  });

  it('replaces the system affinity when the linked child changes', () => {
    const { addParticipant, updateParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'child1' }));
    addParticipant(participant({ id: 'child2' }));
    addParticipant(participant({ id: 'coach1', willingToCoach: true, childId: 'child1' }));

    updateParticipant('coach1', { childId: 'child2' });

    const { affinities } = useTogetherStore.getState();
    expect(affinities).toHaveLength(1);
    expect(affinities[0].toId).toBe('child2');
  });

  it('does not touch manual affinities when updating an unrelated field', () => {
    const { addParticipant, addAffinity, updateParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'p1' }));
    addParticipant(participant({ id: 'p2' }));
    addAffinity({ fromId: 'p1', toId: 'p2', weight: 1.0, system: false });

    updateParticipant('p1', { name: 'Updated' });

    expect(useTogetherStore.getState().affinities).toHaveLength(1);
  });
});

describe('removeParticipant', () => {
  it('removes the participant from the list', () => {
    const { addParticipant, removeParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'p1' }));

    removeParticipant('p1');

    expect(useTogetherStore.getState().participants).toHaveLength(0);
  });

  it('removes all affinities that reference the removed participant', () => {
    const { addParticipant, addAffinity, removeParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'p1' }));
    addParticipant(participant({ id: 'p2' }));
    addParticipant(participant({ id: 'p3' }));
    addAffinity({ fromId: 'p1', toId: 'p2', weight: 1.0, system: false });
    addAffinity({ fromId: 'p2', toId: 'p3', weight: 1.0, system: false });

    removeParticipant('p1');

    const { affinities } = useTogetherStore.getState();
    expect(affinities).toHaveLength(1);
    expect(affinities[0].fromId).toBe('p2');
  });

  it('removes the participant from group memberIds and clears headCoachId', () => {
    const { addParticipant, applyAlgorithmResult, removeParticipant } = useTogetherStore.getState();
    addParticipant(participant({ id: 'p1' }));
    applyAlgorithmResult([
      { id: 'g1', name: 'Group 1', color: '#000', memberIds: ['p1'], headCoachId: 'p1' },
    ]);

    removeParticipant('p1');

    const { groups } = useTogetherStore.getState();
    expect(groups[0].memberIds).toHaveLength(0);
    expect(groups[0].headCoachId).toBeNull();
  });
});

describe('addAffinity / removeAffinity', () => {
  it('adds a manual affinity', () => {
    useTogetherStore.getState().addAffinity({ fromId: 'p1', toId: 'p2', weight: 1.5, system: false });

    const { affinities } = useTogetherStore.getState();
    expect(affinities).toHaveLength(1);
    expect(affinities[0].weight).toBe(1.5);
  });

  it('removes only the specified affinity by fromId and toId', () => {
    const { addAffinity, removeAffinity } = useTogetherStore.getState();
    addAffinity({ fromId: 'p1', toId: 'p2', weight: 1.0, system: false });
    addAffinity({ fromId: 'p2', toId: 'p3', weight: 1.0, system: false });

    removeAffinity('p1', 'p2');

    const { affinities } = useTogetherStore.getState();
    expect(affinities).toHaveLength(1);
    expect(affinities[0].fromId).toBe('p2');
  });
});

describe('satisfaction score', () => {
  it('is 0 when there are no manual affinities', () => {
    expect(useTogetherStore.getState().meta.satisfactionScore).toBe(0);
  });

  it('counts the fraction of manual affinities whose participants are in the same group', () => {
    const { addAffinity, applyAlgorithmResult } = useTogetherStore.getState();
    addAffinity({ fromId: 'p1', toId: 'p2', weight: 1.0, system: false });
    addAffinity({ fromId: 'p3', toId: 'p4', weight: 1.0, system: false });

    applyAlgorithmResult([
      { id: 'g1', name: 'Group 1', color: '#000', memberIds: ['p1', 'p2'], headCoachId: null },
      { id: 'g2', name: 'Group 2', color: '#fff', memberIds: ['p3'], headCoachId: null },
    ]);

    // p1+p2 satisfied (same group), p3+p4 not (p4 not in any group)
    expect(useTogetherStore.getState().meta.satisfactionScore).toBe(0.5);
  });

  it('excludes system affinities from the score calculation', () => {
    const { addAffinity, applyAlgorithmResult } = useTogetherStore.getState();
    addAffinity({ fromId: 'coach', toId: 'child', weight: 2.0, system: true });

    applyAlgorithmResult([
      { id: 'g1', name: 'Group 1', color: '#000', memberIds: ['coach', 'child'], headCoachId: null },
    ]);

    expect(useTogetherStore.getState().meta.satisfactionScore).toBe(0);
  });
});

describe('importSession', () => {
  it('replaces the entire store state with the imported data', () => {
    const importedState = {
      session: { name: 'Imported Session', groupCount: 2, maxGroupSize: 5 },
      participants: [participant({ id: 'p99', name: 'Imported Person' })],
      affinities: [],
      groups: [],
      meta: { assignedBy: 'manual' as const, satisfactionScore: 0.8, coachCoverage: 1 },
    };

    useTogetherStore.getState().importSession(importedState);

    const state = useTogetherStore.getState();
    expect(state.session?.name).toBe('Imported Session');
    expect(state.participants[0].name).toBe('Imported Person');
    expect(state.meta.satisfactionScore).toBe(0.8);
    expect(state.meta.assignedBy).toBe('manual');
  });
});
