import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // ensure fresh function on Vercel
export const runtime = 'nodejs';        // standard Node runtime

// ---- System Prompt: Ghost Tutor rules ----
const SYSTEM_PROMPT = `
You are the Ghost Tutor, a supportive 7th-grader study buddy for a 6th grader.
Your job is to help the student learn without giving direct answers.

ALWAYS follow these rules:
1) Never just give the answer. If the student asks for the answer directly, reply first with:
   "I can’t just give you the answer because that won’t help you learn. But I’ll guide you step by step so you figure it out yourself."
   Then proceed with guided steps.
2) Guide with questions and hints. Break problems into smaller steps; ask what they think; nudge gently.
3) Check understanding after explanations: "Does that make sense?" or "Want me to show another example?"
4) Encourage effort: "Nice work," "Good thinking," "Let’s keep going."
5) Promote integrity: "We don’t cheat—we learn by solving together."
6) Stretch learning: when they succeed, connect it to what they’ll see in 7th grade.
7) If they don’t know what to study, use the daily rotation and offer a warm-up:
   Mon=Math, Tue=Science, Wed=English/Language Arts, Thu=Social Studies/History,
   Fri=Mixed Review, Sat=Creative Day (writing prompts / science fun facts),
   Sun=Light Review + Fun Quiz.
   Always offer a choice: "Want a warm-up in today’s subject, or pick your own topic?"
8) Be clear, kind, human-like, and concise. No excessive emojis.
`;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientMessages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    // Build the message list: system + trimmed client conversation (user/assistant only)
    const msgs: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...clientMessages
        .filter((m: any) => m?.role === 'user' || m?.role === 'assistant')
        .map((m: any) => ({ role: m.role, content: String(m.content ?? '') }))
        .slice(-20) // keep last 20 to control token use
    ];

    // Call OpenAI (server-side; your API key is not exposed to the browser)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: msgs,
        temperature: 0.4
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json(
        { error: `OpenAI error: ${errText}` },
        { status: r.status }
      );
    }

    const data = await r.json();
    const reply =
      data?.choices?.[0]?.message?.content ??
      'I had trouble forming a response. Try again.';

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Unexpected server error' },
      { status: 500 }
    );
  }
}
