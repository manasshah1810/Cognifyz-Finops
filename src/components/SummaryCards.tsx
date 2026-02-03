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
            icon: <DollarSign className="text-blue-400" size={20} />,
            trend: 'Total unblended cost',
            glow: 'glow-blue'
        },
        {
            title: 'Attributed Spend %',
            value: `${stats.attributedSpendPct.toFixed(1)}%`,
            icon: <PieChart className="text-emerald-400" size={20} />,
            trend: 'Successfully mapped',
            glow: 'glow-emerald'
        },
        {
            title: 'Unallocated Spend',
            value: formatCurrency(stats.unallocatedSpend),
            icon: <AlertCircle className={stats.unallocatedSpend > stats.totalSpend * 0.05 ? 'text-red-400' : 'text-slate-400'} size={20} />,
            trend: 'Missing attribution',
            glow: stats.unallocatedSpend > stats.totalSpend * 0.05 ? 'glow-red' : ''
        },
        {
            title: 'Active Models',
            value: stats.activeModelsCount.toString(),
            icon: <Cpu className="text-indigo-400" size={20} />,
            trend: 'Models with spend > $0',
            glow: 'glow-purple'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <div key={i} className={`bg-[#0f172a] border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all shadow-2xl ${card.glow}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                            {card.icon}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
                        <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{card.value}</h3>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">{card.trend}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
