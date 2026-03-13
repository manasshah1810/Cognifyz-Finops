'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CostTrendChart } from '@/components/CostTrendChart';
import { VerticalUsage } from '@/components/VerticalUsage';
import { ModelPortfolio } from '@/components/ModelPortfolio';
import { OwnershipDonut } from '@/components/OwnershipDonut';
import { InitiativeModelMap } from '@/components/InitiativeModelMap';
import { AttributionOverTime } from '@/components/AttributionOverTime';
import { AttributionHeatmap } from '@/components/AttributionHeatmap';
import { Chatbot } from '@/components/Chatbot';
import { Glossary } from '@/components/Glossary';
import { CostBreakdown } from '@/components/CostBreakdown';
import Papa from 'papaparse';
import { Wallet, PieChart, AlertCircle, Server, Database, LayoutDashboard, BarChart3, Settings, LogOut, Menu, X, Bot, BookOpen, Search, Upload, Info, DollarSign } from 'lucide-react';
import { UploadPage } from '@/components/UploadPage';

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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [initiativeFilter, setInitiativeFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [verticalFilter, setVerticalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDataReady, setIsDataReady] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'user'>('demo');
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

  const handleFullUpload = (billData: any[], mapData: any[]) => {
    startTransition(() => {
      setCloudBill(billData);
      setAttributionMap(mapData);
      setIsDataReady(true);
      setDataSource('user');

      // Update date range based on new data
      const dates = billData.map(d => new Date(d.UsageStartDate).getTime()).filter(t => !isNaN(t));
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
        const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
        setStartDate(minDate);
        setEndDate(maxDate);
      }

      setActiveTab('executive');
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
                const data = results.data as CloudBillRow[];
                setCloudBill(data);

                // Set initial dates based on data
                const dates = data.map(d => new Date(d.UsageStartDate).getTime()).filter(t => !isNaN(t));
                if (dates.length > 0) {
                  const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
                  const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
                  setStartDate(minDate);
                  setEndDate(maxDate);
                }
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

    // Find min and max date for global scaling and filtering
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (let i = 0; i < cloudBill.length; i++) {
      const d = cloudBill[i].UsageStartDate;
      if (d) {
        const t = new Date(d).getTime();
        if (!isNaN(t)) {
          if (t < minTime) minTime = t;
          if (t > maxTime) maxTime = t;
        }
      }
    }
    const maxDate = maxTime === -Infinity ? new Date() : new Date(maxTime);
    minTime = Infinity; // reset for actual filtered data min date later

    const filterTime = (dateStr: string) => {
      if (!dateStr || (!startDate && !endDate)) return true;
      const t = new Date(dateStr).getTime();
      if (isNaN(t)) return true;

      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1) : Infinity;

      return t >= start && t <= end;
    };

    const filterSearch = (item: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.ResourceID?.toLowerCase().includes(query) ||
        item.ModelName?.toLowerCase().includes(query) ||
        item.Initiative?.toLowerCase().includes(query) ||
        item.ModelFamily?.toLowerCase().includes(query)
      );
    };

    const filteredBill = cloudBill.filter(b => filterTime(b.UsageStartDate));

    // Base map with time/search only - for dropdowns
    const baseMap = attributionMap.filter(m => filterTime(m.timestamp) && filterSearch(m));
    const allInitiativesDropdown = Array.from(new Set(baseMap.map(m => m.Initiative).filter(Boolean))).sort();
    const allFamiliesDropdown = ['All', ...Array.from(new Set(baseMap.map(m => m.ModelFamily).filter(Boolean))).sort()];

    // Apply active filters to Map for processing
    const filteredMap = baseMap.filter(m => {
      if (initiativeFilter !== 'all' && m.Initiative !== initiativeFilter) return false;
      if (familyFilter !== 'all' && m.ModelFamily !== familyFilter) return false;
      return true;
    });

    const attributionLookup = new Map<string, AttributionMapRow[]>();
    filteredMap.forEach(row => {
      const key = (row.ModelName || '').trim().toLowerCase();
      if (!attributionLookup.has(key)) {
        attributionLookup.set(key, []);
      }
      attributionLookup.get(key)?.push(row);
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

    // Breakdown structures
    const deptCost: Record<string, number> = {};
    const teamCost: Record<string, number> = {};

    const getDept = (init: string) => {
      if (init.includes('Marketing') || init.includes('Growth')) return 'Growth & Marketing';
      if (init.includes('Risk') || init.includes('Fraud')) return 'Risk Management';
      if (init.includes('Support') || init.includes('Service')) return 'Customer Success';
      if (init.includes('Sales')) return 'Sales Operations';
      return 'Engineering & Core Platform';
    }

    const getTeam = (init: string) => {
      if (init.includes('Marketing') || init.includes('Growth')) return 'Acquisition Team';
      if (init.includes('Risk')) return 'Credit Policy Team';
      if (init.includes('Fraud')) return 'Fraud Prevention Unit';
      if (init.includes('Support')) return 'Helpdesk GenAI Team';
      if (init.includes('Claims')) return 'Claims Automation Pod';
      return 'Core AI Operations';
    }

    // Find new min date for drift and trend from filtered data
    for (let i = 0; i < filteredBill.length; i++) {
      const d = filteredBill[i].UsageStartDate;
      if (d) {
        const t = new Date(d).getTime();
        if (!isNaN(t) && t < minTime) minTime = t;
      }
    }
    for (let i = 0; i < filteredMap.length; i++) {
      const d = filteredMap[i].timestamp;
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
    filteredMap.forEach(attr => {
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

    for (let i = 0; i < filteredBill.length; i++) {
      const bill = filteredBill[i];
      const cost = typeof bill.UnblendedCost === 'number' ? bill.UnblendedCost : parseFloat(String(bill.UnblendedCost || '0'));
      const attributions = attributionLookup.get((bill.ResourceID || '').trim().toLowerCase());
      const dateStr = bill.UsageStartDate;
      const dayKey = dateStr.substring(0, 10);

      const hasInitOrFamFilter = initiativeFilter !== 'all' || familyFilter !== 'all';

      // Search check: matches ResourceID or any associated attribution
      const matchesResourceSearch = filterSearch(bill);
      const anyAttrMatchesSearch = attributions?.some(a => filterSearch(a)) || false;
      const passSearch = matchesResourceSearch || anyAttrMatchesSearch;

      if (!passSearch) continue;
      if (hasInitOrFamFilter && (!attributions || attributions.length === 0)) continue;

      if (!attributions || attributions.length === 0) {
        // Unattributed - only include if no initiative/family filter is active
        if (!hasInitOrFamFilter) {
          if (!modelMap.has(bill.ResourceID)) modelMap.set(bill.ResourceID, new Set());

          // Table data
          tableData.push({
            ModelName: bill.ResourceID,
            ModelFamily: 'Unknown',
            Initiative: 'Unattributed',
            AttributionPct: 0,
            UnblendedCost: cost
          });
          totalSpend += cost;
        }
      } else {
        let matchedSomething = false;
        let matchedCostInRow = 0;
        for (let j = 0; j < attributions.length; j++) {
          const attr = attributions[j];
          const attrPct = typeof attr.AttributionPct === 'number' ? attr.AttributionPct : parseFloat(String(attr.AttributionPct || '0'));

          let attributedCost = cost * (attrPct / 100);

          // Apply Vertical Filter scaling if active
          if (verticalFilter !== 'all') {
            let splitVal: any = { CC: 0, PL: 0, Ins: 0 };
            try {
              const parsed = typeof attr.VerticalSplitPct === 'string' ? JSON.parse(attr.VerticalSplitPct) : attr.VerticalSplitPct;
              // Normalize keys to uppercase for robustness
              splitVal = Object.keys(parsed || {}).reduce((acc: any, key) => {
                acc[key.toUpperCase()] = parsed[key];
                return acc;
              }, { CC: 0, PL: 0, Ins: 0 });
            } catch (e) { }
            const vKey = verticalFilter === 'cc' ? 'CC' : verticalFilter === 'pl' ? 'PL' : verticalFilter === 'ins' ? 'Ins' : null;
            if (vKey && splitVal && splitVal[vKey] !== undefined) {
              attributedCost = attributedCost * (splitVal[vKey] / 100);
            } else if (vKey) {
              attributedCost = 0; // Filtered out by vertical
            }
          }

          if (attributedCost <= 0 && verticalFilter !== 'all') continue;

          matchedSomething = true;
          matchedCostInRow += attributedCost;
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

            const dept = getDept(init);
            const team = getTeam(init);
            deptCost[dept] = (deptCost[dept] || 0) + attributedCost;
            teamCost[team] = (teamCost[team] || 0) + attributedCost;
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
        if (matchedSomething) {
          totalSpend += matchedCostInRow;
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
      attributedSpendPct: totalSpend > 0 ? (attributedSpend / totalSpend) * 100 : 0,
      unallocatedSpend: Math.max(0, totalSpend - attributedSpend),
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

    const costBreakdownData = {
      verticalData: [
        { name: 'Credit Card', value: totalCC },
        { name: 'Personal Loans', value: totalPL },
        { name: 'Insurance', value: totalIns }
      ].sort((a, b) => b.value - a.value),
      departmentData: Object.entries(deptCost).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      teamData: Object.entries(teamCost).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)
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
      families: allFamiliesDropdown,
      initiatives: allInitiativesDropdown,
      heatmapMatrix: {
        initiatives: Array.from(initiativeSet).sort(),
        families: Array.from(familySet).sort(),
        data: familyInitiativeStats // Reuse this for heatmap
      }
    };

    return { stats, aggregations: { costTrendData, verticalUsageData, costBreakdownData, modelPortfolioData, attributionData, initiativeSet: Array.from(initiativeSet).sort().slice(0, 8) } };
  }, [cloudBill, attributionMap, startDate, endDate, searchQuery, initiativeFilter, familyFilter, typeFilter, verticalFilter]);

  const { stats, aggregations } = processedData;

  const filteredDisplayData = useMemo(() => {
    if (!aggregations || !stats) return { filteredAggregations: null };

    // Attribution
    const filteredTableData = aggregations.attributionData.tableData.filter((r: any) => {
      if (initiativeFilter !== 'all' && r.Initiative !== initiativeFilter) return false;
      if (familyFilter !== 'all' && r.ModelFamily !== familyFilter) return false;
      return true;
    });

    const filteredChartData = initiativeFilter === 'all'
      ? aggregations.attributionData.chartData
      : aggregations.attributionData.chartData.map((d: any) => ({
        date: d.date,
        [initiativeFilter]: d[initiativeFilter]
      }));

    // Portfolio
    const filteredModelStats = aggregations.modelPortfolioData.modelStats.filter((m: any) => {
      if (familyFilter !== 'all' && m.family !== familyFilter) return false;
      if (typeFilter === 'dedicated' && m.type !== 'Dedicated') return false;
      if (typeFilter === 'shared' && m.type === 'Dedicated') return false;
      if (initiativeFilter !== 'all' && m.owners && m.owners[initiativeFilter] === undefined) return false;
      return true;
    });

    const portKpis = {
      dedicated: filteredModelStats.filter((m: any) => m.type === 'Dedicated').length,
      primary: filteredModelStats.filter((m: any) => m.type === 'Shared-Primary').length,
      balanced: filteredModelStats.filter((m: any) => m.type === 'Shared-Balanced').length,
      dedicatedPct: (filteredModelStats.filter((m: any) => m.type === 'Dedicated').length / (filteredModelStats.length || 1)) * 100,
      primaryPct: (filteredModelStats.filter((m: any) => m.type === 'Shared-Primary').length / (filteredModelStats.length || 1)) * 100,
      balancedPct: (filteredModelStats.filter((m: any) => m.type === 'Shared-Balanced').length / (filteredModelStats.length || 1)) * 100,
    };

    return {
      filteredAggregations: {
        ...aggregations,
        attributionData: {
          ...aggregations.attributionData,
          tableData: filteredTableData,
          chartData: filteredChartData
        },
        modelPortfolioData: {
          ...aggregations.modelPortfolioData,
          modelStats: filteredModelStats,
          kpis: portKpis
        }
      }
    };
  }, [aggregations, stats, initiativeFilter, familyFilter, typeFilter, verticalFilter, searchQuery]);

  const { filteredAggregations } = filteredDisplayData;

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
    { id: 'upload', label: 'Upload Files', icon: <Upload size={18} /> },
    { id: 'glossary', label: 'Glossary', icon: <BookOpen size={18} /> }
  ];

  const renderActiveChips = () => {
    const chips = [];
    if (initiativeFilter !== 'all') chips.push({ label: `Initiative: ${initiativeFilter}`, clear: () => setInitiativeFilter('all') });
    if (familyFilter !== 'all') chips.push({ label: `Family: ${familyFilter}`, clear: () => setFamilyFilter('all') });
    if (typeFilter !== 'all') chips.push({ label: `Type: ${typeFilter}`, clear: () => setTypeFilter('all') });
    if (verticalFilter !== 'all') chips.push({ label: `Segment: ${verticalFilter}`, clear: () => setVerticalFilter('all') });
    if (searchQuery) chips.push({ label: `Search: ${searchQuery}`, clear: () => setSearchQuery('') });

    if (chips.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        {chips.map((chip, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{chip.label}</span>
            <button onClick={chip.clear} className="text-blue-400/50 hover:text-blue-400 transition-colors">
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            setInitiativeFilter('all'); setFamilyFilter('all'); setTypeFilter('all'); setVerticalFilter('all'); setSearchQuery('');
          }}
          className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider px-2"
        >
          Clear All
        </button>
      </div>
    );
  };

  const renderGlobalFilters = () => (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800/50 p-4 lg:p-2 pl-4 lg:pl-6 rounded-[2rem] shadow-2xl relative z-30">
        {/* Search Input */}
        <div className="flex-1 flex items-center gap-3 min-w-[240px]">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search models, initiatives, or families..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:ring-0"
          />
        </div>

        <div className="hidden lg:block h-8 w-[1px] bg-slate-800/50 mx-2" />

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker Group */}
          <div className="flex items-center bg-slate-900/50 rounded-2xl border border-slate-800 p-1 group hover:border-blue-500/30 transition-all">
            <div className="flex items-center px-3 py-1.5 gap-2 border-r border-slate-800">
              <span className="text-[10px] font-black text-slate-500 uppercase">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-slate-300 focus:ring-0 p-0 w-24 [color-scheme:dark]"
              />
            </div>
            <div className="flex items-center px-3 py-1.5 gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-slate-300 focus:ring-0 p-0 w-24 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Dynamic Selects */}
          {/* Dynamic Selects */}
          <div className="relative group">
            <select
              value={initiativeFilter}
              onChange={(e) => setInitiativeFilter(e.target.value)}
              className="appearance-none bg-[#1e293b] border border-slate-700 hover:border-blue-500/50 text-[10px] font-bold text-slate-300 uppercase tracking-wider rounded-2xl px-5 py-3 pr-10 focus:outline-none transition-all cursor-pointer shadow-lg"
            >
              <option value="all">Every Initiative</option>
              {aggregations?.attributionData.initiatives.map((i: string) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Settings size={12} /></div>
          </div>

          <div className="relative group">
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="appearance-none bg-[#1e293b] border border-slate-700 hover:border-blue-500/50 text-[10px] font-bold text-slate-300 uppercase tracking-wider rounded-2xl px-5 py-3 pr-10 focus:outline-none transition-all cursor-pointer shadow-lg"
            >
              {aggregations?.attributionData.families.map((f: string) => (
                <option key={f} value={f === 'All' ? 'all' : f}>{f}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Database size={12} /></div>
          </div>

          <div className="relative group">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-[#1e293b] border border-slate-700 hover:border-blue-500/50 text-[10px] font-bold text-slate-300 uppercase tracking-wider rounded-2xl px-5 py-3 pr-10 focus:outline-none transition-all cursor-pointer shadow-lg"
            >
              <option value="all">Global Type</option>
              <option value="dedicated">Dedicated Only</option>
              <option value="shared">Shared Models</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><PieChart size={12} /></div>
          </div>

          <div className="relative group">
            <select
              value={verticalFilter}
              onChange={(e) => setVerticalFilter(e.target.value)}
              className="appearance-none bg-[#1e293b] border border-slate-700 hover:border-blue-500/50 text-[10px] font-bold text-slate-300 uppercase tracking-wider rounded-2xl px-5 py-3 pr-10 focus:outline-none transition-all cursor-pointer shadow-lg"
            >
              <option value="all">All Segments</option>
              <option value="cc">Credit Card</option>
              <option value="pl">Personal Loans</option>
              <option value="ins">Insurance</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><LayoutDashboard size={12} /></div>
          </div>

        </div>
      </div>
      {renderActiveChips()}
    </div>
  );

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
        {/* Floating Controls */}
        <div className="fixed top-6 left-[inherit] z-50 flex items-center px-8 w-full pointer-events-none">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-[#0f172a]/80 backdrop-blur-md border border-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 transition-all pointer-events-auto shadow-xl"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Floating Data Badge - Bottom Left */}
        <div className={`fixed bottom-8 z-50 transition-all duration-300 pointer-events-none ${isSidebarOpen ? 'left-72' : 'left-28'}`}>
          <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 backdrop-blur-md transition-all pointer-events-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-500 ${dataSource === 'user'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dataSource === 'user' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            {dataSource === 'user' ? 'Live User Data' : 'Demo Dataset'}
          </div>
        </div>

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

        <div className="p-8 overflow-y-auto">
          {activeTab === 'upload' ? (
            <UploadPage onUploadComplete={handleFullUpload} />
          ) : !stats || !aggregations ? (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-[#0f172a] rounded-3xl flex items-center justify-center border border-slate-800 shadow-2xl glow-blue">
                <Database className="text-blue-400" size={40} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Initializing Data...</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto uppercase tracking-wide">
                  Optimizing dashboard for analysis. Please wait.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Conditional Views based on activeTab */}

              {activeTab === 'executive' && (
                <div className="space-y-8">
                  {renderGlobalFilters()}

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

                    <div className="kpi-card glow-blue col-span-1 md:col-span-2 lg:col-span-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Filtered Total Spend</span>
                          <div className="text-4xl font-black text-white tracking-tighter mt-1">{formatCurrency(stats.totalSpend)}</div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Info size={12} /> This reflects cost after applying active filters and vertical scaling
                          </p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                          <DollarSign size={32} className="text-blue-400" />
                        </div>
                      </div>
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
                  <CostBreakdown
                    verticalData={aggregations.costBreakdownData.verticalData}
                    departmentData={aggregations.costBreakdownData.departmentData}
                    teamData={aggregations.costBreakdownData.teamData}
                  />
                  <VerticalUsage data={aggregations.verticalUsageData} />
                </div>
              )}

              {activeTab === 'portfolio' && filteredAggregations && (
                <div className="space-y-8">
                  {renderGlobalFilters()}
                  <ModelPortfolio data={filteredAggregations.modelPortfolioData} />
                </div>
              )}

              {activeTab === 'attribution' && filteredAggregations && (
                <div className="space-y-8">
                  {renderGlobalFilters()}
                  <InitiativeModelMap
                    tableData={filteredAggregations.attributionData.tableData}
                    families={aggregations.attributionData.families}
                  />
                  <AttributionOverTime
                    chartData={filteredAggregations.attributionData.chartData}
                    initiatives={aggregations.attributionData.initiatives}
                  />
                  <AttributionHeatmap matrix={aggregations.attributionData.heatmapMatrix} />
                </div>
              )}

              {activeTab === 'vertical' && (
                <div className="space-y-8">
                  {renderGlobalFilters()}
                  <VerticalUsage data={aggregations.verticalUsageData} />
                </div>
              )}

              {activeTab === 'glossary' && (
                <Glossary />
              )}
            </div>
          )}
        </div>
      </main>

      {/* AI Chatbot */}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contextData={processedData}
      />
    </div>
  );
}
