import { describe, expect, it } from "vitest";
import { deadlineUrgency } from "@/lib/ui/dates";

describe("deadline urgency", () => {
  const now = Date.parse("2026-09-05T01:00:00.000Z");

  it("marks overdue, urgent, soon, and ok", () => {
    expect(deadlineUrgency("2026-09-04T20:00:00.000Z", now)).toBe("overdue");
    expect(deadlineUrgency("2026-09-05T04:00:00.000Z", now)).toBe("urgent");
    expect(deadlineUrgency("2026-09-05T20:00:00.000Z", now)).toBe("soon");
    expect(deadlineUrgency("2026-09-08T01:00:00.000Z", now)).toBe("ok");
    expect(deadlineUrgency(undefined, now)).toBe("none");
  });
});
