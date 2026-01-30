
import React from 'react';
import { AlgorithmMode } from '../types';

interface CodeViewerProps {
  mode: AlgorithmMode;
  activeLine: number;
  i: number;
  j: number;
  coinValue: number | null;
  coins: number[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ mode, activeLine, i, j, coinValue, coins }) => {
  const combinationCode = [
    "for (int i = 0; i < coins.length; i++) {",
    "    for (int j = coins[i]; j <= amount; j++) {",
    "        dp[j] += dp[j - coins[i]];",
    "    }",
    "}"
  ];

  const permutationCode = [
    "for (int j = 1; j <= amount; j++) {",
    "    for (int i = 0; i < coins.length; i++) {",
    "        if (j >= coins[i]) {",
    "            dp[j] += dp[j - coins[i]];",
    "        }",
    "    }",
    "}"
  ];

  const code = mode === AlgorithmMode.COMBINATION ? combinationCode : permutationCode;

  return (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-sm shadow-xl border border-slate-800 relative overflow-x-auto min-w-full">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-slate-500 text-xs font-sans">Solution.java</span>
      </div>
      
      <div className="space-y-1 min-w-max">
        {code.map((line, idx) => {
          let isHighlighted = false;
          let variableOverlay = null;

          if (mode === AlgorithmMode.COMBINATION) {
            if (activeLine === 0 && idx === 0) {
              isHighlighted = true;
              variableOverlay = <span className="text-blue-400 ml-4 font-normal">// i = {i}, coins[i] = {coinValue}</span>;
            }
            if (activeLine === 1 && idx === 1) {
              isHighlighted = true;
              variableOverlay = <span className="text-green-400 ml-4 font-normal">// j = {j}</span>;
            }
            if (activeLine === 2 && idx === 2) {
              isHighlighted = true;
              variableOverlay = <span className="text-yellow-400 ml-4 font-normal">// dp[{j}] += dp[{j}-{coinValue}]</span>;
            }
          } else {
            if (activeLine === 0 && idx === 0) {
              isHighlighted = true;
              variableOverlay = <span className="text-green-400 ml-4 font-normal">// j = {j}</span>;
            }
            if (activeLine === 1 && idx === 1) {
              isHighlighted = true;
              variableOverlay = <span className="text-blue-400 ml-4 font-normal">// i = {i}, coins[i] = {coinValue}</span>;
            }
            if (activeLine === 2 && (idx === 2 || idx === 3)) {
              isHighlighted = true;
              variableOverlay = <span className="text-yellow-400 ml-4 font-normal">// dp[{j}] += dp[{j}-{coinValue}]</span>;
            }
          }

          return (
            <div 
              key={idx} 
              className={`flex items-start gap-4 px-2 py-1 rounded transition-colors duration-200 whitespace-nowrap ${isHighlighted ? 'bg-blue-900/40 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`}
            >
              <span className="text-slate-600 w-6 text-right select-none pt-0.5">{idx + 1}</span>
              <div className="flex items-center">
                <pre className={`whitespace-pre ${isHighlighted ? 'text-white font-bold' : ''}`}>{line}</pre>
                {isHighlighted && variableOverlay}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodeViewer;
