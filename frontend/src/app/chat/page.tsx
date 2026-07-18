'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Paperclip, ArrowUp, Sparkles, FileText, Landmark, GraduationCap } from 'lucide-react';

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderFormattedMessage = (content: string) => {
  if (!content) return null;
  const lines = content.split('\n');
  return (
    <div className="space-y-3 whitespace-pre-wrap text-slate-800 text-lg leading-relaxed">
      {lines.map((line, i) => {
        let trimmed = line.trim();
        if (trimmed === '---') {
          return <hr key={i} className="my-6 border-slate-200" />;
        }
        if (trimmed.startsWith('###')) {
          return <h3 key={i} className="text-xl font-heading font-bold text-slate-900 mt-6 mb-2">{trimmed.replace(/^###\s*/, '')}</h3>;
        }
        if (trimmed.startsWith('##')) {
          return <h2 key={i} className="text-2xl font-heading font-bold text-slate-900 mt-8 mb-3">{trimmed.replace(/^##\s*/, '')}</h2>;
        }
        if (trimmed.startsWith('#')) {
          return <h1 key={i} className="text-3xl font-heading font-bold text-slate-900 mt-8 mb-3">{trimmed.replace(/^#\s*/, '')}</h1>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listText = line.replace(/^\s*[-*]\s+/, '');
          return (
            <div key={i} className="flex gap-2 pl-4">
              <span className="text-slate-400 font-bold">•</span>
              <span className="flex-1">{parseBold(listText)}</span>
            </div>
          );
        }
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 pl-4">
              <span className="text-slate-400 font-bold">{numberedMatch[1]}.</span>
              <span className="flex-1">{parseBold(numberedMatch[2])}</span>
            </div>
          );
        }
        return <p key={i} className="min-h-[1rem]">{parseBold(line)}</p>;
      })}
    </div>
  );
};

function ChatContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      // Optional: auto-send
      // setTimeout(() => handleSend(q), 500);
    }
  }, [searchParams]);

  const handleSend = async (overrideQuery?: string | React.MouseEvent) => {
    const textToSend = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!textToSend) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ query: textToSend })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.reply || "I didn't receive a valid response from the backend."
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the servers." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <nav className="glass sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-heading font-bold text-slate-900">NexusAI</Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-500 shadow-md"></div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-between">
        
        <div className="flex-1 overflow-y-auto pb-32">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center mt-20">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center mb-8"
              >
                <Sparkles className="w-10 h-10 text-brand-blue" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 tracking-tight">
                Hello 👋 <br/> How can I help your family today?
              </h1>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {['My daughter got admission into engineering.', 'Can I buy a house?', 'Find government schemes.', 'Plan my retirement.'].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => setQuery(suggestion)}
                    className="p-4 bg-white border border-slate-200 rounded-[16px] text-left text-slate-700 hover:bg-slate-50 hover:border-brand-blue transition-colors shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 mt-8 pb-20">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-[24px] rounded-tr-[4px] max-w-[80%] shadow-md">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-500 shadow-md shrink-0 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-4">
                          {renderFormattedMessage(msg.content)}
                          {msg.cards && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {msg.cards.map((card: any, i: number) => (
                                <div key={i} className="premium-card p-5 group cursor-pointer">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                      {card.icon}
                                    </div>
                                    <h4 className="font-heading font-semibold text-slate-900">{card.title}</h4>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-4">{card.desc}</p>
                                  <button className="text-sm font-medium text-brand-blue">View Details &rarr;</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              <AnimatePresence>
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center animate-pulse"></div>
                    <div className="glass px-6 py-4 rounded-[24px] rounded-tl-[4px] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      <span className="text-sm font-medium text-slate-500 ml-2">Agents are reasoning...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-brand-bg via-brand-bg to-transparent pt-10 pb-8 px-4">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center gap-2">
              <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your family's life..."
              className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 rounded-full py-5 pl-16 pr-24 text-lg focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-400 text-slate-900"
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={!query}
                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-300 transition-all hover:bg-brand-blue"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">NexusOS can make mistakes. Verify important financial or legal information.</p>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
