"""
Phase 1 — Louvain community detection.

Builds a weighted friendship graph from participants and affinities, then
runs Louvain to produce an initial soft partitioning used as hints for the
CP-SAT constraint solver in Phase 2.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import community as community_louvain
import networkx as nx


@dataclass(frozen=True)
class AffinityEdge:
    from_id: str
    to_id: str
    weight: float


def detect_communities(
    participant_ids: Sequence[str],
    affinities: Sequence[AffinityEdge],
) -> dict[str, int]:
    """
    Run Louvain community detection on the friendship graph.

    Parameters
    ----------
    participant_ids:
        All participant IDs to include as graph nodes.
    affinities:
        Weighted edges between participants. Edges referencing IDs not in
        ``participant_ids`` are silently ignored.

    Returns
    -------
    dict mapping each participant ID to an integer community ID. Community IDs
    are arbitrary non-negative integers with no guaranteed ordering or density.
    Isolated participants (no edges) are still assigned a community.
    """
    if not participant_ids:
        return {}

    pid_set = set(participant_ids)
    graph = nx.Graph()
    graph.add_nodes_from(participant_ids)

    for edge in affinities:
        if edge.from_id not in pid_set or edge.to_id not in pid_set:
            continue
        if graph.has_edge(edge.from_id, edge.to_id):
            graph[edge.from_id][edge.to_id]["weight"] += edge.weight
        else:
            graph.add_edge(edge.from_id, edge.to_id, weight=edge.weight)

    partition: dict[str, int] = community_louvain.best_partition(graph, weight="weight")
    return partition
