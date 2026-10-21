import { MetadataMode, type BaseNode } from "llamaindex";
import type { SourceSnippet } from "../schema";
import type { Topic } from "../topics";
import { COMMON_TOPIC_ID, MAX_SNIPPET_CHARS, RAG_CATEGORIES, type CategoryKey } from "./config";
import { getRagStore } from "./index-store";

export type RetrievedContext = Record<CategoryKey, SourceSnippet[]>;

function emptyContext(): RetrievedContext {
  return Object.fromEntries(RAG_CATEGORIES.map((c) => [c.key, []])) as unknown as RetrievedContext;
}

function toSnippet(node: BaseNode, score?: number): SourceSnippet {
  const text = node.getContent(MetadataMode.NONE).trim();
  return {
    category: String(node.metadata.category),
    file: String(node.metadata.file),
    text: text.length > MAX_SNIPPET_CHARS ? `${text.slice(0, MAX_SNIPPET_CHARS)}…` : text,
    score,
  };
}

// ---------- 關鍵字檢索（無 embedding 時的後備方案）----------

/** 英文/數字取單字，中文取相鄰兩字（bigram） */
function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z0-9]{2,}/g) ?? [];
  const cjk = lower.match(/[一-鿿]+/g) ?? [];
  const bigrams = cjk.flatMap((run) =>
    run.length === 1 ? [run] : Array.from({ length: run.length - 1 }, (_, i) => run.slice(i, i + 2)),
  );
  return [...words, ...bigrams];
}

function keywordSearch(nodes: BaseNode[], query: string, topK: number): SourceSnippet[] {
  const queryTerms = new Set(tokenize(query));
  const docs = nodes.map((node) => {
    const tf = new Map<string, number>();
    for (const t of tokenize(node.getContent(MetadataMode.NONE))) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { node, tf };
  });
  const df = new Map<string, number>();
  for (const { tf } of docs) for (const t of queryTerms) if (tf.has(t)) df.set(t, (df.get(t) ?? 0) + 1);

  return docs
    .map(({ node, tf }) => {
      let score = 0;
      for (const t of queryTerms) {
        const f = tf.get(t);
        if (f) score += (1 + Math.log(f)) * Math.log(1 + docs.length / (df.get(t) ?? 1));
      }
      // 屬於該 topic 的資料（非 common）稍微加分
      if (node.metadata.topicId !== COMMON_TOPIC_ID) score += 1;
      return { node, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ node, score }) => toSnippet(node, score));
}

// ---------- 對外 API ----------

/**
 * 依 topic 從每個分類取回相關片段。
 * 只會取該 topic 的資料 + 標記為 common 的資料。
 */
export async function retrieveContext(topic: Topic, query: string): Promise<RetrievedContext> {
  const store = await getRagStore();
  const result = emptyContext();
  if (store.mode === "empty") return result;

  await Promise.all(
    RAG_CATEGORIES.map(async ({ key, topK }) => {
      if (store.mode === "vector") {
        const retriever = store.index.asRetriever({
          similarityTopK: topK,
          filters: {
            filters: [
              { key: "category", value: key, operator: "==" },
              { key: "topicId", value: [topic.id, COMMON_TOPIC_ID], operator: "in" },
            ],
            condition: "and",
          },
        });
        const hits = await retriever.retrieve({ query });
        result[key] = hits.map((h) => toSnippet(h.node, h.score));
      } else {
        const candidates = store.nodes.filter(
          (n) =>
            n.metadata.category === key &&
            (n.metadata.topicId === topic.id || n.metadata.topicId === COMMON_TOPIC_ID),
        );
        result[key] = keywordSearch(candidates, query, topK);
      }
    }),
  );
  return result;
}
