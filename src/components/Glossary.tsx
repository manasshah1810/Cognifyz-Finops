import React from 'react';
import { BookOpen, Info } from 'lucide-react';

export function Glossary() {
    const sections = [
        {
            title: "Navigation Tabs",
            items: [
                { term: "Executive Summary", desc: "High-level overview of AI/ML costs, highlighting ownership concentration, total dedicated/shared models, and cost trends across your entire infrastructure." },
                { term: "Initiative Attribution", desc: "Detailed breakdown of how model costs are allocated across different business initiatives. Shows the mapping of unblended cloud costs to specific internal projects." },
                { term: "Model Portfolio", desc: "Inventory of all active AI/ML models in your environment, showing their utilization, family categorization (e.g., Llama, GPT), and ownership status." },
                { term: "Vertical Usage", desc: "Analysis of model consumption aligned to specific business verticals like Credit Card, Personal Loans, or Insurance." }
            ]
        },
        {
            title: "Key Metrics & Calculations",
            items: [
                { term: "Unblended Cost", desc: "The raw cost of the cloud resource usage before any discounts or allocations are applied. Directly sourced from cloud billing data." },
                { term: "Attributed Spend", desc: "The portion of the unblended cost that has been successfully mapped to a specific initiative or business unit based on the attribution map." },
                { term: "Ownership Concentration", desc: "The percentage of models where a single initiative is responsible for 50% or more of the model's usage/cost. Indicates dependency." },
                { term: "Shared Models", desc: "Models that are utilized by two or more distinct initiatives. Their cost is split based on the attribution percentages." },
                { term: "Dedicated Models", desc: "Models that are utilized exclusively (100%) by a single initiative." },
                { term: "Vertical Split", desc: "Percentage allocation of an initiative's cost to different business verticals. Calculated as: (Model Cost × Initiative Attribution %) × Vertical Allocation %." }
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
                    <p className="text-sm text-slate-500 mt-1">Definitions of key terms, tabs, and calculation methodologies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <Info size={18} className="text-blue-400" />
                            {section.title}
                        </h3>
                        <div className="space-y-4">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="bg-[#1e293b]/50 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <h4 className="text-sm font-bold text-blue-300 uppercase tracking-wide mb-2">{item.term}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed text-balance">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
