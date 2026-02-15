import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertPanelProps {
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    score: number;
    message: string;
}

export default function AlertPanel({ severity, score, message }: AlertPanelProps) {
    const styles = {
        Critical: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/50',
            text: 'text-red-400',
            icon: AlertOctagon
        },
        High: {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/50',
            text: 'text-orange-400',
            icon: AlertTriangle
        },
        Medium: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/50',
            text: 'text-yellow-400',
            icon: Info
        },
        Low: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/50',
            text: 'text-green-400',
            icon: CheckCircle
        }
    };

    const style = styles[severity] || styles.Low;
    const Icon = style.icon;

    return (
        <div className={cn("rounded-xl border p-6 flex items-start gap-4 transition-all duration-300", style.bg, style.border)}>
            <div className={cn("p-3 rounded-lg bg-slate-950/30", style.text)}>
                <Icon size={32} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className={cn("text-lg font-bold", style.text)}>{severity} Risk Detected</h3>
                    <span className={cn("text-sm font-mono px-2 py-1 rounded bg-slate-950/30", style.text)}>
                        SUC: {(score || 0).toFixed(2)}
                    </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{message}</p>
            </div>
        </div>
    );
}
