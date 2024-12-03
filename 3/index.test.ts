import { test, describe, expect } from "@jest/globals";
import { calculatePart1, calculatePart2 } from ".";

const testInput1 =
  "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
const testInput2 =
  "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";

describe("Day 3", () => {
  test("Calculate part 1", () => {
    expect(calculatePart1(testInput1)).toBe(161);
  });

  test("Calculate part 2", () => {
    expect(calculatePart2(testInput2)).toBe(48);
  });
});
