import React from 'react';
import { BookOpen, Info, Database, PieChart, Bot } from 'lucide-react';

export function Glossary() {
    const sections = [
        {
            title: "Features",
            icon: <Info size={18} className="text-blue-400" />,
            items: [
                { term: "Executive Summary", desc: "High-level overview of AI/ML costs, highlighting ownership concentration, total dedicated/shared models, and cost trends across your entire infrastructure." },
                { term: "Initiative Attribution", desc: "Detailed breakdown of how model costs are allocated across different business initiatives. Shows the mapping of unblended cloud costs to specific internal projects." },
                { term: "Model Portfolio", desc: "Inventory of all active AI/ML models in your environment, showing their utilization, family categorization (e.g., Llama, GPT), and ownership status." },
                { term: "Vertical Usage", desc: "Analysis of model consumption aligned to specific business verticals like Credit Card, Personal Loans, or Insurance." },
                { term: "Unblended Cost", desc: "The raw cost of the cloud resource usage before any discounts or allocations are applied." },
                { term: "Attributed Spend", desc: "The portion of the unblended cost that has been successfully mapped to a specific initiative." },
                { term: "Ownership Concentration", desc: "Percentage of models where a single initiative is responsible for 50% or more of the model's usage/cost." },
                { term: "Shared Models", desc: "Models utilized by two or more distinct initiatives with costs split based on attribution percentages." }
            ]
        },
        {
            title: "Data Schema",
            icon: <Database size={18} className="text-emerald-400" />,
            items: [
                { term: "Cloud Billing (billing.csv)", desc: "Contains three primary columns: UsageStartDate (date of usage), ResourceID (unique identifier for the model, e.g., GPT-4), and UnblendedCost (direct monetary cost)." },
                { term: "Attribution Map (map.csv)", desc: "Defines how costs are allocated. Columns include: ModelName (maps to ResourceID), Initiative (target project), ModelFamily (e.g., LLM), AttributionPct (percentage share), and VerticalSplitPct (JSON split for business verticals)." },
                { term: "Resource Linkage", desc: "The system joins these two files using ResourceID and ModelName to create a unified view of cost and ownership." },
                { term: "Vertical JSON Structure", desc: "The VerticalSplitPct column handles complex distributions using a JSON format like {'CC': 40, 'PL': 30, 'Ins': 30}." }
            ]
        },
        {
            title: "Calculations",
            icon: <PieChart size={18} className="text-purple-400" />,
            items: [
                { term: "Attributed Model Cost", desc: "Formula: model_cost = UnblendedCost * (AttributionPct / 100). This determines how much of a resource's price belongs to a specific project." },
                { term: "Vertical Allocation", desc: "Formula: vertical_cost = attributed_model_cost * (VerticalPercent / 100). This splits initiative costs into Credit Card, Personal Loans, and Insurance categories." },
                { term: "Shared Models %", desc: "Formula: (Models with >1 owner / Total unique models) * 100. Measures the collaborative nature of the model infrastructure." },
                { term: "Ownership Concentration", desc: "Calculated by identifying models where any single initiative has an attribution percentage ≥ 50%." }
            ]
        },
        {
            title: "AI & Model Infrastructure",
            icon: <Bot size={18} className="text-orange-400" />,
            items: [
                { term: "Core Models", desc: "The system primarily tracks Large Language Models (LLMs) including GPT-4-Turbo (OpenAI), Claude-3-Opus (Anthropic), and Llama-3-70B (Meta/Open-Source)." },
                { term: "API Integration", desc: "Resource usage is tracked via API calls to various providers. The cost data reflects token consumption and hosting fees for these models." },
                { term: "Model Families", desc: "Models are grouped into families to analyze cost efficiency at a higher abstraction layer (e.g., comparing Open-Source Llama families vs. Proprietary GPT families)." },
                { term: "FinOps Assistant", desc: "Built with tailored RAG (Retrieval Augmented Generation) to answer natural language queries about this specific dashboard's metrics." }
            ]
        }
    ];

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <BookOpen className="text-blue-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">System Glossary</h2>
                    <p className="text-sm text-slate-500 mt-1">Detailed documentation for features, data structures, and AI models.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest flex items-center gap-3">
                            <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                {section.icon}
                            </div>
                            {section.title}
                        </h3>
                        <div className="space-y-4">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="bg-[#1e293b]/30 p-5 rounded-2xl border border-slate-800/50 hover:border-slate-700/80 transition-all group">
                                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.15em] mb-2">{item.term}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
