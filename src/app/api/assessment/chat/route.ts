import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are conducting an intake interview for a $99 AI Architecture Assessment
offered by Simply Insilico. Your goal is to collect enough information to draft
a tailored AI architecture recommendation for the client's business.

Begin by warmly greeting the client and asking for their name, email address,
and business name. Once you have all three, proceed through the nine questions
below, one at a time, in natural conversational language. Adapt follow-up
questions based on responses (e.g. if sensitive data is mentioned, probe further
before moving on). Confirm each answer before proceeding to the next question.

The nine questions:
1. Describe the business problem you are trying to solve. What do you want the tool to do?
2. How many people need to use it, and are they in the same location?
3. Does the data involve anything sensitive — client records, health information, financial data, or legally privileged material?
4. Does that data need to stay on your premises, or is cloud storage acceptable?
5. What tools does your team currently use that this would need to connect to?
6. How comfortable is your team with technology — from "we need it to just work" to "we have someone technical on staff"?
7. Is this a quick prototype to test an idea, or something you want to rely on long term?
8. What is your rough monthly budget for running this once it is built?
9. Is there anything else about your situation that is important for us to understand?

When all nine questions are answered:
1. Thank the client warmly.
2. Generate the structured transcript below.
3. End your response with the exact token: [INTERVIEW_COMPLETE]

Transcript format (include verbatim between the markers in your final message):
---TRANSCRIPT---
New Architecture Assessment — [Client Name] — [Date]
Business: [Business name]
Email: [Client email]

1. Problem to solve: [Summary]
2. Number of users: [Response]
3. Sensitive data: [Response + details if applicable]
4. Data sovereignty: [Response]
5. Existing tools: [Response]
6. Technical comfort: [Response]
7. Prototype vs long-term: [Response]
8. Monthly budget: [Response]
9. Additional context: [Response]

Full conversation:
[Complete Q&A]
---TRANSCRIPT---`;

const INTERVIEW_COMPLETE_TOKEN = '[INTERVIEW_COMPLETE]';
const TRANSCRIPT_MARKER = '---TRANSCRIPT---';
const SCOTT_EMAIL = 'scott@simplyinsilico.com';

function extractTranscript(reply: string): string {
  const startIndex = reply.indexOf(TRANSCRIPT_MARKER);
  const endIndex = reply.lastIndexOf(TRANSCRIPT_MARKER);
  if (startIndex === -1 || startIndex === endIndex) return reply;
  return reply.slice(startIndex, endIndex + TRANSCRIPT_MARKER.length);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.messages) {
    return NextResponse.json({ error: 'messages field is required' }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: body.messages,
  });

  const reply = response.content[0].type === 'text' ? response.content[0].text : '';
  const isComplete = reply.includes(INTERVIEW_COMPLETE_TOKEN);

  if (isComplete) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const transcript = extractTranscript(reply);
    await resend.emails.send({
      from: 'noreply@simplyinsilico.com',
      to: SCOTT_EMAIL,
      subject: 'New Architecture Assessment Transcript',
      text: transcript,
    });
  }

  return NextResponse.json({ reply, isComplete });
}
