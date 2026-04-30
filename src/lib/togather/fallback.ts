import type {
  AlgorithmGroupResult,
  AlgorithmRequest,
  AlgorithmSuccessResponse,
  AlgorithmWarningResponse,
} from './algorithmTypes';

export function runFallback(
  request: AlgorithmRequest,
): AlgorithmSuccessResponse | AlgorithmWarningResponse {
  const { session, participants, affinities } = request;
  const { groupCount } = session;

  const groups: AlgorithmGroupResult[] = Array.from({ length: groupCount }, (_, i) => ({
    id: `g${i + 1}`,
    memberIds: [],
    headCoachId: null,
  }));

  // Round-robin assignment
  participants.forEach((participant, i) => {
    groups[i % groupCount].memberIds.push(participant.id);
  });

  // Best-effort coach assignment: each coach heads at most one group
  const coachIds = new Set(participants.filter((p) => p.willingToCoach).map((p) => p.id));
  const assignedCoaches = new Set<string>();

  for (const group of groups) {
    const coach = group.memberIds.find((id) => coachIds.has(id) && !assignedCoaches.has(id));
    if (coach) {
      group.headCoachId = coach;
      assignedCoaches.add(coach);
    }
  }

  const membershipMap = new Map<string, string>();
  for (const group of groups) {
    for (const id of group.memberIds) {
      membershipMap.set(id, group.id);
    }
  }

  const satisfied = affinities.filter(
    (a) => membershipMap.get(a.fromId) === membershipMap.get(a.toId),
  ).length;
  const satisfactionScore = affinities.length > 0 ? satisfied / affinities.length : 0;
  const coachCoverage = groups.filter((g) => g.headCoachId !== null).length;
  const meta = { satisfactionScore, coachCoverage };

  const uncoveredCount = groupCount - coachCoverage;
  if (uncoveredCount > 0) {
    return {
      status: 'coach_coverage_warning',
      availableCoaches: coachIds.size,
      requiredCoaches: groupCount,
      groups,
      meta,
    };
  }

  return { status: 'ok', groups, meta };
}
