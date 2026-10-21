import { createClaudeProvider } from "./claude";
import { createDeepSeekProvider } from "./deepseek";
import type { LLMProvider, LLMRequest } from "./types";

export type { LLMProvider, LLMRequest } from "./types";

type ProviderName = "deepseek" | "claude";

const FACTORIES: Record<ProviderName, () => LLMProvider> = {
  deepseek: createDeepSeekProvider,
  claude: createClaudeProvider,
};

/**
 * 依 .env.local 決定模型順序：
 *  - 主要：LLM_PROVIDER（預設 deepseek）
 *  - 後備：ENABLE_CLAUDE_FALLBACK=true 時加入 Claude
 */
function providerChain(): ProviderName[] {
  const primary = (process.env.LLM_PROVIDER || "deepseek") as ProviderName;
  if (!(primary in FACTORIES)) {
    throw new Error(`未知的 LLM_PROVIDER: ${primary}（可用：deepseek / claude）`);
  }
  const chain: ProviderName[] = [primary];
  if (process.env.ENABLE_CLAUDE_FALLBACK === "true" && primary !== "claude") {
    chain.push("claude");
  }
  return chain;
}

/** 依序嘗試各模型，第一個成功的結果即回傳 */
export async function completeWithFallback(
  req: LLMRequest,
): Promise<{ text: string; model: string }> {
  const errors: string[] = [];
  for (const name of providerChain()) {
    try {
      const provider = FACTORIES[name]();
      const text = await provider.complete(req);
      return { text, model: provider.name };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[llm] ${name} 失敗：`, msg);
      errors.push(`${name}: ${msg}`);
    }
  }
  throw new Error(`所有模型都失敗了 —— ${errors.join(" | ")}`);
}
