import { DeepSeekLLM } from "@llamaindex/deepseek";
import type { LLMProvider, LLMRequest } from "./types";

export function createDeepSeekProvider(): LLMProvider {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("未設定 DEEPSEEK_API_KEY，請在 .env.local 填入 DeepSeek API Key");
  }
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  const llm = new DeepSeekLLM({
    apiKey,
    // DEEPSEEK_MODELS 只列了 deepseek-chat / deepseek-coder，其他型號（如 deepseek-reasoner）也能用
    model: model as "deepseek-chat",
    temperature: 0.7,
    maxTokens: 8000,
    timeout: 180_000,
    additionalSessionOptions: {
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    },
  });

  return {
    name: `deepseek:${model}`,
    async complete({ system, user, jsonSchema }: LLMRequest) {
      const res = await llm.chat({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        // DeepSeek 支援 JSON mode（prompt 內需出現 "json" 字樣並給出格式範例）
        additionalChatOptions: jsonSchema
          ? { response_format: { type: "json_object" } }
          : undefined,
      });
      const content = res.message.content;
      return typeof content === "string"
        ? content
        : content.map((c) => (c.type === "text" ? c.text : "")).join("");
    },
  };
}
