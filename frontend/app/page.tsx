"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TelematicsChart from '@/components/TelematicsChart';
import AlertPanel from '@/components/AlertPanel';
import MultimodalChatbot from '@/components/MultimodalChatbot';
import FeedbackModal from '@/components/FeedbackModal';
import { Activity, Thermometer, Disc, Zap, ArrowRight, Gauge, Cpu } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface TelematicsData {
    brake_wear: number;
    tyre_pressure_variance: number;
    engine_temp: number;
    vibration_level: number;
    mileage: number;
}

interface PredictionResult {
    analysis: {
        failure_probability: number;
        telematics: TelematicsData;
    };
    diagnosis: {
        suc_score: number;
        severity_band: 'Critical' | 'High' | 'Medium' | 'Low';
    };
    engagement: {
        message: string;
        action_required: boolean;
    };
}

const containerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Home() {
    const [data, setData] = useState<TelematicsData | null>(null);
    const [history, setHistory] = useState<{ [key: string]: number[] }>({
        brake: [],
        temp: [],
        vib: []
    });
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://127.0.0.1:8000/ws/telematics');

        socket.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            setData(newData);

            setHistory(prev => ({
                brake: [...prev.brake, newData.brake_wear].slice(-20),
                temp: [...prev.temp, newData.engine_temp].slice(-20),
                vib: [...prev.vib, newData.vibration_level].slice(-20)
            }));
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    const handlePredict = async () => {
        if (!data) return;
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/predict-failure', data);
            setPrediction(response.data);
        } catch (error) {
            console.error("Prediction failed", error);
        } finally {
            setLoading(false);
        }
    };

    const [showFeedback, setShowFeedback] = useState(false);

    // Show feedback modal occasionally after prediction for demo
    useEffect(() => {
        if (prediction) {
            // Auto schedule if Critical
            if (prediction.diagnosis.severity_band === 'Critical') {
                const autoBook = async () => {
                    if (confirm("CRITICAL RISK DETECTED: Engine Failure Probability > 85%. \n\nInitiating Emergency Booking Protocol?\n\nClick OK to Book Immediate Service.")) {
                        try {
                            await axios.post('http://127.0.0.1:8000/schedule/book', {
                                preferred_time: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour later
                                service_center: 'Downtown OEM (Emergency)', // This field might be ignored by current simplified backend but keeping for completeness
                                technician: 'Lead Specialist',
                                service_type: 'CRITICAL: ' + prediction.engagement.message,
                                vehicle_id: "veh_001",
                                customer_id: "user_123"
                            });
                            alert("Emergency Appointment Confirmed for Today.");
                        } catch (e) {
                            console.error(e);
                        }
                    }
                };
                setTimeout(autoBook, 1000);
            } else {
                const timer = setTimeout(() => setShowFeedback(true), 15000);
                return () => clearTimeout(timer);
            }
        }
    }, [prediction]);

    return (
        <DashboardLayout>
            <motion.div
                className="grid grid-cols-12 gap-8 max-w-7xl mx-auto"
                variants={containerVars}
                initial="hidden"
                animate="show"
            >
                {/* Hero / Header Section if needed, but we have dashboard layout */}

                {/* Real-time Stats */}
                <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div variants={itemVars} className="col-span-1 md:col-span-2 mb-2">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            Fleet Status Overview
                        </h2>
                        <p className="text-slate-400">Real-time telematics data stream detected.</p>
                    </motion.div>

                    <StatCard
                        title="Brake System"
                        value={data?.brake_wear.toFixed(1) + '%'}
                        icon={Disc}
                        color="text-orange-400"
                        delay={0.1}
                        chart={<TelematicsChart data={history.brake} labels={history.brake.map((_, i) => i.toString())} label="Wear" color="rgb(251, 146, 60)" />}
                    />
                    <StatCard
                        title="Engine Thermal"
                        value={data?.engine_temp.toFixed(1) + '°C'}
                        icon={Thermometer}
                        color="text-red-400"
                        delay={0.2}
                        chart={<TelematicsChart data={history.temp} labels={history.temp.map((_, i) => i.toString())} label="Temp" color="rgb(248, 113, 113)" />}
                    />
                    <StatCard
                        title="Chassis Vibration"
                        value={data?.vibration_level.toFixed(2) + ' G'}
                        icon={Activity}
                        color="text-blue-400"
                        delay={0.3}
                        chart={<TelematicsChart data={history.vib} labels={history.vib.map((_, i) => i.toString())} label="Vib" color="rgb(96, 165, 250)" />}
                    />
                    <StatCard
                        title="Total Mileage"
                        value={data?.mileage.toFixed(0) + ' km'}
                        icon={Zap}
                        color="text-yellow-400"
                        delay={0.4}
                        chart={<div className="flex items-end justify-between h-full pb-2 px-1">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500">Efficiency</span>
                                <span className="text-lg font-mono text-green-400">98%</span>
                            </div>
                            <Gauge className="text-slate-700/50" size={48} />
                        </div>}
                    />
                </div>

                {/* Action Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <motion.div
                        variants={itemVars}
                        className="glass-panel rounded-2xl p-8 sticky top-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-200">AI Diagnostics</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Predictive Engine v2.0</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Our Master Agent analyzes 50+ data points in real-time to predict component life and suggest maintenance actions.
                            </p>

                            <button
                                onClick={handlePredict}
                                disabled={loading}
                                className="w-full relative group overflow-hidden py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <div className="relative flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <span className="animate-spin">⟳</span>
                                            <span>Analyzing Fleet Data...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Run AI Prediction</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        <AnimatePresence>
                            {prediction && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <AlertPanel
                                        severity={prediction.diagnosis.severity_band}
                                        score={prediction.diagnosis.suc_score}
                                        message={prediction.engagement.message}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

            </motion.div>

            <MultimodalChatbot />
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </DashboardLayout>
    );
}

function StatCard({ title, value, icon: Icon, color, chart, delay }: any) {
    return (
        <motion.div
            variants={itemVars}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-card rounded-2xl p-6 flex flex-col h-56 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <h4 className="text-3xl font-bold text-slate-100 tracking-tight">{value || '--'}</h4>
                </div>
                <div className={cn("p-2.5 rounded-xl bg-slate-950/50 backdrop-blur-sm border border-slate-800/50", color)}>
                    <Icon size={22} />
                </div>
            </div>

            <div className="flex-1 mt-4 relative">
                {chart && (
                    <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                        {chart}
                    </div>
                )}
            </div>

            {/* Decorative gradient blob */}
            <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none", color.replace('text-', 'bg-'))} />
        </motion.div>
    );
}
