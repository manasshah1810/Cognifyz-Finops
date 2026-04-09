'use client';

import React from 'react';

interface AttributionHeatmapProps {
    matrix: {
        initiatives: string[];
        families: string[];
        data: Record<string, Record<string, { sum: number; count: number }>>;
    };
}

export const AttributionHeatmap: React.FC<AttributionHeatmapProps> = ({ matrix }) => {
    if (!matrix || !matrix.families || !matrix.initiatives) return null;

    const getHeatColor = (val: number) => {
        if (val === 0) return 'bg-[var(--sidebar-hover)] text-[var(--muted)] border-[var(--card-border)]';
        if (val < 20) return 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20';
        if (val < 40) return 'bg-[var(--primary)]/20 text-[var(--foreground)] border-[var(--primary)]/30';
        if (val < 60) return 'bg-[var(--primary)]/40 text-white border-[var(--primary)]/50';
        if (val < 80) return 'bg-[var(--primary)]/70 text-white border-[var(--primary)]/80 shadow-sm';
        return 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md';
    };

    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm overflow-hidden hover:border-[var(--primary)]/30 transition-all">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Attribution Heatmap</h3>
                <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">Initiative vs Model Family concentration</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1">
                    <thead>
                        <tr>
                            <th className="p-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-left">Initiative</th>
                            {matrix.families.map(f => (
                                <th key={f} className="p-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-center min-w-[100px]">{f}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.initiatives.map(init => (
                            <tr key={init}>
                                <td className="p-2 text-xs font-bold text-[var(--muted)] uppercase tracking-tight">{init}</td>
                                {matrix.families.map(family => {
                                    const stats = matrix.data[family]?.[init];
                                    const val = stats ? stats.sum / stats.count : 0;
                                    return (
                                        <td key={family} className="p-0">
                                            <div className={`h-12 flex items-center justify-center rounded text-[10px] font-bold border transition-all ${getHeatColor(val)}`}>
                                                {val > 0 ? `${val.toFixed(1)}%` : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

