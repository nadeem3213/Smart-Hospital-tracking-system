import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_POSITION, API_BASE } from '@/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  routeSuggested?: string;
}

const EmergencyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I am the MediRoute AI Assistant. Please describe your symptoms and I will route you to the best nearby hospital.',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(DEFAULT_POSITION);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => console.log("Location access denied. Using default position.")
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: newMessages.map(m => ({ role: m.role, content: m.content })),
          userPos
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        let replyText = data.reply;
        let routeSuggested;

        const routeRegex = /\[ROUTE:\s*(.+?)\]/i;
        const match = replyText.match(routeRegex);
        
        if (match) {
          routeSuggested = match[1].trim();
          replyText = replyText.replace(routeRegex, '').trim();
        }

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: replyText || "I've found a suitable hospital for you.",
            routeSuggested
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'I am having trouble connecting to my neural net right now. Please try again.',
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was a network error reaching my servers.',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteClick = (hospitalName: string) => {
    setIsOpen(false);
    navigate('/routing', { state: { selectedHospital: hospitalName } });
  };

  return (
    <>
      {/* Target Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-background/30 backdrop-blur-md border border-white/20 shadow-[0_0_40px_-5px_rgba(139,92,246,0.3)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_-5px_rgba(139,92,246,0.6)] focus:outline-none overflow-hidden"
            >
              {/* Spinning abstract gradient background representing AI */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 opacity-80" />
              
              {/* Inner glowing core */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-300 blur-[8px] opacity-40 group-hover:opacity-80 transition-opacity" />
              
              <MessageSquare className="h-6 w-6 text-white z-10" />
              <Sparkles className="absolute top-3 right-3 h-3 w-3 text-white/80 animate-pulse z-10" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[9999] flex h-[600px] w-[400px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.5)]"
          >
            {/* Glossy overlay for realism */}
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent block" />

            {/* AI Header */}
            <div className="relative px-6 py-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-inner">
                  <Bot className="h-5 w-5 text-indigo-300" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#121212]" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-indigo-400 animate-ping opacity-75" />
                </div>
                <div>
                  <h3 className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
                    MediRoute AI <Sparkles className="h-3 w-3 text-indigo-300" />
                  </h3>
                  <p className="text-[11px] text-indigo-200/60 font-mono tracking-wider mt-0.5 uppercase">
                    Neural Triage Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 rounded-full h-8 w-8 flex items-center justify-center bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar relative">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`relative max-w-[85%] px-4 py-3 text-[13px] shadow-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'text-white rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-500 to-violet-600'
                        : 'bg-white/[0.03] border border-white/10 text-slate-200 rounded-2xl rounded-tl-sm backdrop-blur-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="whitespace-pre-wrap font-medium">
                        {message.content}
                        
                        {message.routeSuggested && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <Button 
                              onClick={() => handleRouteClick(message.routeSuggested!)}
                              className="w-full bg-white/10 hover:bg-white/20 text-white gap-2 font-semibold shadow-sm transition-all rounded-xl border border-white/5 backdrop-blur-md"
                            >
                              <Navigation className="h-4 w-4 text-indigo-300" />
                              Route to {message.routeSuggested}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5 h-10 w-[72px]">
                    <motion.div
                      animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-4 relative z-10 bg-black/20 border-t border-white/5">
              <form
                onSubmit={(e) => {
                   e.preventDefault();
                   handleSend();
                }}
                className="flex items-center gap-2 relative bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-xl"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms..."
                    className="w-full bg-transparent px-4 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white disabled:opacity-30 disabled:bg-white/10 transition-all hover:bg-indigo-400 focus:outline-none"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyChatbot;
