# DSE Maths 練習題生成器

Next.js 16 + DaisyUI 5 + LlamaIndex (RAG) + DeepSeek（Claude 作後備）

## 快速開始

```bash
cp .env.example .env.local   # 已經幫你建立好 .env.local，只需填 key
# 編輯 .env.local → 填入 DEEPSEEK_API_KEY
npm run dev                  # http://localhost:3000
```

## 出題流程

```
按「生成題目」 → POST /api/generate
  → lib/rag/retriever.ts     從 data/ 取回該 topic 的卷子 / 知識點 / 題型片段
  → lib/prompts/*            套入 system prompt + topic 指引 + 參考資料
  → lib/llm/*                呼叫 DeepSeek（失敗且啟用後備時改用 Claude）
  → lib/schema.ts            解析 JSON → 前端用 KaTeX 顯示
```

## 你需要編輯的檔案

| 用途 | 檔案 |
| --- | --- |
| API Key / 模型切換 | `.env.local` |
| 總體出題框架（角色、原則） | `lib/prompts/system-prompt.ts` |
| 每次出題的 prompt 模板 | `lib/prompts/question-prompt.ts` |
| 18 個 topic 各自的出題指引 | `lib/prompts/topic-guides.ts` |
| RAG 參考資料（卷子、知識點、題型） | `data/papers/` `data/knowledge/` `data/question-types/`（見 `data/README.md`） |
| RAG 分類、取回數量、切塊大小 | `lib/rag/config.ts` |
| RAG 檢索查詢句 | `lib/prompts/question-prompt.ts` → `buildRetrievalQuery()` |

## 指令

- `npm run dev` — 開發伺服器
- `npm run rag:ingest` — 手動重建 RAG 索引（平時會自動偵測 data/ 變動並重建）
- 在 `.env.local` 加 `DEBUG_PROMPT=true` 可在終端機看到完整 prompt
