'use client';

import { useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { GraduationCap } from 'lucide-react';
import { useTogetherStore } from '@/lib/togather/store';
import type { Group, Participant } from '@/lib/togather/types';

// How many pixels the pointer must move before a drag starts (avoids click-to-drag)
const DRAG_ACTIVATION_DISTANCE = 8;

interface ParticipantCardProps {
  participant: Participant;
  isCoach: boolean;
  friendMatchLabel: string | null;
  isDragging?: boolean;
}

function ParticipantCard({
  participant,
  isCoach,
  friendMatchLabel,
  isDragging = false,
}: ParticipantCardProps) {
  return (
    <div
      className={`rounded-md border bg-background px-3 py-2 text-sm flex items-center justify-between gap-2 cursor-grab select-none transition-shadow ${
        isDragging ? 'opacity-40' : 'shadow-sm hover:shadow-md'
      } ${isCoach ? 'border-amber-400 dark:border-amber-500' : 'border-border'}`}
    >
      <span className="font-medium text-foreground truncate">{participant.name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {friendMatchLabel && (
          <span className="text-xs text-muted-foreground">{friendMatchLabel}</span>
        )}
        {participant.willingToCoach && (
          <GraduationCap size={13} className="text-amber-500" aria-label="willing to coach" />
        )}
      </div>
    </div>
  );
}

interface DraggableCardProps {
  participant: Participant;
  isCoach: boolean;
  friendMatchLabel: string | null;
}

function DraggableCard({ participant, isCoach, friendMatchLabel }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: participant.id,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <ParticipantCard
        participant={participant}
        isCoach={isCoach}
        friendMatchLabel={friendMatchLabel}
        isDragging={isDragging}
      />
    </div>
  );
}

interface CoachSlotProps {
  groupId: string;
  coach: Participant | null;
}

function CoachSlot({ groupId, coach }: CoachSlotProps) {
  const demoteHeadCoach = useTogetherStore((state) => state.demoteHeadCoach);
  const { setNodeRef, isOver } = useDroppable({ id: `coach-slot-${groupId}` });

  return (
    <div
      ref={setNodeRef}
      onClick={coach ? () => demoteHeadCoach(groupId) : undefined}
      title={coach ? 'Click to remove coach' : undefined}
      className={`rounded-md border-2 px-3 py-2 text-sm flex items-center gap-2 mb-2 transition-colors min-h-[40px] ${
        coach
          ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 cursor-pointer'
          : isOver
            ? 'border-amber-400 border-dashed bg-amber-50 dark:bg-amber-900/10'
            : 'border-dashed border-border bg-muted/40'
      }`}
    >
      <GraduationCap size={14} className={coach ? 'text-amber-500' : 'text-muted-foreground'} />
      {coach ? (
        <span className="font-medium text-foreground truncate">{coach.name}</span>
      ) : (
        <span className="text-muted-foreground text-xs">No Coach — drop a volunteer here</span>
      )}
    </div>
  );
}

interface GroupColumnProps {
  group: Group;
  participants: Participant[];
  affinities: { fromId: string; toId: string }[];
  maxGroupSize: number;
  onSizeExceeded: (groupName: string) => void;
}

function GroupColumn({
  group,
  participants,
  affinities,
  maxGroupSize,
  onSizeExceeded: _onSizeExceeded,
}: GroupColumnProps) {
  const renameGroup = useTogetherStore((state) => state.renameGroup);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({ id: group.id });

  const members = group.memberIds
    .map((id) => participants.find((p) => p.id === id))
    .filter((p): p is Participant => p !== undefined);

  const coachParticipant = group.headCoachId
    ? participants.find((p) => p.id === group.headCoachId) ?? null
    : null;

  const nonCoachMembers = members.filter((p) => p.id !== group.headCoachId);

  function buildFriendMatchLabel(participant: Participant): string | null {
    const friendsHere = affinities.filter(
      (a) =>
        (a.fromId === participant.id && group.memberIds.includes(a.toId)) ||
        (a.toId === participant.id && group.memberIds.includes(a.fromId)),
    ).length;
    const totalFriends = affinities.filter(
      (a) => a.fromId === participant.id || a.toId === participant.id,
    ).length;
    if (totalFriends === 0) return null;
    return `${friendsHere}/${totalFriends} friends`;
  }

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== group.name) {
      renameGroup(group.id, trimmed);
    } else {
      setDraftName(group.name);
    }
    setEditing(false);
  }

  return (
    <div className="flex flex-col w-56 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span
          className="size-3 rounded-full shrink-0"
          style={{ backgroundColor: group.color }}
        />
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setDraftName(group.name);
                setEditing(false);
              }
            }}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-primary outline-none text-foreground"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraftName(group.name);
              setEditing(true);
            }}
            className="flex-1 text-left text-sm font-semibold text-foreground hover:text-primary truncate"
            title="Click to rename"
          >
            {group.name}
          </button>
        )}
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {group.memberIds.length}/{maxGroupSize}
        </span>
      </div>

      {/* Coach slot */}
      <CoachSlot groupId={group.id} coach={coachParticipant} />

      {/* Member cards drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[80px] rounded-lg p-2 space-y-2 transition-colors ${
          isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
        }`}
      >
        {nonCoachMembers.length === 0 && !isOver && (
          <p className="text-xs text-muted-foreground text-center pt-4">Drop participants here</p>
        )}
        {nonCoachMembers.map((participant) => (
          <DraggableCard
            key={participant.id}
            participant={participant}
            isCoach={false}
            friendMatchLabel={buildFriendMatchLabel(participant)}
          />
        ))}
      </div>
    </div>
  );
}

export default function BoardView() {
  const participants = useTogetherStore((state) => state.participants);
  const affinities = useTogetherStore((state) => state.affinities);
  const groups = useTogetherStore((state) => state.groups);
  const session = useTogetherStore((state) => state.session);
  const moveParticipant = useTogetherStore((state) => state.moveParticipant);
  const promoteToHeadCoach = useTogetherStore((state) => state.promoteToHeadCoach);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [sizeToast, setSizeToast] = useState<string | null>(null);

  const maxGroupSize = session?.maxGroupSize ?? Infinity;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
  );

  const activeParticipant = activeId
    ? participants.find((p) => p.id === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const participantId = String(active.id);
    const overId = String(over.id);

    // Dropping onto a coach slot
    if (overId.startsWith('coach-slot-')) {
      const groupId = overId.replace('coach-slot-', '');
      const targetGroup = groups.find((g) => g.id === groupId);
      if (!targetGroup) return;

      const participant = participants.find((p) => p.id === participantId);
      if (!participant?.willingToCoach) return;

      // Ensure participant is in the group
      if (!targetGroup.memberIds.includes(participantId)) {
        if (targetGroup.memberIds.length >= maxGroupSize) {
          setSizeToast(`${targetGroup.name} is already at max size.`);
          setTimeout(() => setSizeToast(null), 4000);
          return;
        }
        moveParticipant(participantId, groupId);
      }
      promoteToHeadCoach(participantId, groupId);
      return;
    }

    // Dropping onto a group column
    const targetGroup = groups.find((g) => g.id === overId);
    if (!targetGroup) return;

    const currentGroup = groups.find((g) => g.memberIds.includes(participantId));
    if (currentGroup?.id === targetGroup.id) return;

    if (targetGroup.memberIds.length >= maxGroupSize) {
      setSizeToast(`${targetGroup.name} is already at max size.`);
      setTimeout(() => setSizeToast(null), 4000);
      return;
    }

    moveParticipant(participantId, targetGroup.id);
  }

  const userAffinities = affinities.filter((a) => !a.system);

  return (
    <div className="space-y-3">
      {sizeToast && (
        <div
          role="status"
          aria-live="assertive"
          className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20 px-4 py-2 text-sm text-red-800 dark:text-red-300"
        >
          {sizeToast}
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {groups.map((group) => (
            <GroupColumn
              key={group.id}
              group={group}
              participants={participants}
              affinities={userAffinities}
              maxGroupSize={maxGroupSize}
              onSizeExceeded={(name) => {
                setSizeToast(`${name} is already at max size.`);
                setTimeout(() => setSizeToast(null), 4000);
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeParticipant && (
            <div className="rotate-2 opacity-90">
              <ParticipantCard
                participant={activeParticipant}
                isCoach={false}
                friendMatchLabel={null}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
