// 前後端共用的型別：生成請求 / 題目 / 回應

export type Difficulty = "easy" | "medium" | "hard" | "mixed";
export type QuestionType = "mc" | "short" | "long" | "mixed";
export type Language = "en" | "zh";

/** 一次最多生成幾題（每題含評卷參考等內容，太多會超過 DeepSeek 8K 輸出上限） */
export const MAX_QUESTIONS = 5;

export interface GenerateRequest {
  topicId: string;
  count: number;
  difficulty: Difficulty;
  questionType: QuestionType;
  language: Language;
  /** 使用者額外要求（可選），例如「多出一些應用題」 */
  extraInstruction?: string;
}

/** 卷別與部分：P1 = 卷一，P2 = 卷二；A1 = 甲(1)、A2 = 甲(2)、A = 甲部、B = 乙部 */
export type PaperSection = "P1-A1" | "P1-A2" | "P1-B" | "P2-A" | "P2-B";

export const SECTION_LABEL: Record<PaperSection, string> = {
  "P1-A1": "卷一 甲(1)",
  "P1-A2": "卷一 甲(2)",
  "P1-B": "卷一 乙部",
  "P2-A": "卷二 甲部",
  "P2-B": "卷二 乙部",
};

export interface LearningObjective {
  /** 學習目標編號，例如 "13.2" */
  code: string;
  /** 例如 "直線與圓的相交" */
  name: string;
  /** FT = 基礎課題，NFT = 非基礎課題，UNSURE = 待核對 */
  foundation: "FT" | "NFT" | "UNSURE";
}

export interface Question {
  type: "mc" | "short" | "long";
  difficulty: "easy" | "medium" | "hard";
  /** 【部分】 */
  section: PaperSection;
  /** 【課題】學習單位編號及名稱，例如 "4 續多項式" */
  learningUnit: string;
  /** 【基礎/非基礎】每個涉及的學習目標 */
  learningObjectives: LearningObjective[];
  /** 【目標等級】例如 "3–4" */
  targetLevel: string;
  /** 【分值】卷一為題目總分（各小問分數寫在 question 內），卷二固定為 1 */
  marks: number;
  /** 【預計作答時間】分鐘 */
  estimatedMinutes: number;
  /** 【圖形說明】有圖時才有 */
  figureDescription?: string;
  /** 【題幹】Markdown + LaTeX（$...$ / $$...$$） */
  question: string;
  /** 卷二才有，固定 4 個選項，不含 "A." 前綴 */
  options?: string[];
  /** 最終答案，例如 "B" 或 "$x = 3$" */
  answer: string;
  /** 【完整解答】Markdown + LaTeX */
  solution: string;
  /** 【評卷參考】卷一才有：逐步標 1M / 1A / 1 / f.t.，並列出其他方法 */
  markingScheme?: string;
  /** 【正確答案及干擾項錯因】卷二才有：依序對應選項 A–D */
  distractorAnalysis?: string[];
  /** 【常見錯誤】至少 2 項 */
  commonMistakes: string[];
}

export interface SourceSnippet {
  category: string;
  file: string;
  text: string;
  score?: number;
}

export interface GenerateResponse {
  questions: Question[];
  sources: SourceSnippet[];
  /** 實際使用的模型，例如 "deepseek:deepseek-chat" */
  model: string;
}

/**
 * 題目的 JSON Schema。
 * - Claude：透過 structured outputs 強制遵守
 * - DeepSeek：JSON mode 只保證是 JSON，不保證欄位，所以下方 parseQuestions 會再檢查
 */
export const QUESTIONS_JSON_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["mc", "short", "long"] },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          section: { type: "string", enum: ["P1-A1", "P1-A2", "P1-B", "P2-A", "P2-B"] },
          learningUnit: { type: "string" },
          learningObjectives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                name: { type: "string" },
                foundation: { type: "string", enum: ["FT", "NFT", "UNSURE"] },
              },
              required: ["code", "name", "foundation"],
              additionalProperties: false,
            },
          },
          targetLevel: { type: "string" },
          marks: { type: "integer" },
          estimatedMinutes: { type: "integer" },
          figureDescription: { type: "string" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "string" },
          solution: { type: "string" },
          markingScheme: { type: "string" },
          distractorAnalysis: { type: "array", items: { type: "string" } },
          commonMistakes: { type: "array", items: { type: "string" } },
        },
        required: [
          "type",
          "difficulty",
          "section",
          "learningUnit",
          "learningObjectives",
          "targetLevel",
          "marks",
          "estimatedMinutes",
          "question",
          "answer",
          "solution",
          "commonMistakes",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
} as const;

