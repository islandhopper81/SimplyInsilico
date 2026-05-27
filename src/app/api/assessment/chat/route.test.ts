import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockCreate, mockEmailSend } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockEmailSend: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function () {
    return { messages: { create: mockCreate } };
  }),
}));

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockEmailSend } };
  }),
}));

import { POST } from './route';

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/assessment/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeAnthropicResponse(text: string) {
  return {
    content: [{ type: 'text', text }],
    id: 'msg_test',
    model: 'claude-sonnet-4-6',
    role: 'assistant',
    stop_reason: 'end_turn',
    type: 'message',
    usage: { input_tokens: 10, output_tokens: 10 },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEmailSend.mockResolvedValue({ data: { id: 'test-id' }, error: null });
});

describe('POST /api/assessment/chat', () => {
  it('returns 400 if messages field is missing from request body', async () => {
    const request = makeRequest({ notMessages: [] });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('calls Anthropic SDK with model claude-sonnet-4-6 and the correct system prompt', async () => {
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse('Hello! How can I help?'));

    const request = makeRequest({ messages: [] });
    await POST(request);

    expect(mockCreate).toHaveBeenCalledOnce();
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-sonnet-4-6');
    expect(callArgs.system).toContain('$99 AI Architecture Assessment');
    expect(callArgs.system).toContain('[INTERVIEW_COMPLETE]');
  });

  it('seeds a user message when messages array is empty', async () => {
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse('Hello! Welcome to the assessment.'));

    const request = makeRequest({ messages: [] });
    await POST(request);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages).toEqual([{ role: 'user', content: 'Hello' }]);
  });

  it('returns isComplete: true when Claude reply contains [INTERVIEW_COMPLETE]', async () => {
    const replyWithComplete = `Thank you so much! Here is your transcript.
---TRANSCRIPT---
New Architecture Assessment — Test User — 2026-01-01
Business: Test Co
Email: test@example.com
---TRANSCRIPT---
[INTERVIEW_COMPLETE]`;
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse(replyWithComplete));

    const request = makeRequest({ messages: [{ role: 'user', content: 'done' }] });
    const response = await POST(request);
    const data = await response.json();

    expect(data.isComplete).toBe(true);
  });

  it('returns isComplete: false when Claude reply does not contain [INTERVIEW_COMPLETE]', async () => {
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse('What is your name?'));

    const request = makeRequest({ messages: [] });
    const response = await POST(request);
    const data = await response.json();

    expect(data.isComplete).toBe(false);
  });

  it('calls Resend to send transcript email when isComplete is true', async () => {
    const replyWithComplete = `Thank you!
---TRANSCRIPT---
New Architecture Assessment — Jane Doe — 2026-01-01
Business: Acme
Email: jane@acme.com
---TRANSCRIPT---
[INTERVIEW_COMPLETE]`;
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse(replyWithComplete));

    const request = makeRequest({ messages: [{ role: 'user', content: 'done' }] });
    await POST(request);

    expect(mockEmailSend).toHaveBeenCalledOnce();
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'scott@simplyinsilico.com',
        subject: 'New Architecture Assessment Transcript',
      })
    );
  });

  it('includes verbatim conversation log in the email body', async () => {
    const replyWithComplete = `---TRANSCRIPT---\nSummary\n---TRANSCRIPT---\n[INTERVIEW_COMPLETE]`;
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse(replyWithComplete));

    const messages = [
      { role: 'user', content: 'My name is Alice' },
      { role: 'assistant', content: 'Nice to meet you, Alice!' },
    ];
    const request = makeRequest({ messages });
    await POST(request);

    const emailText = mockEmailSend.mock.calls[0][0].text as string;
    expect(emailText).toContain('VERBATIM CONVERSATION');
    expect(emailText).toContain('Client:\nMy name is Alice');
    expect(emailText).toContain('Claude:\nNice to meet you, Alice!');
  });

  it('does not call Resend when isComplete is false', async () => {
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse('Tell me about your business.'));

    const request = makeRequest({ messages: [] });
    await POST(request);

    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('still returns isComplete: true and 200 when Resend throws', async () => {
    const replyWithComplete = `Thank you!\n---TRANSCRIPT---\nContent\n---TRANSCRIPT---\n[INTERVIEW_COMPLETE]`;
    mockCreate.mockResolvedValueOnce(makeAnthropicResponse(replyWithComplete));
    mockEmailSend.mockRejectedValueOnce(new Error('Resend domain not verified'));

    const request = makeRequest({ messages: [{ role: 'user', content: 'done' }] });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isComplete).toBe(true);
  });
});
