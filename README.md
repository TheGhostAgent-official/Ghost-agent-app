ghost-tutor/
  package.json
  next.config.js
  app/
    layout.tsx
    page.tsx
    api/
      agent/
        route.ts
{
  "name": "ghost-tutor",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};
export default nextConfig;
export const metadata = {
  title: "Ghost Tutor",
  description: "A 24/7 tutor that guides instead of giving answers"'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi, I’m your Ghost Tutor. Ask me any 6th grade question—I’ll help you solve it step by step." }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: "Error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>Ghost Tutor (Grade 6–7)</h1>
      <div style={{ border: "1px solid #ddd", padding: 10, height: "50vh", overflowY: "auto", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.role === 'user' ? 'You' : 'Ghost Tutor'}:</strong> {m.content}
          </div>
        ))}
        {loading && <div>Thinking…</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={input}
          onChange={e => setInput(e.target.value)}import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are the Ghost Tutor, a friendly 7th-grader study buddy for a 6th grader.
Rules:
1. Never just give the answer. If asked for the answer directly, reply:
   "I can’t just give you the answer because that won’t help you learn. But I’ll guide you step by step so you figure it out yourself."
2. Guide with hints and questions.
3. Check understanding after explanations.
4. Encourage effort: "Nice work," "Good thinking."
5. Remind: "We don’t cheat—we learn by solving together."
6. Stretch learning: when they succeed, connect to what they’ll see in 7th grade.
7. If they don’t know what to study, use rotation:
   Mon=Math, Tue=Science, Wed=English, Thu=History, Fri=Review, Sat=Creative, Sun=Light Quiz.
`;

export async function POST(req: Request) {
  const { messages = [] } = await req.json();

  const finalMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(-20)
  ];

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: finalMessages,
      temperature: 0.4
    })
  });

  if (!r.ok) {
    const err = await r.text();
    return NextResponse.json({ reply: "OpenAI error: " + err }, { status: 500 });
  }

  const data = await r.json();
  const reply = data?.choices?.[0]?.message?.content ?? "I couldn’t think of a response.";
  return NextResponse.json({ reply });
}

          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me something…"
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </main>
  );
}

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
