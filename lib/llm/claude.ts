import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMRequest } from "./types";

// 後備模型：Claude（透過官方 @anthropic-ai/sdk）
// 啟用方式：.env.local 設定 ANTHROPIC_API_KEY，並把 ENABLE_CLAUDE_FALLBACK=true（或 LLM_PROVIDER=claude）
export function createClaudeProvider(): LLMProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("未設定 ANTHROPIC_API_KEY，請在 .env.local 填入 Claude API Key");
  }
  const model = process.env.CLAUDE_MODEL || "claude-opus-5-5";
  const client = new Anthropic({ apiKey });

  return {
    name: `claude:${model}`,
    async complete({ system, user, jsonSchema }: LLMRequest) {
      // 用 streaming + finalMessage() 避免長輸出時 HTTP timeout
      const stream = client.beta.messages.stream({
        model,
        max_tokens: 32000,
        system,
        messages: [{ role: "user", content: user }],
        thinking: { type: "adaptive" },
        output_config: {
          effort: "medium",
          // Structured outputs：保證回傳符合 schema 的 JSON
          ...(jsonSchema ? { format: { type: "json_schema", schema: jsonSchema } } : {}),
        },
        // 安全分類器誤判拒答時，由伺服器自動改用預設的後備模型重試
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      const message = await stream.finalMessage();

      if (message.stop_reason === "refusal") {
        throw new Error("Claude 拒絕了這次請求（refusal），請調整 prompt 後再試");
      }
      return message.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
    },
  };
}
