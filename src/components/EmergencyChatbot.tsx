import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Activity, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
      content: 'Hello. I am the Emergency AI Assistant. Please describe your symptoms and I will help you find the best nearby hospital.',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>([18.5204, 73.8567]); // Default to Pune
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => console.log("Location access denied. Using default Pune position.")
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
    
    // Add user message to history
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
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

        // Parse for the [ROUTE: ...] token
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
            content: 'Sorry, I am having trouble connecting to the emergency database right now.',
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was a network error reaching the assistant.',
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
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-destructive to-red-500 text-white shadow-[0_8px_30px_rgb(220,38,38,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgb(220,38,38,0.6)] focus:outline-none"
            >
              <Activity className="absolute inset-0 m-auto h-8 w-8 animate-ping text-white opacity-20 duration-1000" />
              <MessageSquare className="h-7 w-7 z-10" />
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
            className="fixed bottom-24 right-6 z-[9999] flex h-[550px] w-[380px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl sm:h-[600px] sm:w-[420px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-destructive to-red-500 px-5 py-4 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/20 shadow-sm">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">Emergency AI</h3>
                  <p className="text-xs text-red-100 mt-0.5 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Symptom Triage & Routing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-transparent to-black/5 custom-scrollbar">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm shadow-md backdrop-blur-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-blue-600'
                        : 'bg-card/80 border border-white/5 text-card-foreground rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === 'assistant' && (
                        <div className="mt-0.5 shrink-0 bg-destructive/10 p-1 rounded-full">
                          <Bot className="h-4 w-4 text-destructive" />
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap leading-relaxed font-medium">
                        {message.content}
                        
                        {message.routeSuggested && (
                          <div className="mt-4 pt-3 border-t border-border/50">
                            <Button 
                              onClick={() => handleRouteClick(message.routeSuggested!)}
                              className="w-full bg-gradient-to-r from-destructive to-red-500 hover:opacity-90 text-white gap-2 font-semibold shadow-sm transition-all"
                            >
                              <Navigation className="h-4 w-4" />
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
                  <div className="bg-card/80 backdrop-blur-sm border border-white/5 shadow-md rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-1.5 h-4">
                      <span className="w-2 h-2 bg-destructive/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-destructive/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-destructive/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-card/60 backdrop-blur-xl p-4 border-t border-white/10 relative z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3 relative"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms..."
                    className="w-full rounded-2xl border border-white/10 bg-background/50 px-5 py-3.5 text-sm text-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 text-white shadow-lg disabled:opacity-50 transition-all hover:scale-105 hover:shadow-xl focus:outline-none"
                >
                  <Send className="h-5 w-5 ml-1" />
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
