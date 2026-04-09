'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CreditCard, Landmark, ShieldCheck, Info, TrendingUp, LayoutGrid } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface VerticalUsageProps {
    data: {
        verticalTotals: {
            ccPct: number;
            plPct: number;
            insPct: number;
        };
        initiativeDistribution: any[];
        driftData: any[];
        matrixData: any[];
    };
}

export const VerticalUsage: React.FC<VerticalUsageProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!data) return null;

    const { verticalTotals, initiativeDistribution, driftData, matrixData } = data;

    const getHeatColor = (val: number) => {
        if (isDark) {
            if (val === 0) return 'bg-[#161b22] text-[#484f58] border-[#30363d]';
            if (val < 20) return 'bg-[#112d4e] text-[#60a5fa] border-[#1e40af]';
            if (val < 40) return 'bg-[#1e40af]/30 text-[#93c5fd] border-[#1e40af]/50';
            if (val < 60) return 'bg-[#2563eb]/40 text-[#bfdbfe] border-[#2563eb]/60';
            if (val < 80) return 'bg-[#3b82f6] text-white border-[#60a5fa] shadow-sm';
            return 'bg-[#2563eb] text-white border-[#3b82f6] shadow-md';
        }
        if (val === 0) return 'bg-slate-50 text-slate-400 border-slate-100';
        if (val < 20) return 'bg-blue-50 text-blue-600 border-blue-100';
        if (val < 40) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (val < 60) return 'bg-blue-200 text-blue-800 border-blue-300';
        if (val < 80) return 'bg-blue-500 text-white border-blue-400 shadow-sm';
        return 'bg-blue-600 text-white border-blue-500 shadow-md';
    };

    const gridColor = isDark ? '#1f2937' : '#f1f5f9';
    const axisColor = isDark ? '#64748b' : '#94a3b8';
    const tooltipBg = isDark ? '#0d1117' : '#ffffff';
    const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
    const tooltipText = isDark ? '#f1f5f9' : '#0f172a';

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kpi-card">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Credit Card</span>
                        <div className="p-2 bg-[var(--primary-glow)] rounded-lg"><CreditCard size={16} className="text-[var(--primary)]" /></div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{verticalTotals.ccPct.toFixed(1)}%</div>
                    <div className="mt-2 text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">of total ML usage</div>
                </div>
                <div className="kpi-card">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Personal Loans</span>
                        <div className="p-2 bg-[#10b9811a] rounded-lg"><Landmark size={16} className="text-emerald-500" /></div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{verticalTotals.plPct.toFixed(1)}%</div>
                    <div className="mt-2 text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">of total ML usage</div>
                </div>
                <div className="kpi-card">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Insurance</span>
                        <div className="p-2 bg-[#8b5cf61a] rounded-lg"><ShieldCheck size={16} className="text-purple-500" /></div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{verticalTotals.insPct.toFixed(1)}%</div>
                    <div className="mt-2 text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">of total ML usage</div>
                </div>
            </div>

            {/* Vertical Split Distribution Chart */}
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm hover:border-[var(--primary)]/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[var(--primary)]" />
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Vertical Split Distribution by Initiative</h3>
                    </div>
                    <div className="relative group/info">
                        <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--foreground)] leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                            Shows how each initiative's costs are distributed across different business verticals, weighted by their respective attribution percentages.
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-[var(--muted)] mb-4 uppercase tracking-wide">Weighted vertical usage based on attribution percentage</p>
                <div className="flex h-[340px]">
                    <div className="flex items-center -mr-2">
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest -rotate-90 whitespace-nowrap">Usage Cost ($)</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={initiativeDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} width={50} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                                        itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                                        formatter={(val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                    />
                                    <Bar dataKey="CC" name="Credit Card" stackId="a" fill={isDark ? '#60a5fa' : '#0ea5e9'} />
                                    <Bar dataKey="PL" name="Personal Loans" stackId="a" fill={isDark ? '#34d399' : '#10b981'} />
                                    <Bar dataKey="Ins" name="Insurance" stackId="a" fill={isDark ? '#a78bfa' : '#8b5cf6'} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-1">
                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Initiative</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vertical Drift Over Time */}
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm hover:border-[var(--primary)]/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[var(--primary)]" />
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Vertical Drift Over Time</h3>
                    </div>
                    <div className="relative group/info">
                        <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--foreground)] leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                            Tracks the changes in the proportion of total ML usage across verticals over the specified analysis period.
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-[var(--muted)] mb-4 uppercase tracking-wide">Track proportion changes in vertical usage across the analysis period</p>
                <div className="flex h-[290px]">
                    <div className="flex items-center -mr-2">
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest -rotate-90 whitespace-nowrap">Usage %</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={driftData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke={axisColor}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(0)}%`} domain={[0, 100]} width={40} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                                        itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                                        formatter={(val: number) => `${val.toFixed(1)}%`}
                                    />
                                    <Line type="monotone" dataKey="Credit Card" stroke={isDark ? '#60a5fa' : '#0ea5e9'} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Personal Loans" stroke={isDark ? '#34d399' : '#10b981'} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Insurance" stroke={isDark ? '#a78bfa' : '#8b5cf6'} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-1">
                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Date</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Initiative–Vertical Alignment Matrix */}
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm overflow-hidden hover:border-[var(--primary)]/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={16} className="text-[var(--primary)]" />
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Initiative–Vertical Alignment Matrix</h3>
                    </div>
                    <div className="relative group/info">
                        <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--foreground)] leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                            Displays the percentage distribution of vertical usage by initiative in a heat-map style matrix format.
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-[var(--muted)] mb-6 uppercase tracking-wide">Percentage distribution of vertical usage by initiative</p>
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-1">
                        <thead>
                            <tr>
                                <th className="p-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-left">Initiative</th>
                                <th className="p-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-center">Credit Card</th>
                                <th className="p-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-center">Personal Loans</th>
                                <th className="p-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-center">Insurance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrixData.map((row, i) => (
                                <tr key={i}>
                                    <td className="p-2 text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">{row.initiative}</td>
                                    <td className="p-0"><div className={`h-10 flex items-center justify-center rounded text-[10px] font-bold border transition-colors duration-500 ${getHeatColor(row.cc)}`}>{row.cc.toFixed(1)}%</div></td>
                                    <td className="p-0"><div className={`h-10 flex items-center justify-center rounded text-[10px] font-bold border transition-colors duration-500 ${getHeatColor(row.pl)}`}>{row.pl.toFixed(1)}%</div></td>
                                    <td className="p-0"><div className={`h-10 flex items-center justify-center rounded text-[10px] font-bold border transition-colors duration-500 ${getHeatColor(row.ins)}`}>{row.ins.toFixed(1)}%</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

