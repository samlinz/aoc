import { test, describe, expect } from "@jest/globals";
import { calculatePart1, calculatePart2, isReportSafe, loadInput } from ".";
import path from "node:path";

const file = path.join(__dirname, "testinput");

describe("Day 2", () => {
  test("is report safe", () => {
    const safe = [7, 6, 4, 2, 1];
    const unsafe = [1, 2, 7, 8, 9];

    expect(isReportSafe(safe)).toBe(true);
    expect(isReportSafe(unsafe)).toBe(false);
  });

  test("calculate part1", () => {
    const input = loadInput(file);
    const result = calculatePart1(input);
    expect(result).toBe(2);
  });

  test("calculate part2", () => {
    const input = loadInput(file);
    const result = calculatePart2(input);
    expect(result).toBe(4);
  });
});
