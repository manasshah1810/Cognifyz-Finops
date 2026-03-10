'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

interface AttributionOverTimeProps {
    chartData: any[];
    initiatives: string[];
}

export const AttributionOverTime: React.FC<AttributionOverTimeProps> = ({ chartData, initiatives }) => {
    const colors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24', '#ef4444', '#06b6d4', '#ec4899'];

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attribution Over Time</h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">3-day interval trend analysis</p>
                </div>
                <div className="relative group/info">
                    <Info size={16} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                    <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-slate-300 leading-relaxed">
                        <p className="font-bold text-blue-400 mb-1">Chart Information</p>
                        This line chart tracks the percentage of cost attribution for various initiatives over a rolling 3-day interval, highlighting shifts in resource allocation.
                    </div>
                </div>
            </div>
            <div className="flex h-[350px]">
                <div className="flex items-center -mr-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest -rotate-90 whitespace-nowrap">Attribution (%)</span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
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
                                    width={40}
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
                    <div className="text-center mt-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Timeline</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
