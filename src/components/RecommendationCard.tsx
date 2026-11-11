import React from 'react';
import { ComparableStats } from '../services/dataService';
import { DollarSign, AlertTriangle, Layers, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  stats: ComparableStats;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {/* Low-data warning if N < 20 */}
      {stats.isLowData && (
        <div className="bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded-r-2xl border-y border-r border-amber-400/20 flex items-start gap-3 shadow-lg shadow-black/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-200">
              Low-Data Warning: Only {stats.count} Comparable{stats.count === 1 ? '' : 's'} Found (N &lt; 20)
            </h4>
            <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
              With fewer than 20 comparables, percentiles may be sensitive to single-listing outliers.
              Consider widening your minimum-nights cap (e.g., from {stats.minNightsCap} to 60 or 90 days)
              or reviewing adjacent neighbourhoods in the comparison chart below for greater statistical confidence.
            </p>
          </div>
        </div>
      )}

      {/* Main KPI Card */}
      <div className="bg-white/[0.04] text-zinc-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/40 border border-white/10 relative overflow-hidden backdrop-blur-md">
        {/* Soft background ambient gradient */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Recommended Rate */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Recommended Nightly Price
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl sm:text-[56px] font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-violet-200 bg-clip-text text-transparent tabular-numbers leading-tight">
                ${stats.median.toFixed(2)}
              </span>
              <span className="text-zinc-400 text-base font-medium">/ night (USD)</span>
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed max-w-xl">
              Strictly computed as the <strong className="text-zinc-100 font-semibold">median price</strong> of{' '}
              <strong className="text-zinc-100 font-semibold">{stats.count} verified comparables</strong> in{' '}
              <span className="text-violet-300 font-medium">{stats.neighbourhood}</span> for a{' '}
              {stats.bedrooms === 0 ? 'Studio' : `${stats.bedrooms}-bedroom`} entire property with minimum stay &le;{' '}
              {stats.minNightsCap} nights.
            </p>
          </div>

          {/* Core Percentile Range & N Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-md">
            {/* 25th Percentile */}
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                25th Percentile
              </span>
              <div className="text-2xl font-bold text-zinc-100 tabular-numbers">
                ${stats.p25.toFixed(2)}
              </div>
              <span className="text-xs text-zinc-400">Budget tier entry</span>
            </div>

            {/* 75th Percentile */}
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                75th Percentile
              </span>
              <div className="text-2xl font-bold text-violet-300 tabular-numbers">
                ${stats.p75.toFixed(2)}
              </div>
              <span className="text-xs text-zinc-400">Premium tier</span>
            </div>

            {/* Interquartile Range */}
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                25th–75th Range
              </span>
              <div className="text-base font-bold text-zinc-100 tabular-numbers">
                ${stats.p25.toFixed(2)} – ${stats.p75.toFixed(2)}
              </div>
              <span className="text-xs text-zinc-400">Mid-50% spread</span>
            </div>

            {/* Sample Size N */}
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Sample Size (N)
              </span>
              <div className="text-2xl font-bold text-zinc-100 flex items-center gap-1.5 tabular-numbers">
                {stats.count}
                <span className="text-xs font-normal text-zinc-400">listings</span>
              </div>
              <span className={`text-xs ${stats.isLowData ? 'text-amber-400 font-semibold' : 'text-emerald-400'}`}>
                {stats.isLowData ? 'N < 20 (Limited)' : 'Robust sample'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
