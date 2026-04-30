"""
Phase 2 — CP-SAT constraint satisfaction and group assignment.

Takes Louvain community hints and rebalances them to satisfy hard constraints
(max group size, one head coach per group where possible) while maximising
friend co-location via the affinity objective.

Returns a structured result that is either:
  - "ok"                    all groups have a head coach
  - "coach_coverage_warning" fewer coaches than groups; some headCoachId are null
  - "error"                 infeasible or solver failure
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Sequence

from ortools.sat.python import cp_model

from community_detection import AffinityEdge

SOLVER_TIME_LIMIT_SECONDS = 10.0
WEIGHT_SCALE = 10  # CP-SAT requires integer objective coefficients


@dataclass(frozen=True)
class ParticipantInfo:
    id: str
    willing_to_coach: bool
    child_id: Optional[str] = None


@dataclass
class GroupResult:
    id: str
    member_ids: list[str]
    head_coach_id: Optional[str]


@dataclass
class AssignmentResult:
    status: str  # "ok" | "coach_coverage_warning" | "error"
    groups: list[GroupResult] = field(default_factory=list)
    available_coaches: int = 0
    required_coaches: int = 0
    code: Optional[str] = None
    message: Optional[str] = None


def assign_groups(
    participants: Sequence[ParticipantInfo],
    affinities: Sequence[AffinityEdge],
    group_count: int,
    max_group_size: int,
    community_hints: dict[str, int],
) -> AssignmentResult:
    """
    Produce a valid group assignment satisfying size constraints and maximising
    affinity satisfaction, with best-effort head coach coverage.

    Parameters
    ----------
    participants:
        All participants to assign, including coach volunteers.
    affinities:
        Weighted friendship edges used for the satisfaction objective and to
        enforce coach-child co-location (derived from ParticipantInfo.child_id).
    group_count:
        Target number of groups.
    max_group_size:
        Hard upper bound on participants per group.
    community_hints:
        Louvain partition output (participant_id -> community_index). Remapped
        to [0, group_count) and used as CP-SAT hints to warm-start the solver.

    Returns
    -------
    AssignmentResult with status "ok", "coach_coverage_warning", or "error".
    """
    n = len(participants)
    g = group_count

    if n == 0:
        empty_groups = [
            GroupResult(id=f"g{j + 1}", member_ids=[], head_coach_id=None)
            for j in range(g)
        ]
        return AssignmentResult(status="ok", groups=empty_groups)

    if n > g * max_group_size:
        return AssignmentResult(
            status="error",
            code="infeasible",
            message=(
                f"Cannot fit {n} participants into {g} groups of at most {max_group_size}. "
                f"Increase group count or max group size."
            ),
        )

    ids = [p.id for p in participants]
    idx = {pid: i for i, pid in enumerate(ids)}
    coach_indices = [i for i, p in enumerate(participants) if p.willing_to_coach]
    num_coaches = len(coach_indices)

    model = cp_model.CpModel()

    # x[i][j] = 1  iff  participant i is assigned to group j
    x = [[model.new_bool_var(f"x_{i}_{j}") for j in range(g)] for i in range(n)]

    # y[ci_pos][j] = 1  iff  the ci_pos-th coach is the head coach of group j
    y = [
        [model.new_bool_var(f"y_{ci_pos}_{j}") for j in range(g)]
        for ci_pos in range(num_coaches)
    ]

    # --- Hard constraints ---

    # Each participant belongs to exactly one group
    for i in range(n):
        model.add_exactly_one(x[i])

    # Group size upper bound; non-empty groups when we have enough participants
    for j in range(g):
        model.add(sum(x[i][j] for i in range(n)) <= max_group_size)
        if n >= g:
            model.add(sum(x[i][j] for i in range(n)) >= 1)

    # Head coach must be a member of the group they lead
    for ci_pos, ci in enumerate(coach_indices):
        for j in range(g):
            model.add_implication(y[ci_pos][j], x[ci][j])
        if num_coaches <= g:
            # Fewer coaches than groups: every coach must head exactly one group
            # so we use all available coaches (some groups will still be uncovered)
            model.add_exactly_one(y[ci_pos][j] for j in range(g))
        else:
            # More coaches than groups: only g coaches will be assigned as heads
            model.add_at_most_one(y[ci_pos][j] for j in range(g))

    # At most one head coach per group
    for j in range(g):
        model.add_at_most_one(y[ci_pos][j] for ci_pos in range(num_coaches))

    # When there are enough coaches: require exactly one head coach per group
    if num_coaches >= g:
        for j in range(g):
            model.add_exactly_one(y[ci_pos][j] for ci_pos in range(num_coaches))

    # Coach-child co-location: the linked coach and child must share a group
    for p in participants:
        if p.willing_to_coach and p.child_id and p.child_id in idx:
            ci = idx[p.id]
            ki = idx[p.child_id]
            for j in range(g):
                model.add_implication(x[ci][j], x[ki][j])
                model.add_implication(x[ki][j], x[ci][j])

    # --- Louvain hints ---
    raw_communities = sorted(set(community_hints.values())) if community_hints else []
    remap = {c: i % g for i, c in enumerate(raw_communities)}
    for i, pid in enumerate(ids):
        if pid in community_hints:
            model.add_hint(x[i][remap[community_hints[pid]]], 1)

    # --- Objective: maximise affinity satisfaction ---
    objective_terms: list[cp_model.IntVar] = []
    for a in affinities:
        if a.from_id not in idx or a.to_id not in idx:
            continue
        fi = idx[a.from_id]
        ti = idx[a.to_id]
        weight_int = max(1, round(a.weight * WEIGHT_SCALE))
        for j in range(g):
            pair_gj = model.new_bool_var(f"pair_{fi}_{ti}_{j}")
            model.add_implication(pair_gj, x[fi][j])
            model.add_implication(pair_gj, x[ti][j])
            objective_terms.append(pair_gj * weight_int)

    if objective_terms:
        model.maximize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = SOLVER_TIME_LIMIT_SECONDS
    solve_status = solver.solve(model)

    if solve_status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return AssignmentResult(
            status="error",
            code="infeasible",
            message=(
                f"CP-SAT returned {solver.status_name(solve_status)} — "
                f"no valid assignment found."
            ),
        )

    # Extract group membership from x variables
    group_members: dict[int, list[str]] = {j: [] for j in range(g)}
    for i, pid in enumerate(ids):
        for j in range(g):
            if solver.value(x[i][j]):
                group_members[j].append(pid)
                break

    # Extract head coach assignment from y variables
    head_coaches: dict[int, Optional[str]] = {j: None for j in range(g)}
    for ci_pos, ci in enumerate(coach_indices):
        for j in range(g):
            if solver.value(y[ci_pos][j]):
                head_coaches[j] = ids[ci]
                break

    groups_result = [
        GroupResult(
            id=f"g{j + 1}",
            member_ids=group_members[j],
            head_coach_id=head_coaches[j],
        )
        for j in range(g)
    ]

    uncovered = sum(1 for j in range(g) if head_coaches[j] is None)

    if uncovered > 0:
        return AssignmentResult(
            status="coach_coverage_warning",
            groups=groups_result,
            available_coaches=num_coaches,
            required_coaches=g,
        )

    return AssignmentResult(
        status="ok",
        groups=groups_result,
        available_coaches=num_coaches,
        required_coaches=g,
    )
