import { generateQuestions } from "@/lib/generate";
import { MAX_QUESTIONS, type GenerateRequest } from "@/lib/schema";
import { getTopic } from "@/lib/topics";

const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];
const QUESTION_TYPES = ["mc", "short", "long", "mixed"];
const LANGUAGES = ["en", "zh"];

export async function POST(request: Request) {
  let body: Partial<GenerateRequest>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const topic = getTopic(String(body.topicId ?? ""));
  if (!topic) return Response.json({ error: "找不到此 topic" }, { status: 404 });

  const req: GenerateRequest = {
    topicId: topic.id,
    count: Math.min(Math.max(Number(body.count) || 3, 1), MAX_QUESTIONS),
    difficulty: DIFFICULTIES.includes(body.difficulty ?? "") ? body.difficulty! : "mixed",
    questionType: QUESTION_TYPES.includes(body.questionType ?? "") ? body.questionType! : "mixed",
    language: LANGUAGES.includes(body.language ?? "") ? body.language! : "en",
    extraInstruction: typeof body.extraInstruction === "string" ? body.extraInstruction.slice(0, 500) : undefined,
  };

  try {
    return Response.json(await generateQuestions(topic, req));
  } catch (err) {
    console.error("[api/generate]", err);
    const message = err instanceof Error ? err.message : "生成題目失敗";
    return Response.json({ error: message }, { status: 500 });
  }
}
