import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { attachEvaluationBenchmark, buildDemoStore } from "../lib/demo/seed-data";

const dir = path.join(process.cwd(), ".data");
mkdirSync(dir, { recursive: true });
const store = attachEvaluationBenchmark(buildDemoStore());
writeFileSync(path.join(dir, "store.json"), JSON.stringify(store, null, 2));
console.log(`Seeded ${store.disputes.length} disputes, ${store.evaluationCases.length} evaluation cases.`);
