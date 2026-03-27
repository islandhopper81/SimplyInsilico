'use client';

import { useState } from 'react';
import { CONTACT_CONFIG } from '@/data/contact';

interface FormFields {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FIELDS: FormFields = { name: '', email: '', message: '' };

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim()) errors.name = 'Name is required.';
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!fields.message.trim()) errors.message = 'Message is required.';
  return errors;
}

export default function ContactForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFields((previous) => ({ ...previous, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formData = new FormData();
      formData.append('name', fields.name);
      formData.append('email', fields.email);
      formData.append('message', fields.message);

      const response = await fetch(CONTACT_CONFIG.formspreeEndpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFields(EMPTY_FIELDS);
        setErrors({});
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="rounded-2xl bg-primary/10 border border-primary/20 p-10 text-center">
        <p className="text-2xl font-semibold text-foreground mb-3">Message sent!</p>
        <p className="text-muted-foreground leading-relaxed">
          Thanks for reaching out. We'll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {submitStatus === 'error' && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Something went wrong. Please try again or email us directly at{' '}
          <a href="mailto:requests@simplyinsilico.com" className="underline">
            requests@simplyinsilico.com
          </a>
          .
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Your name"
          className={`rounded-lg border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-white outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
            errors.name ? 'border-red-400' : 'border-border focus:border-primary'
          }`}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="you@example.com"
          className={`rounded-lg border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-white outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
            errors.email ? 'border-red-400' : 'border-border focus:border-primary'
          }`}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={fields.message}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Tell us about your business and what you're looking to do with AI..."
          className={`rounded-lg border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-white outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:opacity-50 resize-none ${
            errors.message ? 'border-red-400' : 'border-border focus:border-primary'
          }`}
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-lg bg-primary text-white font-medium px-8 py-3 text-sm hover:bg-[#1D9E75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>

    </form>
  );
}
