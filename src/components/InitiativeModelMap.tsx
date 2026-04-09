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
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden hover:border-[var(--primary)]/30 transition-all">
            <div className="p-6 border-b border-[var(--card-border)] space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Initiative → Model Map</h3>
                        <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">Detailed attribution logic by resource</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Filter results..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9 pr-4 py-2 bg-[var(--sidebar-hover)] border border-[var(--card-border)] rounded-lg text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]/30 focus:ring-1 focus:ring-[var(--primary)]/30 transition-all w-64"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--sidebar-hover)]/30">
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Model Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Family</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Initiative</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider text-right">Attribution %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                        {paginatedData.map((row, i) => (
                            <tr key={i} className="hover:bg-[var(--sidebar-hover)]/20 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-[var(--foreground)]">{row.ModelName}</td>
                                <td className="px-6 py-4 text-xs text-[var(--muted)]">{row.ModelFamily}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold rounded-md border border-[var(--primary)]/20">
                                        {row.Initiative}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-[var(--foreground)]">
                                    {typeof row.AttributionPct === 'number' ? row.AttributionPct.toFixed(2) : row.AttributionPct}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-[var(--card-border)] flex items-center justify-between bg-[var(--sidebar-hover)]/30">
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">
                    Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-[var(--card-border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-[var(--foreground)] px-4">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-[var(--card-border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] disabled:opacity-30 transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

