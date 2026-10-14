import React from 'react';

export default function PageSkeleton() {
  return (
    <div className="w-full min-h-[70vh] bg-slate-50 animate-fadeIn" role="status" aria-label="Loading page...">
      {/* Top micro progress bar */}
      <div className="h-0.5 w-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sea-500 to-v2orange-500 animate-[loading-bar_1.2s_ease-in-out_infinite] w-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb / Section Header Skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-3.5 bg-slate-200 rounded w-48" />
          <div className="h-7 bg-slate-200 rounded w-72" />
        </div>

        {/* Content Skeleton Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[5px] border border-slate-200 overflow-hidden p-3.5 space-y-3 animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-100 rounded-[4px]" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-8 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

