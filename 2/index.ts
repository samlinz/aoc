import fs from "node:fs";
import path from "node:path";

/**
    So, a report only counts as safe if both of the following are true:

    - The levels are either all increasing or all decreasing.
    - Any two adjacent levels differ by at least one and at most three.

    Output: How many reports are safe
 */

type Level = number;
type Report = Level[];
type ReportList = Report[];

export const loadInput = (file: string): ReportList => {
  const text = fs.readFileSync(file, "utf-8");

  const reports = [];

  const rows = text.split("\n");
  for (const row of rows) {
    if (!row) continue;
    const levels = row.trim().split(/\s+/).map(Number);
    reports.push(levels);
  }

  return reports;
};

export const isReportSafe = (report: Report) => {
  let previousInc: boolean | undefined = undefined;
  let previousLevel = report[0];

  for (let i = 1; i < report.length; i++) {
    const currentLevel = report[i];

    if (currentLevel < 0) throw new Error("Negative level");
    if (Number.isNaN(currentLevel)) throw new Error("Invalid number");

    const diff = currentLevel - previousLevel;
    const absDiff = Math.abs(diff);
    const currentInc = diff > 0;

    if (absDiff < 1 || absDiff > 3) return false;
    if (previousInc !== undefined && currentInc !== previousInc) return false;

    previousInc = currentInc;
    previousLevel = currentLevel;
  }

  return true;
};

export const calculatePart1 = (reports: ReportList) => {
  return reports.reduce(
    (acc, report) => acc + (isReportSafe(report) ? 1 : 0),
    0
  );
};

export const calculatePart2 = (reports: ReportList) => {
  let safeReports = 0;

  for (const report of reports) {
    const safe = isReportSafe(report);
    if (safe) {
      safeReports++;
    } else {
      // Try if removing any single level makes the report safe
      for (let i = 0; i < report.length; i++) {
        const copy = [...report];
        copy.splice(i, 1);

        if (isReportSafe(copy)) {
          safeReports++;
          break;
        }
      }
    }
  }

  return safeReports;
};

if (require.main === module) {
  const input = loadInput(path.join(__dirname, "input"));

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
