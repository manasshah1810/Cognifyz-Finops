'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

interface CostTrendChartProps {
    chartData: any[];
    initiatives: string[];
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({ chartData, initiatives }) => {
    const colors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24'];

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cost Trend by Initiative</h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Daily unblended cost attribution</p>
                </div>
                <div className="relative group/info">
                    <Info size={16} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                    <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-slate-300 leading-relaxed">
                        <p className="font-bold text-blue-400 mb-1">Chart Information</p>
                        This chart visualizes the daily unblended cost attribution across multiple initiatives, showing how costs trend over time for each department.
                    </div>
                </div>
            </div>
            <div className="flex h-[300px]">
                <div className="flex items-center -mr-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest -rotate-90 whitespace-nowrap">Unblended Cost ($)</span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    {initiatives.map((init, i) => (
                                        <linearGradient key={`grad-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="displayName" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} width={50} />
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
                    <div className="text-center mt-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Timeline</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
