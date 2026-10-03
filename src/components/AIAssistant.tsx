import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrainCircuit, RotateCcw, Send, Sparkles, User, X } from 'lucide-react';
import { ChatMessage } from '../types';

const quickPrompts = [
  { label: 'About Grok', prompt: 'Give me a quick introduction to Grok.' },
  { label: 'Projects', prompt: 'What are Grok\'s main projects and what do they do?' },
  { label: 'Tech stack', prompt: 'What technologies does Grok work with?' },
  { label: 'AI work', prompt: 'Tell me about Grok\'s AI work, especially the AI Study Assistant.' },
  { label: 'Vortex Labs', prompt: 'What is Vortex Labs?' },
  { label: 'Collaboration', prompt: 'How can someone collaborate with Grok or Vortex Labs?' },
];

const makeTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const initialMessage: ChatMessage = {
  id: 'init',
  role: 'model',
  text: "Hey 👋 I'm Grok's AI Twin — a digital representation of the developer behind this portfolio. Ask me about Grok, his projects, technology, AI work, or Vortex Labs.",
  timestamp: makeTimestamp(),
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'ready' | 'offline'>('checking');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const node = messagesRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, generating]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasNewMessage(true), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/assistant', { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setServiceStatus(res.ok && data?.configured ? 'ready' : 'offline');
      })
      .catch(() => {
        if (!cancelled) setServiceStatus('offline');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || generating) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: cleanText,
      timestamp: makeTimestamp(),
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'init')
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setGenerating(true);
    setErrorState(false);
    setHasNewMessage(false);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message: cleanText, history: historyPayload }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error([data?.error, data?.detail].filter(Boolean).join(' — ') || `Request failed with status ${res.status}.`);
      }

      setServiceStatus('ready');

      if (typeof data.text !== 'string' || !data.text.trim()) {
        throw new Error('The AI Twin returned an empty response.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-model`,
          role: 'model',
          text: data.text.trim(),
          timestamp: makeTimestamp(),
        },
      ]);
    } catch (err) {
      console.error('AI Twin request failed:', err);
      setErrorState(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'model',
          text: `AI Twin error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          timestamp: makeTimestamp(),
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const resetChat = () => {
    setMessages([{ ...initialMessage, id: `init-${Date.now()}`, timestamp: makeTimestamp() }]);
    setInputText('');
    setErrorState(false);
  };

  return (
    <div className="ai-twin-root fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            <button
              onClick={() => { setIsOpen(true); setHasNewMessage(false); }}
              className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20 border border-white/20 active:scale-95 sm:hover:scale-105 transition-transform cursor-pointer"
              title="Open Grok's AI Twin"
              aria-label="Open Grok's AI Twin"
            >
              <BrainCircuit className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080d18]" />
              {hasNewMessage && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-300 animate-ping" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="ai-twin-panel w-[calc(100vw-1.5rem)] max-w-[420px] sm:w-[390px] h-[min(640px,78dvh)] sm:h-[min(620px,calc(100vh-2rem))] rounded-[24px] border border-white/10 bg-[#080d18]/95 shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            aria-label="Grok AI Twin chat"
          >
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 shrink-0" />

            <header className="px-3.5 py-3.5 sm:px-4 sm:py-4 border-b border-white/8 bg-white/[0.025] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080d18]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">Grok's AI Twin</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    Digital portfolio representation · {serviceStatus === 'checking' ? 'Checking connection…' : serviceStatus === 'ready' ? 'Online' : 'Needs setup'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={resetChat} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors" title="New conversation" aria-label="New conversation">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors" title="Close" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div ref={messagesRef} className="ai-twin-messages flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-4 py-3.5 sm:py-4 space-y-3.5 scrollbar-thin">
              {messages.map((msg) => {
                const isModel = msg.role === 'model';
                return (
                  <div key={msg.id} className={`flex items-start gap-2 ${isModel ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center border ${isModel ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/15' : 'bg-sky-500/10 text-sky-300 border-sky-500/15'}`}>
                      {isModel ? <BrainCircuit className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`max-w-[84%] px-3 py-2.5 rounded-2xl text-[12px] leading-relaxed ${isModel ? 'bg-white/[0.055] text-zinc-300 border border-white/[0.06] rounded-tl-sm' : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm'}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <span className="block text-[8px] opacity-40 mt-1.5 text-right">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {generating && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/15 flex items-center justify-center">
                    <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.055] border border-white/[0.06] flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 mr-1">Thinking</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            <div className="px-3.5 sm:px-4 py-2.5 border-t border-white/8 bg-white/[0.02] shrink-0">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 overscroll-contain">
                {quickPrompts.map((item) => (
                  <button key={item.label} onClick={() => handleSendMessage(item.prompt)} disabled={generating} className="shrink-0 px-3 py-1.5 rounded-xl border border-white/8 bg-white/[0.035] active:bg-cyan-400/10 sm:hover:bg-cyan-400/10 text-[10px] text-zinc-400 sm:hover:text-cyan-200 transition-colors disabled:opacity-40 cursor-pointer">
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {errorState && (
              <div className="px-3.5 py-1.5 text-[9px] text-amber-300/80 bg-amber-400/5 border-t border-amber-400/10 shrink-0">
                The last request failed. You can try sending it again.
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className="p-3 sm:p-3.5 border-t border-white/8 bg-[#070b14] flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={generating}
                placeholder="Ask the AI Twin anything..."
                className="min-w-0 flex-1 px-3.5 py-3 rounded-2xl bg-white/[0.045] border border-white/8 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-colors disabled:opacity-50"
                maxLength={3000}
              />
              <button type="submit" disabled={!inputText.trim() || generating} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center disabled:opacity-30 sm:hover:scale-105 active:scale-95 transition-transform cursor-pointer" title="Send message" aria-label="Send message">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
