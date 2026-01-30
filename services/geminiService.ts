
import { GoogleGenAI, Type } from "@google/genai";
import { AlgorithmMode } from "../types";

// Always use named parameter for apiKey and obtain directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStepExplanation = async (
  mode: AlgorithmMode,
  currentCoin: number,
  currentAmount: number,
  prevValue: number,
  addedValue: number
) => {
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
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });
    // Extract text output using the .text property
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "解析步骤中...";
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
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    // Extract text output using the .text property
    return response.text;
  } catch (error) {
    return "无法获取深度解析，请检查网络连接。";
  }
};
