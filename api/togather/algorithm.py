"""
Vercel Python serverless function — POST /api/togather/algorithm

Accepts an AlgorithmRequest (session settings, participants, affinities),
runs Louvain community detection + CP-SAT constraint satisfaction, and
returns an AlgorithmSuccessResponse or AlgorithmWarningResponse.

Returns 400 with AlgorithmErrorResponse for invalid_input or infeasible cases.
Returns 500 for unexpected failures (client falls back to JS heuristic).
"""
from __future__ import annotations

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

# Allow imports from algorithm/phases relative to the project root
_PROJECT_ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
sys.path.insert(0, os.path.join(_PROJECT_ROOT, 'algorithm', 'phases'))

from community_detection import AffinityEdge, detect_communities  # noqa: E402
from constraint_satisfaction import ParticipantInfo, assign_groups  # noqa: E402


def _validate(body: dict) -> str | None:
    """Return an error message if the request body is invalid, else None."""
    session = body.get('session')
    if not isinstance(session, dict):
        return 'session is required'
    group_count = session.get('groupCount')
    max_group_size = session.get('maxGroupSize')
    if not isinstance(group_count, int) or group_count < 1:
        return 'session.groupCount must be a positive integer'
    if not isinstance(max_group_size, int) or max_group_size < 1:
        return 'session.maxGroupSize must be a positive integer'

    participants = body.get('participants')
    if not isinstance(participants, list):
        return 'participants must be an array'
    for p in participants:
        if not isinstance(p.get('id'), str) or not p['id']:
            return 'each participant must have a non-empty id string'
        if not isinstance(p.get('willingToCoach'), bool):
            return 'each participant must have a boolean willingToCoach field'

    affinities = body.get('affinities')
    if not isinstance(affinities, list):
        return 'affinities must be an array'

    return None


def _run(body: dict) -> tuple[int, dict]:
    """Run the algorithm and return (http_status_code, response_dict)."""
    validation_error = _validate(body)
    if validation_error:
        return 400, {'status': 'error', 'code': 'invalid_input', 'message': validation_error}

    session = body['session']
    group_count: int = session['groupCount']
    max_group_size: int = session['maxGroupSize']

    participants = [
        ParticipantInfo(
            id=p['id'],
            willing_to_coach=p['willingToCoach'],
            child_id=p.get('childId'),
        )
        for p in body['participants']
    ]
    participant_ids = [p.id for p in participants]

    affinities = [
        AffinityEdge(from_id=a['fromId'], to_id=a['toId'], weight=float(a['weight']))
        for a in body['affinities']
    ]

    # Phase 1 — Louvain community detection
    community_hints = detect_communities(participant_ids, affinities)

    # Phase 2 — CP-SAT constraint satisfaction
    result = assign_groups(
        participants=participants,
        affinities=affinities,
        group_count=group_count,
        max_group_size=max_group_size,
        community_hints=community_hints,
    )

    if result.status == 'error':
        return 400, {
            'status': 'error',
            'code': result.code or 'infeasible',
            'message': result.message or 'No valid assignment found.',
        }

    groups_payload = [
        {
            'id': g.id,
            'memberIds': g.member_ids,
            'headCoachId': g.head_coach_id,
        }
        for g in result.groups
    ]

    # Satisfaction score: fraction of affinities satisfied (both in same group)
    membership: dict[str, str] = {}
    for g in result.groups:
        for pid in g.member_ids:
            membership[pid] = g.id

    user_affinities = affinities
    satisfied = sum(
        1 for a in user_affinities
        if membership.get(a.from_id) == membership.get(a.to_id)
        and a.from_id in membership
    )
    satisfaction_score = satisfied / len(user_affinities) if user_affinities else 0.0
    coach_coverage = sum(1 for g in result.groups if g.head_coach_id is not None)

    meta = {'satisfactionScore': round(satisfaction_score, 4), 'coachCoverage': coach_coverage}

    if result.status == 'coach_coverage_warning':
        return 200, {
            'status': 'coach_coverage_warning',
            'availableCoaches': result.available_coaches,
            'requiredCoaches': result.required_coaches,
            'groups': groups_payload,
            'meta': meta,
        }

    return 200, {'status': 'ok', 'groups': groups_payload, 'meta': meta}


class handler(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(content_length)
            body = json.loads(raw_body)
        except (ValueError, json.JSONDecodeError) as exc:
            self._respond(400, {'status': 'error', 'code': 'invalid_input', 'message': str(exc)})
            return

        try:
            status_code, response = _run(body)
        except Exception as exc:  # noqa: BLE001
            self._respond(500, {'status': 'error', 'code': 'infeasible', 'message': str(exc)})
            return

        self._respond(status_code, response)

    def _respond(self, status: int, body: dict) -> None:
        payload = json.dumps(body).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *_args):  # silence default request logging
        pass
