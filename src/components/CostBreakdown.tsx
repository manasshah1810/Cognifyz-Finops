import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Building2, Users, Info } from 'lucide-react';

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
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl shadow-2xl">
                    <p className="font-bold text-slate-100">{payload[0].payload.name}</p>
                    <p className="text-blue-400 font-bold">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const renderChart = (data: BreakdownItem[], title: string, Icon: any, color: string, description: string) => (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 glow-blue flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cost Allocation Breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group/info">
                        <Info size={14} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-56 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[9px] text-slate-300 leading-relaxed font-normal normal-case tracking-normal">
                            <p className="font-bold text-blue-400 mb-1">Chart Information</p>
                            {description}
                        </div>
                    </div>
                    <div className={`p-2 bg-${color}-500/10 rounded-lg border border-${color}-500/20`}>
                        <Icon className={`text-${color}-400`} size={16} />
                    </div>
                </div>
            </div>
            <div className="flex h-[280px]">
                <div className="flex items-center -mr-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest -rotate-90 whitespace-nowrap">Category</span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} width={100} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#64748b'} className="hover:fill-blue-400 transition-colors" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-1">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Cost ($)</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderChart(verticalData, "Cost by Vertical", Layers, "blue", "Breakdown of total ML costs categorized by business verticals like Credit Card, Personal Loans, and Insurance.")}
            {renderChart(departmentData, "Cost by Department", Building2, "emerald", "Distribution of costs across various departments, helping identify which business units are driving consumption.")}
            {renderChart(teamData, "Cost by Team", Users, "purple", "Granular view of cost allocation at the team level, showing dedicated vs shared resource usage.")}
        </div>
    );
}
