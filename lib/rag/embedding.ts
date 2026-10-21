import { OpenAIEmbedding } from "@llamaindex/openai";
import type { BaseEmbedding } from "llamaindex";

/**
 * 依 EMBEDDING_PROVIDER 建立 embedding model。
 * 回傳 null 代表沒有設定 embedding，RAG 會改用關鍵字檢索。
 */
export function getEmbedModel(): BaseEmbedding | null {
  const provider = process.env.EMBEDDING_PROVIDER || "none";
  if (provider === "none") return null;

  if (provider === "openai") {
    const apiKey = process.env.EMBEDDING_API_KEY;
    if (!apiKey) {
      console.warn("[rag] EMBEDDING_PROVIDER=openai 但未設定 EMBEDDING_API_KEY，改用關鍵字檢索");
      return null;
    }
    return new OpenAIEmbedding({
      apiKey,
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      additionalSessionOptions: {
        baseURL: process.env.EMBEDDING_BASE_URL || "https://api.openai.com/v1",
      },
    });
  }

  throw new Error(`未知的 EMBEDDING_PROVIDER: ${provider}（可用：none / openai）`);
}

/** 用來判斷已存的向量索引是否和目前 embedding 設定一致 */
export function embedModelId(): string {
  const provider = process.env.EMBEDDING_PROVIDER || "none";
  if (provider === "none") return "none";
  return `${provider}:${process.env.EMBEDDING_BASE_URL ?? ""}:${process.env.EMBEDDING_MODEL ?? ""}`;
}
