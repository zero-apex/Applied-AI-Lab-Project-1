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
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              D.C. Neighbourhood Price Comparison (1-Bedroom Comps)
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
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
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600 w-44"
          />

          <button
            type="button"
            onClick={() => setHideLowData(!hideLowData)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              hideLowData
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {hideLowData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {hideLowData ? 'Hiding N < 20' : 'Flagging N < 20'}
          </button>
        </div>
      </div>

      {/* Axis Unit Label */}
      <div className="flex items-center justify-between text-2xs text-stone-400 font-mono pb-2 border-b border-stone-100 mb-2 px-1">
        <span>Neighbourhood &amp; Sample Size</span>
        <span>Median Nightly Price ($ USD) &amp; Range</span>
      </div>

      {/* Scrollable Bar List */}
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-500">
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
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50/70 hover:bg-stone-100/90 text-stone-800 border-stone-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                    <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {item.neighbourhood}
                    </span>
                    {item.isLowData ? (
                      <span
                        className={`text-3xs px-1.5 py-0.5 rounded font-mono shrink-0 flex items-center gap-0.5 ${
                          isSelected
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title="Fewer than 20 comparables available"
                      >
                        <AlertCircle className="w-2.5 h-2.5" />
                        N={item.count} &lt; 20
                      </span>
                    ) : (
                      <span
                        className={`text-3xs px-1.5 py-0.5 rounded font-mono shrink-0 ${
                          isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        N={item.count}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 text-right shrink-0">
                    <span
                      className={`font-serif font-bold text-sm ${
                        isSelected ? 'text-amber-300' : 'text-stone-900'
                      }`}
                    >
                      ${item.medianPrice > 0 ? item.medianPrice.toFixed(2) : '—'}
                    </span>
                    <span className={`text-3xs ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                      / nt
                    </span>
                  </div>
                </div>

                {/* Bar representation */}
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isSelected ? 'bg-stone-800' : 'bg-stone-200'
                  }`}
                >
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                        : item.isLowData
                        ? 'bg-amber-400/70'
                        : 'bg-stone-600'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-2xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Highlighted: Current selection ({selectedNeighbourhood})
        </span>
        <span>
          Showing {filteredData.length} of {neighbourhoodData.length} neighbourhoods
        </span>
      </div>
    </div>
  );
};
