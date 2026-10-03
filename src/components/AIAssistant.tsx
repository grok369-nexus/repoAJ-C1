import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, BrainCircuit, MessageSquare, RotateCcw, Send, Sparkles, User, X } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasNewMessage(true), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/assistant', { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        setServiceStatus(res.ok && data?.configured ? 'ready' : 'offline');
      })
      .catch(() => setServiceStatus('offline'));
  }, []);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 250);
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
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {!isOpen && (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}>
            <button
              onClick={() => { setIsOpen(true); setHasNewMessage(false); }}
              className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 border border-white/20 hover:scale-105 transition-transform cursor-pointer"
              title="Open Grok's AI Twin"
              aria-label="Open Grok's AI Twin"
            >
              <BrainCircuit className="w-6 h-6 group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080d18]" />
              {hasNewMessage && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-300 animate-ping" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, scale: 0.92, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 35 }}
            transition={{ type: 'spring', stiffness: 220, damping: 25 }}
            className="w-[calc(100vw-2rem)] sm:w-[390px] h-[min(620px,calc(100vh-2rem))] rounded-3xl border border-white/10 bg-[#080d18]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            aria-label="Grok AI Twin chat"
          >
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500" />

            <header className="px-4 py-4 border-b border-white/8 bg-white/[0.025] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080d18]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Grok's AI Twin</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Digital portfolio representation · {serviceStatus === 'checking' ? 'Checking connection…' : serviceStatus === 'ready' ? 'Online' : 'Needs setup'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetChat} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors" title="New conversation" aria-label="New conversation">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors" title="Close" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map((msg) => {
                const isModel = msg.role === 'model';
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-2.5 ${isModel ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center border ${isModel ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/15' : 'bg-sky-500/10 text-sky-300 border-sky-500/15'}`}>
                      {isModel ? <BrainCircuit className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`max-w-[82%] px-3.5 py-3 rounded-2xl text-[12px] leading-relaxed ${isModel ? 'bg-white/[0.055] text-zinc-300 border border-white/[0.06] rounded-tl-sm' : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm'}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="block text-[8px] opacity-40 mt-1.5 text-right">{msg.timestamp}</span>
                    </div>
                  </motion.div>
                );
              })}

              {generating && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/15 flex items-center justify-center">
                    <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-white/[0.055] border border-white/[0.06] flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 mr-1">Thinking</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            <div className="px-4 py-2.5 border-t border-white/8 bg-white/[0.02]">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {quickPrompts.map((item) => (
                  <button key={item.label} onClick={() => handleSendMessage(item.prompt)} disabled={generating} className="shrink-0 px-3 py-1.5 rounded-xl border border-white/8 bg-white/[0.035] hover:bg-cyan-400/10 hover:border-cyan-400/20 text-[10px] text-zinc-400 hover:text-cyan-200 transition-colors disabled:opacity-40 cursor-pointer">
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {errorState && <div className="px-4 py-1.5 text-[9px] text-amber-300/80 bg-amber-400/5 border-t border-amber-400/10">The last request failed. You can try sending it again.</div>}

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className="p-3.5 border-t border-white/8 bg-[#070b14] flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={generating}
                placeholder="Ask the AI Twin anything..."
                className="min-w-0 flex-1 px-3.5 py-3 rounded-2xl bg-white/[0.045] border border-white/8 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-all disabled:opacity-50"
                maxLength={3000}
              />
              <button type="submit" disabled={!inputText.trim() || generating} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-transform cursor-pointer" title="Send message" aria-label="Send message">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
