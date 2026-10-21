// ============================================================
//  User Prompt 模板：每次出題時送給 LLM 的內容
//  用 {{變數}} 標記要替換的位置（可放心在模板內寫 LaTeX / JSON 的大括號）
//
//  可用變數：
//    {{topicId}} {{topicName}} {{strand}} {{topicGuide}}
//    {{count}} {{difficulty}} {{questionType}} {{language}} {{extraInstruction}}
//    {{papers}} {{knowledge}} {{questionTypes}}   ← RAG 取回的參考資料
//    {{outputFormat}}
// ============================================================

export const QUESTION_PROMPT_TEMPLATE = `# Task
Write {{count}} original HKDSE Mathematics practice question(s) for:
**Topic {{topicId}}: {{topicName}}** ({{strand}})

## Requirements
- Difficulty: {{difficulty}}
- Question type: {{questionType}}
- Language: {{language}}
- Additional instructions from the teacher: {{extraInstruction}}

## Topic guidelines
{{topicGuide}}

## REFERENCE MATERIALS (retrieved from the question bank — for calibration only, do NOT copy)

### Past paper questions
{{papers}}

### Knowledge points
{{knowledge}}

### Question types / patterns
{{questionTypes}}

## Output format
{{outputFormat}}`;

/** 描述 JSON 輸出格式（DeepSeek JSON mode 需要在 prompt 中看到 "json" 和範例） */
export const OUTPUT_FORMAT = `Return json in exactly this shape (see section 8 of the system prompt for what goes in each field):
{
  "questions": [
    {
      "type": "mc" | "short" | "long",
      "difficulty": "easy" | "medium" | "hard",
      "section": "P1-A1" | "P1-A2" | "P1-B" | "P2-A" | "P2-B",
      "learningUnit": "4 續多項式",
      "learningObjectives": [
        { "code": "4.3", "name": "因式定理", "foundation": "FT" | "NFT" | "UNSURE" }
      ],
      "targetLevel": "3–4",
      "marks": 4,
      "estimatedMinutes": 5,
      "figureDescription": "Only if there is a figure: all given conditions in words, ending with (not drawn to scale)",
      "question": "Question stem in Markdown, maths in LaTeX, e.g. Simplify $\\\\frac{(a^2b)^3}{a^4b}$. Show the marks of each part, e.g. (a) ... (2 marks)",
      "options": ["option A", "option B", "option C", "option D"],
      "answer": "Final answer only, e.g. \\"B\\" or \\"$a^2b^2$\\"",
      "solution": "Full step-by-step solution in Markdown + LaTeX",
      "markingScheme": "Paper 1 only: one line per mark, e.g. $... = ...$ 1M, then 1A; note f.t. and alternative methods",
      "distractorAnalysis": ["A: why this option is right/wrong", "B: ...", "C: ...", "D: ..."],
      "commonMistakes": ["at least 2 common student mistakes"]
    }
  ]
}
- Paper 2 ("type": "mc", "section" P2-A / P2-B): include "options" (exactly 4, without "A." prefixes) and "distractorAnalysis" (4 items, in option order); "marks" is 1; omit "markingScheme".
- Paper 1 ("type": "short" / "long", "section" P1-*): include "markingScheme"; omit "options" and "distractorAnalysis".
- Omit "figureDescription" when there is no figure.
- Write "question", "solution", "markingScheme", "distractorAnalysis" and "commonMistakes" in the requested language. "learningUnit" and "learningObjectives" may stay in Chinese.
- Escape backslashes correctly so the output is valid JSON (write \\\\frac, not \\frac).
- Maths formatting: inline maths in $...$; multi-line working in a display block with $$ on its own line, e.g. "$$\\n\\\\begin{aligned} ... \\\\end{aligned}\\n$$". Never use \\\\( \\\\) or \\\\[ \\\\].
- Keep Chinese words outside $...$ (write 售價 $= 320 \\\\times 0.8$, not $售價 = 320 \\\\times 0.8$).
- Money: write the dollar sign as \\\\$ inside maths, e.g. $\\\\$320$.
- Use "\\n" line breaks between steps and between parts (a), (b), (c).
- Paper 2: do NOT repeat the options inside "question"; put them only in "options".
- For "long" questions with parts, label them (a), (b), (c) inside "question", "solution" and "markingScheme".
- Do the self-check (section 10) silently. Do not output the checklist.`;

// ---------- 下拉選單選項 → 寫進 prompt 的文字 ----------

export const DIFFICULTY_TEXT = {
  easy: 'Easy — Paper 1 Section A(1) ("P1-A1") / easy Paper 2 Section A ("P2-A") level',
  medium: 'Medium — Paper 1 Section A(2) ("P1-A2") / Paper 2 Section A ("P2-A") level',
  hard: 'Hard — Paper 1 Section B ("P1-B") / Paper 2 Section B ("P2-B") level',
  mixed: "Mixed — include a range from easy to hard",
} as const;

export const QUESTION_TYPE_TEXT = {
  mc: 'Multiple choice only (Paper 2, "type": "mc")',
  short: 'Short questions only (Paper 1 Section A(1)/A(2) style, "type": "short")',
  long: 'Long structured questions only (Paper 1 Section B style, "type": "long")',
  mixed: "A mix of multiple choice, short and long questions",
} as const;

export const LANGUAGE_TEXT = {
  en: "English",
  zh: "Traditional Chinese (繁體中文), using the standard HKDSE Chinese terminology",
} as const;

/**
 * RAG 檢索用的查詢句：決定從資料庫取回哪些片段。
 * 可以在這裡加入更多關鍵字，讓檢索更精準。
 */
export function buildRetrievalQuery(topicName: string, extraInstruction?: string) {
  return [`HKDSE Mathematics ${topicName}`, extraInstruction].filter(Boolean).join(". ");
}
