'use client';

import React, { useRef } from 'react';
import { FileText, Map as MapIcon, CheckCircle2, Circle } from 'lucide-react';
import Papa from 'papaparse';

interface UploadControlsProps {
    onUpload: (data: any[], type: 'bill' | 'map') => void;
    filesLoaded: {
        bill: boolean;
        map: boolean;
    };
}

export const UploadControls: React.FC<UploadControlsProps> = ({ onUpload, filesLoaded }) => {
    const billInputRef = useRef<HTMLInputElement>(null);
    const mapInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'bill' | 'map') => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    alert(`Error parsing ${type} file: ${results.errors[0].message}`);
                    return;
                }

                // Basic validation
                const headers = results.meta.fields || [];
                if (type === 'bill' && !headers.includes('UnblendedCost')) {
                    alert('Missing required header: UnblendedCost');
                    return;
                }
                if (type === 'map' && !headers.includes('ModelName')) {
                    alert('Missing required header: ModelName');
                    return;
                }

                onUpload(results.data, type);
            },
        });
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-[var(--card)]/90 backdrop-blur-xl shadow-2xl border border-[var(--card-border)] rounded-full px-5 py-2.5 flex items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] mr-1 tracking-widest">Data Sources</span>

                <div className="h-4 w-[1px] bg-[var(--card-border)] mx-1" />

                <button
                    onClick={() => billInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filesLoaded.bill
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm'
                        : 'text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] border border-transparent'
                        }`}
                >
                    <FileText size={14} />
                    <span>Billing CSV</span>
                    {filesLoaded.bill ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Circle size={4} className="fill-[var(--muted)]/30 text-[var(--muted)]/30" />}
                </button>

                <button
                    onClick={() => mapInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filesLoaded.map
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm'
                        : 'text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] border border-transparent'
                        }`}
                >
                    <MapIcon size={14} />
                    <span>Map CSV</span>
                    {filesLoaded.map ? <CheckCircle2 size={12} className="text-[var(--primary)]" /> : <Circle size={4} className="fill-[var(--muted)]/30 text-[var(--muted)]/30" />}
                </button>

                <input
                    type="file"
                    ref={billInputRef}
                    onChange={(e) => handleFileChange(e, 'bill')}
                    accept=".csv"
                    className="hidden"
                />
                <input
                    type="file"
                    ref={mapInputRef}
                    onChange={(e) => handleFileChange(e, 'map')}
                    accept=".csv"
                    className="hidden"
                />
            </div>
        </div>
    );
};

