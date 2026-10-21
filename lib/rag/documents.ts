import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import type { Document } from "llamaindex";
import { COMMON_TOPIC_ID, DATA_DIR, RAG_CATEGORIES } from "./config";

const CATEGORY_KEYS = new Set<string>(RAG_CATEGORIES.map((c) => c.key));

/** 不讀取的檔案：說明檔、隱藏檔、以 _ 開頭的草稿 */
function isIgnored(fileName: string) {
  return fileName.toLowerCase() === "readme.md" || fileName.startsWith(".") || fileName.startsWith("_");
}

/**
 * 從路徑推斷 topicId：任何一層資料夾或檔名以 1–18 的編號開頭即可，例如
 *   data/knowledge/03-indices.md            → "03"
 *   data/papers/topic-12/2019-paper1.pdf    → "12"
 *   data/papers/2019-DSE-paper1.pdf         → "common"（適用所有 topic）
 */
export function topicIdFromPath(relPath: string): string {
  for (const segment of relPath.split(/[\\/]/)) {
    const m = segment.match(/^(?:topic[-_ ]?)?(\d{1,2})(?:[-_ .]|$)/i);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 18) return String(n).padStart(2, "0");
    }
  }
  return COMMON_TOPIC_ID;
}

async function listFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const nested = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return listFiles(full);
      return Promise.resolve(isIgnored(e.name) ? [] : [full]);
    }),
  );
  return nested.flat();
}

/** data/ 內容的指紋（檔名 + 大小 + 修改時間），用來判斷索引是否需要重建 */
export async function dataFingerprint(): Promise<string> {
  const files = (await listFiles(DATA_DIR)).sort();
  const hash = createHash("sha1");
  for (const f of files) {
    const stat = await fs.stat(f);
    hash.update(`${path.relative(DATA_DIR, f)}:${stat.size}:${stat.mtimeMs}\n`);
  }
  return hash.digest("hex");
}

/**
 * 讀取 data/ 底下所有參考資料（支援 .md .txt .pdf .docx .csv .json ...），
 * 並為每份文件加上 metadata：category / topicId / file
 */
export async function loadDocuments(): Promise<Document[]> {
  if ((await listFiles(DATA_DIR)).length === 0) return [];

  const reader = new SimpleDirectoryReader();
  const docs = await reader.loadData({ directoryPath: DATA_DIR });

  return docs.filter((doc) => {
    const filePath = String(doc.metadata.file_path ?? "");
    const fileName = path.basename(filePath);
    if (!filePath || isIgnored(fileName) || !doc.text.trim()) return false;

    const rel = path.relative(DATA_DIR, filePath);
    const category = rel.split(/[\\/]/)[0];
    if (!CATEGORY_KEYS.has(category)) return false;

    doc.metadata = {
      category,
      topicId: topicIdFromPath(rel),
      file: rel,
    };
    return true;
  });
}
