import fs from "node:fs/promises";
import path from "node:path";
import {
  Settings,
  SentenceSplitter,
  VectorStoreIndex,
  storageContextFromDefaults,
  type BaseNode,
} from "llamaindex";
import { CHUNK_OVERLAP, CHUNK_SIZE, STORAGE_DIR } from "./config";
import { dataFingerprint, loadDocuments } from "./documents";
import { embedModelId, getEmbedModel } from "./embedding";

/**
 * 管理兩種檢索資料：
 *  - vector：有設定 embedding 時，用 LlamaIndex VectorStoreIndex（持久化在 storage/）
 *  - keyword：沒設定 embedding 時，直接把切好的 nodes 放在記憶體，用關鍵字打分
 * data/ 內容或 embedding 設定改變時會自動重建。
 */
export type RagStore =
  | { mode: "vector"; index: VectorStoreIndex }
  | { mode: "keyword"; nodes: BaseNode[] }
  | { mode: "empty" };

const META_FILE = path.join(STORAGE_DIR, "meta.json");

interface StoreMeta {
  fingerprint: string;
  embedModel: string;
  builtAt: string;
}

const splitter = new SentenceSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });

async function readMeta(): Promise<StoreMeta | null> {
  try {
    return JSON.parse(await fs.readFile(META_FILE, "utf8")) as StoreMeta;
  } catch {
    return null;
  }
}

async function build(fingerprint: string, log: (msg: string) => void): Promise<RagStore> {
  const docs = await loadDocuments();
  if (docs.length === 0) {
    log("[rag] data/ 內沒有參考資料，將不使用 RAG 出題");
    return { mode: "empty" };
  }

  const embedModel = getEmbedModel();
  if (!embedModel) {
    const nodes = splitter.getNodesFromDocuments(docs);
    log(`[rag] 關鍵字模式：${docs.length} 份文件，${nodes.length} 個片段`);
    return { mode: "keyword", nodes };
  }

  log(`[rag] 建立向量索引：${docs.length} 份文件（${embedModelId()}）...`);
  await fs.rm(STORAGE_DIR, { recursive: true, force: true });
  Settings.embedModel = embedModel;
  Settings.nodeParser = splitter;
  const storageContext = await storageContextFromDefaults({ persistDir: STORAGE_DIR });
  const index = await VectorStoreIndex.fromDocuments(docs, { storageContext });

  const meta: StoreMeta = { fingerprint, embedModel: embedModelId(), builtAt: new Date().toISOString() };
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2));
  log("[rag] 向量索引已儲存到 storage/");
  return { mode: "vector", index };
}

async function load(): Promise<RagStore> {
  const fingerprint = await dataFingerprint();
  const embedModel = getEmbedModel();
  const meta = await readMeta();

  // 已有持久化的向量索引，且資料與 embedding 設定都沒變 → 直接載入
  if (embedModel && meta && meta.fingerprint === fingerprint && meta.embedModel === embedModelId()) {
    Settings.embedModel = embedModel;
    const storageContext = await storageContextFromDefaults({ persistDir: STORAGE_DIR });
    const index = await VectorStoreIndex.init({ storageContext });
    return { mode: "vector", index };
  }
  return build(fingerprint, console.log);
}

// 在 dev 模式下 HMR 會重新載入模組，所以把快取放在 globalThis
const cache = globalThis as unknown as {
  __ragStore?: { fingerprint: string; embed: string; promise: Promise<RagStore> };
};

/** 取得目前的 RAG 資料（有快取；data/ 有變動時自動重建） */
export async function getRagStore(): Promise<RagStore> {
  const fingerprint = await dataFingerprint();
  const embed = embedModelId();
  const cached = cache.__ragStore;
  if (cached && cached.fingerprint === fingerprint && cached.embed === embed) {
    return cached.promise;
  }
  const promise = load();
  cache.__ragStore = { fingerprint, embed, promise };
  promise.catch(() => {
    if (cache.__ragStore?.promise === promise) cache.__ragStore = undefined;
  });
  return promise;
}

/** 強制重建（給 npm run rag:ingest 用） */
export async function rebuildRagStore(log: (msg: string) => void = console.log): Promise<RagStore> {
  return build(await dataFingerprint(), log);
}
