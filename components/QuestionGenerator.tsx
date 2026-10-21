"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MAX_QUESTIONS,
  type Difficulty,
  type GenerateRequest,
  type GenerateResponse,
  type Language,
  type QuestionType,
} from "@/lib/schema";
import type { Topic } from "@/lib/topics";
import QuestionCard from "./QuestionCard";

export default function QuestionGenerator({ topic }: { topic: Topic }) {
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [questionType, setQuestionType] = useState<QuestionType>("mixed");
  const [language, setLanguage] = useState<Language>("en");
  const [extraInstruction, setExtraInstruction] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const body: GenerateRequest = {
        topicId: topic.id,
        count,
        difficulty,
        questionType,
        language,
        extraInstruction: extraInstruction || undefined,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data as GenerateResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 標題列：左邊 topic 名稱，右上角生成按鈕 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="link link-hover text-sm opacity-60">
            ← 所有課題
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            <span className="font-thin opacity-40 tabular-nums mr-2">{topic.id}</span>
            {topic.name}
          </h1>
          <p className="text-xs uppercase font-semibold opacity-60">{topic.strand}</p>
        </div>

        {loading ? (
          <button className="btn btn-neutral btn-outline shrink-0" disabled>
            <span className="loading loading-spinner"></span>
            生成中
          </button>
        ) : (
          <button className="btn btn-neutral btn-outline shrink-0" onClick={handleGenerate}>
            生成題目
          </button>
        )}
      </div>

      {/* 出題設定 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body grid gap-3 sm:grid-cols-4">
          <label className="flex flex-col">
            <span className="text-xs opacity-70 mb-1">題目數量</span>
            <select
              className="select select-sm w-full"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {Array.from({ length: MAX_QUESTIONS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} 題
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-xs opacity-70 mb-1">難度</span>
            <select
              className="select select-sm w-full"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="mixed">混合</option>
              <option value="easy">容易</option>
              <option value="medium">中等</option>
              <option value="hard">困難</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-xs opacity-70 mb-1">題型</span>
            <select
              className="select select-sm w-full"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            >
              <option value="mixed">混合</option>
              <option value="mc">選擇題 (Paper 2)</option>
              <option value="short">短題目 (Paper 1 A)</option>
              <option value="long">長題目 (Paper 1 B)</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-xs opacity-70 mb-1">語言</span>
            <select
              className="select select-sm w-full"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <label className="flex flex-col sm:col-span-4">
            <span className="text-xs opacity-70 mb-1">額外要求（可選）</span>
            <input
              type="text"
              className="input input-sm w-full"
              placeholder="例如：多出一些生活應用題"
              value={extraInstruction}
              maxLength={500}
              onChange={(e) => setExtraInstruction(e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>{error}</span>
        </div>
      )}

      {!result && !loading && !error && (
        <p className="text-center text-sm opacity-60 py-10">按右上角「生成題目」開始</p>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>模型：{result.model}</span>
            <button className="btn btn-neutral btn-dash btn-xs" onClick={() => setResult(null)}>
              清除
            </button>
          </div>

          {result.questions.map((q, i) => (
            <QuestionCard key={i} index={i} question={q} />
          ))}

          {/* RAG 取回的參考資料，方便檢查檢索效果 */}
          <div className="collapse collapse-arrow bg-base-100 shadow-sm">
            <input type="checkbox" aria-label="顯示參考資料" />
            <div className="collapse-title text-sm font-medium">
              RAG 參考資料（{result.sources.length} 段）
            </div>
            <div className="collapse-content text-xs space-y-3">
              {result.sources.length === 0 ? (
                <p className="opacity-60">沒有取回任何參考資料（data/ 資料夾為空或沒有相關內容）</p>
              ) : (
                result.sources.map((s, i) => (
                  <div key={i} className="border-l-2 border-base-300 pl-3">
                    <div className="font-semibold opacity-70">
                      [{s.category}] {s.file}
                      {s.score !== undefined && ` · score ${s.score.toFixed(3)}`}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans mt-1">{s.text}</pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
