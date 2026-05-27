import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConfig = vi.hoisted(() => ({ stripePaymentLink: '' }));

vi.mock('@/data/assessment', () => ({
  ASSESSMENT_CONFIG: mockConfig,
}));

import AssessmentInterview from './AssessmentInterview';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  mockConfig.stripePaymentLink = '';
  Element.prototype.scrollIntoView = vi.fn();
});

function mockFetchResponse(body: unknown, ok = true) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

describe('AssessmentInterview', () => {
  it('POSTs to /api/assessment/chat on mount and renders returned reply as first message', async () => {
    mockFetchResponse({ reply: 'Hello! Welcome to the assessment.', isComplete: false });

    render(<AssessmentInterview />);

    await waitFor(() =>
      expect(screen.getByText('Hello! Welcome to the assessment.')).toBeInTheDocument()
    );

    expect(fetch).toHaveBeenCalledWith(
      '/api/assessment/chat',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('appends user message and calls API again on send', async () => {
    mockFetchResponse({ reply: 'Hello! What is your name?', isComplete: false });

    render(<AssessmentInterview />);
    await waitFor(() => screen.getByText('Hello! What is your name?'));

    mockFetchResponse({ reply: 'Nice to meet you, Alice!', isComplete: false });

    fireEvent.change(screen.getByPlaceholderText('Type your response...'), {
      target: { value: 'My name is Alice' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(screen.getByText('My name is Alice')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Nice to meet you, Alice!')).toBeInTheDocument());

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('transitions to payment phase when API returns isComplete: true', async () => {
    mockFetchResponse({ reply: 'Hello!', isComplete: false });
    render(<AssessmentInterview />);
    await waitFor(() => screen.getByText('Hello!'));

    mockFetchResponse({ reply: 'Thank you! [INTERVIEW_COMPLETE]', isComplete: true });

    fireEvent.change(screen.getByPlaceholderText('Type your response...'), {
      target: { value: 'final answer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByText(/We received your answers/)).toBeInTheDocument()
    );
  });

  it('renders payment link with correct href when stripePaymentLink is set', async () => {
    mockConfig.stripePaymentLink = 'https://buy.stripe.com/test_link';

    mockFetchResponse({ reply: 'Hello!', isComplete: false });
    render(<AssessmentInterview />);
    await waitFor(() => screen.getByText('Hello!'));

    mockFetchResponse({ reply: 'Done! [INTERVIEW_COMPLETE]', isComplete: true });

    fireEvent.change(screen.getByPlaceholderText('Type your response...'), {
      target: { value: 'final answer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'Pay $99 to receive your assessment' });
      expect(link).toHaveAttribute('href', 'https://buy.stripe.com/test_link');
    });
  });

  it('renders placeholder message when stripePaymentLink is empty', async () => {
    mockConfig.stripePaymentLink = '';

    mockFetchResponse({ reply: 'Hello!', isComplete: false });
    render(<AssessmentInterview />);
    await waitFor(() => screen.getByText('Hello!'));

    mockFetchResponse({ reply: 'Done! [INTERVIEW_COMPLETE]', isComplete: true });

    fireEvent.change(screen.getByPlaceholderText('Type your response...'), {
      target: { value: 'final answer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(
        screen.getByText(/we'll follow up within one business day with payment details/)
      ).toBeInTheDocument()
    );
  });

  it('transitions to error phase and shows error banner when API returns non-ok response', async () => {
    mockFetchResponse(null, false);

    render(<AssessmentInterview />);

    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    );

    expect(screen.getByRole('link', { name: 'requests@simplyinsilico.com' })).toHaveAttribute(
      'href',
      'mailto:requests@simplyinsilico.com'
    );
  });
});
