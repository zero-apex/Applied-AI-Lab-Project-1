import React from 'react';
import { ComparableStats } from '../services/dataService';
import { Database, ShieldCheck, Scale, Calendar, CheckSquare, Lock } from 'lucide-react';

interface DataNoteFooterProps {
  stats: ComparableStats;
}

export const DataNoteFooter: React.FC<DataNoteFooterProps> = ({ stats }) => {
  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-stone-200 text-stone-600">
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Methodology &amp; Data Provenance
              </h4>
              <p className="text-xs text-stone-500">
                Inside Airbnb Washington, D.C. public registry snapshot
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-stone-200 font-mono text-stone-700">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Snapshot: Sept 19, 2026
            </div>
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium hover:bg-emerald-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Creative Commons CC BY 4.0
            </a>
          </div>
        </div>

        {/* Detailed Filters & Math Rules Applied */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs leading-relaxed">
          <div>
            <h5 className="font-bold text-stone-900 uppercase tracking-wider text-2xs mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-stone-500" />
              Every Filter Applied to This View
            </h5>
            <ul className="space-y-1.5 text-stone-700">
              <li className="flex items-start gap-1.5">
                <span className="text-stone-400 font-mono">1.</span>
                <span>
                  <strong>Neighbourhood:</strong>{' '}
                  <code className="text-2xs bg-stone-200/80 px-1 py-0.5 rounded">
                    neighbourhood_cleansed == &quot;{stats.neighbourhood}&quot;
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-400 font-mono">2.</span>
                <span>
                  <strong>Bedrooms:</strong>{' '}
                  <code className="text-2xs bg-stone-200/80 px-1 py-0.5 rounded">
                    bedrooms == {stats.bedrooms}
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-400 font-mono">3.</span>
                <span>
                  <strong>Room Type:</strong>{' '}
                  <code className="text-2xs bg-stone-200/80 px-1 py-0.5 rounded">
                    room_type == &quot;Entire home/apt&quot;
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-400 font-mono">4.</span>
                <span>
                  <strong>Minimum Stay Cap:</strong>{' '}
                  <code className="text-2xs bg-stone-200/80 px-1 py-0.5 rounded">
                    minimum_nights &le; {stats.minNightsCap}
                  </code>{' '}
                  (blank values treated as not meeting rule and excluded)
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-400 font-mono">5.</span>
                <span>
                  <strong>Percentile Formula:</strong> Linear interpolation{' '}
                  <span className="font-mono text-2xs">
                    P_p = A[i] + f &times; (A[i+1] - A[i])
                  </span>{' '}
                  where <span className="font-mono text-2xs">idx = (N - 1) &times; p</span>.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 uppercase tracking-wider text-2xs mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-stone-500" />
              Strict Integrity &amp; Privacy Mandate
            </h5>
            <div className="space-y-2 text-stone-600">
              <p>
                <strong>Strict Rule on Numbers:</strong> Every nightly rate, count, percentile, or estimate shown is computed in deterministic TypeScript code from this CSV file. The Gemini model may only explain numbers that the code passes to it, never states a statistic from external training, and responds &quot;not in the data&quot; if asked about unverified outside facts.
              </p>
              <div className="flex items-center gap-2 pt-2 text-stone-500 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero personal data collected or stored. Advisory calculations run in real-time.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200/60 text-center text-2xs text-stone-400">
          &copy; {new Date().getFullYear()} Capital Host Advisory. Independent advisory powered by Inside Airbnb Washington D.C. public records.
        </div>
      </div>
    </footer>
  );
};
