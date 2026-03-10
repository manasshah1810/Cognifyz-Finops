'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CreditCard, Landmark, ShieldCheck, Info, TrendingUp, LayoutGrid } from 'lucide-react';

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
    if (!data) return null;

    const { verticalTotals, initiativeDistribution, driftData, matrixData } = data;

    const getHeatColor = (val: number) => {
        if (val === 0) return 'bg-slate-900/50 text-slate-500 border-slate-800';
        if (val < 20) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (val < 40) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (val < 60) return 'bg-blue-500/30 text-blue-200 border-blue-500/40';
        if (val < 80) return 'bg-blue-500/50 text-white border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
        return 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    };

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kpi-card glow-blue">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Credit Card</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg"><CreditCard size={16} className="text-blue-400" /></div>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{verticalTotals.ccPct.toFixed(1)}%</div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">of total ML usage</div>
                </div>
                <div className="kpi-card glow-emerald">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personal Loans</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><Landmark size={16} className="text-emerald-400" /></div>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{verticalTotals.plPct.toFixed(1)}%</div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">of total ML usage</div>
                </div>
                <div className="kpi-card glow-purple">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Insurance</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg"><ShieldCheck size={16} className="text-purple-400" /></div>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{verticalTotals.insPct.toFixed(1)}%</div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">of total ML usage</div>
                </div>
            </div>

            {/* Vertical Split Distribution Chart */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Vertical Split Distribution by Initiative</h3>
                    </div>
                    <div className="relative group/info">
                        <Info size={16} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-slate-300 leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-blue-400 mb-1">Chart Information</p>
                            Shows how each initiative's costs are distributed across different business verticals, weighted by their respective attribution percentages.
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wide">Weighted vertical usage based on attribution percentage</p>
                <div className="flex h-[340px]">
                    <div className="flex items-center -mr-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest -rotate-90 whitespace-nowrap">Usage Cost ($)</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={initiativeDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} width={50} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                        itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                                        formatter={(val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                    />
                                    <Bar dataKey="CC" name="Credit Card" stackId="a" fill="#0ea5e9" />
                                    <Bar dataKey="PL" name="Personal Loans" stackId="a" fill="#10b981" />
                                    <Bar dataKey="Ins" name="Insurance" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Initiative</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vertical Drift Over Time */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Vertical Drift Over Time</h3>
                    </div>
                    <div className="relative group/info">
                        <Info size={16} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-slate-300 leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-blue-400 mb-1">Chart Information</p>
                            Tracks the changes in the proportion of total ML usage across verticals over the specified analysis period.
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wide">Track proportion changes in vertical usage across the analysis period</p>
                <div className="flex h-[290px]">
                    <div className="flex items-center -mr-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest -rotate-90 whitespace-nowrap">Usage %</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={driftData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(0)}%`} domain={[0, 100]} width={40} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                        itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                                        formatter={(val: number) => `${val.toFixed(1)}%`}
                                    />
                                    <Line type="monotone" dataKey="Credit Card" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Personal Loans" stroke="#10b981" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Insurance" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Initiative–Vertical Alignment Matrix */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={16} className="text-blue-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Initiative–Vertical Alignment Matrix</h3>
                    </div>
                    <div className="relative group/info">
                        <Info size={16} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-slate-300 leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-blue-400 mb-1">Chart Information</p>
                            Displays the percentage distribution of vertical usage by initiative in a heat-map style matrix format.
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-wide">Percentage distribution of vertical usage by initiative</p>
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-1">
                        <thead>
                            <tr>
                                <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Initiative</th>
                                <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Credit Card</th>
                                <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Personal Loans</th>
                                <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Insurance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrixData.map((row, i) => (
                                <tr key={i}>
                                    <td className="p-2 text-xs font-bold text-slate-400 uppercase tracking-tight">{row.initiative}</td>
                                    <td className="p-0"><div className={`h-10 flex items-center justify-center rounded text-[10px] font-bold border ${getHeatColor(row.cc)}`}>{row.cc.toFixed(1)}%</div></td>
                                    <td className="p-0"><div className={`h-10 flex items-center justify-center rounded text-[10px] font-bold border ${getHeatColor(row.pl)}`}>{row.pl.toFixed(1)}%</div></td>
                                    <td className="p-0"><div className={`h-10 flex items-center justify-center rounded text-[10px] font-bold border ${getHeatColor(row.ins)}`}>{row.ins.toFixed(1)}%</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Finance Insights */}
            <div className="bg-slate-900 text-white rounded-xl p-8 shadow-2xl border border-blue-500/20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Info size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Finance Insights</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Key observations for cost alignment review</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vertical Concentration</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Credit Card dominates ML usage at <span className="text-blue-400 font-bold">{verticalTotals.ccPct.toFixed(1)}%</span>.
                            Consider reviewing if this aligns with revenue contribution and business priority for the current fiscal year.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Initiative Alignment Check</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Review initiatives with highly skewed vertical splits. Consider whether dedicated vertical teams should own specific models vs. a shared platform approach for better resource utilization.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Cross-Vertical Efficiency</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Models serving multiple verticals through shared initiatives may benefit from platform-level ownership to optimize cost allocation and reduce redundant engineering efforts.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Chargeback Considerations</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Use vertical split percentages in conjunction with initiative attribution for granular cost allocation to business lines, ensuring equitable chargeback models.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
