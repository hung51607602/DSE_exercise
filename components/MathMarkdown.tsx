import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import { normalizeMath } from "@/lib/latex";

/** 渲染 Markdown + LaTeX（$...$ / $$...$$）；單一換行會保留為換行 */
export default function MathMarkdown({ children }: { children: string }) {
  return (
    <div className="math-md space-y-2 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_table]:table [&_table]:table-sm">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
      >
        {normalizeMath(children)}
      </ReactMarkdown>
    </div>
  );
}
