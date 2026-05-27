'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ASSESSMENT_CONFIG } from '@/data/assessment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Phase = 'interview' | 'payment' | 'error';

export default function AssessmentInterview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>('interview');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchGreeting() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/assessment/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] }),
        });
        if (!response.ok) {
          setPhase('error');
          return;
        }
        const data = await response.json();
        setMessages([{ role: 'assistant', content: data.reply }]);
      } catch {
        setPhase('error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGreeting();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && phase === 'interview') {
      inputRef.current?.focus();
    }
    if (phase === 'payment') {
      paymentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading, phase]);

  async function handleSend() {
    if (!input.trim() || isLoading || phase !== 'interview') return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assessment/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!response.ok) {
        setPhase('error');
        return;
      }
      const data = await response.json();
      setMessages((previous) => [...previous, { role: 'assistant', content: data.reply }]);
      if (data.isComplete) {
        setPhase('payment');
      }
    } catch {
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Message list */}
      <div className="flex flex-col gap-4 min-h-[400px] max-h-[600px] overflow-y-auto rounded-xl border border-border bg-white p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-sm">
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Payment CTA */}
      {phase === 'payment' && (
        <div ref={paymentRef} className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
          {ASSESSMENT_CONFIG.stripePaymentLink ? (
            <>
              <p className="text-foreground font-semibold mb-4">
                Thank you! Your answers have been received.
              </p>
              <a
                href={ASSESSMENT_CONFIG.stripePaymentLink}
                className="inline-block rounded-lg bg-primary text-white font-medium px-8 py-3 text-sm hover:bg-[#1D9E75] transition-colors"
              >
                Pay $99 to receive your assessment
              </a>
            </>
          ) : (
            <p className="text-foreground">
              We received your answers — we&apos;ll follow up within one business day with payment details.
            </p>
          )}
        </div>
      )}

      {/* Error banner */}
      {phase === 'error' && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Something went wrong. Please email us at{' '}
          <a href="mailto:requests@simplyinsilico.com" className="underline">
            requests@simplyinsilico.com
          </a>
          .
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || phase !== 'interview'}
          placeholder="Type your response..."
          rows={3}
          className="flex-1 rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-white outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim() || phase !== 'interview'}
          className="self-end rounded-lg bg-primary text-white font-medium px-6 py-3 text-sm hover:bg-[#1D9E75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

    </div>
  );
}
