'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AttributionOverTimeProps {
    chartData: any[];
    initiatives: string[];
}

export const AttributionOverTime: React.FC<AttributionOverTimeProps> = ({ chartData, initiatives }) => {
    const colors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24', '#ef4444', '#06b6d4', '#ec4899'];

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl h-[450px] hover:border-blue-500/30 transition-all">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attribution Over Time</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">3-day interval trend analysis</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        height={40}
                        padding={{ left: 20, right: 20 }}
                        tickFormatter={(val) => {
                            const d = new Date(val);
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val.toFixed(0)}%`}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                        formatter={(val: number) => `${val.toFixed(2)}%`}
                    />

                    {initiatives.map((init, i) => (
                        <Line
                            key={init}
                            type="monotone"
                            dataKey={init}
                            stroke={colors[i % colors.length]}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            animationDuration={1000}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
