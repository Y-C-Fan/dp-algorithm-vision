
import React from 'react';

interface DPTableProps {
  dp: number[];
  currentIndex: number;
  targetIndex: number;
  highlightColor: string;
}

const DPTable: React.FC<DPTableProps> = ({ dp, currentIndex, targetIndex, highlightColor }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {dp.map((val, idx) => {
        const isCurrent = idx === currentIndex;
        const isTarget = idx === targetIndex;
        
        return (
          <div
            key={idx}
            className={`
              relative w-12 h-16 sm:w-16 sm:h-20 flex flex-col items-center justify-center border-2 rounded-lg transition-all duration-300
              ${isCurrent ? 'border-blue-500 bg-blue-50 scale-110 z-10' : 'border-slate-200 bg-white'}
              ${isTarget ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : ''}
            `}
          >
            <span className="text-[10px] text-slate-400 absolute top-1 left-2 font-mono">dp[{idx}]</span>
            <span className="text-xl font-bold text-slate-800">{val}</span>
            {isCurrent && (
              <div className="absolute -bottom-6 text-blue-600 font-bold animate-bounce text-sm">Update</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DPTable;
