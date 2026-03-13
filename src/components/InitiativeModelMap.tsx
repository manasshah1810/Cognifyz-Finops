'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface InitiativeModelMapProps {
    tableData: any[];
    families: string[];
}

export const InitiativeModelMap: React.FC<InitiativeModelMapProps> = ({ tableData, families }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        if (!tableData) return [];
        const searchLower = searchTerm.toLowerCase();
        return tableData.filter(row => {
            const matchesSearch = !searchTerm ||
                (row.ModelName || '').toLowerCase().includes(searchLower) ||
                (row.Initiative || '').toLowerCase().includes(searchLower);
            return matchesSearch;
        });
    }, [tableData, searchTerm]);

    const paginatedData = useMemo(() => {
        return filteredData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
            <div className="p-6 border-b border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Initiative → Model Map</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Detailed attribution logic by resource</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                                type="text"
                                placeholder="Filter results..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition-all w-64"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Family</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initiative</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Attribution %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-white">{row.ModelName}</td>
                                <td className="px-6 py-4 text-xs text-slate-400">{row.ModelFamily}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/20">
                                        {row.Initiative}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-white">
                                    {typeof row.AttributionPct === 'number' ? row.AttributionPct.toFixed(2) : row.AttributionPct}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/30">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-slate-800 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-white px-4">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-slate-800 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
