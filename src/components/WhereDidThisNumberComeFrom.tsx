import React, { useState, useMemo } from 'react';
import { ComparableStats, Listing } from '../services/dataService';
import {
  FileText,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface WhereDidThisNumberComeFromProps {
  stats: ComparableStats;
  comparables: Listing[];
}

type SortField = 'id' | 'property_type' | 'price' | 'minimum_nights' | 'number_of_reviews' | 'review_scores_rating';

export const WhereDidThisNumberComeFrom: React.FC<WhereDidThisNumberComeFromProps> = ({
  stats,
  comparables,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted comparables
  const processedListings = useMemo(() => {
    let result = [...comparables];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.property_type.toLowerCase().includes(q) ||
          item.price.toString().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = -Infinity;
      if (valB === null || valB === undefined) valB = -Infinity;

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [comparables, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedListings.length / pageSize) || 1;
  const currentListings = processedListings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'id',
      'neighbourhood',
      'property_type',
      'bedrooms',
      'price_usd',
      'minimum_nights',
      'number_of_reviews',
      'review_scores_rating',
      'has_license',
    ];
    const csvRows = [headers.join(',')];

    for (const c of comparables) {
      csvRows.push(
        [
          c.id,
          `"${c.neighbourhood_cleansed}"`,
          `"${c.property_type}"`,
          c.bedrooms,
          c.price,
          c.minimum_nights ?? '',
          c.number_of_reviews,
          c.review_scores_rating ?? '',
          c.has_license,
        ].join(',')
      );
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `comparables_${stats.neighbourhood.replace(/\s+/g, '_')}_${stats.bedrooms}BR.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Where Did This Number Come From?
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Full audit trail of active filter rules, excluded listings, and the verifiable comparable data table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            Export Comps CSV ({stats.count})
          </button>
        </div>
      </div>

      {/* Filter Breakdown & Exclusion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
            Total In Area &amp; BR
          </span>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {stats.totalAreaEntireHomes}
          </div>
          <span className="text-3xs text-stone-500">
            Entire home/apt in {stats.neighbourhood}
          </span>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
          <span className="text-2xs font-semibold uppercase tracking-wider text-amber-900 block mb-1">
            Excluded (31+ Nights)
          </span>
          <div className="text-2xl font-serif font-bold text-amber-800">
            {stats.excluded31PlusCount}
          </div>
          <span className="text-3xs text-amber-700">
            Minimum stay exceeds cap of {stats.minNightsCap}d
          </span>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-2xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
            Excluded (Blank Min Nights)
          </span>
          <div className="text-2xl font-serif font-bold text-stone-700">
            {stats.blankMinNightsCount}
          </div>
          <span className="text-3xs text-stone-500">
            Treated as not meeting rule
          </span>
        </div>

        <div className="bg-stone-900 text-white p-3.5 rounded-xl border border-stone-900 shadow-2xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-amber-400 block mb-1">
            Qualified Comps (N)
          </span>
          <div className="text-2xl font-serif font-bold text-white">
            {stats.count}
          </div>
          <span className="text-3xs text-stone-400">
            {stats.totalAreaEntireHomes} - {stats.totalExcludedByMinNights} = {stats.count}
          </span>
        </div>
      </div>

      {/* Audit Checklist */}
      <div className="bg-stone-50/60 rounded-xl p-4 border border-stone-200 mb-6 text-xs text-stone-700">
        <h4 className="font-bold text-stone-900 mb-2.5 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-stone-600" />
          Filter Rule Verification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Neighbourhood:</strong> Exact match on{' '}
              <code className="text-2xs bg-white px-1.5 py-0.5 rounded border border-stone-200">
                {stats.neighbourhood}
              </code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Bedrooms:</strong> Exactly{' '}
              <code className="text-2xs bg-white px-1.5 py-0.5 rounded border border-stone-200">
                {stats.bedrooms}
              </code>{' '}
              bedroom{stats.bedrooms === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Room Type:</strong> Strictly{' '}
              <code className="text-2xs bg-white px-1.5 py-0.5 rounded border border-stone-200">
                Entire home/apt
              </code>{' '}
              (no shared/private rooms)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Minimum Stay:</strong> &le;{' '}
              <code className="text-2xs bg-white px-1.5 py-0.5 rounded border border-stone-200">
                {stats.minNightsCap} nights
              </code>{' '}
              (blanks excluded)
            </span>
          </div>
        </div>
      </div>

      {/* Table search & pagination header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search comps table..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600"
          />
        </div>

        <div className="text-2xs text-stone-500 font-mono">
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, processedListings.length)} of {processedListings.length}{' '}
          listings
        </div>
      </div>

      {/* Sortable Table */}
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-3 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Listing ID</span>
                  {sortField === 'id' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('property_type')}
                className="py-2.5 px-3 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Property Type</span>
                  {sortField === 'property_type' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Price ($/nt)</span>
                  {sortField === 'price' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('minimum_nights')}
                className="py-2.5 px-3 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Min Nights</span>
                  {sortField === 'minimum_nights' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('number_of_reviews')}
                className="py-2.5 px-3 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Reviews</span>
                  {sortField === 'number_of_reviews' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  )}
                </div>
              </th>

              <th className="py-2.5 px-3">License</th>

              <th
                onClick={() => handleSort('review_scores_rating')}
                className="py-2.5 px-3 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Rating</span>
                  {sortField === 'review_scores_rating' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 font-sans">
            {currentListings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-stone-500 italic">
                  No matching comparables found.
                </td>
              </tr>
            ) : (
              currentListings.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2 px-3 font-mono text-stone-700">
                    <span className="flex items-center gap-1">
                      {c.id}
                      <a
                        href={`https://www.airbnb.com/rooms/${c.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 hover:text-stone-800"
                        title="View listing on Airbnb"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </span>
                  </td>
                  <td className="py-2 px-3 text-stone-800">{c.property_type}</td>
                  <td className="py-2 px-3 font-mono font-bold text-stone-900">
                    ${c.price.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 font-mono text-stone-600">
                    {c.minimum_nights !== null ? `${c.minimum_nights}d` : '—'}
                  </td>
                  <td className="py-2 px-3 font-mono text-stone-600">{c.number_of_reviews}</td>
                  <td className="py-2 px-3">
                    {c.has_license ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Licensed
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                        Unlicensed
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-stone-700">
                    {c.review_scores_rating !== null ? `★ ${c.review_scores_rating.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <span className="text-2xs text-stone-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
