/**
 * Chatbot.jsx — Floating customer-support chat widget
 *
 * Architecture:
 *   User types → browser state → POST /api/chat → Gemini → reply
 *
 * The Gemini API key never touches this file. All AI calls go through
 * the server-side /api/chat route.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

/* ── Quick-action prompts shown before first message ─────────────────────── */
const QUICK_QUESTIONS = [
  'Track my shipment',
  'What shipping services do you offer?',
  'Where are your offices?',
  'How do I get a quote?',
];

/* ── Welcome message ─────────────────────────────────────────────────────── */
const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: 'Welcome to JOSEPHDELIVERYCOMPANY. I can help with shipment tracking, shipping services, locations, quotes, and general delivery questions. How can I help you?',
};

/* ── Colour tokens (match site design system) ────────────────────────────── */
const C = {
  navy:    '#0a1f3c',
  navyDark:'#061529',
  red:     '#c0392b',
  redHov:  '#a93226',
  gray:    '#f4f5f7',
  border:  '#e2e6ea',
  muted:   '#64748b',
  text:    '#1a1a2e',
};

export default function Chatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [unread, setUnread]     = useState(0);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const panelRef    = useRef(null);

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  /* Build history array for the API (excludes welcome message) */
  function buildHistory() {
    return messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }));
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    setInput('');
    setError(null);

    const userMsg = { id: Date.now().toString(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: buildHistory() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Unexpected error');
      }

      const botMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: data.reply };
      setMessages(prev => [...prev, botMsg]);

      if (!open) setUnread(n => n + 1);

    } catch (err) {
      const errMsg = err.message?.length < 300
        ? err.message
        : "I'm unable to respond right now. Please try again shortly or contact our support team.";
      setError(errMsg);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: errMsg, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, loading, messages, open]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const showQuickQuestions = messages.length === 1; /* only welcome shown */

  return (
    <>
      {/* ── Floating button ────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open customer support chat'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: open ? C.navyDark : C.red,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 9998,
          transition: 'background-color 0.2s, transform 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseOut={e =>  { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <i
          className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-comment-dots'}
          style={{ fontSize: 22, color: '#ffffff' }}
        />
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 18, height: 18, borderRadius: '50%',
            backgroundColor: '#fff',
            color: C.red,
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${C.red}`,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Customer support chat"
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 'clamp(300px, 90vw, 380px)',
            height: 'clamp(420px, 70vh, 560px)',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            zIndex: 9997,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}
        >
          {/* Header */}
          <div style={{
            backgroundColor: C.navy,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: C.red,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="fa-solid fa-truck-fast" style={{ fontSize: 16, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: '0.2px' }}>
                JOSEPHDELIVERYCOMPANY
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                Customer Support
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: 16 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            backgroundColor: C.gray,
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '82%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  backgroundColor: msg.role === 'user' ? C.navy : '#ffffff',
                  border: msg.role === 'user' ? 'none' : `1px solid ${C.border}`,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: msg.role === 'user' ? '#ffffff' : (msg.isError ? C.red : C.text),
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick questions (shown only at start) */}
            {showQuickQuestions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      backgroundColor: '#ffffff',
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: C.navy,
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.backgroundColor = '#fff5f4'; }}
                    onMouseOut={e =>  { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    <i className="fa-solid fa-angle-right" style={{ fontSize: 9, color: C.red, marginRight: 7 }} />
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#ffffff',
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px 12px 12px 3px',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: '#94a3b8',
                      display: 'inline-block',
                      animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: '10px 12px',
            borderTop: `1px solid ${C.border}`,
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about shipping, tracking, services…"
                rows={1}
                disabled={loading}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  color: C.text,
                  outline: 'none',
                  lineHeight: 1.4,
                  maxHeight: 80,
                  overflow: 'auto',
                  backgroundColor: loading ? '#f9fafb' : '#ffffff',
                }}
                onFocus={e => { e.target.style.borderColor = C.navy; }}
                onBlur={e =>  { e.target.style.borderColor = C.border; }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  backgroundColor: (loading || !input.trim()) ? '#e2e6ea' : C.red,
                  border: 'none',
                  cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.15s',
                }}
              >
                <i className="fa-solid fa-paper-plane" style={{ fontSize: 14, color: '#ffffff' }} />
              </button>
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Typing dot animation */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @media (max-width: 480px) {
          /* On very small screens expand panel to near full width */
        }
      `}</style>
    </>
  );
}
