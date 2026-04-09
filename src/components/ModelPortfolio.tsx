'use client';

import React, { useState } from 'react';
import { Shield, Share2, Users, AlertTriangle, Info, X, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useTheme } from './ThemeProvider';

interface ModelPortfolioProps {
    data: {
        modelStats: any[];
        familyMixData: any[];
        kpis: {
            dedicated: number;
            primary: number;
            balanced: number;
            dedicatedPct: number;
            primaryPct: number;
            balancedPct: number;
        };
        initiatives: string[];
    };
}

export const ModelPortfolio: React.FC<ModelPortfolioProps> = ({ data }) => {
    const { theme } = useTheme();
    const [activeSubTab, setActiveSubTab] = useState('profiles');
    const [selectedModel, setSelectedModel] = useState<any | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<{ problem: string[], solution: string[] } | null>(null);
    const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
    const [riskSearchQuery, setRiskSearchQuery] = useState('');
    const [riskFamilyFilter, setRiskFamilyFilter] = useState('All');
    const [riskTypeFilter, setRiskTypeFilter] = useState('All');
    const [riskCurrentPage, setRiskCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchRecommendation = async (model: any) => {
        setIsRecommendationLoading(true);
        setAiRecommendation(null);

        const prompt = `
            Analyze this "High-Risk" Machine Learning Model and provide specific recommendations.
            
            Model Context:
            - Name: ${model.name}
            - Family: ${model.family}
            - Owner Count: ${model.ownerCount} (Higher count means more shared risk)
            - Max Attribution: ${model.maxAttr.toFixed(1)}% (Lower max attribution means no single initiative takes responsibility)
            - Owners: ${JSON.stringify(model.owners)}

            Output MUST be strict valid JSON with EXACTLY these two keys:
            {
                "problem": ["Specific technical/financial risk 1", "Specific technical/financial risk 2"],
                "solution": ["Actionable mitigation step 1", "Actionable mitigation step 2"]
            }

            Focus on: Infrastructure efficiency, budget accountability, and ownership consolidation.
            Do NOT include any preamble or markdown formatting. Output ONLY the JSON object.
        `;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "claude-sonnet-4-6",
                    "system": "You are a professional Finops ML Infrastructure Architect. You always output strict JSON with 'problem' and 'solution' arrays.",
                    "messages": [
                        { "role": "user", "content": prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData?.error || `Status ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "";

            // Robust JSON extraction
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const cleanContent = jsonMatch ? jsonMatch[0] : content;

            const parsed = JSON.parse(cleanContent);
            if (!parsed.problem || !parsed.solution) {
                throw new Error("Invalid response structure from Claude");
            }
            setAiRecommendation(parsed);
        } catch (error: any) {
            console.error("AI Recommendation Error:", error);
            setAiRecommendation({
                problem: [
                    `Claude Error: ${error.message}`,
                    "The integration might be facing connectivity issues or invalid API configuration."
                ],
                solution: [
                    "Verify the VITE_ANTHROPIC_API_KEY in the .env file.",
                    "Check the browser console for more detailed error logs.",
                    "Ensure the backend /api/chat route is properly configured."
                ]
            });
        }

        setIsRecommendationLoading(false);
    };

    const handleModelClick = (model: any) => {
        setSelectedModel(model);
        fetchRecommendation(model);
    };

    if (!data || !data.modelStats || !data.familyMixData || !data.initiatives) return null;

    const { modelStats, familyMixData, kpis, initiatives } = data;
    const colors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

    const highRiskModels = modelStats.filter(m =>
        m.ownerCount >= 3 &&
        m.maxAttr <= 40 &&
        (m.name.toLowerCase().includes(riskSearchQuery.toLowerCase()) || m.family.toLowerCase().includes(riskSearchQuery.toLowerCase())) &&
        (riskFamilyFilter === 'All' || m.family === riskFamilyFilter) &&
        (riskTypeFilter === 'All' || m.type === riskTypeFilter)
    );

    const riskTotalPages = Math.ceil(highRiskModels.length / itemsPerPage);
    const paginatedHighRiskModels = highRiskModels.slice(
        (riskCurrentPage - 1) * itemsPerPage,
        riskCurrentPage * itemsPerPage
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kpi-card border border-[var(--primary)]/10 bg-[var(--primary-glow)]">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Dedicated</span>
                        <div className="p-2 bg-[var(--primary)]/10 rounded-lg"><Shield size={16} className="text-[var(--primary)]" /></div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{kpis.dedicated}</div>
                    <div className="mt-2 text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">{kpis.dedicatedPct.toFixed(1)}% of portfolio</div>
                </div>

                <div className="kpi-card border border-purple-500/10 bg-purple-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Shared-Primary</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Share2 size={16} className="text-purple-500" /></div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{kpis.primary}</div>
                    <div className="mt-2 text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">{kpis.primaryPct.toFixed(1)}% of portfolio</div>
                </div>

                <div className="kpi-card border border-emerald-500/10 bg-emerald-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Shared-Balanced</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><Users size={16} className="text-emerald-500" /></div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{kpis.balanced}</div>
                    <div className="mt-2 text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">{kpis.balancedPct.toFixed(1)}% of portfolio</div>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-[var(--sidebar-hover)] w-fit rounded-xl border border-[var(--card-border)]">
                {[
                    { id: 'profiles', label: 'Model Profiles' },
                    { id: 'mix', label: 'Family Attribution Mix' },
                    { id: 'risk', label: 'High-Risk Models' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeSubTab === tab.id ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeSubTab === 'profiles' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {modelStats.slice(0, 12).map((model, i) => (
                        <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 shadow-sm space-y-4 hover:border-[var(--primary)]/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xs font-bold text-[var(--foreground)] truncate max-w-[180px]">{model.name}</h4>
                                    <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">{model.family}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${model.type === 'Dedicated' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : model.type === 'Shared-Primary' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                    {model.type}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">Owners</p>
                                    <p className="text-sm font-bold text-[var(--foreground)]">{model.ownerCount}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">Max Attribution</p>
                                    <p className="text-sm font-bold text-[var(--foreground)]">{model.maxAttr.toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="w-full h-1.5 bg-[var(--sidebar-hover)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" style={{ width: `${model.maxAttr}%` }} />
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    {Object.entries(model.owners).map(([owner, pct]) => (
                                        <span key={owner} className="text-[9px] font-medium text-[var(--muted)]">
                                            {owner}: <span className="text-[var(--foreground)] font-bold">{(pct as number).toFixed(0)}%</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSubTab === 'mix' && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Model Family Attribution Mix</h3>
                        <div className="relative group/info">
                            <Info size={16} className="text-[var(--muted)] hover:text-[var(--primary)] cursor-help transition-colors" />
                            <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 text-[10px] text-[var(--muted)] leading-relaxed font-normal normal-case tracking-normal">
                                <p className="font-bold text-[var(--primary)] mb-1">Chart Information</p>
                                Visualizes the composition of cost attribution for different model families across several business initiatives.
                            </div>
                        </div>
                    </div>
                    <div className="flex h-[400px]">
                        <div className="flex items-center -mr-2">
                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest -rotate-90 whitespace-nowrap">Attribution Value</span>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={familyMixData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} vertical={false} />
                                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} width={40} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                                border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                                borderRadius: '8px',
                                                color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                                            }}
                                            itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                                        />
                                        {initiatives.map((init, i) => (
                                            <Bar key={init} dataKey={init} stackId="a" fill={colors[i % colors.length]} radius={i === initiatives.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}>
                                                <LabelList
                                                    dataKey={init}
                                                    position="center"
                                                    content={(props: any) => {
                                                        const { x, y, width, height, value } = props;
                                                        if (!value || value < 10) return null; // Hide small labels to prevent clutter
                                                        return (
                                                            <text
                                                                x={x + width / 2}
                                                                y={y + height / 2}
                                                                fill="#fff"
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                                style={{ fontSize: '8px', fontWeight: 'bold' }}
                                                            >
                                                                {value.toFixed(0)}%
                                                            </text>
                                                        );
                                                    }}
                                                />
                                            </Bar>
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-1">
                                <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Model Family</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'risk' && (
                <div className="space-y-6">
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--card-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-amber-500" size={20} />
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">High-Risk Models</h3>
                                    <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">Models with ≥3 initiatives and no single owner &gt;40%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative group min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search models or families..."
                                        value={riskSearchQuery}
                                        onChange={(e) => {
                                            setRiskSearchQuery(e.target.value);
                                            setRiskCurrentPage(1);
                                        }}
                                        className="w-full bg-[var(--sidebar-hover)] border border-[var(--card-border)] rounded-lg py-2 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]/30 focus:ring-1 focus:ring-[var(--primary)]/10 transition-all"
                                    />
                                </div>
                                <select
                                    value={riskFamilyFilter}
                                    onChange={(e) => {
                                        setRiskFamilyFilter(e.target.value);
                                        setRiskCurrentPage(1);
                                    }}
                                    className="bg-[var(--sidebar-hover)] border border-[var(--card-border)] rounded-lg py-2 px-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/30 cursor-pointer"
                                >
                                    <option value="All">All Families</option>
                                    {Array.from(new Set(modelStats.map(m => m.family))).map(f => (
                                        <option key={String(f)} value={String(f)}>{String(f)}</option>
                                    ))}
                                </select>
                                <select
                                    value={riskTypeFilter}
                                    onChange={(e) => {
                                        setRiskTypeFilter(e.target.value);
                                        setRiskCurrentPage(1);
                                    }}
                                    className="bg-[var(--sidebar-hover)] border border-[var(--card-border)] rounded-lg py-2 px-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/30 cursor-pointer"
                                >
                                    <option value="All">All Types</option>
                                    <option value="Dedicated">Dedicated</option>
                                    <option value="Shared-Primary">Shared-Primary</option>
                                    <option value="Shared-Balanced">Shared-Balanced</option>
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--sidebar-hover)]/30">
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Model Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Family</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-center">Owners</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-center">Max Attribution</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Initiatives</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--card-border)]">
                                    {paginatedHighRiskModels.map((model, i) => (
                                        <tr key={i} className="hover:bg-[var(--sidebar-hover)]/20 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-[var(--foreground)]">{model.name}</td>
                                            <td className="px-6 py-4 text-xs text-[var(--muted)]">{model.family}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-md border border-amber-500/20">
                                                    {model.ownerCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs font-bold text-[var(--foreground)]">{model.maxAttr.toFixed(0)}%</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(model.owners).map(([owner, pct]) => (
                                                        <span key={owner} className="text-[9px] font-medium text-[var(--muted)] bg-[var(--sidebar-hover)] px-1.5 py-0.5 rounded">
                                                            {owner}: {(pct as number).toFixed(0)}%
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleModelClick(model)}
                                                    className="px-3 py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[var(--primary)]/20 transition-all hover:scale-105"
                                                >
                                                    Show Recommendations
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-[var(--card-border)] flex justify-between items-center bg-[var(--sidebar-hover)]/30">
                            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                                Showing {Math.min(highRiskModels.length, (riskCurrentPage - 1) * itemsPerPage + 1)}-{Math.min(highRiskModels.length, riskCurrentPage * itemsPerPage)} of {highRiskModels.length} models
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRiskCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={riskCurrentPage === 1}
                                    className={`p-1.5 rounded-lg border transition-all ${riskCurrentPage === 1 ? 'border-[var(--card-border)] text-[var(--muted)]' : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5'}`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex items-center px-3 text-[10px] font-bold text-[var(--foreground)]">
                                    {riskCurrentPage} / {riskTotalPages || 1}
                                </div>
                                <button
                                    onClick={() => setRiskCurrentPage(prev => Math.min(riskTotalPages, prev + 1))}
                                    disabled={riskCurrentPage === riskTotalPages || riskTotalPages === 0}
                                    className={`p-1.5 rounded-lg border transition-all ${riskCurrentPage === riskTotalPages || riskTotalPages === 0 ? 'border-[var(--card-border)] text-[var(--muted)]' : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--sidebar-hover)] text-[var(--foreground)] rounded-xl p-6 space-y-4 border border-[var(--primary)]/20">
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-[var(--primary)]" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Engineering Actions Recommended</h4>
                        </div>
                        <ul className="text-[10px] text-[var(--muted)] space-y-2 list-disc pl-4 uppercase tracking-wider leading-relaxed">
                            <li>Review these models for consolidation opportunities</li>
                            <li>Consider platform-level ownership for widely-shared models</li>
                            <li>Evaluate if splitting into initiative-specific variants makes sense</li>
                        </ul>
                    </div>
                </div>
            )}

            {selectedModel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--card)] border border-[var(--card-border)] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--sidebar-hover)]/30">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Risk Analysis</h3>
                                <p className="text-xs text-[var(--muted)] font-mono mt-1">{selectedModel.name}</p>
                            </div>
                            <button onClick={() => setSelectedModel(null)} className="p-2 hover:bg-[var(--sidebar-hover)] rounded-full text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {isRecommendationLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest animate-pulse">Generating AI Recommendations...</p>
                                </div>
                            ) : aiRecommendation ? (
                                <>
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-amber-500 font-bold uppercase text-xs tracking-wider">
                                            <AlertTriangle size={16} /> Problem Identification
                                        </h4>
                                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
                                            <p className="text-[var(--foreground)] text-sm leading-relaxed mb-3">
                                                Analysis of {selectedModel.name} risk factors:
                                            </p>
                                            <ul className="space-y-2">
                                                {aiRecommendation.problem.map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-wider">
                                            <CheckCircle size={16} /> Recommended Solution
                                        </h4>
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
                                            <p className="text-[var(--foreground)] text-sm leading-relaxed mb-3">
                                                Suggested engineering actions:
                                            </p>
                                            <ul className="space-y-2">
                                                {aiRecommendation.solution.map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-[var(--muted)] text-sm">
                                    Could not retrieve recommendations.
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--sidebar-hover)]/30 flex justify-end">
                            <button
                                onClick={() => setSelectedModel(null)}
                                className="px-5 py-2.5 bg-[var(--card)] hover:bg-[var(--sidebar-hover)] text-[var(--foreground)] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm border border-[var(--card-border)]"
                            >
                                Close Recommendations
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

