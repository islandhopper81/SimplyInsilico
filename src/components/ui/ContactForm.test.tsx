import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactForm from './ContactForm';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('ContactForm', () => {
  it('renders all three fields and submit button', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(await screen.findByText('Message is required.')).toBeInTheDocument();
  });

  it('shows email format error for invalid email', async () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'notanemail' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('shows success message after successful submission', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(screen.getByText('Message sent!')).toBeInTheDocument());
  });

  it('shows error message when submission fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(screen.getByText(/Something went wrong/)).toBeInTheDocument());
  });

  it('disables the submit button and shows "Sending..." during submission', async () => {
    let resolveSubmit!: (value: unknown) => void;
    (fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise((resolve) => { resolveSubmit = resolve; })
    );

    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    });

    resolveSubmit({ ok: true });
  });

  it('clears a field error when the user starts typing in that field', async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Name is required.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'T' } });
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
  });
});
