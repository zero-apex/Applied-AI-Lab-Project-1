import React, { useState } from 'react';
import { NeighbourhoodMedian } from '../services/dataService';
import { Building, EyeOff, Eye, AlertCircle, Check } from 'lucide-react';

interface NeighbourhoodBarChartProps {
  neighbourhoodData: NeighbourhoodMedian[];
  selectedNeighbourhood: string;
  onSelectNeighbourhood: (n: string) => void;
}

export const NeighbourhoodBarChart: React.FC<NeighbourhoodBarChartProps> = ({
  neighbourhoodData,
  selectedNeighbourhood,
  onSelectNeighbourhood,
}) => {
  const [hideLowData, setHideLowData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = neighbourhoodData
    .filter((item) => (hideLowData ? !item.isLowData : true))
    .filter((item) => item.neighbourhood.toLowerCase().includes(searchTerm.toLowerCase()));

  const maxMedianPrice = Math.max(...neighbourhoodData.map((d) => d.medianPrice), 300);

  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">
              D.C. Neighbourhood Price Comparison (1-Bedroom Comps)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Median 1-bedroom entire home comparable price per neighbourhood. Click any row to switch active area.
          </p>
        </div>

        {/* Controls: Search & Toggle Hide N < 20 */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search neighbourhoods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:border-violet-500/60 w-44 transition-all duration-150"
          />

          <button
            type="button"
            onClick={() => setHideLowData(!hideLowData)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              hideLowData
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 font-semibold'
                : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08]'
            }`}
          >
            {hideLowData ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
            {hideLowData ? 'Hiding N < 20' : 'Flagging N < 20'}
          </button>
        </div>
      </div>

      {/* Axis Unit Label */}
      <div className="flex items-center justify-between text-2xs text-zinc-400 font-mono pb-2.5 border-b border-white/10 mb-2 px-1">
        <span>Neighbourhood &amp; Sample Size</span>
        <span>Median Nightly Price ($ USD) &amp; Range</span>
      </div>

      {/* Scrollable Bar List */}
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-400">
            No neighbourhoods match your filter criteria.
          </div>
        ) : (
          filteredData.map((item) => {
            const isSelected = item.neighbourhood === selectedNeighbourhood;
            const barWidthPercent = Math.min(100, Math.max(2, (item.medianPrice / maxMedianPrice) * 100));

            return (
              <div
                key={item.neighbourhood}
                onClick={() => onSelectNeighbourhood(item.neighbourhood)}
                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-950/70 via-violet-900/40 to-indigo-950/70 text-white border-violet-500/70 shadow-lg shadow-violet-950/40 ring-1 ring-violet-500/40'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] text-zinc-200 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                    )}
                    <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {item.neighbourhood}
                    </span>
                    {item.isLowData ? (
                      <span
                        className={`text-3xs px-1.5 py-0.5 rounded-md font-mono shrink-0 flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                        title="Fewer than 20 comparables available"
                      >
                        <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                        N={item.count} &lt; 20
                      </span>
                    ) : (
                      <span
                        className={`text-3xs px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                          isSelected ? 'bg-violet-500/30 text-violet-200' : 'bg-white/[0.06] text-zinc-400'
                        }`}
                      >
                        N={item.count}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 text-right shrink-0">
                    <span
                      className={`font-bold text-sm tabular-numbers ${
                        isSelected ? 'text-violet-300' : 'text-zinc-100'
                      }`}
                    >
                      ${item.medianPrice > 0 ? item.medianPrice.toFixed(2) : '—'}
                    </span>
                    <span className={`text-3xs ${isSelected ? 'text-violet-300/80' : 'text-zinc-400'}`}>
                      / nt
                    </span>
                  </div>
                </div>

                {/* Bar representation */}
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isSelected ? 'bg-black/40' : 'bg-white/[0.06]'
                  }`}
                >
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-400'
                        : item.isLowData
                        ? 'bg-amber-500/70'
                        : 'bg-violet-600/70'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          Highlighted: Current selection ({selectedNeighbourhood})
        </span>
        <span>
          Showing {filteredData.length} of {neighbourhoodData.length} neighbourhoods
        </span>
      </div>
    </div>
  );
};
