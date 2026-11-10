import React from 'react';
import { ComparableStats } from '../services/dataService';
import { ShieldCheck, ShieldAlert, Info, Landmark } from 'lucide-react';

interface LicensedVsUnlicensedCardProps {
  stats: ComparableStats;
}

export const LicensedVsUnlicensedCard: React.FC<LicensedVsUnlicensedCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Licensed vs. Unlicensed Market Performance
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            D.C. short-term rental compliance comparison for comparables with{' '}
            <code className="text-2xs bg-stone-100 px-1 py-0.5 rounded font-mono">has_license = True</code> vs{' '}
            <code className="text-2xs bg-stone-100 px-1 py-0.5 rounded font-mono">False</code>.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-2xs font-medium self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Revenue is an Inside Airbnb estimate</span>
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
                  <span className="text-3xs text-emerald-800/80">DC DLCP registered</span>
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

                {/* Median Estimated Annual Revenue */}
                <div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 shadow-2xs min-w-0 overflow-hidden">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1 truncate">
                    Median Est. Annual Revenue
                  </span>
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-800 tracking-tight truncate">
                      ${Math.round(stats.licensedMedianRevenue).toLocaleString()}
                    </span>
                    <span className="text-3xs text-emerald-700/70 font-medium shrink-0">/ yr</span>
                  </div>
                  <span className="text-3xs text-stone-400 block mt-1 truncate">Inside Airbnb estimate</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500 italic bg-white/60 rounded-lg border border-dashed border-emerald-200 my-2">
                No licensed listings found in this specific filter slice.
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-200/60 text-2xs text-emerald-800/80 leading-relaxed">
            Fully compliant with the District of Columbia Short-Term Rental Regulation Act (DLCP licensed).
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
                  <span className="text-3xs text-stone-500">No license on record</span>
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

                {/* Median Estimated Annual Revenue */}
                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0 overflow-hidden">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1 truncate">
                    Median Est. Annual Revenue
                  </span>
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-800 tracking-tight truncate">
                      ${Math.round(stats.unlicensedMedianRevenue).toLocaleString()}
                    </span>
                    <span className="text-3xs text-stone-500 font-medium shrink-0">/ yr</span>
                  </div>
                  <span className="text-3xs text-stone-400 block mt-1 truncate">Inside Airbnb estimate</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-600 bg-white/70 rounded-lg border border-dashed border-stone-200 my-2 px-4">
                <span className="font-semibold text-stone-800">100% Licensed Comps</span>
                <p className="text-2xs text-stone-500 mt-1">
                  0 unlicensed listings in this comparable slice. All {stats.count} qualified listings hold a valid license number.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-200 text-2xs text-stone-500 leading-relaxed">
            Note: Listings without a verified license risk platform de-listing and D.C. regulatory enforcement fines.
          </div>
        </div>
      </div>
    </div>
  );
};
