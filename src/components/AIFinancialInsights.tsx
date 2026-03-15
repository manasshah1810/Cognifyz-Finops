'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, RefreshCw, AlertCircle, TrendingUp, Target, Zap } from 'lucide-react';

interface AIFinancialInsightsProps {
    contextData: any;
}

interface Insight {
    title: string;
    description: string;
    type: 'efficiency' | 'growth' | 'risk' | 'optimization';
}

export const AIFinancialInsights: React.FC<AIFinancialInsightsProps> = ({ contextData }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateInsights = async () => {
        if (!contextData || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            const simplifiedContext = {
                stats: contextData.stats,
                verticals: contextData.aggregations?.verticalUsageData?.verticalTotals,
                topDepartments: contextData.aggregations?.costBreakdownData?.departmentData?.slice(0, 3)
            };

            const prompt = `
                You are a Senior FinOps Strategy Consultant. Analyze the following ML Attribution data and provide 4 high-impact AI-driven financial insights.
                
                Data:
                ${JSON.stringify(simplifiedContext, null, 2)}

                Output MUST be a valid JSON array of objects with this EXACT structure:
                [
                  {
                    "title": "Short catchy title",
                    "description": "1-2 sentences of professional analysis and recommendation.",
                    "type": "one of: efficiency, growth, risk, optimization"
                  }
                ]
                
                Focus on:
                1. Cost concentration in specific verticals.
                2. Balance between dedicated and shared models.
                3. Efficiency of attribution (high vs low unallocated spend).
                4. Strategic departmental spend patterns.

                Provide ONLY the JSON array. No preamble.
            `;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "X-OpenRouter-Title": "Cognifyz FinOps Dashboard"
                },
                body: JSON.stringify({
                    "model": "stepfun/step-3.5-flash:free",
                    "messages": [
                        { "role": "system", "content": "You are a FinOps expert who provides data-driven financial insights in JSON format." },
                        { "role": "user", "content": prompt }
                    ]
                })
            });

            if (!response.ok) throw new Error("Failed to fetch AI insights");

            const result = await response.json();
            const content = result.choices?.[0]?.message?.content || "[]";

            // Extract JSON if model adds markdown
            const jsonStr = content.includes("[") ? content.substring(content.indexOf("["), content.lastIndexOf("]") + 1) : content;
            const parsed = JSON.parse(jsonStr);

            if (Array.isArray(parsed) && parsed.length > 0) {
                setInsights(parsed.slice(0, 4));
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err: any) {
            console.error("Insight generation error:", err);
            setError("Could not generate dynamic insights. Please check your API configuration.");
            // Fallback to placeholders if AI fails
            setInsights([
                { title: "Vertical Concentration", description: "Review if the current cost concentration in dominant verticals aligns with revenue targets.", type: "risk" },
                { title: "Portfolio Balance", description: "The mix of dedicated vs shared models suggests opportunities for infrastructure consolidation.", type: "optimization" },
                { title: "Attribution Efficiency", description: "Automated attribution levels are stable, but manual mappings for 'Unknown' resources should be prioritized.", type: "efficiency" },
                { title: "Spend Alignment", description: "Departmental spend across Growth and Engineering shows typical scaling patterns for this fiscal period.", type: "growth" }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generateInsights();
    }, [contextData.stats?.totalSpend, contextData.stats?.totalModels, contextData.startDate, contextData.endDate]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'efficiency': return <Zap className="text-amber-400" size={18} />;
            case 'growth': return <TrendingUp className="text-emerald-400" size={18} />;
            case 'risk': return <AlertCircle className="text-rose-400" size={18} />;
            case 'optimization': return <Target className="text-blue-400" size={18} />;
            default: return <Brain className="text-blue-400" size={18} />;
        }
    };

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                        <Sparkles className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-[0.2em]">AI Finance Insights</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            Real-time strategic analysis powered by OpenRouter
                        </p>
                    </div>
                </div>

                <button
                    onClick={generateInsights}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all hover:text-white disabled:opacity-50 group/btn"
                >
                    <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                    {isLoading ? 'Analyzing...' : 'Refresh Insights'}
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="text-rose-400 flex-shrink-0" size={18} />
                    <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wide">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading && insights.length === 0 ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse space-y-4">
                            <div className="h-4 w-32 bg-slate-800 rounded" />
                            <div className="h-20 w-full bg-slate-800/50 rounded-2xl" />
                        </div>
                    ))
                ) : (
                    insights.map((insight, i) => (
                        <div key={i} className="relative p-6 bg-slate-900/40 border border-slate-800/50 rounded-3xl hover:border-blue-500/30 transition-all hover:bg-slate-900/60 group/card">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.15em]">{insight.title}</h4>
                                <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 group-hover/card:border-blue-500/30 transition-all">
                                    {getIcon(insight.type)}
                                </div>
                            </div>
                            <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                                {insight.description}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <Brain size={12} /> Model: Step-3.5-Flash
                </div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    Last Updated: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
