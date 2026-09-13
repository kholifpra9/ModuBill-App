import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse select-none">
      {/* Skeleton Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-xl"></div>
          <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* Skeleton Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
            <div className="h-9 w-9 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
            <div className="h-9 w-9 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-8 w-36 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton List Items */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-36 bg-slate-200 rounded"></div>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-3 w-48 bg-slate-100 rounded"></div>
              </div>
              <div className="h-5 w-24 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}