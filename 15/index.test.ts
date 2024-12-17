import { describe, expect, test } from "@jest/globals";
import { calculatePart1 } from ".";
import { loadTextFile } from "../shared";

const input1 = loadTextFile("testinput")(__dirname);
const input2 = loadTextFile("testinput2")(__dirname);

describe("Day 11", () => {
  test("Calculate part 1", () => {
    expect(calculatePart1(input1)).toBe(2028);
    expect(calculatePart1(input2)).toBe(10092);
  });

  test("Calculate part 2", () => {});
});
