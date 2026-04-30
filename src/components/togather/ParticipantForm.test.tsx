import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ParticipantForm from './ParticipantForm';
import type { Participant } from '@/lib/togather/types';

const OTHER_PARTICIPANTS: Participant[] = [
  { id: 'p2', name: 'Bob', ageGroup: 'U12', willingToCoach: false },
  { id: 'p3', name: 'Carol', ageGroup: 'U10', willingToCoach: false },
];

function renderForm(initialValues: Participant | null = null, participants = OTHER_PARTICIPANTS) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <ParticipantForm
      initialValues={initialValues}
      participants={participants}
      onSave={onSave}
      onCancel={onCancel}
    />,
  );
  return { onSave, onCancel };
}

function fillRequired(name = 'Alice', ageGroup = 'U10') {
  fireEvent.change(screen.getByLabelText(/Name/), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/Age Group/), { target: { value: ageGroup } });
}

describe('ParticipantForm', () => {
  describe('rendering', () => {
    it('renders all fields for a new participant', () => {
      renderForm();
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Age Group/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Willing to coach/)).toBeInTheDocument();
    });

    it('shows "Add Participant" button when adding a new participant', () => {
      renderForm();
      expect(screen.getByRole('button', { name: 'Add Participant' })).toBeInTheDocument();
    });

    it('shows "Save Changes" button when editing an existing participant', () => {
      const existing: Participant = { id: 'p1', name: 'Alice', ageGroup: 'U10', willingToCoach: false };
      renderForm(existing);
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('pre-fills fields when editing an existing participant', () => {
      const existing: Participant = { id: 'p1', name: 'Alice', ageGroup: 'U10', willingToCoach: false };
      renderForm(existing);
      expect(screen.getByLabelText(/Name/)).toHaveValue('Alice');
      expect(screen.getByLabelText(/Age Group/)).toHaveValue('U10');
    });
  });

  describe('required field validation', () => {
    it('shows a name error when submitted without a name', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText(/Age Group/), { target: { value: 'U10' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      expect(await screen.findByText('Name is required')).toBeInTheDocument();
    });

    it('shows an age group error when submitted without an age group', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Alice' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      expect(await screen.findByText('Age group is required')).toBeInTheDocument();
    });
  });

  describe('valid submission', () => {
    it('calls onSave with the correct participant data', () => {
      const { onSave } = renderForm();
      fillRequired('Alice', 'U10');
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      expect(onSave).toHaveBeenCalledOnce();
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice', ageGroup: 'U10', willingToCoach: false }),
      );
    });

    it('trims whitespace from name and ageGroup before saving', () => {
      const { onSave } = renderForm();
      fillRequired('  Alice  ', '  U10  ');
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice', ageGroup: 'U10' }),
      );
    });

    it('omits contactEmail when the field is empty', () => {
      const { onSave } = renderForm();
      fillRequired();
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      const saved = onSave.mock.calls[0][0] as Participant;
      expect(saved.contactEmail).toBeUndefined();
    });
  });

  describe('coach linked-child dropdown', () => {
    it('does not show the linked child dropdown by default', () => {
      renderForm();
      expect(screen.queryByLabelText(/Linked child/)).not.toBeInTheDocument();
    });

    it('shows the linked child dropdown when the coach checkbox is checked', () => {
      renderForm();
      fireEvent.click(screen.getByLabelText(/Willing to coach/));

      expect(screen.getByLabelText(/Linked child/)).toBeInTheDocument();
    });

    it('hides the linked child dropdown when the coach checkbox is unchecked', () => {
      renderForm();
      fireEvent.click(screen.getByLabelText(/Willing to coach/));
      expect(screen.getByLabelText(/Linked child/)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/Willing to coach/));
      expect(screen.queryByLabelText(/Linked child/)).not.toBeInTheDocument();
    });

    it('populates the dropdown with other participants', () => {
      renderForm();
      fireEvent.click(screen.getByLabelText(/Willing to coach/));

      expect(screen.getByRole('option', { name: 'Bob' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Carol' })).toBeInTheDocument();
    });

    it('excludes the participant being edited from the dropdown options', () => {
      const existing: Participant = { id: 'p2', name: 'Bob', ageGroup: 'U12', willingToCoach: false };
      renderForm(existing, OTHER_PARTICIPANTS);
      fireEvent.click(screen.getByLabelText(/Willing to coach/));

      expect(screen.queryByRole('option', { name: 'Bob' })).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Carol' })).toBeInTheDocument();
    });

    it('saves childId when a linked child is selected', () => {
      const { onSave } = renderForm();
      fillRequired('Coach Parent', 'U14');
      fireEvent.click(screen.getByLabelText(/Willing to coach/));
      fireEvent.change(screen.getByLabelText(/Linked child/), { target: { value: 'p2' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ willingToCoach: true, childId: 'p2' }),
      );
    });

    it('omits childId when the coach checkbox is unchecked before saving', () => {
      const { onSave } = renderForm();
      fillRequired();
      fireEvent.click(screen.getByLabelText(/Willing to coach/));
      fireEvent.change(screen.getByLabelText(/Linked child/), { target: { value: 'p2' } });
      fireEvent.click(screen.getByLabelText(/Willing to coach/));
      fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }));

      const saved = onSave.mock.calls[0][0] as Participant;
      expect(saved.willingToCoach).toBe(false);
      expect(saved.childId).toBeUndefined();
    });
  });

  describe('cancel', () => {
    it('calls onCancel when the Cancel button is clicked', () => {
      const { onCancel } = renderForm();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledOnce();
    });
  });
});
