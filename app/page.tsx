import Link from "next/link";
import { TOPICS, type Strand } from "@/lib/topics";

const STRAND_BADGE: Record<Strand, { short: string; className: string }> = {
  "Number and Algebra": { short: "NA", className: "bg-primary text-primary-content" },
  "Measures, Shape and Space": { short: "MS", className: "bg-secondary text-secondary-content" },
  "Data Handling": { short: "DH", className: "bg-accent text-accent-content" },
};

export default function Home() {
  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
        HKDSE Mathematics Compulsory Part · {TOPICS.length} Topics
      </li>

      {TOPICS.map((topic) => {
        const badge = STRAND_BADGE[topic.strand];
        return (
          <li key={topic.id} className="list-row">
            <div className="text-4xl font-thin opacity-30 tabular-nums">{topic.id}</div>
            <div>
              <div
                className={`size-10 rounded-box grid place-items-center text-xs font-bold ${badge.className}`}
                aria-hidden
              >
                {badge.short}
              </div>
            </div>
            <Link href={`/topics/${topic.id}`} className="list-col-grow hover:underline">
              <div>{topic.name}</div>
              <div className="text-xs uppercase font-semibold opacity-60">{topic.strand}</div>
            </Link>
            <Link
              href={`/topics/${topic.id}`}
              className="btn btn-square btn-ghost"
              aria-label={`進入 ${topic.name}`}
            >
              <svg aria-label="Open" className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                  <path d="M6 3L20 12 6 21 6 3z"></path>
                </g>
              </svg>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
