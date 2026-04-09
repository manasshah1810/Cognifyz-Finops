'use client';

import React from 'react';
import { DollarSign, PieChart, AlertCircle, Cpu } from 'lucide-react';
import { DashboardStats } from '@/types';

interface SummaryCardsProps {
    stats: DashboardStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const cards = [
        {
            title: 'Total Cloud Spend',
            value: formatCurrency(stats.totalSpend),
            icon: <DollarSign className="text-blue-500" size={20} />,
            trend: 'Total unblended cost',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            title: 'Attributed Spend %',
            value: `${stats.attributedSpendPct.toFixed(1)}%`,
            icon: <PieChart className="text-emerald-500" size={20} />,
            trend: 'Successfully mapped',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            title: 'Unallocated Spend',
            value: formatCurrency(stats.unallocatedSpend),
            icon: <AlertCircle className={stats.unallocatedSpend > stats.totalSpend * 0.05 ? 'text-rose-500' : 'text-[var(--muted)]'} size={20} />,
            trend: 'Missing attribution',
            bgColor: stats.unallocatedSpend > stats.totalSpend * 0.05 ? 'bg-rose-500/10' : 'bg-[var(--sidebar-hover)]',
            borderColor: stats.unallocatedSpend > stats.totalSpend * 0.05 ? 'border-rose-500/20' : 'border-[var(--card-border)]'
        },
        {
            title: 'Active Models',
            value: stats.activeModelsCount.toString(),
            icon: <Cpu className="text-indigo-500" size={20} />,
            trend: 'Models with spend > $0',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 hover:border-[var(--primary)]/30 transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 ${card.bgColor} rounded-lg border ${card.borderColor}`}>
                            {card.icon}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{card.title}</p>
                        <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1 tracking-tight">{card.value}</h3>
                        <p className="text-[10px] text-[var(--muted)] mt-2 uppercase tracking-wide group-hover:text-[var(--foreground)] transition-colors">{card.trend}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

