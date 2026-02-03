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
    if (!matrix) return null;

    const getHeatColor = (val: number) => {
        if (val === 0) return 'bg-slate-900/50 text-slate-600 border-slate-800';
        if (val < 20) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (val < 40) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (val < 60) return 'bg-blue-500/30 text-blue-200 border-blue-500/40';
        if (val < 80) return 'bg-blue-500/50 text-white border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
        return 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    };

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attribution Heatmap</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Initiative vs Model Family concentration</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1">
                    <thead>
                        <tr>
                            <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Initiative</th>
                            {matrix.families.map(f => (
                                <th key={f} className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center min-w-[100px]">{f}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.initiatives.map(init => (
                            <tr key={init}>
                                <td className="p-2 text-xs font-bold text-slate-400 uppercase tracking-tight">{init}</td>
                                {matrix.families.map(family => {
                                    // Note: In page.tsx we used familyInitiativeStats which is [family][init]
                                    // But here we might need [init][family] or vice versa.
                                    // Let's check how it was calculated in page.tsx.
                                    // familyInitiativeStats[family][init]
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
