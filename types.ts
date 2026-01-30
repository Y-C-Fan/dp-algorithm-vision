
export enum AlgorithmMode {
  COMBINATION = 'COMBINATION', // Coin-first
  PERMUTATION = 'PERMUTATION'   // Amount-first
}

export interface Step {
  coin: number | null;
  amount: number;
  coinIdx: number;
  dpBefore: number[];
  dpAfter: number[];
  addedValue: number;
  description: string;
  activeLine: number; // 0: outer, 1: inner, 2: update
  formula: {
    target: number;
    current: number;
    prev: number;
    prevIdx: number;
  } | null;
}
