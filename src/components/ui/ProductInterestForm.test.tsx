import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_CONFIG } from '@/data/contact';
import ProductInterestForm from './ProductInterestForm';

vi.mock('@/data/contact', () => ({ CONTACT_CONFIG: { formspreeEndpoint: 'https://formspree.io/f/example' } }));

afterEach(() => {
  CONTACT_CONFIG.formspreeEndpoint = 'https://formspree.io/f/example';
  vi.unstubAllGlobals();
});

function submitInterest() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'coach@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'I’m interested' }));
}

describe('ProductInterestForm', () => {
  it('attributes interest to the selected product and confirms only after a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    render(<ProductInterestForm productName="Line Change" feedbackPrompt="What sport do you coach?" />);
    submitInterest();
    expect(await screen.findByRole('status')).toHaveTextContent('Your message has been sent');
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(fetchMock.mock.calls[0][0]).toBe(CONTACT_CONFIG.formspreeEndpoint);
    expect(body.get('product')).toBe('Line Change');
    expect(body.get('_subject')).toBe('Product interest: Line Change');
    expect(body.get('email')).toBe('coach@example.com');
  });

  it('keeps the entered email after a failed request and offers a product-specific email fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    render(<ProductInterestForm productName="The Giving Guru" feedbackPrompt="How do you coordinate gifts?" />);
    submitInterest();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('couldn’t be sent'));
    expect(screen.getByLabelText('Email')).toHaveValue('coach@example.com');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'email us your interest' }).getAttribute('href')).toContain('The%20Giving%20Guru');
    expect(screen.getByRole('button', { name: 'I’m interested' })).toBeEnabled();
  });

  it('offers email instead of submitting to an empty endpoint', () => {
    CONTACT_CONFIG.formspreeEndpoint = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ProductInterestForm productName="Line Change" feedbackPrompt="What sport do you coach?" />);
    expect(screen.getByRole('link', { name: 'Email your interest in Line Change' })).toHaveAttribute('href', expect.stringContaining('mailto:requests@simplyinsilico.com'));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
