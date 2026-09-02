import { writeFileSync } from "fs";
import { generateEvaluationCases } from "../lib/demo/evaluation-dataset";

const cases = generateEvaluationCases(8291);
writeFileSync("evaluation-dataset.json", JSON.stringify(cases, null, 2));
console.log(`Wrote ${cases.length} cases (${cases.filter((c) => c.split === "held_out").length} held-out).`);
