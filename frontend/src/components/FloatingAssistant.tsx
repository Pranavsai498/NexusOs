'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, ArrowUp, X, MessageSquare, Loader2, Send } from 'lucide-react';

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function FloatingAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', content: 'Hello Ramesh 👋\nHow can I help your family today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const publicRoutes = ['/', '/login', '/register'];
  const showAssistant = !publicRoutes.includes(pathname);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    const textToSend = query;
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setQuery('');
    setIsTyping(true);

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: textToSend })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply || "I couldn't generate a response." }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', content: "Unable to connect to NexusOS agents." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Works for Indian English and accepts mixed phrases

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? prev + ' ' + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!showAssistant) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 bg-gradient-to-tr from-brand-blue to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-transform duration-200 ${
            isOpen ? 'bg-slate-800' : 'hover:scale-110 active:scale-95 shadow-[0_4px_20px_rgba(59,130,246,0.4)]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <span className="text-2xl font-bold font-sans">🧠</span>}
        </motion.button>
      </div>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 right-6 w-96 h-[520px] bg-white border border-slate-200 rounded-[28px] shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md bg-white/95"
          >
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <div>
                  <h3 className="font-bold font-heading text-sm">Life Brain</h3>
                  <span className="text-[10px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block mt-0.5">CEO Mode Active</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-[20px] rounded-tr-[4px] max-w-[85%] shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-inner">
                        <Sparkles className="w-4 h-4 text-brand-blue" />
                      </div>
                      <div className="bg-slate-100 text-slate-900 text-sm font-medium px-4 py-3 rounded-[20px] rounded-tl-[4px] shadow-inner whitespace-pre-wrap leading-relaxed">
                        {parseBold(msg.content)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />
                  </div>
                  <div className="bg-slate-100 text-slate-500 text-sm font-medium px-4 py-3 rounded-[20px] rounded-tl-[4px] flex items-center gap-1.5 shadow-inner">
                    <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <div className="flex-1 relative flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about family..."
                  className="flex-1 text-sm text-slate-800 focus:outline-none py-2 bg-transparent pr-8 pl-1 font-medium"
                />
                
                {/* Speech mic */}
                {speechSupported && (
                  <button 
                    onClick={startListening}
                    className={`p-1.5 rounded-full transition-all duration-200 absolute right-2 top-1/2 -translate-y-1/2 ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleSend}
                disabled={!query.trim() && !isListening}
                className="w-10 h-10 bg-slate-900 hover:bg-brand-blue active:scale-95 transition-all text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 shadow-md shrink-0 cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
