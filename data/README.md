# RAG 參考資料庫

把出題時要參考的資料放進以下資料夾（支援 `.md` `.txt` `.pdf` `.docx` `.csv` `.html` 等）：

| 資料夾 | 內容 | 每次取回片段數 |
| --- | --- | --- |
| `papers/` | 歷屆試題、模擬卷、校內卷 | 3 |
| `knowledge/` | 知識點、公式、筆記 | 4 |
| `question-types/` | 題型分類、出題模式、常見陷阱 | 3 |

（分類與數量在 `lib/rag/config.ts` 的 `RAG_CATEGORIES` 修改）

## 怎樣標記屬於哪個 Topic？

檔名或任何一層資料夾以 **topic 編號（1–18）** 開頭即可：

```
data/knowledge/03-indices-and-logs.md        → Topic 03
data/papers/12-circles/2019-p1-q15.md        → Topic 12
data/question-types/topic-17-probability.md  → Topic 17
data/papers/2019-DSE-Paper1.pdf              → 沒有編號 = common，所有 topic 都會參考
```

## 小技巧

- 用 Markdown/純文字比 PDF 效果好（PDF 的數學公式通常抽取得很亂）。題目可以用 LaTeX 寫。
- 一份整卷 PDF 建議按 topic 拆題後放到對應編號的檔案，檢索會準確很多。
- 以 `_` 開頭的檔案和 `README.md` 不會被讀取，可以當草稿。
- 新增/修改資料後，網站會在下一次出題時自動重建索引；也可以手動執行 `npm run rag:ingest`。
