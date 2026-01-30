
import React from 'react';

interface FormulaTraceProps {
  formula: {
    target: number;
    current: number;
    prev: number;
    prevIdx: number;
  } | null;
  coin: number | null;
}

const FormulaTrace: React.FC<FormulaTraceProps> = ({ formula, coin }) => {
  if (!formula || coin === null) return <div className="h-20 flex items-center justify-center text-slate-400 italic">等待开始...</div>;

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl font-mono shadow-inner border border-slate-700">
      <div className="text-blue-400 text-xs mb-2 uppercase tracking-widest font-bold">状态转移方程</div>
      <div className="text-lg sm:text-2xl flex flex-wrap items-center gap-x-2">
        <span className="text-yellow-400">dp[{formula.target}]</span>
        <span>=</span>
        <span className="text-slate-300">dp[{formula.target}]</span>
        <span className="text-green-400">+</span>
        <span className="text-purple-400">dp[{formula.target} - {coin}]</span>
      </div>
      <div className="mt-3 text-sm sm:text-lg border-t border-slate-700 pt-2 flex gap-x-2 items-center">
        <span className="text-slate-500">数值代入:</span>
        <span className="text-yellow-400 font-bold">{formula.current + formula.prev}</span>
        <span>=</span>
        <span className="text-slate-300">{formula.current}</span>
        <span>+</span>
        <span className="text-purple-400">{formula.prev}</span>
      </div>
    </div>
  );
};

export default FormulaTrace;
