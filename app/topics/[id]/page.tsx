import { Suspense } from "react";
import { notFound } from "next/navigation";
import QuestionGenerator from "@/components/QuestionGenerator";
import { TOPICS, getTopic } from "@/lib/topics";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

export default function TopicPage({ params }: PageProps<"/topics/[id]">) {
  return (
    <Suspense fallback={<span className="loading loading-dots loading-md" />}>
      <TopicContent params={params} />
    </Suspense>
  );
}

async function TopicContent({ params }: { params: PageProps<"/topics/[id]">["params"] }) {
  const { id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();

  return <QuestionGenerator topic={topic} />;
}