const SECTIONS = Object.keys(SECTION_LABEL);

/**
 * LLM 有時在 JSON 裡只寫一個反斜線（"\times" 而非 "\\times"），
 * JSON.parse 會把 \t \f \b \r 當成控制字元，令 LaTeX 指令變成「tab + imes」。這裡還原回來。
 */
function repairLatex(text: string): string {
  return text
    .replace(/\f/g, "\\f")
    .replace(/\x08/g, "\\b")
    .replace(/\t(?=[a-zA-Z])/g, "\\t")
    .replace(/\r(?=[a-zA-Z])/g, "\\r");
}

function str(value: unknown): string {
  return typeof value === "string" ? repairLatex(value) : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").map(repairLatex) : [];
}

/** 選擇題題幹末尾如果重複列出了 A–D 選項，把它們刪掉（選項已另外顯示） */
function stripInlineOptions(question: string): string {
  const lines = question.split("\n");
  let cut = lines.length;
  while (cut > 0 && /^\s*\(?[A-D][.．、)）]/.test(lines[cut - 1])) cut--;
  return lines.length - cut >= 4 ? lines.slice(0, cut).join("\n").trimEnd() : question;
}

/** 把 LLM 給的單題補齊/修正成合法的 Question；缺少題目或答案則回傳 null */
function normalizeQuestion(raw: unknown): Question | null {
  if (typeof raw !== "object" || raw === null) return null;
  const q = raw as Record<string, unknown>;
  if (typeof q.question !== "string" || typeof q.answer !== "string") return null;

  const type = q.type === "mc" || q.type === "long" ? q.type : "short";
  const fallbackSection: PaperSection = type === "mc" ? "P2-A" : type === "long" ? "P1-B" : "P1-A1";
  const options = stringArray(q.options);
  const distractorAnalysis = stringArray(q.distractorAnalysis);

  return {
    type,
    difficulty: q.difficulty === "easy" || q.difficulty === "hard" ? q.difficulty : "medium",
    section: SECTIONS.includes(q.section as string) ? (q.section as PaperSection) : fallbackSection,
    learningUnit: str(q.learningUnit),
    learningObjectives: Array.isArray(q.learningObjectives)
      ? q.learningObjectives
          .filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null)
          .map((o) => ({
            code: String(o.code ?? ""),
            name: String(o.name ?? ""),
            foundation: o.foundation === "FT" || o.foundation === "NFT" ? o.foundation : "UNSURE",
          }))
      : [],
    targetLevel: typeof q.targetLevel === "string" ? q.targetLevel : "",
    marks: Number(q.marks) || (type === "mc" ? 1 : 0),
    estimatedMinutes: Number(q.estimatedMinutes) || 0,
    figureDescription: str(q.figureDescription).trim() || undefined,
    question: options.length > 0 ? stripInlineOptions(str(q.question)) : str(q.question),
    options: options.length > 0 ? options : undefined,
    answer: str(q.answer),
    solution: str(q.solution),
    markingScheme: str(q.markingScheme).trim() || undefined,
    distractorAnalysis: distractorAnalysis.length > 0 ? distractorAnalysis : undefined,
    commonMistakes: stringArray(q.commonMistakes),
  };
}

/** 解析 LLM 回傳的文字為題目陣列（容忍 ```json 包裹、前後多餘文字） */
export function parseQuestions(raw: string): Question[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("LLM 回傳的內容不是 JSON");
  }
  const data = JSON.parse(cleaned.slice(start, end + 1)) as { questions?: unknown };
  if (!Array.isArray(data.questions)) {
    throw new Error("LLM 回傳的 JSON 缺少 questions 陣列");
  }
  return data.questions.map(normalizeQuestion).filter((q): q is Question => q !== null);
}
