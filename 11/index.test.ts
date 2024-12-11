import { describe, expect, test } from "@jest/globals";
import { parseInput, run } from ".";
import { loadTestInput } from "../shared";

// const testInput1 = loadTestInput(__dirname);

describe("Day 11", () => {
  test("Calculate part 1", () => {
    const i = [125, 17];
    expect(run(i, 1)).toEqual([253000, 1, 7]);
    expect(run(i, 2)).toEqual([253, 0, 2024, 14168]);
    expect(run(i, 3)).toEqual([512072, 1, 20, 24, 28676032]);
    expect(run(i, 4)).toEqual([512, 72, 2024, 2, 0, 2, 4, 2867, 6032]);
    expect(run(i, 5)).toEqual([
      1036288, 7, 2, 20, 24, 4048, 1, 4048, 8096, 28, 67, 60, 32,
    ]);

    // const parsed = parseInput(testInput1);
    expect(run(i, 25).length).toBe(55312);
  });

  // test("Calculate part 2", () => {
  //   expect(calculatePart2(testInput1)).toBe(81);
  // });
});