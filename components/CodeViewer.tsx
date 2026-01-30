
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
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-sm shadow-xl border border-slate-800 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-slate-500 text-xs">Solution.java</span>
      </div>
      
      <div className="space-y-1">
        {code.map((line, idx) => {
          let isHighlighted = false;
          let variableOverlay = null;

          if (mode === AlgorithmMode.COMBINATION) {
            if (activeLine === 0 && idx === 0) {
              isHighlighted = true;
              variableOverlay = <span className="text-blue-400 ml-4 animate-pulse">// i = {i}, coins[i] = {coinValue}</span>;
            }
            if (activeLine === 1 && idx === 1) {
              isHighlighted = true;
              variableOverlay = <span className="text-green-400 ml-4 animate-pulse">// j = {j}</span>;
            }
            if (activeLine === 2 && idx === 2) {
              isHighlighted = true;
              variableOverlay = <span className="text-yellow-400 ml-4 animate-pulse">// dp[{j}] += dp[{j}-{coinValue}]</span>;
            }
          } else {
            // Permutation Mode
            if (activeLine === 0 && idx === 0) {
              isHighlighted = true;
              variableOverlay = <span className="text-green-400 ml-4 animate-pulse">// j = {j}</span>;
            }
            if (activeLine === 1 && idx === 1) {
              isHighlighted = true;
              variableOverlay = <span className="text-blue-400 ml-4 animate-pulse">// i = {i}, coins[i] = {coinValue}</span>;
            }
            if (activeLine === 2 && (idx === 2 || idx === 3)) {
              isHighlighted = true;
              variableOverlay = <span className="text-yellow-400 ml-4 animate-pulse">// dp[{j}] += dp[{j}-{coinValue}]</span>;
            }
          }

          return (
            <div 
              key={idx} 
              className={`flex items-start gap-4 px-2 py-1 rounded transition-colors duration-200 ${isHighlighted ? 'bg-blue-900/30 border-l-2 border-blue-400' : ''}`}
            >
              <span className="text-slate-600 w-4 text-right select-none pt-0.5">{idx + 1}</span>
              <div className="flex flex-wrap items-center">
                <pre className={`whitespace-pre-wrap ${isHighlighted ? 'text-white font-bold' : ''}`}>{line}</pre>
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
