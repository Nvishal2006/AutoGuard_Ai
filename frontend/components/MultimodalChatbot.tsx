"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, MessageSquare, Volume2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function MultimodalChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        // TTS: Speak latest bot message
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.sender === 'bot' && !isLoading) {
            const utterance = new SpeechSynthesisUtterance(lastMsg.text);
            // Select a good voice if available (e.g. Google US English)
            const voices = window.speechSynthesis.getVoices();
            utterance.voice = voices.find(v => v.name.includes('Google US English')) || voices[0];
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.cancel(); // Stop previous
            window.speechSynthesis.speak(utterance);
        }
    }, [messages, isLoading]);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                // Optional: Auto-send after voice
                // handleSend(); 
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech error", event);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            text,
            sender,
            timestamp: new Date()
        }]);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        addMessage(userMsg, 'user');
        setInput('');
        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/chat', {
                message: userMsg,
                history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [m.text] }))
            });
            addMessage(res.data.response, 'bot');
        } catch (e) {
            console.error(e);
            addMessage("I'm having trouble connecting to the Neural Core. Please try again.", 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mb-4 w-96 h-[500px] bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <MessageSquare size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-100 block text-sm">Voice Bot Agent</span>
                                        <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                            MULTIMODAL ONLINE
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-slate-900/50">
                                {messages.length === 0 && (
                                    <div className="text-center text-slate-500 mt-10 text-sm">
                                        <p>Ask me anything about your fleet.</p>
                                        <p className="text-xs mt-2 opacity-50">Powered by AutoGuard AI</p>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id}
                                        className={cn(
                                            "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.sender === 'user'
                                                ? "bg-blue-600 text-white self-end ml-auto rounded-br-sm"
                                                : "bg-slate-800 text-slate-200 self-start rounded-bl-sm border border-slate-700/50"
                                        )}
                                    >
                                        {msg.sender === 'user' ? (
                                            msg.text
                                        ) : (
                                            <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-sm">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-bold text-white shadow-blue-500/20" {...props} />,
                                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-2 rounded-lg border border-slate-700/50 bg-slate-900/50"><table className="w-full text-left text-xs" {...props} /></div>,
                                                        thead: ({ node, ...props }) => <thead className="bg-slate-800/80" {...props} />,
                                                        th: ({ node, ...props }) => <th className="p-2 font-bold text-slate-200 border-b border-slate-700" {...props} />,
                                                        td: ({ node, ...props }) => <td className="p-2 border-b border-slate-800/50 text-slate-300" {...props} />,
                                                        code: ({ node, ...props }) => <code className="bg-slate-900 px-1 py-0.5 rounded text-xs font-mono text-purple-300 border border-slate-700" {...props} />,
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="self-start bg-slate-800/50 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 flex items-center gap-2">
                                <button
                                    onClick={() => alert("Image upload feature coming soon! (Backend ready)")}
                                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-full"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                <button
                                    onClick={toggleListening}
                                    className={cn(
                                        "text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-full",
                                        isListening && "text-red-500 animate-pulse bg-red-500/10"
                                    )}
                                >
                                    <Mic size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isListening ? "Listening..." : "Message AutoGuard AI..."}
                                    className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-90 shadow-lg shadow-blue-600/20"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center transition-all border border-purple-400/20"
                >
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </motion.button>
            </div>
        </div>
    );
}
