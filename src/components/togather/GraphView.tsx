'use client';

import { useEffect, useRef } from 'react';
import type cytoscape from 'cytoscape';
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

      // Nodes: one per participant
      const nodes: cytoscape.NodeDefinition[] = participants.map((p) => {
        const groupInfo = participantGroupMap.get(p.id);
        const isCoach = groups.some((g) => g.headCoachId === p.id);
        return {
          data: {
            id: p.id,
            label: p.name,
            initials: getInitials(p.name),
            color: groupInfo?.color ?? '#94A3B8',
            groupId: groupInfo?.id ?? null,
            isCoach,
            willingToCoach: p.willingToCoach,
          },
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
        elements: { nodes, edges },
        layout: { name: 'cose', animate: false },
        style: [
          {
            selector: 'node',
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
            // Coach nodes rendered as diamonds
            selector: 'node[?isCoach]',
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

      // Show full name tooltip on hover
      cy.on('mouseover', 'node', (event) => {
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

      cy.on('mouseout', 'node', () => {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      });

      // Drag node to reassign group: on drag stop, find the group whose color centroid
      // is nearest the dropped position and move the participant.
      cy.on('dragfreeon', 'node', (event) => {
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
          // Shift+drag: move the node AND all directly connected neighbours to the target group
          const connectedIds = node.neighborhood('node').map((n: cytoscape.NodeSingular) => n.id());
          moveParticipant(participantId, closestGroupId);
          for (const connectedId of connectedIds) {
            moveParticipant(connectedId, closestGroupId);
          }
        } else {
          moveParticipant(participantId, closestGroupId);
        }
      });

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
          <div className="w-4 h-4 rounded-full bg-slate-400 shrink-0" />
          <span className="text-muted-foreground">Participant (colored by group)</span>
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
        <div className="text-muted-foreground/70 pt-0.5">Drag to reassign · Shift+drag moves neighbours</div>
      </div>
    </div>
  );
}
