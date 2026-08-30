'use client';

import { FormEvent, useRef, useState } from 'react';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

type Reply = {
  message: string;
  suggestions?: string[];
  requiresHuman?: boolean;
  policyArea?: string;
  termsVersion?: string;
};

const starterSuggestions = ['What can Orbit do?', 'How do transfers work?', 'Is my data private?'];

function newId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function GalacticChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState(starterSuggestions);
  const [humanEscalation, setHumanEscalation] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! I’m Orbit 👋 I’m an automated support assistant for general product questions. I do not make regulated or account-specific decisions, and I’ll mark when a protected human workflow would be required.'
    }
  ]);
  const panelRef = useRef<HTMLDivElement>(null);

  async function sendMessage(raw: string) {
    const text = raw.trim().slice(0, 500);
    if (!text || busy) return;

    setMessages((current) => [...current, { id: newId(), role: 'user', text }]);
    setInput('');
    setSuggestions([]);
    setHumanEscalation(false);
    setBusy(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Orbit could not answer right now.');
      const reply = data.reply as Reply;
      setMessages((current) => [...current, { id: newId(), role: 'assistant', text: reply.message }]);
      setHumanEscalation(Boolean(reply.requiresHuman));
      setSuggestions(reply.suggestions?.slice(0, 3) || starterSuggestions);
    } catch (error) {
      setMessages((current) => [...current, {
        id: newId(),
        role: 'assistant',
        text: error instanceof Error ? error.message : 'Orbit could not answer right now.'
      }]);
      setHumanEscalation(true);
      setSuggestions(['Product status', 'Security protections', 'Privacy']);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        const scroller = panelRef.current?.querySelector('.chatMessages');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      });
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className={`galacticChat ${open ? 'open' : ''}`}>
      {open && (
        <div className="chatPanel" ref={panelRef} role="dialog" aria-label="Galactic Trust automated support assistant">
          <div className="chatHeader">
            <div className="chatBotAvatar" aria-hidden="true">✦</div>
            <div><strong>Orbit</strong><small><i /> Automated support · general guidance</small></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div className="chatSafetyNote">
            <span>🔒</span>
            <p>Never share passwords, PINs, CVVs, recovery codes, one-time codes, SSNs, or identity documents here.</p>
          </div>

          <div className="chatMessages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`chatBubble ${message.role}`}>{message.text}</div>
            ))}
            {busy && <div className="chatBubble assistant typing" aria-label="Orbit is typing"><span /><span /><span /></div>}
          </div>

          {humanEscalation ? (
            <div className="chatSafetyNote" role="status">
              <span>👤</span>
              <p>Prototype handoff marker: this needs authorized human handling in a live program. No production case-management channel is connected here, and Orbit has not acknowledged, investigated, or resolved a case.</p>
            </div>
          ) : null}

          {suggestions.length > 0 && (
            <div className="chatSuggestions">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} disabled={busy}>{suggestion}</button>
              ))}
            </div>
          )}

          <form className="chatComposer" onSubmit={submit}>
            <label className="srOnly" htmlFor="orbit-message">Message Orbit</label>
            <input id="orbit-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Ask a general support question…" autoComplete="off" />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send message">➤</button>
          </form>
          <div className="chatPrivacyLine">Automated prototype support. Required human handling is a marker only until an approved human case-management channel is connected.</div>
        </div>
      )}

      <button className="chatLauncher" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close support chat' : 'Open automated support chat'}>
        {open ? <span className="launcherClose">×</span> : <><span className="launcherPlanet">✦</span><span className="launcherBadge">1</span></>}
      </button>
    </div>
  );
}