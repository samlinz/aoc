import { describe, expect, test } from "@jest/globals";
import { calculatePart1, calculatePart2 } from ".";
import { loadTestInput } from "../shared";

const testInput1 = loadTestInput(__dirname);

describe("Day 10", () => {
  test("Calculate part 1", () => {
    expect(calculatePart1(testInput1)).toBe(36);
  });

  test("Calculate part 2", () => {
    expect(calculatePart2(testInput1)).toBe(81);
  });
});
