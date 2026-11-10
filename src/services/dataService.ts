/**
 * Capital Host Advisory - Data Engine & Analytics Service
 * Source: Inside Airbnb Washington DC, snapshot 19 Sept 2026, CC BY 4.0
 */

export interface Listing {
  id: string;
  neighbourhood_cleansed: string;
  property_type: string;
  room_type: string;
  accommodates: number;
  bedrooms: number;
  beds: number | null;
  price: number;
  minimum_nights: number | null;
  availability_365: number;
  number_of_reviews: number;
  review_scores_rating: number | null;
  estimated_occupancy_l365d: number;
  estimated_revenue_l365d: number;
  has_license: boolean;
}

export interface ComparableStats {
  neighbourhood: string;
  bedrooms: number;
  minNightsCap: number;
  count: number;
  p25: number;
  median: number;
  p75: number;
  p99: number;
  minPrice: number;
  maxPrice: number;
  isLowData: boolean; // N < 20
  
  // Exclusion metrics for the "Where did this number come from?" panel
  totalAreaEntireHomes: number;
  excluded31PlusCount: number;
  blankMinNightsCount: number;
  totalExcludedByMinNights: number;
  totalAreaBedroomCount: number;
  
  // Licensing statistics
  licensedCount: number;
  licensedMedianPrice: number;
  licensedMedianRevenue: number;
  unlicensedCount: number;
  unlicensedMedianPrice: number;
  unlicensedMedianRevenue: number;
  
  // Common property types in this comparable slice
  commonPropertyTypes: string[];
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  label: string;
  count: number;
  isOutlierBucket?: boolean;
}

export interface NeighbourhoodMedian {
  neighbourhood: string;
  medianPrice: number;
  p25: number;
  p75: number;
  count: number;
  isLowData: boolean; // N < 20
}

/**
 * Robust CSV parser handling escaped quotes and commas
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && next === '\n') {
          i++;
        }
        row.push(field);
        field = '';
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          rows.push(row);
        }
        row = [];
      } else {
        field += c;
      }
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Load and parse the bundled Inside Airbnb Washington DC dataset
 */
export async function loadListingsData(): Promise<Listing[]> {
  const response = await fetch('/assets/aistudio/dc_listings_clean_5ae168f2.csv');
  if (!response.ok) {
    throw new Error(`Failed to load dataset: ${response.statusText}`);
  }
  const text = await response.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const colIndex: Record<string, number> = {};
  headers.forEach((h, idx) => {
    colIndex[h] = idx;
  });

  const listings: Listing[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || (r.length === 1 && !r[0])) continue;

    const getVal = (name: string): string => {
      const idx = colIndex[name];
      return idx !== undefined && r[idx] !== undefined ? r[idx].trim() : '';
    };

    const id = getVal('id');
    if (!id) continue;

    const neighbourhood = getVal('neighbourhood_cleansed');
    const propertyType = getVal('property_type');
    const roomType = getVal('room_type');
    const accommodates = parseInt(getVal('accommodates'), 10) || 1;
    const bedrooms = parseInt(getVal('bedrooms'), 10) || 0;
    const bedsRaw = getVal('beds');
    const beds = bedsRaw !== '' && !isNaN(Number(bedsRaw)) ? Number(bedsRaw) : null;
    const price = parseFloat(getVal('price')) || 0;

    const minNightsRaw = getVal('minimum_nights');
    // Rule: blank minimum_nights treated as not meeting rule (null)
    const minimum_nights =
      minNightsRaw !== '' && !isNaN(Number(minNightsRaw)) ? Number(minNightsRaw) : null;

    const availability_365 = parseInt(getVal('availability_365'), 10) || 0;
    const number_of_reviews = parseInt(getVal('number_of_reviews'), 10) || 0;

    const ratingRaw = getVal('review_scores_rating');
    const review_scores_rating =
      ratingRaw !== '' && !isNaN(Number(ratingRaw)) ? Number(ratingRaw) : null;

    const estimated_occupancy_l365d = parseInt(getVal('estimated_occupancy_l365d'), 10) || 0;
    const estimated_revenue_l365d = parseFloat(getVal('estimated_revenue_l365d')) || 0;
    const hasLicenseRaw = getVal('has_license').toLowerCase();
    const has_license = hasLicenseRaw === 'true' || hasLicenseRaw === 't' || hasLicenseRaw === '1';

    listings.push({
      id,
      neighbourhood_cleansed: neighbourhood,
      property_type: propertyType,
      room_type: roomType,
      accommodates,
      bedrooms,
      beds,
      price,
      minimum_nights,
      availability_365,
      number_of_reviews,
      review_scores_rating,
      estimated_occupancy_l365d,
      estimated_revenue_l365d,
      has_license,
    });
  }

  return listings;
}

