import React from 'react';
import { Building2, ShieldCheck, Database, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-serif font-bold text-xl shadow-xs">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-stone-900 tracking-tight">
                  Capital Host Advisory
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                  Washington, D.C.
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                Short-Term Rental Pricing Intelligence & Homeowner Advisory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-600">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-stone-50 border border-stone-200">
              <Database className="w-3.5 h-3.5 text-stone-500" />
              <span>Inside Airbnb DC</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 border border-stone-200">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>Snapshot: 19 Sept 2026</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CC BY 4.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
