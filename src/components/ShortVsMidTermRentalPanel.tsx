import React, { useState, useEffect, useRef } from 'react';
import { Listing, computeShortVsMidTermStats } from '../services/dataService';
import { CalendarRange, AlertTriangle, Info, ArrowRightLeft, DollarSign } from 'lucide-react';

interface ShortVsMidTermRentalPanelProps {
  allListings: Listing[];
  selectedNeighbourhood: string;
  bedrooms: number;
}

export const ShortVsMidTermRentalPanel: React.FC<ShortVsMidTermRentalPanelProps> = ({
  allListings,
  selectedNeighbourhood,
  bedrooms,
}) => {
  const stats = computeShortVsMidTermStats(allListings, selectedNeighbourhood, bedrooms);
  const { shortStay, midTerm, breakevenOccupancyPercent, breakevenNights } = stats;

  // Slider for expected short-stay occupancy (0 to 365 nights),
  // defaulting to the short-stay group's median estimated occupancy
  const defaultOccupancy = Math.min(365, Math.max(0, Math.round(shortStay.medianOccupancy) || 0));
  const [sliderOccupancy, setSliderOccupancy] = useState<number>(defaultOccupancy);

  // Sync default slider occupancy when neighbourhood or bedrooms change
  useEffect(() => {
    setSliderOccupancy(defaultOccupancy);
  }, [selectedNeighbourhood, bedrooms, defaultOccupancy]);

  // Annual revenues
  const shortStayAnnualRevenue = shortStay.medianPrice * sliderOccupancy;
  const midTermAnnualRevenue = midTerm.medianPrice * 365;

  const hasMidTerm = midTerm.count > 0;
  const eitherLowData = shortStay.isLowData || (hasMidTerm && midTerm.isLowData);

  // Measure chart container width so SVG text uses fixed pixel sizes without scaling
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartContainerWidth, setChartContainerWidth] = useState<number>(360);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateWidth = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth;
        if (w > 0) setChartContainerWidth(w);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(chartContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Small bar chart dimensions: at least 260px tall
  const chartSvgHeight = 270;
  const plotLeft = 75;
  const baselineY = 195;
  const plotTop = 35;
  const maxBarH = 135;
  const maxPrice = Math.max(shortStay.medianPrice, midTerm.medianPrice, 100) * 1.25;

  const availablePlotW = Math.max(180, chartContainerWidth - plotLeft - 25);
  const barW = Math.min(75, Math.max(50, availablePlotW * 0.28));
  const shortBarCenterX = plotLeft + availablePlotW * 0.32;
  const midBarCenterX = plotLeft + availablePlotW * 0.72;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 sm:p-6 mb-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Short-term vs. Mid-term Rental
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Comparing entire home/apt listings in {selectedNeighbourhood} ({bedrooms === 0 ? 'Studio' : `${bedrooms} BR`}):
            Short-stay (&le; 30 nights) vs. Mid-term (&ge; 31 nights).
          </p>
        </div>
      </div>

      {/* Low-data warning if either group has N < 20 */}
      {eitherLowData && (
        <div className="mb-5 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Low-Data Warning (N &lt; 20)
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {shortStay.isLowData && midTerm.isLowData
                ? `Both short-stay (N = ${shortStay.count}) and mid-term (N = ${midTerm.count}) groups have fewer than 20 listings.`
                : shortStay.isLowData
                ? `The short-stay group has only ${shortStay.count} listings (N < 20).`
                : `The mid-term group has only ${midTerm.count} listings (N < 20).`}
              {' '}Percentiles in small samples are sensitive to individual listings.
            </p>
          </div>
        </div>
      )}

      {/* Two Group Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Short-stay group */}
        <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-bold text-sm text-stone-900 block leading-tight">
                  Short-stay Group
                </span>
                <span className="text-3xs text-stone-500 font-mono">minimum_nights &le; 30</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 border border-stone-300">
                N = {shortStay.count}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
              {/* Median nightly price & 25th-75th range */}
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0">
                <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                  Median Nightly Price
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    ${shortStay.medianPrice.toFixed(2)}
                  </span>
                  <span className="text-3xs text-stone-400 font-medium">/ night</span>
                </div>
                <span className="text-3xs text-stone-500 block mt-1 font-mono">
                  25th–75th: ${shortStay.p25Price.toFixed(2)} – ${shortStay.p75Price.toFixed(2)}
                </span>
              </div>

              {/* Median estimated occupancy */}
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0">
                <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                  Median Estimated Occupancy
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {Math.round(shortStay.medianOccupancy)}
                  </span>
                  <span className="text-3xs text-stone-400 font-medium">nights / year</span>
                </div>
                <span className="text-3xs text-stone-400 block mt-1">
                  Inside Airbnb estimate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-term group */}
        <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-bold text-sm text-stone-900 block leading-tight">
                  Mid-term Group
                </span>
                <span className="text-3xs text-stone-500 font-mono">minimum_nights &ge; 31</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 border border-stone-300">
                N = {midTerm.count}
              </span>
            </div>

            {hasMidTerm ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                {/* Median nightly price & 25th-75th range */}
                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                    Median Nightly Price
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                      ${midTerm.medianPrice.toFixed(2)}
                    </span>
                    <span className="text-3xs text-stone-400 font-medium">/ night</span>
                  </div>
                  <span className="text-3xs text-stone-500 block mt-1 font-mono">
                    25th–75th: ${midTerm.p25Price.toFixed(2)} – ${midTerm.p75Price.toFixed(2)}
                  </span>
                </div>

                {/* Median estimated occupancy */}
                <div className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs min-w-0">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                    Median Estimated Occupancy
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                      {Math.round(midTerm.medianOccupancy)}
                    </span>
                    <span className="text-3xs text-stone-400 font-medium">nights / year</span>
                  </div>
                  <span className="text-3xs text-stone-400 block mt-1">
                    Inside Airbnb estimate
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-600 bg-white/70 rounded-lg border border-dashed border-stone-200 my-2 px-4">
                No mid-term comparables in this neighbourhood
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart & Break-even + Slider Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-start">
        {/* Small bar chart of the two median nightly prices */}
        <div className="lg:col-span-5 bg-stone-50/80 p-4 rounded-xl border border-stone-200">
          <h4 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider font-sans">
            Median Nightly Price Comparison
          </h4>

          <div ref={chartContainerRef} className="relative w-full overflow-hidden select-none">
            <svg
              width={chartContainerWidth}
              height={chartSvgHeight}
              className="overflow-visible font-sans"
            >
              {/* Y-axis gridlines & labels */}
              {[0, 0.5, 1].map((ratio) => {
                const priceVal = Math.round(maxPrice * ratio);
                const y = baselineY - ratio * maxBarH;
                return (
                  <g key={ratio}>
                    <line
                      x1={plotLeft}
                      y1={y}
                      x2={chartContainerWidth - 20}
                      y2={y}
                      stroke="#e7e5e4"
                      strokeDasharray={ratio === 0 ? undefined : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={plotLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#78716c"
                      fontSize="12px"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      ${priceVal}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis title: sits fully to the left of tick labels with >=12px clearance */}
              <text
                x={-(plotTop + maxBarH / 2)}
                y={18}
                transform="rotate(-90)"
                textAnchor="middle"
                fill="#57534e"
                fontSize="12px"
                fontWeight="500"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                $ per night
              </text>

              {/* Baseline axis line */}
              <line
                x1={plotLeft}
                y1={baselineY}
                x2={chartContainerWidth - 20}
                y2={baselineY}
                stroke="#a8a29e"
                strokeWidth="1.25"
              />

              {/* Bar 1: Short-stay */}
              {(() => {
                const barH = (shortStay.medianPrice / maxPrice) * maxBarH;
                const barX = shortBarCenterX - barW / 2;
                const barY = baselineY - barH;
                return (
                  <g>
                    <rect
                      x={barX}
                      y={barY}
                      width={barW}
                      height={Math.max(barH, 0)}
                      fill="#1c1917"
                      rx="3"
                    />
                    {/* Dollar value above bar with >= 6px space */}
                    <text
                      x={shortBarCenterX}
                      y={barY - 8}
                      textAnchor="middle"
                      fill="#1c1917"
                      fontSize="13px"
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                    >
                      ${shortStay.medianPrice.toFixed(2)}
                    </text>
                    {/* Category label: line 1, with >= 8px space below axis line */}
                    <text
                      x={shortBarCenterX}
                      y={baselineY + 20}
                      textAnchor="middle"
                      fill="#1c1917"
                      fontSize="13px"
                      fontWeight="600"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      Short-stay
                    </text>
                    {/* N label: line 2, with >= 8px space below category label */}
                    <text
                      x={shortBarCenterX}
                      y={baselineY + 40}
                      textAnchor="middle"
                      fill="#78716c"
                      fontSize="12px"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      N = {shortStay.count}
                    </text>
                  </g>
                );
              })()}

              {/* Bar 2: Mid-term */}
              {(() => {
                const barH = hasMidTerm ? (midTerm.medianPrice / maxPrice) * maxBarH : 0;
                const barX = midBarCenterX - barW / 2;
                const barY = baselineY - barH;
                return (
                  <g>
                    <rect
                      x={barX}
                      y={barY}
                      width={barW}
                      height={Math.max(barH, 0)}
                      fill="#78716c"
                      rx="3"
                    />
                    {/* Dollar value above bar with >= 6px space */}
                    <text
                      x={midBarCenterX}
                      y={barY - 8}
                      textAnchor="middle"
                      fill="#1c1917"
                      fontSize="13px"
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                    >
                      {hasMidTerm ? `$${midTerm.medianPrice.toFixed(2)}` : 'N/A'}
                    </text>
                    {/* Category label: line 1, with >= 8px space below axis line */}
                    <text
                      x={midBarCenterX}
                      y={baselineY + 20}
                      textAnchor="middle"
                      fill="#1c1917"
                      fontSize="13px"
                      fontWeight="600"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      Mid-term
                    </text>
                    {/* N label: line 2, with >= 8px space below category label */}
                    <text
                      x={midBarCenterX}
                      y={baselineY + 40}
                      textAnchor="middle"
                      fill="#78716c"
                      fontSize="12px"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      N = {midTerm.count}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Break-even & Slider (hidden if midTerm.count === 0) */}
        {hasMidTerm ? (
          <div className="lg:col-span-7 bg-stone-50/80 p-5 rounded-xl border border-stone-200">
            {/* Break-even Display */}
            <div className="mb-5 pb-4 border-b border-stone-200">
              <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                Break-Even Occupancy
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-extrabold text-stone-900">
                  {breakevenOccupancyPercent.toFixed(1)}%
                </span>
                <span className="text-sm font-serif font-bold text-stone-700">
                  ({breakevenNights.toFixed(1)} nights per year)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Assumes the mid-term unit is occupied all 365 nights.
              </p>
            </div>

            {/* Slider for expected short-stay occupancy */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="short-stay-occupancy-slider"
                  className="text-xs font-semibold text-stone-800"
                >
                  Expected Short-Stay Occupancy:
                </label>
                <span className="text-xs font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {sliderOccupancy} nights{' '}
                  <span className="text-stone-500 font-normal text-3xs">
                    (your assumption, not data)
                  </span>
                </span>
              </div>

              <input
                id="short-stay-occupancy-slider"
                type="range"
                min="0"
                max="365"
                step="1"
                value={sliderOccupancy}
                onChange={(e) => setSliderOccupancy(parseInt(e.target.value, 10) || 0)}
                className="w-full accent-stone-900 cursor-pointer"
              />

              {/* Slider reference markers */}
              <div className="relative w-full h-5 text-3xs font-mono text-stone-500 mt-1">
                {/* 0 and 365 ends */}
                <span className="absolute left-0">0d</span>
                <span className="absolute right-0">365d</span>

                {/* Data's median occupancy reference tick */}
                {shortStay.medianOccupancy > 0 && (
                  <div
                    style={{ left: `${Math.min(95, Math.max(5, (shortStay.medianOccupancy / 365) * 100))}%` }}
                    className="absolute -translate-x-1/2 flex flex-col items-center"
                    title={`Data median occupancy: ${Math.round(shortStay.medianOccupancy)} nights`}
                  >
                    <span className="w-0.5 h-1.5 bg-stone-400" />
                    <span className="whitespace-nowrap text-stone-600">
                      Data Median: {Math.round(shortStay.medianOccupancy)}d
                    </span>
                  </div>
                )}

                {/* Break-even point marker */}
                {breakevenNights > 0 && breakevenNights <= 365 && (
                  <div
                    style={{ left: `${(breakevenNights / 365) * 100}%` }}
                    className="absolute -translate-x-1/2 flex flex-col items-center top-3"
                    title={`Break-even: ${breakevenNights.toFixed(1)} nights`}
                  >
                    <span className="w-0.5 h-1.5 bg-amber-600" />
                    <span className="whitespace-nowrap text-amber-800 font-bold">
                      Break-even: {breakevenNights.toFixed(0)}d
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Annual Revenue Comparison from slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-2">
              <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-3xs uppercase tracking-wider text-stone-500 block mb-0.5 font-semibold">
                  Short-Stay Annual Revenue
                </span>
                <span className="text-xl font-serif font-bold text-stone-900 block">
                  ${Math.round(shortStayAnnualRevenue).toLocaleString()}
                </span>
                <span className="text-3xs text-stone-500 font-mono mt-0.5 block">
                  ${shortStay.medianPrice.toFixed(2)} &times; {sliderOccupancy} nights
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-3xs uppercase tracking-wider text-stone-500 block mb-0.5 font-semibold">
                  Mid-Term Annual Revenue
                </span>
                <span className="text-xl font-serif font-bold text-stone-900 block">
                  ${Math.round(midTermAnnualRevenue).toLocaleString()}
                </span>
                <span className="text-3xs text-stone-500 font-mono mt-0.5 block">
                  ${midTerm.medianPrice.toFixed(2)} &times; 365 nights
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-stone-50/80 p-6 rounded-xl border border-stone-200 text-center text-xs text-stone-500 flex items-center justify-center">
            No mid-term comparables in this neighbourhood. Break-even analysis and occupancy slider are not applicable.
          </div>
        )}
      </div>

      {/* Data Note (computed from all rows, no legal claims) */}
      <div className="pt-3 border-t border-stone-200 text-xs text-stone-700 leading-relaxed bg-stone-50/80 p-3 rounded-lg border border-stone-200">
        In this dataset, {stats.totalDataset31PlusCount} listings require 31 or more nights and {stats.totalDataset31PlusNoLicensePercent.toFixed(1)}% of them have has_license = False.
      </div>
    </div>
  );
};
