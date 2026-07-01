'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { useBarterStore } from '@/lib/stores/barterStore';
import { useAccountsStore } from '@/lib/stores/accountsStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const QUICK_PROMPTS = [
  'Which sites are available right now?',
  'Summarize my overdue invoices',
  'Which barter deals end this month?',
  'What is my total revenue outstanding?',
];

export function AIChatPanel({ fullPage = false }: { fullPage?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant', ts: Date.now(),
      content: 'Hi Yash! I\'m your Atlas AI assistant. Ask me anything about your OOH inventory, barter deals, accounts, or get location intelligence insights.',
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sites    = useInventoryStore((s) => s.sites);
  const deals    = useBarterStore((s) => s.deals);
  const invoices = useAccountsStore((s) => s.invoices);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function buildContext() {
    const available = sites.filter((s) => s.status === 'available');
    const occupied  = sites.filter((s) => s.status === 'occupied');
    const overdue   = invoices.filter((i) => i.status === 'overdue');
    const activeDeals = deals.filter((d) => d.status === 'active');
    return `
ATLAS BUSINESS CONTEXT (BIZEX4U):
- Total OOH sites: ${sites.length} (${available.length} available, ${occupied.length} occupied)
- Available sites: ${available.map(s=>`${s.siteCode} ${s.name} ${s.city}`).join(', ') || 'none'}
- Active barter deals: ${activeDeals.length} — partners: ${[...new Set(activeDeals.map(d=>d.partnerName))].join(', ') || 'none'}
- Total receivable: ₹${invoices.filter(i=>i.type==='receivable'&&i.status!=='paid').reduce((s,i)=>s+i.outstandingInr,0).toLocaleString('en-IN')}
- Overdue invoices: ${overdue.length} — ₹${overdue.reduce((s,i)=>s+i.outstandingInr,0).toLocaleString('en-IN')} outstanding
- Clients with overdue: ${overdue.map(i=>i.partyName).join(', ') || 'none'}
You are an expert OOH media business assistant for BIZEX4U India. Answer concisely in plain text. Use ₹ for currency.
    `.trim();
  }

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: q, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, context: buildContext() }),
      });
      const data = await res.json();
      setMessages((m) => [...m, {
        id: Date.now().toString() + '_a', role: 'assistant',
        content: data.reply ?? 'Sorry, I couldn\'t get a response. Try again.',
        ts: Date.now(),
      }]);
    } catch {
      setMessages((m) => [...m, {
        id: Date.now().toString() + '_e', role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
          <p className="text-[10px] text-gray-400">Powered by Groq · llama-3.3-70b</p>
        </div>
        <div className="ml-auto h-2 w-2 rounded-full bg-green-400" title="Online" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
              msg.role === 'assistant'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-gray-800 text-white'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="h-3.5 w-3.5" />
                : <User className="h-3.5 w-3.5" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-gray-50 text-gray-800 rounded-tl-sm'
                : 'bg-[#6B21A8] text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} onClick={() => send(p)}
              className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium hover:bg-purple-100 transition-colors text-left">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-purple-400 focus-within:bg-white transition-colors">
          <input
            className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
            placeholder="Ask about your sites, deals, invoices…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-[#6B21A8] text-white disabled:opacity-40 hover:bg-purple-800 transition-colors">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
