'use client';

import React, { useState } from 'react';
import { Shield, Share2, Users, AlertTriangle, Info, X, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const [activeSubTab, setActiveSubTab] = useState('profiles');
    const [selectedModel, setSelectedModel] = useState<any | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<{ problem: string[], solution: string[] } | null>(null);
    const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
    const [riskSearchQuery, setRiskSearchQuery] = useState('');
    const [riskCurrentPage, setRiskCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchRecommendation = async (model: any) => {
        setIsRecommendationLoading(true);
        setAiRecommendation(null);

        const models = [
            "sourceful/riverflow-v2-pro",
            "arcee-ai/trinity-large-preview:free",
            "allenai/molmo-2-8b:free",
            "bytedance-seed/seedream-4.5",
            "tngtech/tng-r1t-chimera:free"
        ];

        const prompt = `
            Analyze this "High-Risk" Machine Learning Model and provide specific recommendations.
            
            Model Context:
            - Name: ${model.name}
            - Family: ${model.family}
            - Owner Count: ${model.ownerCount} (Threshold is < 3 for normal)
            - Max Attribution: ${model.maxAttr}% (Threshold is > 40% for normal)
            - Owners: ${JSON.stringify(model.owners)}

            Output must be valid JSON with ONLY these two keys:
            {
                "problem": ["point 1", "point 2"],
                "solution": ["point 1", "point 2"]
            }

            The "problem" section should explain why it is high risk based on the data.
            The "solution" section should provide actionable steps to resolve the risk.
            Keep it professional, concise, and engineering-focused. Do NOT include markdown formatting.
        `;

        let success = false;

        for (const modelId of models) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://cogniify-finops.vercel.app/",
                        "X-Title": "Analytics Dashboard"
                    },
                    body: JSON.stringify({
                        "model": modelId,
                        "messages": [
                            { "role": "system", "content": "You are an expert ML Infrastructure Architect. Output strict JSON only." },
                            { "role": "user", "content": prompt }
                        ]
                    })
                });

                if (!response.ok) {
                    console.warn(`Model ${modelId} failed with status: ${response.status}`);
                    continue;
                }

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content || "";

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                const cleanContent = jsonMatch ? jsonMatch[0] : content;

                try {
                    const parsed = JSON.parse(cleanContent);
                    if (!parsed.problem || !parsed.solution) {
                        throw new Error("Invalid structure");
                    }
                    setAiRecommendation(parsed);
                    success = true;
                    break;
                } catch (e) {
                    console.warn(`Model ${modelId} returned invalid JSON. Trying next...`);
                    continue;
                }
            } catch (error) {
                console.warn(`Model ${modelId} error:`, error);
                continue;
            }
        }

        if (!success) {
            setAiRecommendation({
                problem: ["All AI models failed to respond.", "Service capability is currently limited."],
                solution: ["Review manual controls.", "Try again in a few minutes."]
            });
        }

        setIsRecommendationLoading(false);
    };

    const handleModelClick = (model: any) => {
        setSelectedModel(model);
        fetchRecommendation(model);
    };

    if (!data) return null;

    const { modelStats, familyMixData, kpis, initiatives } = data;
    const colors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

    const highRiskModels = modelStats.filter(m =>
        m.ownerCount >= 3 &&
        m.maxAttr <= 40 &&
        (m.name.toLowerCase().includes(riskSearchQuery.toLowerCase()) ||
            m.family.toLowerCase().includes(riskSearchQuery.toLowerCase()))
    );

    const riskTotalPages = Math.ceil(highRiskModels.length / itemsPerPage);
    const paginatedHighRiskModels = highRiskModels.slice(
        (riskCurrentPage - 1) * itemsPerPage,
        riskCurrentPage * itemsPerPage
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kpi-card glow-blue">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dedicated</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Shield size={16} className="text-blue-400" /></div>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{kpis.dedicated}</div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">{kpis.dedicatedPct.toFixed(1)}% of portfolio</div>
                </div>

                <div className="kpi-card glow-purple">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shared-Primary</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Share2 size={16} className="text-purple-400" /></div>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{kpis.primary}</div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">{kpis.primaryPct.toFixed(1)}% of portfolio</div>
                </div>

                <div className="kpi-card glow-emerald">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shared-Balanced</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><Users size={16} className="text-emerald-400" /></div>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{kpis.balanced}</div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">{kpis.balancedPct.toFixed(1)}% of portfolio</div>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-slate-900/50 w-fit rounded-xl border border-slate-800">
                {[
                    { id: 'profiles', label: 'Model Profiles' },
                    { id: 'mix', label: 'Family Attribution Mix' },
                    { id: 'risk', label: 'High-Risk Models' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeSubTab === tab.id ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeSubTab === 'profiles' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {modelStats.slice(0, 12).map((model, i) => (
                        <div key={i} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 hover:border-blue-500/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{model.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{model.family}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${model.type === 'Dedicated' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : model.type === 'Shared-Primary' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {model.type}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Owners</p>
                                    <p className="text-sm font-bold text-white">{model.ownerCount}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Max Attribution</p>
                                    <p className="text-sm font-bold text-white">{model.maxAttr.toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${model.maxAttr}%` }} />
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    {Object.entries(model.owners).map(([owner, pct]) => (
                                        <span key={owner} className="text-[9px] font-medium text-slate-400">
                                            {owner}: <span className="text-white font-bold">{(pct as number).toFixed(0)}%</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSubTab === 'mix' && (
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl h-[500px]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">ModelFamily Attribution Mix</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={familyMixData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ fontSize: '11px', fontWeight: '500' }}
                            />
                            {initiatives.map((init, i) => (
                                <Bar key={init} dataKey={init} stackId="a" fill={colors[i % colors.length]} radius={i === initiatives.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeSubTab === 'risk' && (
                <div className="space-y-6">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-amber-500" size={20} />
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">High-Risk Models</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Models with ≥3 initiatives and no single owner &gt;40%</p>
                                </div>
                            </div>
                            <div className="relative group max-w-xs w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search models or families..."
                                    value={riskSearchQuery}
                                    onChange={(e) => {
                                        setRiskSearchQuery(e.target.value);
                                        setRiskCurrentPage(1);
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Family</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Owners</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Max Attribution</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initiatives</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {paginatedHighRiskModels.map((model, i) => (
                                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-white">{model.name}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{model.family}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/20">
                                                    {model.ownerCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs font-bold text-white">{model.maxAttr.toFixed(0)}%</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(model.owners).map(([owner, pct]) => (
                                                        <span key={owner} className="text-[9px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                                            {owner}: {(pct as number).toFixed(0)}%
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleModelClick(model)}
                                                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-500/20 transition-all hover:scale-105"
                                                >
                                                    Show Recommendations
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/30">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Showing {Math.min(highRiskModels.length, (riskCurrentPage - 1) * itemsPerPage + 1)}-{Math.min(highRiskModels.length, riskCurrentPage * itemsPerPage)} of {highRiskModels.length} models
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRiskCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={riskCurrentPage === 1}
                                    className={`p-1.5 rounded-lg border transition-all ${riskCurrentPage === 1 ? 'border-slate-800 text-slate-700' : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5'}`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex items-center px-3 text-[10px] font-bold text-white">
                                    {riskCurrentPage} / {riskTotalPages || 1}
                                </div>
                                <button
                                    onClick={() => setRiskCurrentPage(prev => Math.min(riskTotalPages, prev + 1))}
                                    disabled={riskCurrentPage === riskTotalPages || riskTotalPages === 0}
                                    className={`p-1.5 rounded-lg border transition-all ${riskCurrentPage === riskTotalPages || riskTotalPages === 0 ? 'border-slate-800 text-slate-700' : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4 border border-blue-500/20">
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-blue-400" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Engineering Actions Recommended</h4>
                        </div>
                        <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4 uppercase tracking-wider leading-relaxed">
                            <li>Review these models for consolidation opportunities</li>
                            <li>Consider platform-level ownership for widely-shared models</li>
                            <li>Evaluate if splitting into initiative-specific variants makes sense</li>
                        </ul>
                    </div>
                </div>
            )}

            {selectedModel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Risk Analysis</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">{selectedModel.name}</p>
                            </div>
                            <button onClick={() => setSelectedModel(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {isRecommendationLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating AI Recommendations...</p>
                                </div>
                            ) : aiRecommendation ? (
                                <>
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-amber-500 font-bold uppercase text-xs tracking-wider">
                                            <AlertTriangle size={16} /> Problem Identification
                                        </h4>
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                                            <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                                Analysis of {selectedModel.name} risk factors:
                                            </p>
                                            <ul className="space-y-2">
                                                {aiRecommendation.problem.map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
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
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                                            <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                                Suggested engineering actions:
                                            </p>
                                            <ul className="space-y-2">
                                                {aiRecommendation.solution.map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    Could not retrieve recommendations.
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                            <button
                                onClick={() => setSelectedModel(null)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg border border-slate-700"
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
