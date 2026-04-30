"""Unit tests for algorithm/phases/constraint_satisfaction.py."""

import pytest
from community_detection import AffinityEdge
from constraint_satisfaction import AssignmentResult, GroupResult, ParticipantInfo, assign_groups


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def p(pid: str, coach: bool = False, child_id: str | None = None) -> ParticipantInfo:
    return ParticipantInfo(id=pid, willing_to_coach=coach, child_id=child_id)


def group_of(result: AssignmentResult, pid: str) -> GroupResult | None:
    for group in result.groups:
        if pid in group.member_ids:
            return group
    return None


def all_assigned(result: AssignmentResult, expected_ids: set[str]) -> bool:
    assigned = {pid for g in result.groups for pid in g.member_ids}
    return assigned == expected_ids


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestAssignGroups:

    def test_empty_participants_returns_ok_with_empty_groups(self):
        result = assign_groups([], [], group_count=3, max_group_size=5, community_hints={})
        assert result.status == "ok"
        assert len(result.groups) == 3
        assert all(len(g.member_ids) == 0 for g in result.groups)

    def test_all_participants_assigned(self):
        participants = [p(f"k{i}") for i in range(9)]
        result = assign_groups(participants, [], group_count=3, max_group_size=5, community_hints={})
        assert result.status in ("ok", "coach_coverage_warning")
        assert all_assigned(result, {f"k{i}" for i in range(9)})

    def test_group_size_constraint_respected(self):
        participants = [p(f"k{i}") for i in range(9)]
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints={})
        assert result.status in ("ok", "coach_coverage_warning")
        for group in result.groups:
            assert len(group.member_ids) <= 4

    def test_infeasible_too_many_participants_returns_error(self):
        # 10 participants, 3 groups of max 3 = capacity 9 < 10
        participants = [p(f"k{i}") for i in range(10)]
        result = assign_groups(participants, [], group_count=3, max_group_size=3, community_hints={})
        assert result.status == "error"
        assert result.code == "infeasible"
        assert result.message is not None

    def test_sufficient_coaches_status_ok_all_groups_covered(self):
        participants = [
            p("c1", coach=True), p("c2", coach=True), p("c3", coach=True),
            *[p(f"k{i}") for i in range(6)],
        ]
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints={})
        assert result.status == "ok"
        assert all(g.head_coach_id is not None for g in result.groups)

    def test_insufficient_coaches_returns_warning(self):
        # 1 coach for 3 groups — 2 groups must be uncovered
        participants = [
            p("c1", coach=True),
            *[p(f"k{i}") for i in range(8)],
        ]
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints={})
        assert result.status == "coach_coverage_warning"
        assert result.available_coaches == 1
        assert result.required_coaches == 3
        uncovered = sum(1 for g in result.groups if g.head_coach_id is None)
        assert uncovered == 2

    def test_too_many_coaches_in_one_cluster_still_covers_all_groups(self):
        # Louvain hints cluster all 3 coaches in group 0.
        # CP-SAT must override hints because exactly-one-coach-per-group is a hard constraint.
        participants = [
            p("c1", coach=True), p("c2", coach=True), p("c3", coach=True),
            *[p(f"k{i}") for i in range(6)],
        ]
        hints = {"c1": 0, "c2": 0, "c3": 0, **{f"k{i}": i % 3 for i in range(6)}}
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints=hints)
        assert result.status == "ok"
        assert all(g.head_coach_id is not None for g in result.groups)
        head_coach_ids = [g.head_coach_id for g in result.groups]
        assert len(set(head_coach_ids)) == 3  # each coach heads a different group

    def test_minimum_viable_max_group_size_succeeds(self):
        # ceil(9/3) = 3, so max_group_size=3 is the tightest feasible bound
        participants = [
            p("c1", coach=True), p("c2", coach=True), p("c3", coach=True),
            *[p(f"k{i}") for i in range(6)],
        ]
        result = assign_groups(participants, [], group_count=3, max_group_size=3, community_hints={})
        assert result.status == "ok"
        assert all_assigned(result, {"c1", "c2", "c3", *{f"k{i}" for i in range(6)}})
        for group in result.groups:
            assert len(group.member_ids) == 3

    def test_coach_linked_child_co_located(self):
        participants = [
            p("c1", coach=True, child_id="k1"),
            p("c2", coach=True),
            p("c3", coach=True),
            p("k1"),
            *[p(f"k{i}") for i in range(2, 7)],
        ]
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints={})
        assert result.status == "ok"
        assert group_of(result, "c1").id == group_of(result, "k1").id

    def test_head_coach_is_member_of_their_group(self):
        participants = [
            p("c1", coach=True), p("c2", coach=True), p("c3", coach=True),
            *[p(f"k{i}") for i in range(6)],
        ]
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints={})
        for group in result.groups:
            if group.head_coach_id:
                assert group.head_coach_id in group.member_ids

    def test_affinity_satisfaction_places_friends_together(self):
        # k1 and k2 are friends; with slack in group sizes they should be co-assigned
        participants = [
            p("c1", coach=True), p("c2", coach=True), p("c3", coach=True),
            p("k1"), p("k2"),
            *[p(f"k{i}") for i in range(3, 9)],
        ]
        affinities = [AffinityEdge(from_id="k1", to_id="k2", weight=1.0)]
        result = assign_groups(
            participants, affinities, group_count=3, max_group_size=5, community_hints={}
        )
        assert result.status == "ok"
        assert group_of(result, "k1").id == group_of(result, "k2").id

    def test_no_coaches_at_all_returns_warning(self):
        participants = [p(f"k{i}") for i in range(9)]
        result = assign_groups(participants, [], group_count=3, max_group_size=4, community_hints={})
        assert result.status == "coach_coverage_warning"
        assert result.available_coaches == 0
        assert result.required_coaches == 3

    def test_each_coach_heads_at_most_one_group(self):
        # More coaches than groups: extra coaches are members but not heads
        participants = [
            p("c1", coach=True), p("c2", coach=True),
            p("c3", coach=True), p("c4", coach=True),
            *[p(f"k{i}") for i in range(8)],
        ]
        result = assign_groups(participants, [], group_count=3, max_group_size=5, community_hints={})
        assert result.status == "ok"
        head_ids = [g.head_coach_id for g in result.groups if g.head_coach_id]
        assert len(head_ids) == len(set(head_ids))  # no duplicates
