'use client';

import React from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
    onUpload: (file: File, type: 'bill' | 'map') => void;
    label: string;
    type: 'bill' | 'map';
    isLoaded: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, label, type, isLoaded }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file, type);
        }
    };

    return (
        <div className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${isLoaded ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
            }`}>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${isLoaded ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--sidebar-hover)] text-[var(--muted)] group-hover:text-[var(--primary)]'}`}>
                    {isLoaded ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                </div>
                <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                        {isLoaded ? 'File uploaded successfully' : 'Click or drag CSV file'}
                    </p>
                </div>
            </div>
        </div>
    );
};

