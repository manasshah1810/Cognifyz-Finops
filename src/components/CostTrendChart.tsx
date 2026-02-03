'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostTrendChartProps {
    chartData: any[];
    initiatives: string[];
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({ chartData, initiatives }) => {
    const colors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24'];

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl h-[400px] hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cost Trend by Initiative</h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Daily unblended cost attribution</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                    <defs>
                        {initiatives.map((init, i) => (
                            <linearGradient key={`grad-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="displayName" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} height={40} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}
                    />

                    {initiatives.map((init, i) => (
                        <Area
                            key={init}
                            type="monotone"
                            dataKey={init}
                            stackId="1"
                            stroke={colors[i % colors.length]}
                            fillOpacity={1}
                            fill={`url(#color-${i})`}
                            strokeWidth={2}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
