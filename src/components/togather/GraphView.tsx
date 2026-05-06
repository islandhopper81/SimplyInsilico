'use client';

import { useEffect, useRef } from 'react';
import type cytoscape from 'cytoscape';
import type { Group } from '@/lib/togather/types';
import { useTogetherStore } from '@/lib/togather/store';

// Cytoscape is browser-only; import dynamically on the client
let cytoscapeModule: typeof cytoscape | null = null;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function getCytoscape(): Promise<typeof cytoscape> {
  if (!cytoscapeModule) {
    cytoscapeModule = (await import('cytoscape')).default;
  }
  return cytoscapeModule;
}

const BASE_RADIUS = 55;
const PER_MEMBER_RADIUS = 10;
const COMPOUND_PADDING = 28;
const MAX_NODE_SIZE = 42; // coach diamond is the largest node at 42x42

// Arrange each group's members in a circle around a cluster center.
// Clusters are laid out in a grid so every group gets its own region.
// Spacing is calculated dynamically from the actual max cluster diameter so
// compound boxes never overlap regardless of league size.
function buildPresetPositions(
  groups: Group[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const activeGroups = groups.filter((g) => g.memberIds.length > 0);

  const maxMemberCount = activeGroups.reduce((max, g) => Math.max(max, g.memberIds.length), 0);
  const maxOrbitRadius = Math.max(BASE_RADIUS, maxMemberCount * PER_MEMBER_RADIUS);
  // Half-width of the largest compound node: orbit radius + node half-size + compound padding
  const maxCompoundHalfWidth = maxOrbitRadius + MAX_NODE_SIZE / 2 + COMPOUND_PADDING;
  const CLUSTER_SPACING = Math.max(280, 2 * maxCompoundHalfWidth + 80);

  const cols = Math.ceil(Math.sqrt(activeGroups.length));

  activeGroups.forEach((group, groupIdx) => {
    const col = groupIdx % cols;
    const row = Math.floor(groupIdx / cols);
    const centerX = col * CLUSTER_SPACING + CLUSTER_SPACING / 2;
    const centerY = row * CLUSTER_SPACING + CLUSTER_SPACING / 2;

    const memberCount = group.memberIds.length;
    const radius = Math.max(BASE_RADIUS, memberCount * PER_MEMBER_RADIUS);

    group.memberIds.forEach((memberId, memberIdx) => {
      // Start from top (-π/2) and go clockwise
      const angle = (2 * Math.PI * memberIdx) / memberCount - Math.PI / 2;
      positions[memberId] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  return positions;
}

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const participants = useTogetherStore((state) => state.participants);
  const affinities = useTogetherStore((state) => state.affinities);
  const groups = useTogetherStore((state) => state.groups);
  const moveParticipant = useTogetherStore((state) => state.moveParticipant);

  // Build a lookup from participant id → group
  const participantGroupMap = new Map<string, { id: string; color: string }>();
  for (const group of groups) {
    for (const memberId of group.memberIds) {
      participantGroupMap.set(memberId, { id: group.id, color: group.color });
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    getCytoscape().then((Cytoscape) => {
      if (destroyed || !containerRef.current) return;

      const presetPositions = buildPresetPositions(groups);

      // Compound nodes: one translucent container per non-empty group
      const groupNodes: cytoscape.NodeDefinition[] = groups
        .filter((g) => g.memberIds.length > 0)
        .map((g) => ({
          data: {
            id: `group-${g.id}`,
            label: g.name,
            color: g.color,
          },
        }));

      // Participant nodes nested inside their group compound node
      const participantNodes: cytoscape.NodeDefinition[] = participants.map((p) => {
        const groupInfo = participantGroupMap.get(p.id);
        const isCoach = groups.some((g) => g.headCoachId === p.id);
        return {
          data: {
            id: p.id,
            parent: groupInfo ? `group-${groupInfo.id}` : undefined,
            label: p.name,
            initials: getInitials(p.name),
            color: groupInfo?.color ?? '#94A3B8',
            groupId: groupInfo?.id ?? null,
            isCoach,
            willingToCoach: p.willingToCoach,
          },
          position: presetPositions[p.id],
        };
      });

      // Edges: user affinities (thin gray) + system coach-child (thick amber)
      const edges: cytoscape.EdgeDefinition[] = affinities.map((a, idx) => ({
        data: {
          id: `e${idx}`,
          source: a.fromId,
          target: a.toId,
          isSystem: a.system,
        },
      }));

      const cy = Cytoscape({
        container: containerRef.current,
        elements: { nodes: [...groupNodes, ...participantNodes], edges },
        // preset uses the positions embedded in each node's definition above;
        // compound containers auto-size to fit their children
        layout: { name: 'preset', animate: false },
        style: [
          {
            // Participant dots
            selector: 'node:childless',
            style: {
              'background-color': 'data(color)' as string,
              label: 'data(initials)',
              'font-size': '11px',
              'font-weight': 'bold',
              color: '#ffffff',
              'text-valign': 'center',
              'text-halign': 'center',
              width: 36,
              height: 36,
            },
          },
          {
            // Group container (compound node) — auto-sized to fit children
            selector: 'node:parent',
            style: {
              'background-color': 'data(color)' as string,
              'background-opacity': 0.12,
              'border-color': 'data(color)' as string,
              'border-width': 2,
              'border-opacity': 0.5,
              label: 'data(label)',
              // text-valign 'top' positions the label at the compound's top boundary.
              // text-margin-y shifts it down so it sits visibly inside the box.
              'text-valign': 'top',
              'text-halign': 'center',
              'text-margin-y': 14,
              'font-size': '12px',
              'font-weight': 'bold',
              color: 'data(color)' as string,
              shape: 'roundrectangle',
              padding: `${COMPOUND_PADDING}px`,
            },
          },
          {
            // Coach nodes rendered as diamonds
            selector: 'node:childless[?isCoach]',
            style: {
              shape: 'diamond',
              width: 42,
              height: 42,
              'border-width': 2,
              'border-color': '#F59E0B',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 1,
              'line-color': '#CBD5E1',
              'curve-style': 'bezier',
            },
          },
          {
            // Coach-child edges: thick amber
            selector: 'edge[?isSystem]',
            style: {
              width: 3,
              'line-color': '#F59E0B',
            },
          },
          {
            selector: ':selected',
            style: {
              'border-width': 3,
              'border-color': '#6366F1',
            },
          },
        ],
      });

      // Show full name tooltip on hover (participant nodes only, not group containers)
      cy.on('mouseover', 'node:childless', (event) => {
        const node = event.target as cytoscape.NodeSingular;
        const fullName = node.data('label') as string;
        const renderedPos = node.renderedPosition();
        if (tooltipRef.current) {
          tooltipRef.current.textContent = fullName;
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${renderedPos.x}px`;
          tooltipRef.current.style.top = `${renderedPos.y - 36}px`;
        }
      });

      cy.on('mouseout', 'node:childless', () => {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      });

      // Drag participant to reassign group: find the group whose centroid is nearest
      // the dropped position. Only fires for participant nodes (node:childless), not
      // group containers — dragging a container just repositions it visually.
      cy.on('dragfreeon', 'node:childless', (event) => {
        const node = event.target as cytoscape.NodeSingular;
        const participantId = node.id();
        const pos = node.position();
        const isShiftHeld = (event.originalEvent as MouseEvent).shiftKey;

        // Find centroid of each group based on current node positions
        let closestGroupId: string | null = null;
        let closestDist = Infinity;

        for (const group of groups) {
          if (group.memberIds.length === 0) continue;
          let sumX = 0;
          let sumY = 0;
          let count = 0;
          for (const memberId of group.memberIds) {
            if (memberId === participantId) continue;
            const memberNode = cy.getElementById(memberId);
            if (memberNode.length === 0) continue;
            const mPos = memberNode.position();
            sumX += mPos.x;
            sumY += mPos.y;
            count++;
          }
          if (count === 0) continue;
          const cx = sumX / count;
          const cy2 = sumY / count;
          const dist = Math.hypot(pos.x - cx, pos.y - cy2);
          if (dist < closestDist) {
            closestDist = dist;
            closestGroupId = group.id;
          }
        }

        if (!closestGroupId) return;

        if (isShiftHeld) {
          // Shift+drag: move the node AND all directly connected leaf neighbours
          const connectedIds = node
            .neighborhood('node:childless')
            .map((n: cytoscape.NodeSingular) => n.id());
          moveParticipant(participantId, closestGroupId);
          for (const connectedId of connectedIds) {
            moveParticipant(connectedId, closestGroupId);
          }
        } else {
          moveParticipant(participantId, closestGroupId);
        }
      });

      // Zoom/pan to fit all clusters in the viewport with some breathing room
      cy.ready(() => cy.fit(undefined, 40));

      cyRef.current = cy;
    });

    return () => {
      destroyed = true;
      cyRef.current?.destroy();
      cyRef.current = null;
    };
    // Rebuild graph whenever groups or participants change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, affinities, groups]);

  return (
    <div className="relative rounded-lg border border-border overflow-hidden bg-muted/20">
      <div ref={containerRef} className="w-full h-[480px]" />

      {/* Full-name tooltip — shown imperatively by Cytoscape hover events */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-full rounded bg-foreground px-2 py-1 text-xs text-background shadow-md whitespace-nowrap"
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-md border border-border px-3 py-2 text-xs space-y-1 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border-2 border-slate-400 bg-slate-400/10 shrink-0" />
          <span className="text-muted-foreground">Group (drag container to reposition)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-400 shrink-0" />
          <span className="text-muted-foreground">Participant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-400 shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          <span className="text-muted-foreground">Head coach</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-slate-300 shrink-0" />
          <span className="text-muted-foreground">Friendship</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 bg-amber-400 shrink-0" />
          <span className="text-muted-foreground">Coach-child link</span>
        </div>
        <div className="text-muted-foreground/70 pt-0.5">Drag dot to reassign · Shift+drag moves neighbours</div>
      </div>
    </div>
  );
}
