import { test, describe, expect } from "@jest/globals";
import { calculatePart1, calculatePart2, loadInput } from ".";

const file = "./1/testinput";
const arr1 = [3, 4, 2, 1, 3, 3];
const arr2 = [4, 3, 5, 3, 9, 3];

describe("1", () => {
  test("load input", () => {
    const input = loadInput(file);
    expect(input).toEqual([arr1, arr2]);
  });

  test("calculate part1", () => {
    const input = loadInput(file);
    const result = calculatePart1(...input);
    expect(result).toBe(11);
  });

  test("calculate part2", () => {
    const input = loadInput(file);
    const result = calculatePart2(...input);
    expect(result).toBe(31);
  });
});
