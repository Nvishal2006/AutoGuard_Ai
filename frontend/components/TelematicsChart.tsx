"use client";
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TelematicsChartProps {
    data: number[];
    labels: string[];
    label: string;
    color: string;
}

export default function TelematicsChart({ data, labels, label, color }: TelematicsChartProps) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(51, 65, 85, 0.5)',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                display: false,
                grid: {
                    display: false,
                }
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(51, 65, 85, 0.3)',
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 10
                    }
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
            },
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
            }
        }
    };

    const chartData = {
        labels,
        datasets: [
            {
                label,
                data,
                borderColor: color,
                backgroundColor: color.replace('1)', '0.1)').replace('rgb', 'rgba'),
                fill: true,
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="h-full w-full">
            <Line options={options} data={chartData} />
        </div>
    );
}
