'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface OwnershipDonutProps {
    data: {
        dedicated: number;
        shared: number;
        unassigned: number;
    };
}

export const OwnershipDonut: React.FC<OwnershipDonutProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chartData = [
        { name: 'Dedicated', value: data.dedicated, color: isDark ? '#60a5fa' : '#0ea5e9' },
        { name: 'Shared', value: data.shared, color: isDark ? '#818cf8' : '#6366f1' },
        { name: 'Unassigned', value: data.unassigned, color: isDark ? '#1f2937' : '#e2e8f0' },
    ];

    const tooltipBg = isDark ? '#0d1117' : '#ffffff';
    const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
    const tooltipText = isDark ? '#f1f5f9' : '#0f172a';

    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm h-[400px] hover:border-[var(--primary)]/50 transition-all duration-300 group relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Model Ownership Mix</h3>
                    <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">Distribution of model reuse patterns</p>
                </div>
                <div className="relative group/info">
                    <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                    <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--foreground)] leading-relaxed font-normal normal-case tracking-normal">
                        <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                        This donut chart shows the distribution of model ownership patterns, categorized into Dedicated, Shared, and Unassigned resources.
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                        itemStyle={{ fontSize: '11px', fontWeight: '500', color: tooltipText }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

