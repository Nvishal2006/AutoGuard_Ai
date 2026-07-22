"use client";
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackModal({ isOpen, onClose, appointmentId }: { isOpen: boolean, onClose: () => void, appointmentId?: number }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/feedback', {
                appointment_id: appointmentId || 0,
                rating,
                comments: comment,
                recurrence: false
            });
            onClose();
            alert("Thank you for your feedback!");
        } catch (e) {
            console.error(e);
            alert("Failed to submit feedback.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Rate Service</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-700'}`}
                                    >
                                        <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 h-24 placeholder:text-slate-600"
                                placeholder="Share your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
