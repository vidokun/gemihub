// Gemini 2.5 Flash pricing (standard tier, per 1M tokens)
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.15, output: 0.60 },
  'gemini-2.5-pro':   { input: 1.25, output: 5.00 },
};

const DEFAULT_PRICING = { input: 0.15, output: 0.60 };

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model?: string,
): number {
  const rate = model ? (PRICING[model] ?? DEFAULT_PRICING) : DEFAULT_PRICING;
  const cost =
    (inputTokens / 1_000_000) * rate.input +
    (outputTokens / 1_000_000) * rate.output;
  return Math.round(cost * 100) / 100;
}
