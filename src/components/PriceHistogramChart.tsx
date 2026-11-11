import React, { useState, useRef, useEffect } from 'react';
import { ComparableStats, generatePriceHistogram, Listing } from '../services/dataService';
import { BarChart3, Info } from 'lucide-react';

interface PriceHistogramChartProps {
  comparables: Listing[];
  stats: ComparableStats;
}

export const PriceHistogramChart: React.FC<PriceHistogramChartProps> = ({ comparables, stats }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<'p25' | 'median' | 'p75' | null>(null);

  // Measure container width so SVG text uses fixed pixel sizes without scaling/distortion
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

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

  // Fixed SVG height and layout metrics
  const svgHeight = 340;
  const padding = { top: 35, right: 35, bottom: 65, left: 80 };
  const plotWidth = Math.max(280, containerWidth - padding.left - padding.right);
  const plotHeight = svgHeight - padding.top - padding.bottom; // 240px

  // Leave at least 40px of empty space between top of tallest bar and top of plot area
  const emptyHeadroom = 45; // 45px >= 40px
  const maxBarHeight = plotHeight - emptyHeadroom; // 195px

  // X coordinate calculation
  const minBinStart = bins[0].binStart;
  const maxBinEnd = bins[bins.length - 1].binEnd;
  const xSpan = Math.max(1, maxBinEnd - minBinStart);

  const getXForValue = (val: number) => {
    const clamped = Math.min(Math.max(val, minBinStart), maxBinEnd);
    return padding.left + ((clamped - minBinStart) / xSpan) * plotWidth;
  };

  const x25 = getXForValue(stats.p25);
  const xMedian = getXForValue(stats.median);
  const x75 = getXForValue(stats.p75);

  // Select at most 8 evenly spaced X-axis labels with 0 rotation to avoid overlap
  const labelStep = bins.length > 8 ? Math.ceil(bins.length / 7) : 1;

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
          <p className="text-xs text-stone-500 mt-0.5 font-sans">
            Histogram of {stats.count} comparable listings. X-axis is capped at the 99th percentile (${stats.p99.toFixed(2)}) to prevent outlier compression.
          </p>
        </div>

        {/* Legend with distinct line styles */}
        <div className="flex items-center gap-3 text-xs bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 flex-wrap font-sans">
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" className="overflow-visible">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 3" />
            </svg>
            <span className="text-stone-700 font-medium">25th (${stats.p25.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" className="overflow-visible">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#ea580c" strokeWidth="2.5" />
            </svg>
            <span className="text-stone-900 font-bold">Median (${stats.median.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" className="overflow-visible">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#9333ea" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
            <span className="text-stone-700 font-medium">75th (${stats.p75.toFixed(2)})</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          width={containerWidth}
          height={svgHeight}
          className="overflow-visible font-sans"
        >
          {/* Y-axis gridlines & labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const countVal = Math.round(maxCount * ratio);
            const y = padding.top + plotHeight - (ratio * maxBarHeight);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#78716c"
                  fontSize="12px"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {countVal}
                </text>
              </g>
            );
          })}

          {/* Y-axis Title: sits outside tick labels with >12px clearance */}
          <text
            x={-(padding.top + plotHeight / 2)}
            y={22}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#57534e"
            fontSize="13px"
            fontWeight="500"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Number of Listings (Count)
          </text>

          {/* Histogram Bars */}
          {bins.map((bin, idx) => {
            const barW = Math.max(4, plotWidth / bins.length - 4);
            const barH = (bin.count / maxCount) * maxBarHeight;
            const x = padding.left + idx * (plotWidth / bins.length) + 2;
            const y = padding.top + plotHeight - barH;
            const isHovered = hoveredBin === idx;

            // Bar count labels: put above each bar, hide if bar is too short (< 14px)
            const showCountLabel = bin.count > 0 && barH >= 14;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredBin(idx)}
                onMouseLeave={() => setHoveredBin(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 0)}
                  fill={bin.isOutlierBucket ? '#d6d3d1' : isHovered ? '#1c1917' : '#78716c'}
                  rx="3"
                />

                {/* Bar count above each bar */}
                {showCountLabel && (
                  <text
                    x={x + barW / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill="#1c1917"
                    fontSize="11px"
                    fontWeight="600"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {bin.count}
                  </text>
                )}

                {/* X-axis tick label: at most 8 evenly spaced labels, no rotation, no overlap */}
                {idx % labelStep === 0 && (
                  <g>
                    <line
                      x1={x + barW / 2}
                      y1={padding.top + plotHeight}
                      x2={x + barW / 2}
                      y2={padding.top + plotHeight + 5}
                      stroke="#d6d3d1"
                      strokeWidth="1"
                    />
                    <text
                      x={x + barW / 2}
                      y={padding.top + plotHeight + 20}
                      textAnchor="middle"
                      fill="#57534e"
                      fontSize="12px"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      {bin.isOutlierBucket ? `>$${Math.round(p99Cap)}` : `$${Math.round(bin.binStart)}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Plot Area Baseline */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#a8a29e"
            strokeWidth="1.25"
          />

          {/* Percentile Line 1: 25th percentile (dashed blue, marker at top, no floating text) */}
          <g
            onMouseEnter={() => setHoveredMarker('p25')}
            onMouseLeave={() => setHoveredMarker(null)}
            className="cursor-pointer"
          >
            <line
              x1={x25}
              y1={padding.top}
              x2={x25}
              y2={padding.top + plotHeight}
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            {/* Small marker dot at top only */}
            <circle cx={x25} cy={padding.top} r="4" fill="#2563eb" />
          </g>

          {/* Percentile Line 2: 75th percentile (dashed purple, marker at top, no floating text) */}
          <g
            onMouseEnter={() => setHoveredMarker('p75')}
            onMouseLeave={() => setHoveredMarker(null)}
            className="cursor-pointer"
          >
            <line
              x1={x75}
              y1={padding.top}
              x2={x75}
              y2={padding.top + plotHeight}
              stroke="#9333ea"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            {/* Small marker dot at top only */}
            <circle cx={x75} cy={padding.top} r="4" fill="#9333ea" />
          </g>

          {/* Percentile Line 3: Median (solid orange, marker at top, no floating text) */}
          <g
            onMouseEnter={() => setHoveredMarker('median')}
            onMouseLeave={() => setHoveredMarker(null)}
            className="cursor-pointer"
          >
            <line
              x1={xMedian}
              y1={padding.top}
              x2={xMedian}
              y2={padding.top + plotHeight}
              stroke="#ea580c"
              strokeWidth="2.5"
            />
            {/* Small marker dot at top only */}
            <circle cx={xMedian} cy={padding.top} r="4.5" fill="#ea580c" />
          </g>

          {/* X-axis Title: sits outside tick labels with >12px clearance */}
          <text
            x={padding.left + plotWidth / 2}
            y={padding.top + plotHeight + 48}
            textAnchor="middle"
            fill="#44403c"
            fontSize="13px"
            fontWeight="500"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Nightly Asking Price ($ USD / night)
          </text>
        </svg>

        {/* Hover Tooltip for Percentile Markers */}
        {hoveredMarker !== null && (
          <div
            className="absolute top-2 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md border border-stone-700 pointer-events-none font-sans z-20"
            style={{
              left: hoveredMarker === 'p25' ? `${x25}px` : hoveredMarker === 'median' ? `${xMedian}px` : `${x75}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {hoveredMarker === 'p25' && <span>25th Percentile: <strong>${stats.p25.toFixed(2)}</strong></span>}
            {hoveredMarker === 'median' && <span>Median (Recommended): <strong>${stats.median.toFixed(2)}</strong></span>}
            {hoveredMarker === 'p75' && <span>75th Percentile: <strong>${stats.p75.toFixed(2)}</strong></span>}
          </div>
        )}

        {/* Hover Tooltip for Bars */}
        {hoveredBin !== null && bins[hoveredBin] && (
          <div className="absolute top-2 right-4 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md border border-stone-700 pointer-events-none font-sans z-20">
            <span className="font-semibold">{bins[hoveredBin].label}:</span>{' '}
            <span className="text-amber-300 font-bold">{bins[hoveredBin].count}</span> listings (
            {((bins[hoveredBin].count / stats.count) * 100).toFixed(1)}%)
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100 flex-wrap gap-2 font-sans">
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
