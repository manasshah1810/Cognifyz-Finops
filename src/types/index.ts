export interface CloudBillRow {
    ResourceID: string;
    UnblendedCost: string | number;
    UsageStartDate: string;
}

export interface VerticalSplit {
    CC: number;
    PL: number;
    Ins: number;
}

export interface AttributionMapRow {
    timestamp: string;
    ModelName: string;
    Initiative: string;
    ModelFamily: string;
    AttributionPct: string | number;
    VerticalSplitPct: string;
}

export interface MergedData {
    resourceId: string;
    unblendedCost: number;
    usageStartDate: string;
    modelName: string;
    initiative: string;
    attributionPct: number;
    attributedCost: number;
    verticalSplit: VerticalSplit;
    verticalCosts: {
        CC: number;
        PL: number;
        Ins: number;
    };
    isAttributed: boolean;
}

export interface DashboardStats {
    totalSpend: number;
    attributedSpendPct: number;
    unallocatedSpend: number;
    activeModelsCount: number;
}
