'use client';

import { useState } from 'react';
import { CONTACT_CONFIG } from '@/data/contact';

interface ProductInterestFormProps {
  productName: string;
  feedbackPrompt: string;
}

export default function ProductInterestForm({ productName, feedbackPrompt }: ProductInterestFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const emailLink = `mailto:requests@simplyinsilico.com?subject=${encodeURIComponent(`Interest in ${productName}`)}&body=${encodeURIComponent(`I'm interested in ${productName}.\n\n${feedbackPrompt}\n\n`)}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending' || !CONTACT_CONFIG.formspreeEndpoint) return;
    const formData = new FormData(event.currentTarget);
    formData.set('product', productName);
    formData.set('_subject', `Product interest: ${productName}`);
    setStatus('sending');
    try {
      const response = await fetch(CONTACT_CONFIG.formspreeEndpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Interest submission failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (!CONTACT_CONFIG.formspreeEndpoint) {
    return (
      <div>
        <a href={emailLink} className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-[#1D9E75] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Email your interest in {productName}</a>
        <p className="mt-3 text-sm text-muted-foreground">Opens your email app. Send your message to requests@simplyinsilico.com to let us know you’re interested.</p>
      </div>
    );
  }

  if (status === 'success') {
    return <p role="status" className="rounded-xl bg-primary/10 p-6 text-primary">Thanks for your interest in {productName}! Your message has been sent.</p>;
  }

  const fieldClass = 'w-full rounded-lg border border-border bg-white px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="interest-name" className="mb-2 block text-sm font-medium">Name (optional)</label>
        <input id="interest-name" name="name" autoComplete="name" maxLength={200} className={fieldClass} disabled={status === 'sending'} />
      </div>
      <div>
        <label htmlFor="interest-email" className="mb-2 block text-sm font-medium">Email</label>
        <input id="interest-email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} disabled={status === 'sending'} />
      </div>
      <div>
        <label htmlFor="interest-message" className="mb-2 block text-sm font-medium">{feedbackPrompt} (optional)</label>
        <textarea id="interest-message" name="message" rows={3} maxLength={5000} className={fieldClass} disabled={status === 'sending'} />
      </div>
      <p className="text-sm text-muted-foreground">We’ll use your email to follow up about {productName}. Registering interest does not create an account or guarantee access.</p>
      {status === 'error' && <p role="alert" className="text-sm text-red-700">Your message couldn’t be sent. Please try again or <a href={emailLink} className="underline">email us your interest</a>.</p>}
      <button disabled={status === 'sending'} type="submit" className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-[#1D9E75] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{status === 'sending' ? 'Sending…' : 'I’m interested'}</button>
    </form>
  );
}
