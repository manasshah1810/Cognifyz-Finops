'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UploadControls } from '@/components/UploadControls';
import { CostTrendChart } from '@/components/CostTrendChart';
import { VerticalUsage } from '@/components/VerticalUsage';
import { ModelPortfolio } from '@/components/ModelPortfolio';
import { OwnershipDonut } from '@/components/OwnershipDonut';
import { InitiativeModelMap } from '@/components/InitiativeModelMap';
import { AttributionOverTime } from '@/components/AttributionOverTime';
import { AttributionHeatmap } from '@/components/AttributionHeatmap';
import { Chatbot } from '@/components/Chatbot';
import Papa from 'papaparse';
import { Wallet, PieChart, AlertCircle, Server, Database, LayoutDashboard, BarChart3, Settings, LogOut, Menu, X, Bot } from 'lucide-react';

interface CloudBillRow {
  UsageStartDate: string;
  ResourceID: string;
  UnblendedCost: string | number;
}

interface AttributionMapRow {
  timestamp: string;
  ModelName: string;
  Initiative: string;
  ModelFamily: string;
  AttributionPct: string | number;
  VerticalSplitPct: string;
}

export default function Dashboard() {
  const [cloudBill, setCloudBill] = useState<CloudBillRow[]>([]);
  const [attributionMap, setAttributionMap] = useState<AttributionMapRow[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPending, startTransition] = React.useTransition();

  const filesLoaded = {
    bill: cloudBill.length > 0,
    map: attributionMap.length > 0
  };

  const handleUpload = (data: any[], type: 'bill' | 'map') => {
    startTransition(() => {
      if (type === 'bill') setCloudBill(data);
      else setAttributionMap(data);
    });
  };

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const [billRes, mapRes] = await Promise.all([
          fetch('/billing.csv'),
          fetch('/map.csv')
        ]);

        if (billRes.ok) {
          const billText = await billRes.text();
          Papa.parse(billText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data.length > 0) {
                setCloudBill(results.data as CloudBillRow[]);
              }
            }
          });
        }

        if (mapRes.ok) {
          const mapText = await mapRes.text();
          Papa.parse(mapText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data.length > 0) {
                setAttributionMap(results.data as AttributionMapRow[]);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading default data:', error);
      }
    };

    loadDefaultData();
  }, []);

  const processedData = useMemo(() => {
    if (cloudBill.length === 0) return { stats: null, aggregations: null };

    const attributionLookup = new Map<string, AttributionMapRow[]>();
    attributionMap.forEach(row => {
      if (!attributionLookup.has(row.ModelName)) {
        attributionLookup.set(row.ModelName, []);
      }
      attributionLookup.get(row.ModelName)?.push(row);
    });

    // Aggregation structures
    let totalSpend = 0;
    let attributedSpend = 0;
    const modelMap = new Map<string, Set<string>>();
    const modelMaxAttribution = new Map<string, number>();
    const modelFamilies = new Map<string, string>();

    // Executive / Cost Trend
    const dailyInitiativeCost: Record<string, Record<string, number>> = {};
    const initiativeSet = new Set<string>();

    // Vertical Usage
    let totalCC = 0, totalPL = 0, totalIns = 0;
    const verticalInitiativeMap: Record<string, { CC: number; PL: number; Ins: number }> = {};
    const verticalDriftBuckets: Record<string, { CC: number; PL: number; Ins: number }> = {};

    // Model Portfolio
    const modelInitiativeStats: Record<string, Record<string, { sum: number; count: number }>> = {};
    const familyInitiativeStats: Record<string, Record<string, { sum: number; count: number }>> = {};
    const familySet = new Set<string>();

    // Attribution Map (Table) - We'll keep a summarized version for the table
    const tableData: any[] = [];

    // Find min date for drift and trend
    let minTime = Infinity;
    for (let i = 0; i < cloudBill.length; i++) {
      const d = cloudBill[i].UsageStartDate;
      if (d) {
        const t = new Date(d).getTime();
        if (!isNaN(t) && t < minTime) minTime = t;
      }
    }
    for (let i = 0; i < attributionMap.length; i++) {
      const d = attributionMap[i].timestamp;
      if (d) {
        const t = new Date(d).getTime();
        if (!isNaN(t) && t < minTime) minTime = t;
      }
    }

    const minDate = minTime === Infinity ? new Date() : new Date(minTime);
    minDate.setHours(0, 0, 0, 0);

    // Attribution Trend (3-day intervals)
    const attributionTrendBuckets: Record<string, Record<string, { sum: number; count: number }>> = {};

    // Process attributionMap for trend independently
    attributionMap.forEach(attr => {
      const dateStr = attr.timestamp;
      if (!dateStr) return;

      const currentDate = new Date(dateStr);
      if (isNaN(currentDate.getTime())) return;
      currentDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const bucketIndex = Math.floor(diffDays / 3);
      const bucketDate = new Date(minDate);
      bucketDate.setDate(minDate.getDate() + (bucketIndex * 3));
      const bucketKey = bucketDate.toISOString().split('T')[0];

      const init = attr.Initiative;
      if (init && init !== 'Unattributed') {
        if (!attributionTrendBuckets[bucketKey]) attributionTrendBuckets[bucketKey] = {};
        if (!attributionTrendBuckets[bucketKey][init]) attributionTrendBuckets[bucketKey][init] = { sum: 0, count: 0 };

        const attrPct = typeof attr.AttributionPct === 'number' ? attr.AttributionPct : parseFloat(String(attr.AttributionPct || '0'));
        if (!isNaN(attrPct)) {
          attributionTrendBuckets[bucketKey][init].sum += attrPct;
          attributionTrendBuckets[bucketKey][init].count += 1;
        }
      }
    });

    for (let i = 0; i < cloudBill.length; i++) {
      const bill = cloudBill[i];
      const cost = typeof bill.UnblendedCost === 'number' ? bill.UnblendedCost : parseFloat(String(bill.UnblendedCost || '0'));
      totalSpend += cost;

      const attributions = attributionLookup.get(bill.ResourceID);
      const dateStr = bill.UsageStartDate;
      const dayKey = dateStr.substring(0, 10);

      if (!attributions || attributions.length === 0) {
        // Unattributed
        if (!modelMap.has(bill.ResourceID)) modelMap.set(bill.ResourceID, new Set());

        // Table data
        tableData.push({
          ModelName: bill.ResourceID,
          ModelFamily: 'Unknown',
          Initiative: 'Unattributed',
          AttributionPct: 0,
          UnblendedCost: cost
        });
      } else {
        for (let j = 0; j < attributions.length; j++) {
          const attr = attributions[j];
          const attrPct = typeof attr.AttributionPct === 'number' ? attr.AttributionPct : parseFloat(String(attr.AttributionPct || '0'));
          const attributedCost = cost * (attrPct / 100);
          attributedSpend += attributedCost;
          const init = attr.Initiative;
          const family = attr.ModelFamily;

          if (init) initiativeSet.add(init);
          if (family) familySet.add(family);

          // Stats
          if (!modelMap.has(bill.ResourceID)) modelMap.set(bill.ResourceID, new Set());
          if (init && init !== 'Unattributed') modelMap.get(bill.ResourceID)?.add(init);

          const currentMax = modelMaxAttribution.get(bill.ResourceID) || 0;
          if (attrPct > currentMax) modelMaxAttribution.set(bill.ResourceID, attrPct);
          modelFamilies.set(bill.ResourceID, family);

          // Cost Trend
          if (!dailyInitiativeCost[dayKey]) dailyInitiativeCost[dayKey] = {};
          if (init) dailyInitiativeCost[dayKey][init] = (dailyInitiativeCost[dayKey][init] || 0) + attributedCost;

          // Vertical
          let split = { CC: 0, PL: 0, Ins: 0 };
          try { split = typeof attr.VerticalSplitPct === 'string' ? JSON.parse(attr.VerticalSplitPct) : attr.VerticalSplitPct; } catch (e) { }
          const ccCost = attributedCost * (split.CC / 100);
          const plCost = attributedCost * (split.PL / 100);
          const insCost = attributedCost * (split.Ins / 100);
          totalCC += ccCost; totalPL += plCost; totalIns += insCost;

          if (init && init !== 'Unattributed') {
            if (!verticalInitiativeMap[init]) verticalInitiativeMap[init] = { CC: 0, PL: 0, Ins: 0 };
            verticalInitiativeMap[init].CC += ccCost;
            verticalInitiativeMap[init].PL += plCost;
            verticalInitiativeMap[init].Ins += insCost;
          }

          // Drift
          const currentDate = new Date(dateStr);
          currentDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((currentDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
          const bucketIndex = Math.floor(diffDays / 3);
          const bucketDate = new Date(minDate);
          bucketDate.setDate(minDate.getDate() + (bucketIndex * 3));
          const bucketKey = bucketDate.toISOString().split('T')[0];
          if (!verticalDriftBuckets[bucketKey]) verticalDriftBuckets[bucketKey] = { CC: 0, PL: 0, Ins: 0 };
          verticalDriftBuckets[bucketKey].CC += ccCost;
          verticalDriftBuckets[bucketKey].PL += plCost;
          verticalDriftBuckets[bucketKey].Ins += insCost;

          // Model Portfolio
          const name = attr.ModelName || bill.ResourceID;
          if (!modelInitiativeStats[name]) modelInitiativeStats[name] = {};
          if (init && init !== 'Unattributed') {
            if (!modelInitiativeStats[name][init]) modelInitiativeStats[name][init] = { sum: 0, count: 0 };
            modelInitiativeStats[name][init].sum += attrPct;
            modelInitiativeStats[name][init].count += 1;
          }

          if (family && init && init !== 'Unattributed') {
            if (!familyInitiativeStats[family]) familyInitiativeStats[family] = {};
            if (!familyInitiativeStats[family][init]) familyInitiativeStats[family][init] = { sum: 0, count: 0 };
            familyInitiativeStats[family][init].sum += attrPct;
            familyInitiativeStats[family][init].count += 1;
          }

          // Table data (limit to first 5000 for performance if needed, or keep all if manageable)
          if (tableData.length < 5000) {
            tableData.push({
              ModelName: name,
              ModelFamily: family,
              Initiative: init,
              AttributionPct: attrPct,
              UnblendedCost: attributedCost
            });
          }
        }
      }
    }

    // Finalize Stats
    const totalModels = modelMap.size;
    let highConcentrationCount = 0, dedicatedCount = 0, sharedCount = 0;
    modelMap.forEach((owners, modelId) => {
      const maxAttr = modelMaxAttribution.get(modelId) || 0;
      if (maxAttr >= 50) highConcentrationCount++;
      if (owners.size === 1) dedicatedCount++;
      if (owners.size >= 2) sharedCount++;
    });

    const stats = {
      totalSpend,
      attributedSpendPct: (attributedSpend / totalSpend) * 100,
      unallocatedSpend: totalSpend - attributedSpend,
      activeModelsCount: totalModels,
      ownershipConcentration: totalModels > 0 ? (highConcentrationCount / totalModels) * 100 : 0,
      dedicatedCount,
      sharedCount,
      sharedModelsPct: totalModels > 0 ? (sharedCount / totalModels) * 100 : 0,
      totalModels,
      attributionStability: 15.8
    };

    // Finalize Aggregations
    const costTrendData = Object.entries(dailyInitiativeCost).map(([date, inits]) => ({
      name: date,
      displayName: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...inits
    })).sort((a, b) => a.name.localeCompare(b.name));

    const verticalUsageData = {
      verticalTotals: {
        ccPct: (totalCC / (totalCC + totalPL + totalIns || 1)) * 100,
        plPct: (totalPL / (totalCC + totalPL + totalIns || 1)) * 100,
        insPct: (totalIns / (totalCC + totalPL + totalIns || 1)) * 100
      },
      initiativeDistribution: Object.entries(verticalInitiativeMap).map(([name, values]) => ({ name, ...values })).sort((a, b) => (b.CC + b.PL + b.Ins) - (a.CC + a.PL + a.Ins)),
      driftData: Object.entries(verticalDriftBuckets).map(([date, vals]) => {
        const bTotal = vals.CC + vals.PL + vals.Ins || 1;
        return { date, 'Credit Card': (vals.CC / bTotal) * 100, 'Personal Loans': (vals.PL / bTotal) * 100, 'Insurance': (vals.Ins / bTotal) * 100 };
      }).sort((a, b) => a.date.localeCompare(b.date)),
      matrixData: Object.entries(verticalInitiativeMap).map(([init, vals]) => {
        const iTotal = vals.CC + vals.PL + vals.Ins || 1;
        return { initiative: init, cc: (vals.CC / iTotal) * 100, pl: (vals.PL / iTotal) * 100, ins: (vals.Ins / iTotal) * 100 };
      })
    };

    const modelStats = Object.entries(modelInitiativeStats).map(([name, owners]) => {
      const averagedOwners: Record<string, number> = {};
      let maxAttr = 0, ownerCount = 0;
      for (const [init, s] of Object.entries(owners)) {
        const avg = s.sum / s.count;
        averagedOwners[init] = avg;
        if (avg > maxAttr) maxAttr = avg;
        ownerCount++;
      }
      return { name, family: modelFamilies.get(name) || 'Unknown', owners: averagedOwners, maxAttr, type: ownerCount > 1 ? (maxAttr > 50 ? 'Shared-Primary' : 'Shared-Balanced') : 'Dedicated', ownerCount };
    });

    const modelPortfolioData = {
      modelStats,
      familyMixData: Object.entries(familyInitiativeStats).map(([name, values]) => {
        const entry: Record<string, any> = { name };
        for (const [init, s] of Object.entries(values)) entry[init] = s.sum / s.count;
        return entry;
      }),
      kpis: {
        dedicated: modelStats.filter(m => m.type === 'Dedicated').length,
        primary: modelStats.filter(m => m.type === 'Shared-Primary').length,
        balanced: modelStats.filter(m => m.type === 'Shared-Balanced').length,
        dedicatedPct: (modelStats.filter(m => m.type === 'Dedicated').length / (modelStats.length || 1)) * 100,
        primaryPct: (modelStats.filter(m => m.type === 'Shared-Primary').length / (modelStats.length || 1)) * 100,
        balancedPct: (modelStats.filter(m => m.type === 'Shared-Balanced').length / (modelStats.length || 1)) * 100,
      },
      initiatives: Array.from(initiativeSet)
    };

    const attributionData = {
      tableData,
      chartData: Object.entries(attributionTrendBuckets).map(([date, values]) => {
        const entry: Record<string, any> = { date };
        for (const [init, s] of Object.entries(values)) entry[init] = s.sum / s.count;
        return entry;
      }).sort((a, b) => a.date.localeCompare(b.date)),
      families: ['All', ...Array.from(familySet).sort()],
      initiatives: Array.from(initiativeSet).slice(0, 8),
      heatmapMatrix: {
        initiatives: Array.from(initiativeSet),
        families: Array.from(familySet),
        data: familyInitiativeStats // Reuse this for heatmap
      }
    };

    return { stats, aggregations: { costTrendData, verticalUsageData, modelPortfolioData, attributionData, initiativeSet: Array.from(initiativeSet).slice(0, 5) } };
  }, [cloudBill, attributionMap]);

  const { stats, aggregations } = processedData;

  const ownershipData = useMemo(() => {
    if (!stats) return { dedicated: 0, shared: 0, unassigned: 0 };
    return {
      dedicated: stats.dedicatedCount,
      shared: stats.sharedCount,
      unassigned: stats.totalModels - stats.dedicatedCount - stats.sharedCount
    };
  }, [stats]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const navItems = [
    { id: 'executive', label: 'Executive Summary', icon: <LayoutDashboard size={18} /> },
    { id: 'attribution', label: 'Initiative Attribution', icon: <Database size={18} /> },
    { id: 'portfolio', label: 'Model Portfolio', icon: <BarChart3 size={18} /> },
    { id: 'vertical', label: 'Vertical Usage', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'
          } bg-[#0f172a] border-r border-slate-800 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-4">
          <div className="flex-shrink-0">
            <img
              src="/logo.png"
              className="w-12 h-12 object-contain"
              alt="Cogniify Logo"
            />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-[0.1em] text-white uppercase leading-none">Cogniify Finops</span>
              <span className="font-bold text-[8px] tracking-[0.2em] text-blue-400 uppercase mt-1">ML Attribution System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeTab === item.id
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              <div className={`${activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </div>
              {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 rounded-xl transition-all group"
          >
            <Bot size={18} className="group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-6">
            {isPending && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Processing Data...</span>
              </div>
            )}
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-50 bg-[#020617]/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Analyzing Datasets</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Optimizing aggregations for large files</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto">
          {!stats ? (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-[#0f172a] rounded-3xl flex items-center justify-center border border-slate-800 shadow-2xl glow-blue">
                <Database className="text-blue-400" size={40} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">No Data Sources Connected</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto uppercase tracking-wide">
                  Upload your Cloud Billing and Attribution Map CSV files using the controls in the bottom-right corner to begin analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Conditional Views based on activeTab */}

              {activeTab === 'executive' && (
                <div className="space-y-8">
                  {/* KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="kpi-card glow-blue">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ownership Concentration</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg"><PieChart size={16} className="text-blue-400" /></div>
                      </div>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.ownershipConcentration.toFixed(2)}%</div>
                      <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">Models with ≥50% single ownership</div>
                    </div>

                    <div className="kpi-card glow-emerald">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dedicated Models</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><Server size={16} className="text-emerald-400" /></div>
                      </div>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.dedicatedCount}</div>
                      <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">{stats.dedicatedCount} of {stats.totalModels} models</div>
                    </div>

                    <div className="kpi-card glow-purple">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shared Models</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Database size={16} className="text-purple-400" /></div>
                      </div>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.sharedModelsPct.toFixed(2)}%</div>
                      <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">{stats.sharedCount} models with 2+ owners</div>
                    </div>

                    <div className="kpi-card glow-blue">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attribution Stability</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Settings size={16} className="text-blue-400" /></div>
                      </div>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.attributionStability}%</div>
                      <div className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">Stable attribution over time</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <CostTrendChart
                        chartData={aggregations.costTrendData}
                        initiatives={aggregations.initiativeSet}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <OwnershipDonut data={ownershipData} />
                    </div>
                  </div>
                  <VerticalUsage data={aggregations.verticalUsageData} />
                </div>
              )}

              {activeTab === 'portfolio' && (
                <ModelPortfolio data={aggregations.modelPortfolioData} />
              )}

              {activeTab === 'attribution' && (
                <div className="space-y-8">
                  <InitiativeModelMap
                    tableData={aggregations.attributionData.tableData}
                    families={aggregations.attributionData.families}
                  />
                  <AttributionOverTime
                    chartData={aggregations.attributionData.chartData}
                    initiatives={aggregations.attributionData.initiatives}
                  />
                  <AttributionHeatmap matrix={aggregations.attributionData.heatmapMatrix} />
                </div>
              )}

              {activeTab === 'vertical' && (
                <div className="space-y-8">
                  <VerticalUsage data={aggregations.verticalUsageData} />

                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Controls */}
      <UploadControls onUpload={handleUpload} filesLoaded={filesLoaded} />

      {/* AI Chatbot */}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contextData={processedData}
      />
    </div>
  );
}
