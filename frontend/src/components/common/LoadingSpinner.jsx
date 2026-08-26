import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-blue-600`} />
      {message && <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          {message && <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p>}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-xs rounded-xl">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
