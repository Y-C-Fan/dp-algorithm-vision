
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlgorithmMode, Step } from './types';
import DPTable from './components/DPTable';
import CodeViewer from './components/CodeViewer';
import FormulaTrace from './components/FormulaTrace';
import { getStepExplanation } from './services/geminiService';

const App: React.FC = () => {
  const [amount, setAmount] = useState<number>(5);
  const [coins, setCoins] = useState<number[]>([1, 2, 5]);
  const [mode, setMode] = useState<AlgorithmMode>(AlgorithmMode.COMBINATION);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(800);
  const [explanation, setExplanation] = useState<string>('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAiCallRef = useRef<number>(0);

  const generateSteps = useCallback(() => {
    const localSteps: Step[] = [];
    let dp = new Array(amount + 1).fill(0);
    dp[0] = 1;

    // Initialization step
    localSteps.push({
      coin: null,
      amount: 0,
      coinIdx: 0,
      dpBefore: [...dp],
      dpAfter: [...dp],
      addedValue: 0,
      description: "初始化状态：dp[0] = 1 (金额为0有一种方案)",
      activeLine: 0,
      formula: null
    });

    if (mode === AlgorithmMode.COMBINATION) {
      for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        localSteps.push({
          coin, amount: coin, coinIdx: i, dpBefore: [...dp], dpAfter: [...dp], addedValue: 0,
          description: `外层循环：选择硬币 ${coin}`,
          activeLine: 0, formula: null
        });

        for (let j = coin; j <= amount; j++) {
          const prevValue = dp[j];
          const dependencyValue = dp[j - coin];
          dp[j] += dependencyValue;
          
          localSteps.push({
            coin,
            amount: j,
            coinIdx: i,
            dpBefore: [...dp].map((v, idx) => idx === j ? prevValue : v),
            dpAfter: [...dp],
            addedValue: dependencyValue,
            description: `更新 dp[${j}]，使用硬币 ${coin}`,
            activeLine: 2,
            formula: {
              target: j,
              current: prevValue,
              prev: dependencyValue,
              prevIdx: j - coin
            }
          });
        }
      }
    } else {
      for (let j = 1; j <= amount; j++) {
        localSteps.push({
          coin: null, amount: j, coinIdx: 0, dpBefore: [...dp], dpAfter: [...dp], addedValue: 0,
          description: `外层循环：当前目标金额 ${j}`,
          activeLine: 0, formula: null
        });

        for (let i = 0; i < coins.length; i++) {
          const coin = coins[i];
          if (j >= coin) {
            const prevValue = dp[j];
            const dependencyValue = dp[j - coin];
            dp[j] += dependencyValue;

            localSteps.push({
              coin,
              amount: j,
              coinIdx: i,
              dpBefore: [...dp].map((v, idx) => idx === j ? prevValue : v),
              dpAfter: [...dp],
              addedValue: dependencyValue,
              description: `更新 dp[${j}]，放入最后一个硬币 ${coin}`,
              activeLine: 2,
              formula: {
                target: j,
                current: prevValue,
                prev: dependencyValue,
                prevIdx: j - coin
              }
            });
          }
        }
      }
    }
    setSteps(localSteps);
    setCurrentStep(0);
  }, [amount, coins, mode]);

  useEffect(() => { generateSteps(); }, [generateSteps]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setTimeout(() => { setCurrentStep(prev => prev + 1); }, playbackSpeed);
    } else { setIsPlaying(false); }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextStep();
      else if (e.key === 'ArrowLeft') handlePrevStep();
      else if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length, currentStep]);

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    const fetchStepDetail = async () => {
      if (currentStep >= 0 && steps[currentStep]) {
        const s = steps[currentStep];
        
        // Rate limit mitigation: Only call AI if not playing too fast, or use cached
        const now = Date.now();
        if (s.formula && (now - lastAiCallRef.current > 1000 || !isPlaying)) {
          lastAiCallRef.current = now;
          const desc = await getStepExplanation(mode, s.coin || 0, s.amount, s.formula.current, s.addedValue);
          setExplanation(desc || s.description);
        } else {
          setExplanation(s.description);
        }
      }
    };
    fetchStepDetail();
  }, [currentStep, mode, steps, isPlaying]);

  const currentStepData = steps[currentStep] || steps[0];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-100 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">完全背包：组合与排列的“循环之秘”</h1>
            <p className="text-slate-500 text-sm">观察代码行中的实时变量 i, j 和 coins[i]</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setMode(AlgorithmMode.COMBINATION); setIsPlaying(false); }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === AlgorithmMode.COMBINATION ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              组合 (先硬币)
            </button>
            <button 
              onClick={() => { setMode(AlgorithmMode.PERMUTATION); setIsPlaying(false); }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === AlgorithmMode.PERMUTATION ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              排列 (先金额)
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Code Viewer & Controls (Now wider) */}
          <div className="xl:col-span-5 space-y-6">
            <CodeViewer 
              mode={mode} 
              activeLine={currentStepData?.activeLine ?? 0} 
              i={currentStepData?.coinIdx ?? 0}
              j={currentStepData?.amount ?? 0}
              coinValue={currentStepData?.coin ?? null}
              coins={coins}
            />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-1 rounded">🎮</span> 交互控制
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <button onClick={handlePrevStep} disabled={currentStep === 0} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl font-bold text-slate-700 transition-colors">← Step</button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`flex-[1.5] py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${isPlaying ? 'bg-amber-100 text-amber-700' : 'bg-slate-800 text-white'}`}>
                    {isPlaying ? 'PAUSE' : 'RUN ALL'}
                  </button>
                  <button onClick={handleNextStep} disabled={currentStep >= steps.length - 1} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl font-bold text-slate-700 transition-colors">Step →</button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">目标金额</label>
                    <input type="number" value={amount} onChange={e => setAmount(Math.min(15, Math.max(1, +e.target.value)))} className="w-full mt-1 p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">硬币面额</label>
                    <input type="text" value={coins.join(',')} onChange={e => setCoins(e.target.value.split(',').map(v => +v.trim()).filter(v => !isNaN(v)))} className="w-full mt-1 p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">速度 ({playbackSpeed}ms)</label>
                  <input type="range" min="100" max="2000" step="100" value={playbackSpeed} onChange={e => setPlaybackSpeed(+e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
                </div>
              </div>
            </div>

            <div className="bg-indigo-900 text-indigo-100 p-4 rounded-xl text-xs space-y-2">
              <p className="font-bold flex items-center gap-1 text-white underline decoration-indigo-500 underline-offset-4 mb-2">当前状态变量</p>
              <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                <div className="bg-indigo-800/50 p-2 rounded border border-indigo-700">
                  <div className="text-[10px] text-indigo-300 uppercase">i (Index)</div>
                  <div className="font-bold text-white">{currentStepData?.coinIdx ?? '-'}</div>
                </div>
                <div className="bg-indigo-800/50 p-2 rounded border border-indigo-700">
                  <div className="text-[10px] text-indigo-300 uppercase">coins[i]</div>
                  <div className="font-bold text-white">{currentStepData?.coin ?? '-'}</div>
                </div>
                <div className="bg-indigo-800/50 p-2 rounded col-span-2 border border-indigo-700">
                  <div className="text-[10px] text-indigo-300 uppercase">j (Current Amount)</div>
                  <div className="font-bold text-white text-center text-lg">{currentStepData?.amount ?? '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer (Now slightly narrower but fits well) */}
          <div className="xl:col-span-7 space-y-6">
            <FormulaTrace formula={currentStepData?.formula} coin={currentStepData?.coin} />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-bold text-slate-800">DP 状态演变</h2>
                  <div className="flex gap-4 text-xs font-mono bg-slate-50 px-4 py-2 rounded-full border">
                    <span className="text-blue-600 font-bold">coin: {currentStepData?.coin ?? '-'}</span>
                    <span className="text-green-600 font-bold">amount: {currentStepData?.amount ?? '-'}</span>
                  </div>
                </div>

                <DPTable 
                  dp={currentStepData?.dpAfter || []} 
                  currentIndex={currentStepData?.amount ?? -1} 
                  targetIndex={currentStepData?.formula?.prevIdx ?? -1}
                  highlightColor="blue"
                />
              </div>

              <div className="mt-12">
                <div className="bg-blue-50 p-5 rounded-2xl border-l-4 border-blue-500 relative shadow-sm">
                   <div className="absolute -top-3 left-6 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">AI 步骤解析</div>
                   <p className="text-blue-900 leading-relaxed font-medium">{explanation || "计算中..."}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
               <input type="range" min="0" max={steps.length - 1} value={currentStep} onChange={e => { setIsPlaying(false); setCurrentStep(+e.target.value); }} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Step</span>
                  <span className="text-blue-600 font-mono font-bold text-sm">{currentStep + 1}</span>
                  <span className="text-slate-300 font-mono text-sm">/</span>
                  <span className="text-slate-500 font-mono text-sm">{steps.length}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
