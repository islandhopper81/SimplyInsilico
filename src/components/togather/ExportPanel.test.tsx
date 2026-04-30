import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportPanel from './ExportPanel';
import { useTogetherStore } from '@/lib/togather/store';
import type { Group, Participant } from '@/lib/togather/types';

vi.mock('@/lib/togather/exportUtils', () => ({
  downloadCsv: vi.fn(),
  downloadJson: vi.fn(),
}));

import { downloadCsv, downloadJson } from '@/lib/togather/exportUtils';

const INITIAL_STATE = {
  session: { name: 'Spring 2025', groupCount: 2, maxGroupSize: 8 },
  participants: [] as Participant[],
  affinities: [],
  groups: [] as Group[],
  meta: { assignedBy: null as null, satisfactionScore: 0, coachCoverage: 0 },
};

const PARTICIPANT: Participant = {
  id: 'p1',
  name: 'Alice',
  ageGroup: 'U10',
  willingToCoach: false,
};

const GROUP_WITH_MEMBER: Group = {
  id: 'g1',
  name: 'Team 1',
  color: '#3B82F6',
  memberIds: ['p1'],
  headCoachId: null,
};

beforeEach(() => {
  useTogetherStore.setState(INITIAL_STATE);
  vi.clearAllMocks();
});

describe('ExportPanel', () => {
  describe('when no groups are assigned', () => {
    it('renders the export button as disabled', () => {
      render(<ExportPanel />);
      expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
    });

    it('shows the correct tooltip on the disabled button', () => {
      render(<ExportPanel />);
      const button = screen.getByRole('button', { name: /export/i });
      expect(button).toHaveAttribute(
        'title',
        'Run the algorithm or assign participants manually before exporting.',
      );
    });

    it('does not show the dropdown menu', () => {
      render(<ExportPanel />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('when groups have been assigned', () => {
    beforeEach(() => {
      useTogetherStore.setState({
        ...INITIAL_STATE,
        participants: [PARTICIPANT],
        groups: [GROUP_WITH_MEMBER],
      });
    });

    it('renders the export button as enabled', () => {
      render(<ExportPanel />);
      expect(screen.getByRole('button', { name: /export/i })).toBeEnabled();
    });

    it('does not have a tooltip on the enabled button', () => {
      render(<ExportPanel />);
      const button = screen.getByRole('button', { name: /export/i });
      expect(button).not.toHaveAttribute('title');
    });

    it('opens the dropdown when the export button is clicked', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows Download CSV and Download JSON options in the menu', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.getByRole('menuitem', { name: /download csv/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /download json/i })).toBeInTheDocument();
    });

    it('closes the dropdown when the export button is clicked again', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls downloadCsv with the session name, groups, and participants when CSV is clicked', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /download csv/i }));
      expect(downloadCsv).toHaveBeenCalledOnce();
      expect(downloadCsv).toHaveBeenCalledWith(
        'Spring 2025',
        [GROUP_WITH_MEMBER],
        [PARTICIPANT],
      );
    });

    it('closes the dropdown after CSV download is triggered', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /download csv/i }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls downloadJson with the session name and full session state when JSON is clicked', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /download json/i }));
      expect(downloadJson).toHaveBeenCalledOnce();
      expect(downloadJson).toHaveBeenCalledWith(
        'Spring 2025',
        expect.objectContaining({
          session: INITIAL_STATE.session,
          participants: [PARTICIPANT],
          groups: [GROUP_WITH_MEMBER],
        }),
      );
    });

    it('closes the dropdown after JSON download is triggered', () => {
      render(<ExportPanel />);
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /download json/i }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the dropdown when clicking outside', () => {
      render(
        <div>
          <ExportPanel />
          <div data-testid="outside">outside</div>
        </div>,
      );
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
