'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ClipboardPaste, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';

interface UploadPageProps {
    onUploadComplete: (billData: any[], mapData: any[]) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUploadComplete }) => {
    const [billData, setBillData] = useState<any[] | null>(null);
    const [mapData, setMapData] = useState<any[] | null>(null);
    const [billFileName, setBillFileName] = useState<string | null>(null);
    const [mapFileName, setMapFileName] = useState<string | null>(null);

    const billFileRef = useRef<HTMLInputElement>(null);
    const mapFileRef = useRef<HTMLInputElement>(null);

    const sanitizeValue = (val: any) => {
        if (typeof val !== 'string') return val;
        // Prevent CSV Injection by prefixing common formula triggers with a single quote
        if (val.startsWith('=') || val.startsWith('+') || val.startsWith('-') || val.startsWith('@')) {
            return `'${val}`;
        }
        return val;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bill' | 'map') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state on new upload attempt
        if (type === 'bill') {
            setBillData(null);
            setBillFileName(null);
        } else {
            setMapData(null);
            setMapFileName(null);
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transform: (value) => sanitizeValue(value),
            complete: (results) => {
                if (results.errors.length > 0) {
                    alert(`Error parsing file: ${results.errors[0].message}`);
                    return;
                }

                const data = results.data as any[];

                // Validate Map Data specifically for VerticalSplitPct
                if (type === 'map' && data.length > 0) {
                    const firstRow = data[0];
                    if (firstRow.VerticalSplitPct) {
                        try {
                            const parsed = typeof firstRow.VerticalSplitPct === 'string'
                                ? JSON.parse(firstRow.VerticalSplitPct)
                                : firstRow.VerticalSplitPct;

                            const keys = Object.keys(parsed).map(k => k.toUpperCase());
                            if (!keys.includes('CC') || !keys.includes('PL') || !keys.includes('INS')) {
                                alert("CRITICAL ERROR: Attribution Map detected but 'VerticalSplitPct' is missing required keys: CC, PL, or Ins. Vertical charts will not display correctly.");
                                return;
                            }
                        } catch (e) {
                            alert("CRITICAL ERROR: 'VerticalSplitPct' column contains invalid JSON. Please check the specification at the bottom of the page.");
                            return;
                        }
                    }
                }

                if (type === 'bill') {
                    setBillData(data);
                    setBillFileName(file.name);
                } else {
                    setMapData(data);
                    setMapFileName(file.name);
                }
            },
            error: (error) => {
                alert(`Fatal parsing error: ${error.message}`);
                if (type === 'bill') {
                    setBillData(null);
                    setBillFileName(null);
                } else {
                    setMapData(null);
                    setMapFileName(null);
                }
            }
        });
    };


    const clearData = (type: 'bill' | 'map') => {
        if (type === 'bill') {
            setBillData(null);
            setBillFileName(null);
        } else {
            setMapData(null);
            setMapFileName(null);
        }
    };

    const isReady = billData && billData.length > 0 && mapData && mapData.length > 0;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tighter">
                    Initialize <span className="text-[var(--primary)]">Datasets</span>
                </h2>
                <p className="text-[var(--muted)] text-sm font-medium uppercase tracking-[0.2em]">
                    Upload your CSV data to begin financial attribution analysis
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Billing Data Card */}
                <div className={`p-8 bg-[var(--card)] border-2 rounded-[2.5rem] transition-all duration-500 shadow-sm ${billData ? 'border-emerald-500/30' : 'border-[var(--card-border)]'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${billData ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--primary-glow)] text-[var(--primary)]'}`}>
                            <FileText size={24} />
                        </div>
                        {billData && (
                            <button
                                onClick={() => clearData('bill')}
                                className="p-2 hover:bg-rose-500/10 text-[var(--muted)] hover:text-rose-500 transition-colors rounded-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Billing Data</h3>
                    <p className="text-xs text-[var(--muted)] mb-6 uppercase tracking-wider">Cloud usage and spend records</p>

                    {!billData ? (
                        <div className="space-y-6">
                            <button
                                onClick={() => billFileRef.current?.click()}
                                className="w-full py-10 border-2 border-dashed border-[var(--card-border)] hover:border-[var(--primary)] rounded-3xl flex flex-col items-center gap-3 group transition-all bg-[var(--card-hover)]/30"
                            >
                                <Upload className="text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:scale-110 transition-all" />
                                <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--primary)]">Choose CSV File</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="text-emerald-500" size={32} />
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)]">{billFileName}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{billData.length} Records Detected</p>
                            </div>
                        </div>
                    )}
                    <input type="file" ref={billFileRef} onChange={(e) => handleFileUpload(e, 'bill')} accept=".csv" className="hidden" />
                </div>

                {/* Attribution Map Card */}
                <div className={`p-8 bg-[var(--card)] border-2 rounded-[2.5rem] transition-all duration-500 shadow-sm ${mapData ? 'border-[var(--primary)]/30' : 'border-[var(--card-border)]'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${mapData ? 'bg-[var(--primary-glow)] text-[var(--primary)]' : 'bg-purple-500/10 text-purple-500'}`}>
                            <Upload size={24} />
                        </div>
                        {mapData && (
                            <button
                                onClick={() => clearData('map')}
                                className="p-2 hover:bg-rose-500/10 text-[var(--muted)] hover:text-rose-500 transition-colors rounded-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Attribution Map</h3>
                    <p className="text-xs text-[var(--muted)] mb-6 uppercase tracking-wider">Model-To-Initiative relationships</p>

                    {!mapData ? (
                        <div className="space-y-6">
                            <button
                                onClick={() => mapFileRef.current?.click()}
                                className="w-full py-10 border-2 border-dashed border-[var(--card-border)] hover:border-[var(--primary)] rounded-3xl flex flex-col items-center gap-3 group transition-all bg-[var(--card-hover)]/30"
                            >
                                <Upload className="text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:scale-110 transition-all" />
                                <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--primary)]">Choose CSV File</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[var(--primary-glow)] border border-[var(--primary)]/20 rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="text-[var(--primary)]" size={32} />
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)]">{mapFileName}</p>
                                <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">{mapData.length} Records Detected</p>
                            </div>
                        </div>
                    )}
                    <input type="file" ref={mapFileRef} onChange={(e) => handleFileUpload(e, 'map')} accept=".csv" className="hidden" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button
                    disabled={!isReady}
                    onClick={() => isReady && onUploadComplete(billData, mapData)}
                    className={`group flex items-center gap-3 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isReady
                        ? 'bg-[var(--primary)] hover:opacity-90 text-white shadow-[var(--primary)]/20 active:scale-95'
                        : 'bg-[var(--card-hover)] text-[var(--muted)] cursor-not-allowed'
                        }`}
                >
                    <span>Complete Submission</span>
                    <ArrowRight size={20} className={`transition-transform duration-300 ${isReady ? 'group-hover:translate-x-2' : ''}`} />
                </button>

                {!isReady && (
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Both datasets are required before submission</span>
                    </div>
                )}
            </div>

            {/* Dataset Schemas */}
            <div className="bg-[var(--card-hover)]/30 border border-[var(--card-border)] rounded-[2.5rem] p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1.5 bg-[var(--primary)] rounded-full" />
                        <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-wider">Critical Schema Requirements</h3>
                    </div>
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-500" />
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Strict formatting enforced</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Billing Schema */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-emerald-500">
                            <div className="p-2 bg-emerald-500/10 rounded-lg"><FileText size={20} /></div>
                            <span className="text-sm font-black uppercase tracking-[0.2em]">1. Modern Cloud Billing</span>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-px bg-[var(--card-border)] rounded-2xl overflow-hidden border border-[var(--card-border)]">
                                {[
                                    ['Column Name', 'Req. Type'],
                                    ['UsageStartDate', 'YYYY-MM-DD'],
                                    ['ResourceID', 'String (ID)'],
                                    ['UnblendedCost', 'Numeric']
                                ].map(([col, type], i) => (
                                    <React.Fragment key={i}>
                                        <div className={`p-4 text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-[var(--sidebar-hover)] text-[var(--muted)]' : 'bg-[var(--card)] text-[var(--foreground)]'}`}>{col}</div>
                                        <div className={`p-4 text-[10px] italic font-medium ${i === 0 ? 'bg-[var(--sidebar-hover)] text-[var(--muted)]' : 'bg-[var(--card)] text-[var(--muted)]/60'}`}>{type}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--muted)] font-bold px-2 italic uppercase">* ResourceID is the primary key used to join with the Attribution Map.</p>
                        </div>
                    </div>

                    {/* Map Schema */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[var(--primary)]">
                            <div className="p-2 bg-[var(--primary-glow)] rounded-lg"><Upload size={20} /></div>
                            <span className="text-sm font-black uppercase tracking-[0.2em]">2. Attribution Logic Map</span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-px bg-[var(--card-border)] rounded-2xl overflow-hidden border border-[var(--card-border)]">
                                {[
                                    ['Column Name', 'Req. Type'],
                                    ['timestamp', 'YYYY-MM-DD'],
                                    ['ModelName', 'Must match ResourceID'],
                                    ['Initiative', 'String Category'],
                                    ['ModelFamily', 'String Category'],
                                    ['AttributionPct', '0 to 100'],
                                    ['VerticalSplitPct', 'Strict JSON Object']
                                ].map(([col, type], i) => (
                                    <React.Fragment key={i}>
                                        <div className={`p-3.5 text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-[var(--sidebar-hover)] text-[var(--muted)]' : 'bg-[var(--card)] text-[var(--foreground)]'}`}>{col}</div>
                                        <div className={`p-3.5 text-[10px] italic font-medium ${i === 0 ? 'bg-[var(--sidebar-hover)] text-[var(--muted)]' : 'bg-[var(--card)] text-[var(--muted)]/60'}`}>{type}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Split Detail */}
                <div className="p-8 bg-[var(--primary-glow)] border border-[var(--primary)]/10 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-xl"><ClipboardPaste size={18} className="text-[var(--primary)]" /></div>
                        <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-[0.3em]">VerticalSplitPct Specification</h4>
                    </div>

                    <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                        This field <span className="text-[var(--foreground)] font-bold">MUST</span> be a valid JSON string containing exactly these three keys. If these keys are missing or misspelled, your vertical usage charts will remain at 0%.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { key: 'CC', label: 'Credit Card Split', color: 'text-[var(--primary)]' },
                            { key: 'PL', label: 'Personal Loans Split', color: 'text-emerald-500' },
                            { key: 'Ins', label: 'Insurance Split', color: 'text-purple-500' }
                        ].map((item, i) => (
                            <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                <span className="text-[10px] font-black text-[var(--muted)] uppercase">Key Name</span>
                                <span className={`text-sm font-black mono ${item.color}`}>{item.key}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Example Value:</p>
                        <code className="text-blue-300 text-xs font-mono">{"{\"CC\": 40, \"PL\": 30, \"Ins\": 30}"}</code>
                    </div>
                </div>
            </div>

            {/* Quick Help */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <div className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--card-border)] shadow-sm">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-3">Format Check</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">Ensure your Billing CSV includes the <span className="text-[var(--primary)]">UnblendedCost</span> and <span className="text-[var(--primary)]">UsageStartDate</span> columns.</p>
                </div>
                <div className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--card-border)] shadow-sm">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-3">Map Schema</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">The Attribution Map requires <span className="text-purple-500">ModelName</span> and <span className="text-purple-600">Initiative</span> to link costs correctly.</p>
                </div>
                <div className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--card-border)] shadow-sm">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-3">Privacy</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">Data processing occurs entirely in-browser. No files are uploaded to any external servers.</p>
                </div>
            </div>
        </div>
    );
};

