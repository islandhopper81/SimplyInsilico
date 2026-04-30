import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AffinityForm from './AffinityForm';
import type { Affinity, Participant } from '@/lib/togather/types';

const PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Alice', ageGroup: 'U10', willingToCoach: false },
  { id: 'p2', name: 'Bob', ageGroup: 'U12', willingToCoach: false },
  { id: 'p3', name: 'Carol', ageGroup: 'U10', willingToCoach: false },
];

function renderForm(existingAffinities: Affinity[] = []) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <AffinityForm
      participants={PARTICIPANTS}
      existingAffinities={existingAffinities}
      onSave={onSave}
      onCancel={onCancel}
    />,
  );
  return { onSave, onCancel };
}

function selectFrom(name: string) {
  fireEvent.change(screen.getByLabelText('From participant'), { target: { value: name } });
}

function selectTo(name: string) {
  fireEvent.change(screen.getByLabelText('To participant'), { target: { value: name } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Add Friendship' }));
}

describe('AffinityForm', () => {
  it('renders from/to dropdowns and a weight field', () => {
    renderForm();
    expect(screen.getByLabelText('From participant')).toBeInTheDocument();
    expect(screen.getByLabelText('To participant')).toBeInTheDocument();
    expect(screen.getByLabelText('Weight')).toBeInTheDocument();
  });

  it('calls onSave with the correct affinity when all fields are valid', () => {
    const { onSave } = renderForm();
    selectFrom('p1');
    selectTo('p2');
    submit();

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ fromId: 'p1', toId: 'p2', weight: 1.0, system: false }),
    );
  });

  it('shows an error and does not call onSave when "from" is not selected', () => {
    const { onSave } = renderForm();
    selectTo('p2');
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/"from" participant/i);
  });

  it('shows an error and does not call onSave when "to" is not selected', () => {
    const { onSave } = renderForm();
    selectFrom('p1');
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/"to" participant/i);
  });

  it('shows a self-reference error when from and to are the same participant', () => {
    const { onSave } = renderForm();
    selectFrom('p1');
    selectTo('p1');
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/themselves/i);
  });

  it('shows a duplicate error when the affinity already exists', () => {
    const existing: Affinity[] = [
      { fromId: 'p1', toId: 'p2', weight: 1.0, system: false },
    ];
    const { onSave } = renderForm(existing);
    selectFrom('p1');
    selectTo('p2');
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i);
  });

  it('shows an error when the weight is zero or negative', () => {
    const { onSave } = renderForm();
    selectFrom('p1');
    selectTo('p2');
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '0' } });
    submit();

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/positive number/i);
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const { onCancel } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('clears the error message when the user changes a field after a failed submit', () => {
    renderForm();
    submit();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    selectFrom('p1');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
