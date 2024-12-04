import { describe, expect, test } from "@jest/globals";
import { calculatePart1, calculatePart2 } from ".";
import { loadTestInput, loadTextFile } from "../shared";

const testInput1 = loadTestInput(__dirname);
const testInput2 = loadTextFile("testinput2")(__dirname);

describe("Day 3", () => {
  test("Calculate part 1", () => {
    expect(calculatePart1(testInput1)).toBe(18);
  });

  test("Calculate part 2", () => {
    expect(calculatePart2(testInput2)).toBe(9);
  });
});
