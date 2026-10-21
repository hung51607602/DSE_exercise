import { completeWithFallback } from "./llm";
import { SYSTEM_PROMPT } from "./prompts/system-prompt";
import {
  DIFFICULTY_TEXT,
  LANGUAGE_TEXT,
  OUTPUT_FORMAT,
  QUESTION_PROMPT_TEMPLATE,
  QUESTION_TYPE_TEXT,
  buildRetrievalQuery,
} from "./prompts/question-prompt";
import { fillTemplate } from "./prompts/render";
import { TOPIC_GUIDES } from "./prompts/topic-guides";
import { retrieveContext } from "./rag/retriever";
import {
  QUESTIONS_JSON_SCHEMA,
  parseQuestions,
  type GenerateRequest,
  type GenerateResponse,
  type SourceSnippet,
} from "./schema";
import type { Topic } from "./topics";

function formatSnippets(snippets: SourceSnippet[]): string {
  if (snippets.length === 0) return "(none)";
  return snippets.map((s, i) => `[${i + 1}] (source: ${s.file})\n${s.text}`).join("\n\n");
}

/** 出題流程：RAG 檢索 → 套用 prompt 模板 → 呼叫 LLM → 解析 JSON */
export async function generateQuestions(
  topic: Topic,
  req: GenerateRequest,
): Promise<GenerateResponse> {
  // 1. RAG：取回該 topic 的參考資料
  const context = await retrieveContext(topic, buildRetrievalQuery(topic.name, req.extraInstruction));

  // 2. Prompt engineering：把指引和參考資料填進模板
  const userPrompt = fillTemplate(QUESTION_PROMPT_TEMPLATE, {
    topicId: topic.id,
    topicName: topic.name,
    strand: topic.strand,
    topicGuide: TOPIC_GUIDES[topic.id] || "(none)",
    count: req.count,
    difficulty: DIFFICULTY_TEXT[req.difficulty],
    questionType: QUESTION_TYPE_TEXT[req.questionType],
    language: LANGUAGE_TEXT[req.language],
    extraInstruction: req.extraInstruction?.trim() || "(none)",
    papers: formatSnippets(context.papers),
    knowledge: formatSnippets(context.knowledge),
    questionTypes: formatSnippets(context["question-types"]),
    outputFormat: OUTPUT_FORMAT,
  });

  if (process.env.DEBUG_PROMPT === "true") {
    console.log("========== SYSTEM ==========\n" + SYSTEM_PROMPT);
    console.log("========== USER ==========\n" + userPrompt);
  }

  // 3. 呼叫 LLM（DeepSeek → 必要時後備 Claude）
  const { text, model } = await completeWithFallback({
    system: SYSTEM_PROMPT,
    user: userPrompt,
    jsonSchema: QUESTIONS_JSON_SCHEMA as unknown as Record<string, unknown>,
  });

  // 4. 解析結果
  const questions = parseQuestions(text);
  if (questions.length === 0) throw new Error("LLM 沒有生成任何有效題目，請再試一次");

  return {
    questions,
    sources: [...context.papers, ...context.knowledge, ...context["question-types"]],
    model,
  };
}
