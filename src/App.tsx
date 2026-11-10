import React, { useState, useEffect, useMemo } from 'react';
import {
  Listing,
  loadListingsData,
  computeComparableStats,
  computeAllNeighbourhood1BedComparables,
  ComparableStats,
} from './services/dataService';
import { Header } from './components/Header';
import { InputsBar } from './components/InputsBar';
import { RecommendationCard } from './components/RecommendationCard';
import { PricingStrategySelector } from './components/PricingStrategySelector';
import { PriceHistogramChart } from './components/PriceHistogramChart';
import { NeighbourhoodBarChart } from './components/NeighbourhoodBarChart';
import { LicensedVsUnlicensedCard } from './components/LicensedVsUnlicensedCard';
import { WhereDidThisNumberComeFrom } from './components/WhereDidThisNumberComeFrom';
import { AskTheDataBox } from './components/AskTheDataBox';
import { DataNoteFooter } from './components/DataNoteFooter';
import { Loader2, RefreshCw, AlertCircle, Building2 } from 'lucide-react';

export default function App() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Preselected sample case mandated by user prompt:
  // "Union Station, Stanton Park, Kingman Park, 1 bedroom gives N = 221, 25th = 180.50, median = 211.00, 75th = 247.00. Preselect this neighbourhood as the sample case."
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string>(
    'Union Station, Stanton Park, Kingman Park'
  );
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [minNightsCap, setMinNightsCap] = useState<number>(30);

  // Load dataset on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await loadListingsData();
        setAllListings(data);
      } catch (err: any) {
        console.error('Failed to load dataset:', err);
        setError(err.message || 'Failed to load Inside Airbnb dataset');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Unique sorted list of neighbourhoods
  const neighbourhoods = useMemo(() => {
    const set = new Set(allListings.map((l) => l.neighbourhood_cleansed));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allListings]);

  // Available bedroom counts in data
  const availableBedrooms = useMemo(() => {
    const set = new Set(allListings.map((l) => l.bedrooms));
    return Array.from(set).sort((a, b) => a - b);
  }, [allListings]);

  // Compute stats and filtered comparables for the active selection
  const { stats, comparables } = useMemo(() => {
    if (allListings.length === 0) {
      return {
        stats: {
          neighbourhood: selectedNeighbourhood,
          bedrooms,
          minNightsCap,
          count: 0,
          p25: 0,
          median: 0,
          p75: 0,
          p99: 0,
          minPrice: 0,
          maxPrice: 0,
          isLowData: true,
          totalAreaEntireHomes: 0,
          excluded31PlusCount: 0,
          blankMinNightsCount: 0,
          totalExcludedByMinNights: 0,
          totalAreaBedroomCount: 0,
          licensedCount: 0,
          licensedMedianPrice: 0,
          licensedMedianRevenue: 0,
          unlicensedCount: 0,
          unlicensedMedianPrice: 0,
          unlicensedMedianRevenue: 0,
          commonPropertyTypes: [],
        } as ComparableStats,
        comparables: [] as Listing[],
      };
    }

    return computeComparableStats(allListings, selectedNeighbourhood, bedrooms, minNightsCap);
  }, [allListings, selectedNeighbourhood, bedrooms, minNightsCap]);

  // All-neighbourhood comparison for 1-bedroom comparables
  const allNeighbourhood1BedData = useMemo(() => {
    if (allListings.length === 0) return [];
    return computeAllNeighbourhood1BedComparables(allListings, 1, 30);
  }, [allListings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center mb-4 shadow-md">
          <Building2 className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>
        <h2 className="font-serif font-bold text-xl text-stone-900 mb-2">
          Capital Host Advisory
        </h2>
        <p className="text-xs text-stone-500 mb-4 font-mono">
          Loading Inside Airbnb Washington D.C. dataset (4,500+ records)...
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-stone-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-lg max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-serif font-bold text-lg text-stone-900 mb-1">
            Data Ingestion Error
          </h2>
          <p className="text-xs text-stone-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 flex flex-col antialiased selection:bg-amber-200 selection:text-stone-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Intro banner */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-stone-200/80 pb-4">
            <div>
              <span className="text-2xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
                District of Columbia Market Advisory
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-950">
                Short-Term Rental Pricing Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                Independent pricing benchmarks derived from real Inside Airbnb Washington D.C. records.
                Every figure is mathematically computed in code; Gemini provides grounded strategic context.
              </p>
            </div>

            <div className="flex items-center gap-2 text-2xs font-mono text-stone-500 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Verified Dataset: {allListings.length.toLocaleString()} total DC listings</span>
            </div>
          </div>
        </div>

        {/* 1. Filter Controls & Active Comparable Rule */}
        <InputsBar
          neighbourhoods={neighbourhoods}
          selectedNeighbourhood={selectedNeighbourhood}
          onSelectNeighbourhood={setSelectedNeighbourhood}
          bedrooms={bedrooms}
          onSelectBedrooms={setBedrooms}
          minNightsCap={minNightsCap}
          onSelectMinNightsCap={setMinNightsCap}
          availableBedrooms={availableBedrooms.length > 0 ? availableBedrooms : [0, 1, 2, 3, 4]}
        />

        {/* 2 & 7. Recommendation Card (Median, 25th-75th, N, Low-Data Warning) */}
        <RecommendationCard stats={stats} />

        {/* 6. Pricing Strategy Selector (Budget, Market, Premium + Gemini Explanation) */}
        <PricingStrategySelector stats={stats} />

        {/* 3. Price Distribution Histogram */}
        <PriceHistogramChart comparables={comparables} stats={stats} />

        {/* 8. Licensed vs Unlicensed Comparison Card */}
        <LicensedVsUnlicensedCard stats={stats} />

        {/* 4. Neighbourhood Comparison Bar Chart */}
        <NeighbourhoodBarChart
          neighbourhoodData={allNeighbourhood1BedData}
          selectedNeighbourhood={selectedNeighbourhood}
          onSelectNeighbourhood={setSelectedNeighbourhood}
        />

        {/* 5. "Where did this number come from?" Panel */}
        <WhereDidThisNumberComeFrom stats={stats} comparables={comparables} />

        {/* 9. Ask-the-Data Box */}
        <AskTheDataBox stats={stats} comparables={comparables} />

        {/* 10. Data Note Footer */}
        <DataNoteFooter stats={stats} />
      </main>
    </div>
  );
}
