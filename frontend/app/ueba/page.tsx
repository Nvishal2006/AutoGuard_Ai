"use client";
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, Users, Lock, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UEBAPage() {
    const [agents, setAgents] = React.useState<any[]>([]);
    const [showAgents, setShowAgents] = React.useState(false);

    React.useEffect(() => {
        fetch('http://127.0.0.1:8000/ueba/agents')
            .then(res => res.json())
            .then(data => setAgents(data))
            .catch(err => console.error("Failed to fetch agents", err));
    }, []);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                        <Shield className="text-red-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Security & UEBA</h1>
                        <p className="text-slate-400">User Entity Behavior Analytics & Agent Safeguards</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-slate-800/50 transition-colors"
                        onClick={() => setShowAgents(true)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-300 font-medium">Active Agents</h3>
                            <Users className="text-blue-400" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-white">{agents.length || '-'}</p>
                        <p className="text-sm text-green-400 mt-2">All systems nominal</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-300 font-medium">Security Incidents</h3>
                            <AlertOctagon className="text-orange-400" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-white">0</p>
                        <p className="text-sm text-slate-500 mt-2">Last 24 hours</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-300 font-medium">Policy Violations</h3>
                            <Lock className="text-red-400" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-white">0</p>
                        <p className="text-sm text-green-400 mt-2">100% Compliance</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Security Logs</h2>
                    <div className="space-y-2">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="p-4 bg-slate-950/30 rounded-lg flex items-center justify-between border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-slate-300 font-mono text-sm">SYSTEM_CHECK</span>
                                </div>
                                <span className="text-slate-500 text-sm">Routine integrity verification passed</span>
                                <span className="text-slate-600 font-mono text-xs">10:0{i} AM</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agents Modal */}
                {showAgents && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAgents(false)}>
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Active Agents & Roles</h2>
                                <button onClick={() => setShowAgents(false)} className="text-slate-400 hover:text-white">✕</button>
                            </div>
                            <div className="grid gap-4">
                                {agents.map((agent, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${agent.type === 'Core' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-200">{agent.name}</h3>
                                                <p className="text-xs text-slate-500">{agent.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded">{agent.type}</span>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${agent.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {agent.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
