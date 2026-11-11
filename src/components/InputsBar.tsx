import React from 'react';
import { Filter, Info, MapPin, BedDouble, Moon } from 'lucide-react';

interface InputsBarProps {
  neighbourhoods: string[];
  selectedNeighbourhood: string;
  onSelectNeighbourhood: (n: string) => void;
  bedrooms: number;
  onSelectBedrooms: (b: number) => void;
  minNightsCap: number;
  onSelectMinNightsCap: (m: number) => void;
  availableBedrooms: number[];
}

export const InputsBar: React.FC<InputsBarProps> = ({
  neighbourhoods,
  selectedNeighbourhood,
  onSelectNeighbourhood,
  bedrooms,
  onSelectBedrooms,
  minNightsCap,
  onSelectMinNightsCap,
  availableBedrooms,
}) => {
  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 backdrop-blur-md">
      {/* Inputs row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        {/* Neighbourhood Dropdown */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-violet-400" />
            D.C. Neighbourhood
          </label>
          <div className="relative">
            <select
              value={selectedNeighbourhood}
              onChange={(e) => onSelectNeighbourhood(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:border-violet-500/60 focus:bg-[#12111d] transition-all duration-150 cursor-pointer"
            >
              {neighbourhoods.map((n) => (
                <option key={n} value={n} className="bg-[#12111d] text-zinc-100">
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bedrooms selector */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-violet-400" />
            Bedrooms
          </label>
          <div className="grid grid-cols-5 gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/10">
            {availableBedrooms.slice(0, 5).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onSelectBedrooms(b)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  bedrooms === b
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                {b === 0 ? 'Studio' : `${b} BR`}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum-nights cap */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-violet-400" />
              Min. Nights Cap
            </span>
            <span className="text-zinc-500 font-normal">Default: 30</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="365"
              value={minNightsCap}
              onChange={(e) => onSelectMinNightsCap(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 bg-white/[0.05] border border-white/10 rounded-xl py-2 px-3 text-sm font-semibold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:border-violet-500/60 focus:bg-[#12111d] text-center transition-all duration-150 tabular-numbers"
            />
            <div className="flex gap-1">
              {[7, 30, 90].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => onSelectMinNightsCap(quick)}
                  className={`text-xs px-2.5 py-2 rounded-lg font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    minNightsCap === quick
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500/50 shadow-md shadow-violet-900/40'
                      : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:bg-white/[0.08] hover:text-zinc-200'
                  }`}
                >
                  {quick}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Rule Banner */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-start gap-3 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-zinc-100">Active Comparable Rule:</span>{' '}
          A comparable is a listing with neighbourhood ={' '}
          <span className="font-semibold text-violet-300">&quot;{selectedNeighbourhood}&quot;</span>,{' '}
          bedrooms = <span className="font-semibold text-violet-300">{bedrooms === 0 ? '0 (Studio)' : bedrooms}</span>, room type ={' '}
          <span className="font-semibold text-violet-300">&quot;Entire home/apt&quot;</span>, and minimum nights &le;{' '}
          <span className="font-semibold text-violet-300">{minNightsCap}</span>. Recommended nightly price is the exact median of these comparables (with 25th &amp; 75th percentiles computed via linear interpolation).
        </div>
      </div>
    </div>
  );
};
