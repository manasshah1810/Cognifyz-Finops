'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OwnershipDonutProps {
    data: {
        dedicated: number;
        shared: number;
        unassigned: number;
    };
}

export const OwnershipDonut: React.FC<OwnershipDonutProps> = ({ data }) => {
    const chartData = [
        { name: 'Dedicated', value: data.dedicated, color: '#38bdf8' },
        { name: 'Shared', value: data.shared, color: '#818cf8' },
        { name: 'Unassigned', value: data.unassigned, color: '#334155' },
    ];

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl h-[400px] hover:border-blue-500/30 transition-all">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Model Ownership Mix</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Distribution of model reuse patterns</p>
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
                                className="drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ fontSize: '11px', fontWeight: '500', color: '#fff' }}
                    />

                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
