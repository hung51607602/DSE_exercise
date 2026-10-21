export type Strand = "Number and Algebra" | "Measures, Shape and Space" | "Data Handling";

export interface Topic {
  /** 兩位數編號，例如 "01"；同時用作 URL (/topics/01) 和 RAG 資料的 topicId */
  id: string;
  name: string;
  strand: Strand;
}

const TOPIC_NAMES = [
  "Estimation",
  "Percentages",
  "Indices and Logarithms",
  "Polynomials",
  "Formulas",
  "Identities, Equations and the Number System",
  "Functions and Graphs",
  "Rate, Ratio and Variation",
  "Arithmetic and Geometric Sequences",
  "Inequalities and Linear Programming",
  "Geometry of Rectilinear Figure",
  "Geometry of Circles",
  "Basic Trigonometry",
  "Applications of Trigonometry",
  "Mensuration",
  "Coordinate Geometry",
  "Counting Principles and Probability",
  "Statistics",
];

function strandOf(n: number): Strand {
  if (n <= 10) return "Number and Algebra";
  if (n <= 16) return "Measures, Shape and Space";
  return "Data Handling";
}

export const TOPICS: Topic[] = TOPIC_NAMES.map((name, i) => ({
  id: String(i + 1).padStart(2, "0"),
  name,
  strand: strandOf(i + 1),
}));

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
