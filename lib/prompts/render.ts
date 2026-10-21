/**
 * 把模板中的 {{變數}} 替換成實際內容。
 * 不使用 LlamaIndex PromptTemplate 的 {var} 語法，因為它遇到 LaTeX（如 \frac{a}{b}）會報錯。
 */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
