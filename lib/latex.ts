/**
 * 在交給 Markdown（remark-math）之前，修正 LLM 常見的 LaTeX 寫法：
 *  1. 數學式內的 \$（港幣金額，例如 $\$320$）：remark-math 會把其中的 $ 當成數學式結尾，
 *     改寫成 \text{\textdollar}；數學式外的 \$ 保留（Markdown 會顯示成 $）。
 *  2. \( ... \) → $ ... $，\[ ... \] → $$ ... $$
 *  3. 沒有包在 $$ 裡的 \begin{align*} ... \end{align*} 等環境 → 自動包成獨立的 $$ 區塊
 *  4. 數學式內的換行 → 空格（行內數學式不能跨行，否則 remark-breaks 會把它拆開）
 */
export function normalizeMath(input: string): string {
  let out = "";
  let math: "" | "$" | "$$" = "";
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (ch === "\\") {
      if (next === "$") {
        out += math ? "\\text{\\textdollar}" : "\\$";
        i += 2;
        continue;
      }
      if (!math && (next === "(" || next === "[")) {
        const close = next === "(" ? "\\)" : "\\]";
        const end = input.indexOf(close, i + 2);
        if (end !== -1) {
          const body = input.slice(i + 2, end).replace(/\$/g, "\\$");
          out += next === "(" ? `$${body.replace(/\n/g, " ")}$` : `\n$$\n${body.trim()}\n$$\n`;
          i = end + 2;
          continue;
        }
      }
      if (!math && input.startsWith("\\begin{", i)) {
        const name = input.slice(i + 7, input.indexOf("}", i + 7));
        const endTag = `\\end{${name}}`;
        const end = input.indexOf(endTag, i);
        if (name && end !== -1) {
          out += `\n$$\n${input.slice(i, end + endTag.length)}\n$$\n`;
          i = end + endTag.length;
          continue;
        }
      }
      // 其他跳脫字元（\\、\{、\frac ...）原樣保留，並一次吃掉兩個字元，避免把 \\$ 誤判
      out += ch + (next ?? "");
      i += 2;
      continue;
    }

    if (ch === "$") {
      const isDouble = next === "$";
      if (!math) {
        math = isDouble ? "$$" : "$";
      } else if ((math === "$$") === isDouble) {
        math = "";
      }
      out += isDouble ? "$$" : "$";
      i += isDouble ? 2 : 1;
      continue;
    }

    // 行內數學式中的換行改成空格；$$ 區塊保留換行
    out += math === "$" && ch === "\n" ? " " : ch;
    i += 1;
  }

  // 獨立一行的 $$ 前後需要空行，才會被當成區塊公式
  return out.replace(/\n{3,}/g, "\n\n");
}