/**
 * Standard linear interpolation percentile
 * Matches exact check case: Union Station, Stanton Park, Kingman Park, 1 br => 180.50, 211.00, 247.00
 */
export function linearPercentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  if (sortedArr.length === 1) return sortedArr[0];
  const idx = (sortedArr.length - 1) * p;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const weight = idx - lower;
  if (lower >= sortedArr.length - 1) return sortedArr[sortedArr.length - 1];
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

/**
 * Filter comparables according to the exact business rules:
 * - same neighbourhood_cleansed
 * - bedrooms equal to selected bedrooms
 * - room_type === 'Entire home/apt'
 * - minimum_nights <= minimum_nights_cap (treat blank minimum_nights as not meeting rule)
 */
export function filterComparables(
  allListings: Listing[],
  neighbourhood: string,
  bedrooms: number,
  minNightsCap: number
): {
  comparables: Listing[];
  excluded31Plus: Listing[];
  blankMinNights: Listing[];
  totalAreaEntireHomes: Listing[];
} {
  const totalAreaEntireHomes = allListings.filter(
    (l) =>
      l.neighbourhood_cleansed === neighbourhood &&
      l.bedrooms === bedrooms &&
      l.room_type === 'Entire home/apt'
  );

  const comparables: Listing[] = [];
  const excluded31Plus: Listing[] = [];
  const blankMinNights: Listing[] = [];

  for (const listing of totalAreaEntireHomes) {
    if (listing.minimum_nights === null) {
      blankMinNights.push(listing);
    } else if (listing.minimum_nights > minNightsCap) {
      excluded31Plus.push(listing);
    } else {
      comparables.push(listing);
    }
  }

  return {
    comparables,
    excluded31Plus,
    blankMinNights,
    totalAreaEntireHomes,
  };
}

/**
 * Compute detailed statistical breakdown for the filtered comparables
 */
export function computeComparableStats(
  allListings: Listing[],
  neighbourhood: string,
  bedrooms: number,
  minNightsCap: number
): { stats: ComparableStats; comparables: Listing[] } {
  const { comparables, excluded31Plus, blankMinNights, totalAreaEntireHomes } = filterComparables(
    allListings,
    neighbourhood,
    bedrooms,
    minNightsCap
  );

  const sortedPrices = comparables.map((c) => c.price).sort((a, b) => a - b);
  const count = sortedPrices.length;

  const p25 = linearPercentile(sortedPrices, 0.25);
  const median = linearPercentile(sortedPrices, 0.5);
  const p75 = linearPercentile(sortedPrices, 0.75);
  const p99 = linearPercentile(sortedPrices, 0.99);
  const minPrice = sortedPrices.length > 0 ? sortedPrices[0] : 0;
  const maxPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : 0;

  // Licensed vs Unlicensed breakdown
  const licensedListings = comparables.filter((c) => c.has_license);
  const unlicensedListings = comparables.filter((c) => !c.has_license);

  const licensedPrices = licensedListings.map((c) => c.price).sort((a, b) => a - b);
  const unlicensedPrices = unlicensedListings.map((c) => c.price).sort((a, b) => a - b);

  const licensedRevenues = licensedListings.map((c) => c.estimated_revenue_l365d).sort((a, b) => a - b);
  const unlicensedRevenues = unlicensedListings.map((c) => c.estimated_revenue_l365d).sort((a, b) => a - b);

  // Common property types
  const typeCounts: Record<string, number> = {};
  comparables.forEach((c) => {
    typeCounts[c.property_type] = (typeCounts[c.property_type] || 0) + 1;
  });
  const commonPropertyTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);

  const stats: ComparableStats = {
    neighbourhood,
    bedrooms,
    minNightsCap,
    count,
    p25,
    median,
    p75,
    p99,
    minPrice,
    maxPrice,
    isLowData: count < 20,
    totalAreaEntireHomes: totalAreaEntireHomes.length,
    excluded31PlusCount: excluded31Plus.length,
    blankMinNightsCount: blankMinNights.length,
    totalExcludedByMinNights: excluded31Plus.length + blankMinNights.length,
    totalAreaBedroomCount: totalAreaEntireHomes.length,
    licensedCount: licensedListings.length,
    licensedMedianPrice: linearPercentile(licensedPrices, 0.5),
    licensedMedianRevenue: linearPercentile(licensedRevenues, 0.5),
    unlicensedCount: unlicensedListings.length,
    unlicensedMedianPrice: linearPercentile(unlicensedPrices, 0.5),
    unlicensedMedianRevenue: linearPercentile(unlicensedRevenues, 0.5),
    commonPropertyTypes,
  };

  return { stats, comparables };
}

