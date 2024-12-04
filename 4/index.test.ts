import { describe, expect, test } from "@jest/globals";
import { calculatePart1 } from ".";
import { loadTestInput } from "../shared";

const testInput = loadTestInput(__dirname);

describe("Day 3", () => {
  test("Calculate part 1", () => {
    expect(calculatePart1(testInput)).toBe(18);
  });
});
