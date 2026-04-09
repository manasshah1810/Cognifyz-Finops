'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Building2, Users, Info } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface BreakdownItem {
    name: string;
    value: number;
}

interface CostBreakdownProps {
    verticalData: BreakdownItem[];
    departmentData: BreakdownItem[];
    teamData: BreakdownItem[];
}

export function CostBreakdown({ verticalData, departmentData, teamData }: CostBreakdownProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const tooltipBg = isDark ? '#0d1117' : '#ffffff';
            const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
            const tooltipText = isDark ? '#f1f5f9' : '#0f172a';
            return (
                <div className="p-3 rounded-xl shadow-xl" style={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}` }}>
                    <p className="font-bold" style={{ color: tooltipText }}>{payload[0].payload.name}</p>
                    <p className="font-bold" style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const renderChart = (data: BreakdownItem[], title: string, Icon: any, color: string, description: string) => {
        const iconBg = isDark ? `rgba(var(--primary-rgb), 0.1)` : `${color === 'blue' ? 'bg-blue-50' : color === 'emerald' ? 'bg-emerald-50' : 'bg-purple-50'}`;
        const iconColor = color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-purple-500';

        return (
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm flex flex-col hover:border-[var(--primary)]/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">{title}</h3>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Cost Allocation Breakdown</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative group/info">
                            <Info size={14} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                            <div className="absolute right-0 top-6 w-56 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[9px] text-[var(--foreground)] leading-relaxed font-normal normal-case tracking-normal">
                                <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                                {description}
                            </div>
                        </div>
                        <div className={`p-2 rounded-lg border border-transparent ${isDark ? 'bg-slate-800/50' : color === 'blue' ? 'bg-blue-50' : color === 'emerald' ? 'bg-emerald-50' : 'bg-purple-50'}`}>
                            <Icon className={isDark ? 'text-[var(--primary)]' : iconColor} size={16} />
                        </div>
                    </div>
                </div>
                <div className="flex h-[280px]">
                    <div className="flex items-center -mr-2">
                        <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest -rotate-90 whitespace-nowrap">Category</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 700 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#1f2937' : '#cbd5e1')} className="transition-colors" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-1">
                            <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">Cost ($)</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderChart(verticalData, "Cost by Vertical", Layers, "blue", "Breakdown of total ML costs categorized by business verticals like Credit Card, Personal Loans, and Insurance.")}
            {renderChart(departmentData, "Cost by Department", Building2, "emerald", "Distribution of costs across various departments, helping identify which business units are driving consumption.")}
            {renderChart(teamData, "Cost by Team", Users, "purple", "Granular view of cost allocation at the team level, showing dedicated vs shared resource usage.")}
        </div>
    );
}

