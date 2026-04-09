'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface AttributionOverTimeProps {
    chartData: any[];
    initiatives: string[];
}

export const AttributionOverTime: React.FC<AttributionOverTimeProps> = ({ chartData, initiatives }) => {
    const { theme } = useTheme();
    // Safeguards for chartData and initiatives
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0 || !initiatives || !Array.isArray(initiatives) || initiatives.length === 0) return null;
    const colors = ['#0ea5e9', '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#d946ef', '#06b6d4', '#ec4899'];

    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm hover:border-[var(--primary)]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Attribution Over Time</h3>
                    <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">3-day interval trend analysis</p>
                </div>
                <div className="relative group/info">
                    <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                    <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--muted)] leading-relaxed font-normal normal-case tracking-normal">
                        <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                        This line chart tracks the percentage of cost attribution for various initiatives over a rolling 3-day interval, highlighting shifts in resource allocation.
                    </div>
                </div>
            </div>
            <div className="flex h-[350px]">
                <div className="flex items-center -mr-2">
                    <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest -rotate-90 whitespace-nowrap">Attribution (%)</span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
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
                                    stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val.toFixed(0)}%`}
                                    domain={['auto', 'auto']}
                                    width={40}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: '8px',
                                        color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                                    }}
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
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Timeline</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

