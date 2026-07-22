import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

const AgentNode = ({ name, status, icon: Icon, color }: any) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm",
            status === 'active' ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' : ''
        )}
    >
        <div className={cn("p-3 rounded-full", color, status === 'active' ? 'animate-pulse' : '')}>
            <Icon size={24} className="text-white" />
        </div>
        <span className="text-xs font-mono text-slate-400">{name}</span>
        {status === 'active' && <span className="text-[10px] text-blue-400">PROCESSING</span>}
    </motion.div>
);

export default function AgentVisualizer({ activeAgents = [] }: { activeAgents: string[] }) {
    return (
        <div className="relative p-6 glass-panel rounded-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Cpu size={20} className="text-blue-400" />
                Agentic Workflow Engine
            </h3>

            <div className="flex justify-center items-center gap-8 relative">
                {/* Connecting Lines (Simplified) */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800" />

                <AgentNode name="Master" status="active" icon={Bot} color="bg-indigo-600" />
                <AgentNode name="Analysis" status={activeAgents.includes('analysis') ? 'active' : 'idle'} icon={Activity} color="bg-blue-600" />
                <AgentNode name="Diagnosis" status={activeAgents.includes('diagnosis') ? 'active' : 'idle'} icon={Activity} color="bg-cyan-600" />
                <AgentNode name="Security" status={activeAgents.includes('ueba') ? 'active' : 'idle'} icon={ShieldAlert} color="bg-red-600" />
            </div>
        </div>
    );
}
