"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, MessageSquare, Volume2, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function VoiceBot({ initialMessage }: { initialMessage?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [flowState, setFlowState] = useState<'initial' | 'booking_proposed' | 'asking_email' | 'completed'>('initial');

    useEffect(() => {
        if (initialMessage) {
            addMessage(initialMessage, 'bot');
            setIsOpen(true);
            setFlowState('initial');
        }
    }, [initialMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            text,
            sender,
            timestamp: new Date()
        }]);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        addMessage(input, 'user');
        const userInput = input.toLowerCase();
        setInput('');

        // Simulate bot response with simple state machine
        setTimeout(() => {
            if (flowState === 'initial') {
                if (userInput.includes('book')) {
                    addMessage("I can help with that. I've checked the schedule and tomorrow at 10 AM is available at the Downtown center. Shall I confirm this slot?", 'bot');
                    setFlowState('booking_proposed');
                } else {
                    addMessage("I understand. I can help you book a service or provide more details on the analysis.", 'bot');
                }
            } else if (flowState === 'booking_proposed') {
                if (userInput.includes('yes') || userInput.includes('confirm') || userInput.includes('ok')) {
                    addMessage("Great! To send you the appointment details and calendar invite, please provide your email address.", 'bot');
                    setFlowState('asking_email');
                } else {
                    addMessage("No problem. Let me know if you'd like to check other dates.", 'bot');
                    setFlowState('initial');
                }
            } else if (flowState === 'asking_email') {
                if (userInput.includes('@')) {
                    addMessage(`Thanks! I've sent the confirmation to ${input}. You'll receive it shortly.`, 'bot');
                    setFlowState('completed');
                } else {
                    addMessage("That doesn't look like a valid email. Could you please check and type it again?", 'bot');
                }
            } else {
                addMessage("Is there anything else I can help you with?", 'bot');
                setFlowState('initial');
            }
        }, 800);
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
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Volume2 size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-100 block text-sm">AutoGuard Assistant</span>
                                        <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            ONLINE
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-slate-900/50">
                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id}
                                        className={cn(
                                            "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.sender === 'user'
                                                ? "bg-blue-600 text-white self-end ml-auto rounded-br-sm"
                                                : "bg-slate-800 text-slate-200 self-start rounded-bl-sm border border-slate-700/50"
                                        )}
                                    >
                                        {msg.text}
                                    </motion.div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 flex items-center gap-2">
                                <button
                                    className={cn("p-2.5 rounded-full transition-all active:scale-95", isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "hover:bg-slate-700/50 text-slate-400")}
                                    onClick={() => setIsListening(!isListening)}
                                >
                                    <Mic size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={flowState === 'asking_email' ? "Enter your email..." : "Type your message..."}
                                    className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="p-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-90 shadow-lg shadow-blue-600/20"
                                >
                                    <Send size={18} />
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
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all border border-blue-400/20"
                >
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </motion.button>
            </div>
        </div>
    );
}
