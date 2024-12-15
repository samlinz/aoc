import { describe, expect, test } from "@jest/globals";
import { calculatePart1 } from ".";
import { loadTestInput } from "../shared";

const input = loadTestInput(__dirname);

describe("Day 12", () => {
  test("Calculate part 1", () => {
    expect(calculatePart1(input)).toBe(1930);
  });

  // test("Calculate part 2", () => {});
});
