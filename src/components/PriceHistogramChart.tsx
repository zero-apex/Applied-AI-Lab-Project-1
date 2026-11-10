import React, { useState } from 'react';
import { ComparableStats, generatePriceHistogram, Listing } from '../services/dataService';
import { BarChart3, Info } from 'lucide-react';

interface PriceHistogramChartProps {
  comparables: Listing[];
  stats: ComparableStats;
}

export const PriceHistogramChart: React.FC<PriceHistogramChartProps> = ({ comparables, stats }) => {
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);

  const prices = comparables.map((c) => c.price);
  const { bins, p99Cap } = generatePriceHistogram(prices, stats.p99, 14);

  if (bins.length === 0 || comparables.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-6 text-center text-stone-500">
        No price distribution available for the selected filters.
      </div>
    );
  }

  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  // SVG dimensions with generous headroom to completely prevent label overlap
  const svgWidth = 900;
  const svgHeight = 320;
  const padding = { top: 72, right: 35, bottom: 55, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // X coordinate calculation
  const minBinStart = bins[0].binStart;
  const maxBinEnd = bins[bins.length - 1].binEnd;
  const xSpan = Math.max(1, maxBinEnd - minBinStart);

  const getXForValue = (val: number) => {
    const clamped = Math.min(Math.max(val, minBinStart), maxBinEnd);
    return padding.left + ((clamped - minBinStart) / xSpan) * chartWidth;
  };

  const x25 = getXForValue(stats.p25);
  const xMedian = getXForValue(stats.median);
  const x75 = getXForValue(stats.p75);

  // Calculate non-overlapping vertical tiers for percentile badges
  // Tier 1 (top): Median (Recommended)
  const medianBadgeY = 16;
  // Tier 2 & 3: 25th & 75th percentiles. If 25th and 75th are close horizontally, stagger them vertically.
  const isP25AndP75Close = Math.abs(x75 - x25) < 95;
  const p25BadgeY = 42;
  const p75BadgeY = isP25AndP75Close ? 58 : 42;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Price Distribution of Comparables
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Histogram of {stats.count} comparable listings. X-axis is capped at the 99th percentile (${stats.p99.toFixed(2)}) to prevent outlier compression.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-500 rounded-sm inline-block" />
            <span className="text-stone-700 font-medium">25th (${stats.p25.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-sm inline-block" />
            <span className="text-stone-900 font-bold">Median (${stats.median.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-purple-500 rounded-sm inline-block" />
            <span className="text-stone-700 font-medium">75th (${stats.p75.toFixed(2)})</span>
          </div>
        </div>
      </div>

      {/* SVG Histogram */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minWidth: '600px' }}
        >
          {/* Y-axis gridlines & labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const countVal = Math.round(maxCount * ratio);
            const y = padding.top + chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-3xs fill-stone-400 font-mono"
                >
                  {countVal}
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={-(padding.top + chartHeight / 2)}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs fill-stone-500 font-medium tracking-wide"
          >
            Number of Listings (Count)
          </text>

          {/* Bars */}
          {bins.map((bin, idx) => {
            const barW = Math.max(3, chartWidth / bins.length - 4);
            const barH = (bin.count / maxCount) * chartHeight;
            const x = padding.left + idx * (chartWidth / bins.length) + 2;
            const y = padding.top + chartHeight - barH;
            const isHovered = hoveredBin === idx;

            // Decide whether to show bar count on top or inside without colliding
            const showCountAbove = bin.count > 0 && barH < 30;
            const showCountInside = bin.count > 0 && barH >= 30;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredBin(idx)}
                onMouseLeave={() => setHoveredBin(null)}
                className="cursor-pointer transition-opacity"
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 0)}
                  fill={bin.isOutlierBucket ? '#d6d3d1' : isHovered ? '#1c1917' : '#78716c'}
                  rx="3"
                  className="transition-colors duration-150"
                />

                {/* Count above the bar */}
                {showCountAbove && (
                  <text
                    x={x + barW / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-3xs fill-stone-700 font-mono font-bold"
                  >
                    {bin.count}
                  </text>
                )}

                {/* Count inside the bar */}
                {showCountInside && (
                  <text
                    x={x + barW / 2}
                    y={y + 14}
                    textAnchor="middle"
                    className="text-3xs fill-white font-mono font-bold"
                  >
                    {bin.count}
                  </text>
                )}

                {/* X-axis tick labels */}
                <text
                  x={x + barW / 2}
                  y={padding.top + chartHeight + 18}
                  textAnchor="middle"
                  className="text-3xs fill-stone-500 font-mono"
                >
                  {bin.isOutlierBucket ? `>$${Math.round(p99Cap)}` : `$${Math.round(bin.binStart)}`}
                </text>
              </g>
            );
          })}

          {/* Vertical marker: 25th percentile */}
          <line
            x1={x25}
            y1={p25BadgeY + 10}
            x2={x25}
            y2={padding.top + chartHeight}
            stroke="#3b82f6"
            strokeWidth="1.75"
            strokeDasharray="4 3"
          />
          {/* P25 Badge with background pill to avoid overlap */}
          <g transform={`translate(${x25}, ${p25BadgeY})`}>
            <rect
              x="-36"
              y="-10"
              width="72"
              height="18"
              rx="4"
              fill="#eff6ff"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              className="text-3xs fill-blue-700 font-bold font-mono"
            >
              25th ${stats.p25.toFixed(2)}
            </text>
          </g>

          {/* Vertical marker: 75th percentile */}
          <line
            x1={x75}
            y1={p75BadgeY + 10}
            x2={x75}
            y2={padding.top + chartHeight}
            stroke="#a855f7"
            strokeWidth="1.75"
            strokeDasharray="4 3"
          />
          {/* P75 Badge with background pill to avoid overlap */}
          <g transform={`translate(${x75}, ${p75BadgeY})`}>
            <rect
              x="-36"
              y="-10"
              width="72"
              height="18"
              rx="4"
              fill="#faf5ff"
              stroke="#a855f7"
              strokeWidth="1"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              className="text-3xs fill-purple-700 font-bold font-mono"
            >
              75th ${stats.p75.toFixed(2)}
            </text>
          </g>

          {/* Vertical marker: Median (Recommended) - Placed on elevated Tier 1 */}
          <line
            x1={xMedian}
            y1={medianBadgeY + 11}
            x2={xMedian}
            y2={padding.top + chartHeight}
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <circle cx={xMedian} cy={padding.top} r="3.5" fill="#f59e0b" />

          {/* Median Badge with elevated amber pill */}
          <g transform={`translate(${xMedian}, ${medianBadgeY})`}>
            <rect
              x="-48"
              y="-11"
              width="96"
              height="20"
              rx="5"
              fill="#fffbeb"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              className="text-3xs fill-amber-900 font-extrabold font-mono"
            >
              ★ Median ${stats.median.toFixed(2)}
            </text>
          </g>

          {/* X-axis unit title */}
          <text
            x={padding.left + chartWidth / 2}
            y={svgHeight - 12}
            textAnchor="middle"
            className="text-xs fill-stone-600 font-medium"
          >
            Nightly Asking Price ($ USD / night)
          </text>
        </svg>

        {/* Hover detail tooltip */}
        {hoveredBin !== null && bins[hoveredBin] && (
          <div className="absolute top-2 right-4 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md border border-stone-700 pointer-events-none">
            <span className="font-semibold">{bins[hoveredBin].label}:</span>{' '}
            <span className="text-amber-300 font-bold">{bins[hoveredBin].count}</span> listings (
            {((bins[hoveredBin].count / stats.count) * 100).toFixed(1)}%)
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-2xs text-stone-500 pt-3 border-t border-stone-100 flex-wrap gap-2">
        <span>Min Comps Price: ${stats.minPrice.toFixed(2)}</span>
        <span className="flex items-center gap-1 text-stone-600">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          Linear interpolation: 25th = ${stats.p25.toFixed(2)}, Median = ${stats.median.toFixed(2)}, 75th = ${stats.p75.toFixed(2)}
        </span>
        <span>99th Percentile Cap: ${stats.p99.toFixed(2)}</span>
      </div>
    </div>
  );
};
