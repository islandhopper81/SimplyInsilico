import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SessionSetupForm from './SessionSetupForm';

interface MockReaderInstance {
  onload: ((event: { target: { result: string } }) => void) | null;
  readAsText: ReturnType<typeof vi.fn>;
}

let mockReader: MockReaderInstance;

beforeEach(() => {
  mockReader = { onload: null, readAsText: vi.fn() };
  // Must use a regular function (not an arrow) so it can be called with `new`
  vi.stubGlobal('FileReader', vi.fn(function () { return mockReader; }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fillForm(name = 'Spring 2025', groupCount = '6', maxGroupSize = '8') {
  if (name) fireEvent.change(screen.getByLabelText(/Session name/), { target: { value: name } });
  if (groupCount) fireEvent.change(screen.getByLabelText(/Number of groups/), { target: { value: groupCount } });
  if (maxGroupSize) fireEvent.change(screen.getByLabelText(/Max participants per group/), { target: { value: maxGroupSize } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
}

function simulateFileLoad(content: string) {
  const fileInput = screen.getByLabelText('Import previous session JSON file');
  const file = new File([content], 'session.json', { type: 'application/json' });
  fireEvent.change(fileInput, { target: { files: [file] } });
  // Wrap in act so React processes the setErrors state update from within onload
  act(() => {
    mockReader.onload!({ target: { result: content } });
  });
}

const VALID_SESSION_JSON = JSON.stringify({
  session: { name: 'Old Session', groupCount: 4, maxGroupSize: 8 },
  participants: [],
  affinities: [],
  groups: [],
  meta: { assignedBy: null, satisfactionScore: 0, coachCoverage: 0 },
});

describe('SessionSetupForm', () => {
  describe('rendering', () => {
    it('renders session name, group count, and max group size fields', () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      expect(screen.getByLabelText(/Session name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of groups/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max participants per group/)).toBeInTheDocument();
    });

    it('renders the submit button as disabled when the form is empty', () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Next →' })).toBeDisabled();
    });
  });

  describe('form validation', () => {
    it('enables the submit button only when all fields are valid', () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      fillForm();
      expect(screen.getByRole('button', { name: 'Next →' })).toBeEnabled();
    });

    it('shows a name error on blur when the name field is empty', async () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      fireEvent.blur(screen.getByLabelText(/Session name/));
      expect(await screen.findByText('Session name is required')).toBeInTheDocument();
    });

    it('shows a group count error when the value is zero', async () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      fireEvent.change(screen.getByLabelText(/Number of groups/), { target: { value: '0' } });
      fireEvent.blur(screen.getByLabelText(/Number of groups/));
      expect(await screen.findByText(/whole number greater than 0/i)).toBeInTheDocument();
    });

    it('shows a group count error for a decimal number', async () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      fireEvent.change(screen.getByLabelText(/Number of groups/), { target: { value: '2.5' } });
      fireEvent.blur(screen.getByLabelText(/Number of groups/));
      expect(await screen.findByText(/whole number greater than 0/i)).toBeInTheDocument();
    });

    it('shows a group count error for a negative number', async () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      fireEvent.change(screen.getByLabelText(/Number of groups/), { target: { value: '-3' } });
      fireEvent.blur(screen.getByLabelText(/Number of groups/));
      expect(await screen.findByText(/whole number greater than 0/i)).toBeInTheDocument();
    });

    it('shows a group count error for non-numeric text', async () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      fireEvent.change(screen.getByLabelText(/Number of groups/), { target: { value: 'abc' } });
      fireEvent.blur(screen.getByLabelText(/Number of groups/));
      expect(await screen.findByText(/whole number greater than 0/i)).toBeInTheDocument();
    });
  });

  describe('valid submission', () => {
    it('calls onSubmit with the parsed session data', () => {
      const onSubmit = vi.fn();
      render(<SessionSetupForm onSubmit={onSubmit} onImport={vi.fn()} />);
      fillForm('Spring 2025', '6', '8');
      submit();

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Spring 2025', groupCount: 6, maxGroupSize: 8 });
    });

    it('trims whitespace from the session name', () => {
      const onSubmit = vi.fn();
      render(<SessionSetupForm onSubmit={onSubmit} onImport={vi.fn()} />);
      fillForm('  Spring 2025  ', '4', '10');
      submit();

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Spring 2025' }));
    });
  });

  describe('JSON import', () => {
    it('calls onImport with parsed session state for a valid file', () => {
      const onImport = vi.fn();
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={onImport} />);
      simulateFileLoad(VALID_SESSION_JSON);

      expect(onImport).toHaveBeenCalledOnce();
      expect(onImport).toHaveBeenCalledWith(
        expect.objectContaining({ session: expect.objectContaining({ name: 'Old Session' }) }),
      );
    });

    it('shows an error when the file contains invalid JSON', () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      simulateFileLoad('{not valid json}');

      expect(screen.getByRole('alert')).toHaveTextContent(/could not read this file/i);
    });

    it('shows an error when the JSON is valid but not a session state shape', () => {
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      simulateFileLoad('{"foo": "bar"}');

      expect(screen.getByRole('alert')).toHaveTextContent(/could not read this file/i);
    });

    it('shows an error when the session object is missing required fields', () => {
      const incomplete = JSON.stringify({
        session: { name: 'Broken' },
        participants: [],
      });
      render(<SessionSetupForm onSubmit={vi.fn()} onImport={vi.fn()} />);
      simulateFileLoad(incomplete);

      expect(screen.getByRole('alert')).toHaveTextContent(/could not read this file/i);
    });
  });
});
