import React from 'react';
import { ComparableStats } from '../services/dataService';
import { DollarSign, AlertTriangle, Layers, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  stats: ComparableStats;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ stats }) => {
  return (
    <div className="mb-6">
      {/* Low-data warning if N < 20 */}
      {stats.isLowData && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Low-Data Warning: Only {stats.count} Comparable{stats.count === 1 ? '' : 's'} Found (N &lt; 20)
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              With fewer than 20 comparables, percentiles may be sensitive to single-listing outliers.
              Consider widening your minimum-nights cap (e.g., from {stats.minNightsCap} to 60 or 90 days)
              or reviewing adjacent neighbourhoods in the comparison chart below for greater statistical confidence.
            </p>
          </div>
        </div>
      )}

      {/* Main KPI Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-6 md:p-8 shadow-md border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Recommended Rate */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Recommended Nightly Price
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
                ${stats.median.toFixed(2)}
              </span>
              <span className="text-stone-300 text-base font-medium">/ night (USD)</span>
            </div>

            <p className="text-stone-300 text-sm leading-relaxed max-w-xl">
              Strictly computed as the <strong className="text-white font-semibold">median price</strong> of{' '}
              <strong className="text-white font-semibold">{stats.count} verified comparables</strong> in{' '}
              <span className="text-amber-200">{stats.neighbourhood}</span> for a{' '}
              {stats.bedrooms === 0 ? 'Studio' : `${stats.bedrooms}-bedroom`} entire property with minimum stay &le;{' '}
              {stats.minNightsCap} nights.
            </p>
          </div>

          {/* Core Percentile Range & N Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 bg-stone-800/80 p-4 rounded-xl border border-stone-700/60 backdrop-blur-xs">
            {/* 25th Percentile */}
            <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-700/50">
              <span className="text-2xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                25th Percentile
              </span>
              <div className="text-2xl font-serif font-bold text-stone-100">
                ${stats.p25.toFixed(2)}
              </div>
              <span className="text-2xs text-stone-400">Budget tier entry</span>
            </div>

            {/* 75th Percentile */}
            <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-700/50">
              <span className="text-2xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                75th Percentile
              </span>
              <div className="text-2xl font-serif font-bold text-amber-300">
                ${stats.p75.toFixed(2)}
              </div>
              <span className="text-2xs text-stone-400">Premium tier</span>
            </div>

            {/* Interquartile Range */}
            <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-700/50">
              <span className="text-2xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                25th–75th Range
              </span>
              <div className="text-base font-serif font-bold text-white">
                ${stats.p25.toFixed(2)} – ${stats.p75.toFixed(2)}
              </div>
              <span className="text-2xs text-stone-400">Mid-50% spread</span>
            </div>

            {/* Sample Size N */}
            <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-700/50">
              <span className="text-2xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                Sample Size (N)
              </span>
              <div className="text-2xl font-serif font-bold text-white flex items-center gap-1.5">
                {stats.count}
                <span className="text-xs font-sans font-normal text-stone-400">listings</span>
              </div>
              <span className={`text-2xs ${stats.isLowData ? 'text-amber-400 font-semibold' : 'text-emerald-400'}`}>
                {stats.isLowData ? 'N < 20 (Limited)' : 'Robust sample'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
