import React from 'react';
import { ComparableStats } from '../services/dataService';
import { ShieldCheck, ShieldAlert, Landmark } from 'lucide-react';

interface LicensedVsUnlicensedCardProps {
  stats: ComparableStats;
}

export const LicensedVsUnlicensedCard: React.FC<LicensedVsUnlicensedCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 sm:p-6 mb-6">
      {/* Header with strictly computed text only */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Licensed vs. Unlicensed Market Performance
            </h3>
          </div>
          {/* Replaced panel explanation with computed text only */}
          <p className="text-xs font-semibold text-stone-700 mt-1 font-mono">
            {stats.licensedCount} of {stats.count} comparables have has_license = True.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Licensed Card */}
        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <span className="font-bold text-sm text-stone-900 block leading-tight">
                    Licensed Listings
                  </span>
                  <span className="text-3xs text-stone-500 font-mono">has_license = True</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                N = {stats.licensedCount}
              </span>
            </div>

            {stats.licensedCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                {/* Median Nightly Price */}
                <div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 shadow-2xs min-w-0 overflow-hidden">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1 truncate">
                    Median Nightly Price
                  </span>
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight truncate">
                      ${stats.licensedMedianPrice.toFixed(2)}
                    </span>
                    <span className="text-3xs text-stone-400 font-medium shrink-0">/ night</span>
                  </div>
                  <span className="text-3xs text-stone-400 block mt-1">Based on asking prices</span>
                </div>

                {/* Revenue Card labeled exactly as requested */}
                <div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 shadow-2xs min-w-0 overflow-hidden">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-600 block mb-1 leading-tight">
                    Median estimated annual revenue across all {stats.count} comparables (Inside Airbnb estimate)
                  </span>
                  <div className="flex items-baseline gap-1 min-w-0 mt-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-800 tracking-tight truncate">
                      ${Math.round(stats.comparablesMedianRevenue).toLocaleString()}
                    </span>
                    <span className="text-3xs text-emerald-700/70 font-medium shrink-0">/ yr</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500 italic bg-white/60 rounded-lg border border-dashed border-emerald-200 my-2">
                No licensed listings found in this specific filter slice.
              </div>
            )}
          </div>
        </div>

        {/* Unlicensed Card */}
        <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/70 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldAlert className="w-4 h-4 text-stone-600" />
                </div>
                <div>
                  <span className="font-bold text-sm text-stone-900 block leading-tight">
                    Unlicensed Listings
                  </span>
                  <span className="text-3xs text-stone-500 font-mono">has_license = False</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-stone-200 text-stone-700 border border-stone-300 shadow-2xs">
                N = {stats.unlicensedCount}
              </span>
            </div>

            {stats.unlicensedCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                {/* Median Nightly Price */}
                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0 overflow-hidden">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1 truncate">
                    Median Nightly Price
                  </span>
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight truncate">
                      ${stats.unlicensedMedianPrice.toFixed(2)}
                    </span>
                    <span className="text-3xs text-stone-400 font-medium shrink-0">/ night</span>
                  </div>
                  <span className="text-3xs text-stone-400 block mt-1">Based on asking prices</span>
                </div>

                {/* Revenue Card labeled exactly as requested */}
                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0 overflow-hidden">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-600 block mb-1 leading-tight">
                    Median estimated annual revenue across all {stats.count} comparables (Inside Airbnb estimate)
                  </span>
                  <div className="flex items-baseline gap-1 min-w-0 mt-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-800 tracking-tight truncate">
                      ${Math.round(stats.unlicensedMedianRevenue).toLocaleString()}
                    </span>
                    <span className="text-3xs text-stone-500 font-medium shrink-0">/ yr</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-600 bg-white/70 rounded-lg border border-dashed border-stone-200 my-2 px-4">
                <span className="font-semibold text-stone-800">0 Unlicensed Comparables</span>
                <p className="text-2xs text-stone-500 mt-1 font-mono">
                  {stats.licensedCount} of {stats.count} comparables have has_license = True.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note computed from the full dataset as requested */}
      <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-700 leading-relaxed bg-stone-50/80 p-3 rounded-lg border border-stone-200">
        In this dataset, {stats.totalDatasetUnlicensedCount} listings have no license, and all of them require a minimum stay of 31 or more nights, so they are excluded by the comparable rule.
      </div>
    </div>
  );
};
