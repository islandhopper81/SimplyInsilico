"""Unit tests for algorithm/phases/community_detection.py."""

import pytest
from community_detection import AffinityEdge, detect_communities


def same_community(partition: dict[str, int], *ids: str) -> bool:
    """Return True if all given IDs are assigned the same community."""
    communities = {partition[pid] for pid in ids}
    return len(communities) == 1


def different_communities(partition: dict[str, int], id_a: str, id_b: str) -> bool:
    """Return True if two IDs are assigned different communities."""
    return partition[id_a] != partition[id_b]


class TestDetectCommunities:
    def test_returns_empty_dict_for_no_participants(self):
        result = detect_communities([], [])
        assert result == {}

    def test_single_participant_gets_a_community(self):
        result = detect_communities(["p1"], [])
        assert "p1" in result
        assert isinstance(result["p1"], int)

    def test_all_participants_present_in_result(self):
        ids = ["p1", "p2", "p3", "p4"]
        result = detect_communities(ids, [])
        assert set(result.keys()) == set(ids)

    def test_isolated_participants_are_still_assigned_communities(self):
        ids = ["p1", "p2", "p3"]
        result = detect_communities(ids, [])
        # All three are isolated — each should have a community (value may vary)
        assert all(isinstance(result[pid], int) for pid in ids)

    def test_strongly_connected_cluster_shares_a_community(self):
        # p1–p2–p3 are a dense clique; p4–p5 are a separate clique
        ids = ["p1", "p2", "p3", "p4", "p5"]
        affinities = [
            AffinityEdge("p1", "p2", 1.0),
            AffinityEdge("p2", "p3", 1.0),
            AffinityEdge("p1", "p3", 1.0),
            AffinityEdge("p4", "p5", 1.0),
        ]
        result = detect_communities(ids, affinities)
        assert same_community(result, "p1", "p2", "p3")
        assert same_community(result, "p4", "p5")
        assert different_communities(result, "p1", "p4")

    def test_all_participants_in_one_dense_cluster_share_a_community(self):
        ids = ["p1", "p2", "p3", "p4"]
        # Full clique
        affinities = [
            AffinityEdge("p1", "p2", 1.0),
            AffinityEdge("p1", "p3", 1.0),
            AffinityEdge("p1", "p4", 1.0),
            AffinityEdge("p2", "p3", 1.0),
            AffinityEdge("p2", "p4", 1.0),
            AffinityEdge("p3", "p4", 1.0),
        ]
        result = detect_communities(ids, affinities)
        assert same_community(result, "p1", "p2", "p3", "p4")

    def test_coach_child_heavy_edge_pulls_coach_into_childs_cluster(self):
        # child1 and child2 are tightly bonded; coach is linked to child1 at weight 2.0
        ids = ["coach", "child1", "child2", "unrelated1", "unrelated2"]
        affinities = [
            AffinityEdge("child1", "child2", 1.0),
            AffinityEdge("coach",  "child1", 2.0),  # system affinity
            AffinityEdge("unrelated1", "unrelated2", 1.0),
        ]
        result = detect_communities(ids, affinities)
        assert same_community(result, "coach", "child1", "child2")

    def test_edges_referencing_unknown_ids_are_ignored(self):
        ids = ["p1", "p2"]
        affinities = [
            AffinityEdge("p1", "ghost", 1.0),  # ghost not in participant list
            AffinityEdge("p1", "p2", 1.0),
        ]
        # Should not raise; p1 and p2 should still be present
        result = detect_communities(ids, affinities)
        assert set(result.keys()) == {"p1", "p2"}

    def test_parallel_edges_accumulate_weight(self):
        # Adding two edges between p1–p2 should sum to weight 2.0 internally
        # and p1/p2 should share a community while p3/p4 share theirs
        ids = ["p1", "p2", "p3", "p4"]
        affinities = [
            AffinityEdge("p1", "p2", 1.0),
            AffinityEdge("p1", "p2", 1.0),  # duplicate — weight sums to 2.0
            AffinityEdge("p3", "p4", 1.0),
        ]
        result = detect_communities(ids, affinities)
        assert same_community(result, "p1", "p2")
        assert same_community(result, "p3", "p4")

    def test_result_values_are_non_negative_integers(self):
        ids = ["a", "b", "c"]
        result = detect_communities(ids, [])
        for community_id in result.values():
            assert isinstance(community_id, int)
            assert community_id >= 0
