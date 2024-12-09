import { describe, expect, test } from "@jest/globals";
import { calculatePart1, calculatePart2, parseInput } from ".";
import { loadTestInput } from "../shared";

const testInput1 = loadTestInput(__dirname);

describe("Day 7", () => {
  test("Parse input", () => {
    const result = parseInput("2333133121414131402");
    expect(result).toEqual([
      0,
      0,
      undefined,
      undefined,
      undefined,
      1,
      1,
      1,
      undefined,
      undefined,
      undefined,
      2,
      undefined,
      undefined,
      undefined,
      3,
      3,
      3,
      undefined,
      4,
      4,
      undefined,
      5,
      5,
      5,
      5,
      undefined,
      6,
      6,
      6,
      6,
      undefined,
      7,
      7,
      7,
      undefined,
      8,
      8,
      8,
      8,
      9,
      9,
    ]);
  });

  test("Calculate part 1", () => {
    expect(calculatePart1(testInput1)).toBe(1928);
  });

  test("Calculate part 2", () => {
    expect(calculatePart2(testInput1)).toBe(2858);
  });
});