/**
 * Generate histogram data capped at the 99th percentile so outliers do not flatten it.
 */
export function generatePriceHistogram(
  prices: number[],
  p99: number,
  binCount = 14
): { bins: HistogramBin[]; p99Cap: number } {
  if (prices.length === 0) return { bins: [], p99Cap: p99 };

  const validPrices = prices.filter((p) => !isNaN(p));
  if (validPrices.length === 0) return { bins: [], p99Cap: p99 };

  const effectiveMax = Math.max(p99, 100);
  const min = Math.max(0, Math.floor(Math.min(...validPrices) / 10) * 10);
  const range = effectiveMax - min;
  const binWidth = Math.max(10, Math.ceil(range / binCount));

  const bins: HistogramBin[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    bins.push({
      binStart,
      binEnd,
      label: `$${binStart}–$${binEnd}`,
      count: 0,
    });
  }

  // Extra overflow bin for > 99th percentile if any exist
  let overflowCount = 0;

  for (const price of validPrices) {
    if (price > effectiveMax) {
      overflowCount++;
    } else {
      let placed = false;
      for (const bin of bins) {
        if (price >= bin.binStart && price < bin.binEnd) {
          bin.count++;
          placed = true;
          break;
        }
      }
      if (!placed && bins.length > 0) {
        bins[bins.length - 1].count++;
      }
    }
  }

  if (overflowCount > 0) {
    bins.push({
      binStart: effectiveMax,
      binEnd: Math.max(...validPrices),
      label: `>$${Math.round(effectiveMax)}`,
      count: overflowCount,
      isOutlierBucket: true,
    });
  }

  return { bins, p99Cap: effectiveMax };
}

/**
 * Compute median 1-bedroom comparable price across all DC neighbourhoods.
 * Feature 4: "Neighbourhood comparison bar chart: median 1-bedroom comparable price per neighbourhood, with the selected one highlighted. Hide or flag neighbourhoods with N under 20."
 */
export function computeAllNeighbourhood1BedComparables(
  allListings: Listing[],
  bedrooms = 1,
  minNightsCap = 30
): NeighbourhoodMedian[] {
  const neighbourhoodMap: Record<string, number[]> = {};

  for (const l of allListings) {
    if (
      l.bedrooms === bedrooms &&
      l.room_type === 'Entire home/apt' &&
      l.minimum_nights !== null &&
      l.minimum_nights <= minNightsCap
    ) {
      if (!neighbourhoodMap[l.neighbourhood_cleansed]) {
        neighbourhoodMap[l.neighbourhood_cleansed] = [];
      }
      neighbourhoodMap[l.neighbourhood_cleansed].push(l.price);
    }
  }

  // Also ensure every distinct neighbourhood in the dataset appears, even if 0 comps
  const allNeighbourhoods = Array.from(new Set(allListings.map((l) => l.neighbourhood_cleansed)));

  const results: NeighbourhoodMedian[] = allNeighbourhoods.map((n) => {
    const prices = (neighbourhoodMap[n] || []).sort((a, b) => a - b);
    const count = prices.length;
    const medianPrice = linearPercentile(prices, 0.5);
    const p25 = linearPercentile(prices, 0.25);
    const p75 = linearPercentile(prices, 0.75);

    return {
      neighbourhood: n,
      medianPrice,
      p25,
      p75,
      count,
      isLowData: count < 20,
    };
  });

  // Sort descending by median price
  return results.sort((a, b) => b.medianPrice - a.medianPrice);
}
