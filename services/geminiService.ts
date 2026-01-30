
import { GoogleGenAI } from "@google/genai";
import { AlgorithmMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple cache to prevent redundant API calls
const explanationCache: Record<string, string> = {};

export const getStepExplanation = async (
  mode: AlgorithmMode,
  currentCoin: number,
  currentAmount: number,
  prevValue: number,
  addedValue: number
) => {
  const cacheKey = `${mode}-${currentCoin}-${currentAmount}-${prevValue}-${addedValue}`;
  if (explanationCache[cacheKey]) return explanationCache[cacheKey];

  const prompt = `
    In the dynamic programming "Coin Change II" problem (Unbounded Knapsack):
    The current mode is ${mode === AlgorithmMode.COMBINATION ? 'Combinations (Coin-first)' : 'Permutations (Amount-first)'}.
    We are at Amount: ${currentAmount} using Coin: ${currentCoin}.
    The DP value for ${currentAmount} was ${prevValue}, and we are adding ${addedValue} (which comes from dp[${currentAmount} - ${currentCoin}]).
    
    Briefly explain (in 1-2 sentences in Chinese) why this step contributes to the final result and what it represents in terms of building combinations or permutations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.5,
      },
    });
    const text = response.text || "";
    explanationCache[cacheKey] = text;
    return text;
  } catch (error: any) {
    if (error?.message?.includes('429')) {
      console.warn("Rate limit exceeded (429). Using fallback.");
    }
    return ""; // Return empty to use local fallback
  }
};

export const getDeepComparison = async (amount: number, coins: number[]) => {
  const prompt = `
    Explain the fundamental difference between these two loop orders in Chinese:
    1. Outer: Coins, Inner: Amount (Combination)
    2. Outer: Amount, Inner: Coins (Permutation)
    
    Use the specific example: Amount=${amount}, Coins=[${coins.join(', ')}].
    Focus on WHY the first one avoids counting {1, 2} and {2, 1} separately, while the second one counts both.
    Provide a clear, high-quality technical explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "解析引擎繁忙，请稍后再试。";
  }
};
