"use client";
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Factory, TrendingUp, AlertTriangle, Box } from 'lucide-react';

export default function InsightsPage() {
    const [insights, setInsights] = React.useState<any>(null);

    React.useEffect(() => {
        fetch('http://127.0.0.1:8000/insights')
            .then(res => res.json())
            .then(data => setInsights(data))
            .catch(err => console.error("Failed to fetch insights", err));
    }, []);

    if (!insights) return (
        <DashboardLayout>
            <div className="flex h-screen items-center justify-center text-slate-500">Loading Insights...</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <Factory className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">OEM & Manufacturing Insights</h1>
                        <p className="text-slate-400">Real-time feedback loop to production lines</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-indigo-500">
                        <h3 className="text-slate-400 text-sm font-medium mb-1">Global Failures</h3>
                        <p className="text-2xl font-bold text-white">1,240</p>
                        <p className="text-xs text-indigo-400 mt-1">+{insights.cost_reduction}% vs last week</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500">
                        <h3 className="text-slate-400 text-sm font-medium mb-1">Uptime Gain</h3>
                        <p className="text-2xl font-bold text-white">{insights.uptime_improvement}%</p>
                        <p className="text-xs text-emerald-400 mt-1">Design iterations deployed</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500">
                        <h3 className="text-slate-400 text-sm font-medium mb-1">Recall Risk</h3>
                        <p className="text-2xl font-bold text-white">Low</p>
                        <p className="text-xs text-amber-400 mt-1">Monitoring brake systems</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-cyan-500">
                        <h3 className="text-slate-400 text-sm font-medium mb-1">Top Defect</h3>
                        <p className="text-2xl font-bold text-white">{insights.top_failures?.[0]?.component || 'Unknown'}</p>
                        <p className="text-xs text-cyan-400 mt-1">{insights.top_failures?.[0]?.count} Incidents</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">Defect Trends ({new Date().getFullYear()})</h2>
                        <div className="h-64 flex items-end gap-2 justify-between px-2">
                            {insights.defect_recurrence && insights.defect_recurrence.map((item: any, i: number) => {
                                const height = Math.min(100, item.count * 5); // scale nicely
                                return (
                                    <div key={i} className="w-full bg-indigo-500/20 rounded-t-lg relative group">
                                        <div style={{ height: `${height}%` }} className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg opacity-60 group-hover:opacity-100 transition-all cursor-pointer">
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                {item.month}: {item.count} Defects
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                            <span>{insights.defect_recurrence?.[0]?.month}</span>
                            <span>{insights.defect_recurrence?.[insights.defect_recurrence.length - 1]?.month}</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">CAPA Recommendations</h2>
                        <div className="space-y-3">
                            {insights.rca_recommendations && insights.rca_recommendations.map((rec: any, i: number) => (
                                <div key={i} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex gap-4">
                                    <AlertTriangle className="text-amber-400 shrink-0" />
                                    <div>
                                        <h4 className="text-slate-200 font-bold text-sm">{rec.issue}</h4>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">Root Cause: {rec.root_cause}</p>
                                        <p className="text-indigo-400 text-xs mt-1">Action: {rec.capa}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
