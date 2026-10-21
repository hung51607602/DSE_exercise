import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSE Maths 練習題生成器",
  description: "以 LlamaIndex RAG 自動生成 HKDSE 數學練習題",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant-HK" className="h-full">
      <body className="min-h-full flex flex-col bg-base-200 antialiased">
        <header className="navbar bg-base-100 shadow-sm px-4">
          <Link href="/" className="btn btn-ghost text-lg">
            DSE Maths 練習題生成器
          </Link>
        </header>
        <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
