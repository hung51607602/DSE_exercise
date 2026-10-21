import { SECTION_LABEL, type Question } from "@/lib/schema";
import MathMarkdown from "./MathMarkdown";

const TYPE_LABEL = { mc: "選擇題", short: "短題目", long: "長題目" } as const;
const DIFFICULTY_BADGE = {
  easy: "badge-success",
  medium: "badge-warning",
  hard: "badge-error",
} as const;
const FOUNDATION_BADGE = {
  FT: { label: "基礎", className: "badge-info" },
  NFT: { label: "非基礎", className: "badge-secondary" },
  UNSURE: { label: "待核對", className: "badge-warning" },
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="font-semibold">{title}</div>
      {children}
    </div>
  );
}

export default function QuestionCard({ index, question: q }: { index: number; question: Question }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        {/* 題目資料：部分、題型、難度、分值、時間、目標等級 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Q{index + 1}</span>
          <span className="badge badge-neutral badge-sm">{SECTION_LABEL[q.section]}</span>
          <span className="badge badge-outline badge-sm">{TYPE_LABEL[q.type]}</span>
          <span className={`badge badge-soft badge-sm ${DIFFICULTY_BADGE[q.difficulty]}`}>{q.difficulty}</span>
          {q.marks > 0 && <span className="badge badge-ghost badge-sm">{q.marks} 分</span>}
          {q.estimatedMinutes > 0 && <span className="badge badge-ghost badge-sm">約 {q.estimatedMinutes} 分鐘</span>}
          {q.targetLevel && <span className="badge badge-ghost badge-sm">目標 Level {q.targetLevel}</span>}
        </div>

        {/* 課題與學習目標（FT / NFT） */}
        {(q.learningUnit || q.learningObjectives.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {q.learningUnit && <span className="opacity-70">{q.learningUnit}</span>}
            {q.learningObjectives.map((o) => {
              const f = FOUNDATION_BADGE[o.foundation];
              return (
                <span key={`${o.code}-${o.name}`} className={`badge badge-soft badge-xs ${f.className}`}>
                  {o.code} {o.name} · {f.label}
                </span>
              );
            })}
          </div>
        )}

        {q.figureDescription && (
          <div className="text-sm bg-base-200 rounded-box p-3">
            <span className="font-semibold">圖形說明：</span>
            <MathMarkdown>{q.figureDescription}</MathMarkdown>
          </div>
        )}

        <MathMarkdown>{q.question}</MathMarkdown>

        {q.options && q.options.length > 0 && (
          <ol className="grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                <MathMarkdown>{opt}</MathMarkdown>
              </li>
            ))}
          </ol>
        )}

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" aria-label="顯示答案與詳解" />
          <div className="collapse-title text-sm font-medium">答案與詳解</div>
          <div className="collapse-content text-sm space-y-4">
            <Section title="答案">
              <MathMarkdown>{q.answer}</MathMarkdown>
            </Section>

            <Section title="完整解答">
              <MathMarkdown>{q.solution}</MathMarkdown>
            </Section>

            {q.markingScheme && (
              <Section title="評卷參考">
                <MathMarkdown>{q.markingScheme}</MathMarkdown>
              </Section>
            )}

            {q.distractorAnalysis && (
              <Section title="正確答案及干擾項錯因">
                <ul className="space-y-1">
                  {q.distractorAnalysis.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                      <MathMarkdown>{d.replace(/^[A-D][.:：]\s*/, "")}</MathMarkdown>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {q.commonMistakes.length > 0 && (
              <Section title="常見錯誤">
                <ul className="list-disc pl-5 space-y-1">
                  {q.commonMistakes.map((m, i) => (
                    <li key={i}>
                      <MathMarkdown>{m}</MathMarkdown>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
