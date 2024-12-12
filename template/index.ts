import { isMain, loadDayInput } from "../shared";

export const parseInput = (input: string) =>
  input.split("\n")[0].split(/\s+/).map(Number);

const calculatePart1 = (input: string) => {
  const x = parseInput(input);
};

export const calculatePart2 = (input: string) => {
  const x = parseInput(input);
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  // const result2 = calculatePart2(input);
  // console.log("Part 2: " + result2);
}
