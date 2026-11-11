import React from 'react';
import { ComparableStats } from '../services/dataService';
import { Database, ShieldCheck, Scale, Calendar, CheckSquare, Lock } from 'lucide-react';

interface DataNoteFooterProps {
  stats: ComparableStats;
}

export const DataNoteFooter: React.FC<DataNoteFooterProps> = ({ stats }) => {
  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-white/10 text-zinc-400">
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl shadow-black/40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold shadow-md shadow-violet-950/30">
              <Database className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-zinc-100 tracking-tight">
                Methodology &amp; Data Provenance
              </h4>
              <p className="text-xs text-zinc-400">
                Inside Airbnb Washington, D.C. public registry snapshot
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Snapshot: Sept 19, 2026</span>
            </div>
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all duration-150"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Creative Commons CC BY 4.0</span>
            </a>
          </div>
        </div>

        {/* Detailed Filters & Math Rules Applied */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs leading-relaxed">
          <div>
            <h5 className="font-semibold text-zinc-200 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
              Every Filter Applied to This View
            </h5>
            <ul className="space-y-2 text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">1.</span>
                <span>
                  <strong className="text-zinc-100">Neighbourhood:</strong>{' '}
                  <code className="text-2xs bg-white/[0.06] text-violet-300 border border-white/10 px-1.5 py-0.5 rounded-md font-mono">
                    neighbourhood_cleansed == &quot;{stats.neighbourhood}&quot;
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">2.</span>
                <span>
                  <strong className="text-zinc-100">Bedrooms:</strong>{' '}
                  <code className="text-2xs bg-white/[0.06] text-violet-300 border border-white/10 px-1.5 py-0.5 rounded-md font-mono">
                    bedrooms == {stats.bedrooms}
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">3.</span>
                <span>
                  <strong className="text-zinc-100">Room Type:</strong>{' '}
                  <code className="text-2xs bg-white/[0.06] text-violet-300 border border-white/10 px-1.5 py-0.5 rounded-md font-mono">
                    room_type == &quot;Entire home/apt&quot;
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">4.</span>
                <span>
                  <strong className="text-zinc-100">Minimum Stay Cap:</strong>{' '}
                  <code className="text-2xs bg-white/[0.06] text-violet-300 border border-white/10 px-1.5 py-0.5 rounded-md font-mono">
                    minimum_nights &le; {stats.minNightsCap}
                  </code>{' '}
                  (blank values treated as not meeting rule and excluded)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">5.</span>
                <span>
                  <strong className="text-zinc-100">Percentile Formula:</strong> Linear interpolation{' '}
                  <span className="font-mono text-2xs text-zinc-400">
                    P_p = A[i] + f &times; (A[i+1] - A[i])
                  </span>{' '}
                  where <span className="font-mono text-2xs text-zinc-400">idx = (N - 1) &times; p</span>.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-zinc-200 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-violet-400" />
              Strict Integrity &amp; Privacy Mandate
            </h5>
            <div className="space-y-2.5 text-zinc-300">
              <p>
                <strong className="text-zinc-100">Strict Rule on Numbers:</strong> Every nightly rate, count, percentile, or estimate shown is computed in deterministic TypeScript code from this CSV file. The Gemini model may only explain numbers that the code passes to it, never states a statistic from external training, and responds &quot;not in the data&quot; if asked about unverified outside facts.
              </p>
              <div className="flex items-center gap-2 pt-2 text-zinc-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero personal data collected or stored. Advisory calculations run in real-time.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Capital Host Advisory. Independent advisory powered by Inside Airbnb Washington D.C. public records.
        </div>
      </div>
    </footer>
  );
};
