// 手動重建 RAG 索引：npm run rag:ingest
import { rebuildRagStore } from "../lib/rag/index-store";
import { RAG_CATEGORIES } from "../lib/rag/config";

const store = await rebuildRagStore();

if (store.mode === "keyword") {
  const counts = RAG_CATEGORIES.map(
    ({ key }) => `${key}: ${store.nodes.filter((n) => n.metadata.category === key).length}`,
  );
  console.log(`[rag] 片段數量 → ${counts.join(", ")}`);
  console.log("[rag] 目前是關鍵字模式；在 .env.local 設定 EMBEDDING_PROVIDER=openai 可改用向量檢索");
}
console.log("[rag] 完成");
