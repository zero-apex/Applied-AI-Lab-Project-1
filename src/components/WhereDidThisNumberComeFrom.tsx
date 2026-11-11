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
    <div className="bg-white/[0.04] rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Where Did This Number Come From?
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Full audit trail of active filter rules, excluded listings, and the verifiable comparable data table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white flex items-center gap-1.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            Export Comps CSV ({stats.count})
          </button>
        </div>
      </div>

      {/* Filter Breakdown & Exclusion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
            Total In Area &amp; BR
          </span>
          <div className="text-2xl font-bold text-zinc-100 tabular-numbers">
            {stats.totalAreaEntireHomes}
          </div>
          <span className="text-3xs text-zinc-400">
            Entire home/apt in {stats.neighbourhood}
          </span>
        </div>

        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-400/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 block mb-1">
            Excluded (31+ Nights)
          </span>
          <div className="text-2xl font-bold text-amber-200 tabular-numbers">
            {stats.excluded31PlusCount}
          </div>
          <span className="text-3xs text-amber-300/80">
            Minimum stay exceeds cap of {stats.minNightsCap}d
          </span>
        </div>

        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
            Excluded (Blank Min Nights)
          </span>
          <div className="text-2xl font-bold text-zinc-300 tabular-numbers">
            {stats.blankMinNightsCount}
          </div>
          <span className="text-3xs text-zinc-400">
            Treated as not meeting rule
          </span>
        </div>

        <div className="bg-gradient-to-br from-violet-900/40 via-violet-950/60 to-indigo-950/50 text-white p-4 rounded-xl border border-violet-500/50 shadow-lg shadow-violet-950/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300 block mb-1">
            Qualified Comps (N)
          </span>
          <div className="text-2xl font-bold text-white tabular-numbers">
            {stats.count}
          </div>
          <span className="text-3xs text-zinc-300">
            {stats.totalAreaEntireHomes} - {stats.totalExcludedByMinNights} = {stats.count}
          </span>
        </div>
      </div>

      {/* Audit Checklist */}
      <div className="bg-black/30 rounded-xl p-4.5 border border-white/10 mb-6 text-xs text-zinc-300 backdrop-blur-md">
        <h4 className="font-semibold text-zinc-100 mb-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-violet-400" />
          Filter Rule Verification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-zinc-100">Neighbourhood:</strong> Exact match on{' '}
              <code className="text-2xs bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                {stats.neighbourhood}
              </code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-zinc-100">Bedrooms:</strong> Exactly{' '}
              <code className="text-2xs bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                {stats.bedrooms}
              </code>{' '}
              bedroom{stats.bedrooms === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-zinc-100">Room Type:</strong> Strictly{' '}
              <code className="text-2xs bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                Entire home/apt
              </code>{' '}
              (no shared/private rooms)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-zinc-100">Minimum Stay:</strong> &le;{' '}
              <code className="text-2xs bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                {stats.minNightsCap} nights
              </code>{' '}
              (blanks excluded)
            </span>
          </div>
        </div>
      </div>

      {/* Table search & pagination header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search comps table..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:border-violet-500/60 transition-all duration-150"
          />
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, processedListings.length)} of {processedListings.length}{' '}
          listings
        </div>
      </div>

      {/* Sortable Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.05] text-zinc-300 font-semibold border-b border-white/10">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-3.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Listing ID</span>
                  {sortField === 'id' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-400" /> : <ArrowDown className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('property_type')}
                className="py-3 px-3.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Property Type</span>
                  {sortField === 'property_type' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-400" /> : <ArrowDown className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('price')}
                className="py-3 px-3.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Price ($/nt)</span>
                  {sortField === 'price' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-400" /> : <ArrowDown className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('minimum_nights')}
                className="py-3 px-3.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Min Nights</span>
                  {sortField === 'minimum_nights' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-400" /> : <ArrowDown className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('number_of_reviews')}
                className="py-3 px-3.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Reviews</span>
                  {sortField === 'number_of_reviews' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-400" /> : <ArrowDown className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
              </th>

              <th className="py-3 px-3.5">License</th>

              <th
                onClick={() => handleSort('review_scores_rating')}
                className="py-3 px-3.5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Rating</span>
                  {sortField === 'review_scores_rating' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-400" /> : <ArrowDown className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {currentListings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 italic">
                  No matching comparables found.
                </td>
              </tr>
            ) : (
              currentListings.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3.5 font-mono text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      {c.id}
                      <a
                        href={`https://www.airbnb.com/rooms/${c.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-violet-300 transition-colors"
                        title="View listing on Airbnb"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-zinc-200">{c.property_type}</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-zinc-100 tabular-numbers">
                    ${c.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-zinc-400">
                    {c.minimum_nights !== null ? `${c.minimum_nights}d` : '—'}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-zinc-400 tabular-numbers">{c.number_of_reviews}</td>
                  <td className="py-2.5 px-3.5">
                    {c.has_license ? (
                      <span className="inline-block px-2 py-0.5 rounded-md text-3xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Licensed
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md text-3xs font-semibold bg-white/[0.06] text-zinc-400 border border-white/10">
                        Unlicensed
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-zinc-300 tabular-numbers">
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
        <div className="flex items-center justify-between mt-4 text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <span className="text-xs text-zinc-400 font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
