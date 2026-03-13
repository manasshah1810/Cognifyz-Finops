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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bill' | 'map') => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    alert(`Error parsing file: ${results.errors[0].message}`);
                    return;
                }
                if (type === 'bill') {
                    setBillData(results.data);
                    setBillFileName(file.name);
                } else {
                    setMapData(results.data);
                    setMapFileName(file.name);
                }
            },
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
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                    Initialize <span className="text-blue-400">Datasets</span>
                </h2>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">
                    Upload your CSV data to begin financial attribution analysis
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Billing Data Card */}
                <div className={`p-8 bg-[#0f172a]/50 backdrop-blur-xl border-2 rounded-[2.5rem] transition-all duration-500 ${billData ? 'border-emerald-500/30' : 'border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${billData ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            <FileText size={24} />
                        </div>
                        {billData && (
                            <button
                                onClick={() => clearData('bill')}
                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors rounded-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">Billing Data</h3>
                    <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Cloud usage and spend records</p>

                    {!billData ? (
                        <div className="space-y-6">
                            <button
                                onClick={() => billFileRef.current?.click()}
                                className="w-full py-10 border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-3xl flex flex-col items-center gap-3 group transition-all"
                            >
                                <Upload className="text-slate-600 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-300">Choose CSV File</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="text-emerald-500" size={32} />
                            <div>
                                <p className="text-sm font-bold text-white">{billFileName}</p>
                                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mt-1">{billData.length} Records Detected</p>
                            </div>
                        </div>
                    )}
                    <input type="file" ref={billFileRef} onChange={(e) => handleFileUpload(e, 'bill')} accept=".csv" className="hidden" />
                </div>

                {/* Attribution Map Card */}
                <div className={`p-8 bg-[#0f172a]/50 backdrop-blur-xl border-2 rounded-[2.5rem] transition-all duration-500 ${mapData ? 'border-blue-500/30' : 'border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${mapData ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                            <Upload size={24} />
                        </div>
                        {mapData && (
                            <button
                                onClick={() => clearData('map')}
                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors rounded-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">Attribution Map</h3>
                    <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Model-To-Initiative relationships</p>

                    {!mapData ? (
                        <div className="space-y-6">
                            <button
                                onClick={() => mapFileRef.current?.click()}
                                className="w-full py-10 border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-3xl flex flex-col items-center gap-3 group transition-all"
                            >
                                <Upload className="text-slate-600 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-300">Choose CSV File</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="text-blue-500" size={32} />
                            <div>
                                <p className="text-sm font-bold text-white">{mapFileName}</p>
                                <p className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest mt-1">{mapData.length} Records Detected</p>
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
                    className={`group flex items-center gap-3 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl ${isReady
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    <span>Complete Submission</span>
                    <ArrowRight size={20} className={`transition-transform duration-300 ${isReady ? 'group-hover:translate-x-2' : ''}`} />
                </button>

                {!isReady && (
                    <div className="flex items-center gap-2 text-slate-600">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Both datasets are required before submission</span>
                    </div>
                )}
            </div>

            {/* Dataset Schemas */}
            <div className="bg-[#0f172a]/30 backdrop-blur-md border border-slate-800/50 rounded-[2.5rem] p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1.5 bg-blue-500 rounded-full" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider">Critical Schema Requirements</h3>
                    </div>
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Strict formatting enforced</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Billing Schema */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-emerald-400">
                            <div className="p-2 bg-emerald-500/10 rounded-lg"><FileText size={20} /></div>
                            <span className="text-sm font-black uppercase tracking-[0.2em]">1. Modern Cloud Billing</span>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-px bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-800/50">
                                {[
                                    ['Column Name', 'Req. Type'],
                                    ['UsageStartDate', 'YYYY-MM-DD'],
                                    ['ResourceID', 'String (ID)'],
                                    ['UnblendedCost', 'Numeric']
                                ].map(([col, type], i) => (
                                    <React.Fragment key={i}>
                                        <div className={`p-4 text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-slate-800 text-slate-400' : 'bg-slate-900/50 text-slate-200'}`}>{col}</div>
                                        <div className={`p-4 text-[10px] italic font-medium ${i === 0 ? 'bg-slate-800 text-slate-400' : 'bg-transparent text-slate-500'}`}>{type}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold px-2 italic uppercase">* ResourceID is the primary key used to join with the Attribution Map.</p>
                        </div>
                    </div>

                    {/* Map Schema */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-blue-400">
                            <div className="p-2 bg-blue-500/10 rounded-lg"><Upload size={20} /></div>
                            <span className="text-sm font-black uppercase tracking-[0.2em]">2. Attribution Logic Map</span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-px bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-800/50">
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
                                        <div className={`p-3.5 text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-slate-800 text-slate-400' : 'bg-slate-900/50 text-slate-200'}`}>{col}</div>
                                        <div className={`p-3.5 text-[10px] italic font-medium ${i === 0 ? 'bg-slate-800 text-slate-400' : 'bg-transparent text-slate-500'}`}>{type}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Split Detail */}
                <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-xl"><ClipboardPaste size={18} className="text-blue-400" /></div>
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">VerticalSplitPct Specification</h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        This field <span className="text-white font-bold">MUST</span> be a valid JSON string containing exactly these three keys. If these keys are missing or misspelled, your vertical usage charts will remain at 0%.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { key: 'CC', label: 'Credit Card Split', color: 'text-blue-400' },
                            { key: 'PL', label: 'Personal Loans Split', color: 'text-emerald-400' },
                            { key: 'Ins', label: 'Insurance Split', color: 'text-purple-400' }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Key Name</span>
                                <span className={`text-sm font-black mono ${item.color}`}>{item.key}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#020617] rounded-2xl p-4 border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Example Value:</p>
                        <code className="text-blue-300 text-xs font-mono">{"{\"CC\": 40, \"PL\": 30, \"Ins\": 30}"}</code>
                    </div>
                </div>
            </div>

            {/* Quick Help */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <div className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Format Check</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Ensure your Billing CSV includes the <span className="text-blue-400">UnblendedCost</span> and <span className="text-blue-400">UsageStartDate</span> columns.</p>
                </div>
                <div className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Map Schema</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">The Attribution Map requires <span className="text-purple-400">ModelName</span> and <span className="text-purple-400">Initiative</span> to link costs correctly.</p>
                </div>
                <div className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Privacy</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Data processing occurs entirely in-browser. No files are uploaded to any external servers.</p>
                </div>
            </div>
        </div>
    );
};
