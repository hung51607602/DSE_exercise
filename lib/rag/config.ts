import path from "node:path";

// ============================================================
//  RAG 設定：資料夾位置、分類、檢索數量、切塊大小
// ============================================================

/** 參考資料根目錄，詳見 data/README.md */
export const DATA_DIR = path.join(process.cwd(), "data");

/** 向量索引持久化位置（自動生成，可隨時刪除重建） */
export const STORAGE_DIR = path.join(process.cwd(), "storage");

/**
 * 資料分類 = data/ 底下的第一層資料夾名稱。
 * topK 是每次出題時從該分類取回的片段數量。
 * 想新增分類（例如 marking-schemes），在 data/ 開新資料夾並在這裡加一行即可。
 */
export const RAG_CATEGORIES = [
  { key: "papers", label: "歷屆試題 / 卷子", topK: 3 },
  { key: "knowledge", label: "知識點", topK: 4 },
  { key: "question-types", label: "題型", topK: 3 },
] as const;

export type CategoryKey = (typeof RAG_CATEGORIES)[number]["key"];

/** 不屬於任何 topic 的檔案，會套用到所有 topic */
export const COMMON_TOPIC_ID = "common";

/** 文件切塊設定 */
export const CHUNK_SIZE = 512;
export const CHUNK_OVERLAP = 64;

/** 每個片段放進 prompt 前的最大字元數（避免 prompt 過長） */
export const MAX_SNIPPET_CHARS = 1500;
