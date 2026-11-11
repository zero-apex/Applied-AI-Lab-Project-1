import React from 'react';
import { Building2, ShieldCheck, Database, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-white/10 bg-[#0c0b14]/80 backdrop-blur-md sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-violet-900/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-zinc-100 tracking-tight">
                  Capital Host Advisory
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/10">
                  Washington, D.C.
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium hidden sm:block">
                Short-Term Rental Pricing Intelligence &amp; Homeowner Advisory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-zinc-300">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
              <Database className="w-3.5 h-3.5 text-violet-400" />
              <span>Inside Airbnb DC</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Snapshot: 19 Sept 2026</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CC BY 4.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
