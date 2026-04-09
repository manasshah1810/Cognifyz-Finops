'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface CostTrendChartProps {
    chartData: any[];
    initiatives: string[];
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({ chartData, initiatives }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = isDark
        ? ['#60a5fa', '#818cf8', '#f87171', '#34d399', '#fbbf24']
        : ['#0ea5e9', '#6366f1', '#f43f5e', '#10b981', '#f59e0b'];

    const gridColor = isDark ? '#1f2937' : '#f1f5f9';
    const axisColor = isDark ? '#64748b' : '#94a3b8';
    const tooltipBg = isDark ? '#0d1117' : '#ffffff';
    const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
    const tooltipText = isDark ? '#f1f5f9' : '#0f172a';

    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm hover:border-[var(--primary)]/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Cost Trend by Initiative</h3>
                    <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">Daily unblended cost attribution</p>
                </div>
                <div className="relative group/info">
                    <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                    <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--foreground)] leading-relaxed font-normal normal-case tracking-normal">
                        <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                        This chart visualizes the daily unblended cost attribution across multiple initiatives, showing how costs trend over time for each department.
                    </div>
                </div>
            </div>
            <div className="flex h-[300px]">
                <div className="flex items-center -mr-2">
                    <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest -rotate-90 whitespace-nowrap">Unblended Cost ($)</span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    {initiatives.map((init, i) => (
                                        <linearGradient key={`grad-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="displayName" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} width={50} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                                    labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px', fontWeight: 'bold' }}
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
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Timeline</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

