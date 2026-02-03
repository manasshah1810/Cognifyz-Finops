'use client';

import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { CloudBillRow, AttributionMapRow, MergedData, VerticalSplit, DashboardStats } from '@/types';

export const useFinancialData = () => {
    const [cloudBill, setCloudBill] = useState<CloudBillRow[]>([]);
    const [attributionMap, setAttributionMap] = useState<AttributionMapRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const processFiles = useCallback((billData: CloudBillRow[], mapData: AttributionMapRow[]) => {
        setIsProcessing(true);

        const map = new Map<string, AttributionMapRow>();
        mapData.forEach(row => {
            map.set(row.ModelName, row);
        });

        const merged: MergedData[] = billData.map(bill => {
            const attribution = map.get(bill.ResourceID);
            const unblendedCost = typeof bill.UnblendedCost === 'string' ? parseFloat(bill.UnblendedCost) : bill.UnblendedCost;

            if (!attribution) {
                return {
                    resourceId: bill.ResourceID,
                    unblendedCost,
                    usageStartDate: bill.UsageStartDate,
                    modelName: bill.ResourceID,
                    initiative: 'Unattributed',
                    attributionPct: 0,
                    attributedCost: 0,
                    verticalSplit: { CC: 0, PL: 0, Ins: 0 },
                    verticalCosts: { CC: 0, PL: 0, Ins: 0 },
                    isAttributed: false,
                };
            }

            const attributionPct = typeof attribution.AttributionPct === 'string' ? parseFloat(attribution.AttributionPct) : attribution.AttributionPct;
            const attributedCost = unblendedCost * (attributionPct / 100);

            let verticalSplit: VerticalSplit = { CC: 0, PL: 0, Ins: 0 };
            try {
                verticalSplit = JSON.parse(attribution.VerticalSplitPct);
            } catch (e) {
                console.error('Failed to parse vertical split', e);
            }

            return {
                resourceId: bill.ResourceID,
                unblendedCost,
                usageStartDate: bill.UsageStartDate,
                modelName: attribution.ModelName,
                initiative: attribution.Initiative,
                attributionPct,
                attributedCost,
                verticalSplit,
                verticalCosts: {
                    CC: attributedCost * (verticalSplit.CC / 100),
                    PL: attributedCost * (verticalSplit.PL / 100),
                    Ins: attributedCost * (verticalSplit.Ins / 100),
                },
                isAttributed: true,
            };
        });

        setIsProcessing(false);
        return merged;
    }, []);

    const mergedData = useMemo(() => {
        if (cloudBill.length === 0) return [];
        return processFiles(cloudBill, attributionMap);
    }, [cloudBill, attributionMap, processFiles]);

    const stats: DashboardStats = useMemo(() => {
        const totalSpend = mergedData.reduce((acc, curr) => acc + curr.unblendedCost, 0);
        const attributedSpend = mergedData.reduce((acc, curr) => acc + curr.attributedCost, 0);
        const unallocatedSpend = totalSpend - attributedSpend;
        const activeModels = new Set(mergedData.filter(d => d.unblendedCost > 0).map(d => d.modelName));

        return {
            totalSpend,
            attributedSpendPct: totalSpend > 0 ? (attributedSpend / totalSpend) * 100 : 0,
            unallocatedSpend,
            activeModelsCount: activeModels.size,
        };
    }, [mergedData]);

    const loadSampleData = () => {
        // Synthetic data generation for demo
        const sampleBill: CloudBillRow[] = Array.from({ length: 50 }).map((_, i) => ({
            ResourceID: `model_${(i % 10) + 1}`,
            UnblendedCost: Math.random() * 1000 + 100,
            UsageStartDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));

        const sampleMap: AttributionMapRow[] = Array.from({ length: 10 }).map((_, i) => ({
            ModelName: `model_${i + 1}`,
            Initiative: ['Retention', 'Acquisition', 'Risk', 'Servicing'][i % 4],
            AttributionPct: 100,
            VerticalSplitPct: JSON.stringify({
                CC: Math.random() * 40 + 20,
                PL: Math.random() * 30 + 10,
                Ins: Math.random() * 20 + 10,
            }),
        }));

        setCloudBill(sampleBill);
        setAttributionMap(sampleMap);
    };

    const handleFileUpload = (file: File, type: 'bill' | 'map') => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                if (type === 'bill') {
                    setCloudBill(results.data as CloudBillRow[]);
                } else {
                    setAttributionMap(results.data as AttributionMapRow[]);
                }
            },
        });
    };

    return {
        mergedData,
        stats,
        isProcessing,
        handleFileUpload,
        loadSampleData,
        hasData: mergedData.length > 0,
    };
};
