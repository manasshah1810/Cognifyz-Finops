import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Building2, Users } from 'lucide-react';

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

    const renderChart = (data: BreakdownItem[], title: string, Icon: any, color: string) => (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 glow-blue h-96 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cost Allocation Breakdown</p>
                </div>
                <div className={`p-2 bg-${color}-500/10 rounded-lg border border-${color}-500/20`}>
                    <Icon className={`text-${color}-400`} size={16} />
                </div>
            </div>
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} width={120} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#64748b'} className="hover:fill-blue-400 transition-colors" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderChart(verticalData, "Cost by Vertical", Layers, "blue")}
            {renderChart(departmentData, "Cost by Department", Building2, "emerald")}
            {renderChart(teamData, "Cost by Team", Users, "purple")}
        </div>
    );
}
