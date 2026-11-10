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
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 mb-6">
      {/* Inputs row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Neighbourhood Dropdown */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            D.C. Neighbourhood
          </label>
          <div className="relative">
            <select
              value={selectedNeighbourhood}
              onChange={(e) => onSelectNeighbourhood(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg py-2.5 px-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:bg-white transition-all shadow-2xs"
            >
              {neighbourhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bedrooms selector */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-stone-500" />
            Bedrooms
          </label>
          <div className="grid grid-cols-5 gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
            {availableBedrooms.slice(0, 5).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onSelectBedrooms(b)}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  bedrooms === b
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-200'
                }`}
              >
                {b === 0 ? 'Studio' : `${b} BR`}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum-nights cap */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-stone-500" />
              Min. Nights Cap
            </span>
            <span className="text-stone-500 font-normal">Default: 30</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="365"
              value={minNightsCap}
              onChange={(e) => onSelectMinNightsCap(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 bg-stone-50 border border-stone-300 rounded-lg py-2 px-3 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:bg-white text-center"
            />
            <div className="flex gap-1">
              {[7, 30, 90].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => onSelectMinNightsCap(quick)}
                  className={`text-xs px-2.5 py-2 rounded-md font-medium border transition-colors ${
                    minNightsCap === quick
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
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
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-start gap-2.5 bg-stone-50/80 p-3 rounded-lg border border-stone-200">
        <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed">
          <span className="font-semibold text-stone-900">Active Comparable Rule:</span>{' '}
          A comparable is a listing with neighbourhood ={' '}
          <span className="font-semibold text-stone-900">&quot;{selectedNeighbourhood}&quot;</span>,{' '}
          bedrooms = <span className="font-semibold text-stone-900">{bedrooms === 0 ? '0 (Studio)' : bedrooms}</span>, room type ={' '}
          <span className="font-semibold text-stone-900">&quot;Entire home/apt&quot;</span>, and minimum nights &le;{' '}
          <span className="font-semibold text-stone-900">{minNightsCap}</span>. Recommended nightly price is the exact median of these comparables (with 25th &amp; 75th percentiles computed via linear interpolation).
        </div>
      </div>
    </div>
  );
};
