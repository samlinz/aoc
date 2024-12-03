import fs from "node:fs";
import path from "node:path";

export const loadInput = (file: string): string => {
  return fs.readFileSync(file, "utf-8");
};

const tokenize1 = (input: string) => {
  const regex = /mul\(\d+,\d+\)/g;
  const matches = input.matchAll(regex);
  return matches;
};

const tokenize2 = (input: string) => {
  const regex = /mul\((\d+),(\d+)\)|do\(\)|don't\(\)/g;
  const matches = input.matchAll(regex);
  return matches;
};

const parseMatch = (match: string) => {
  const regex = /mul\((\d+),(\d+)\)/g;
  const parsed = regex.exec(match);
  if (!parsed) throw new Error("Unparseable match: " + match);
  return [parseInt(parsed[1]), parseInt(parsed[2])];
};

export const calculatePart1 = (input: string) => {
  const iterator = tokenize1(input);

  let result = 0;
  for (const match of iterator) {
    const [a, b] = parseMatch(match[0]);
    result += a * b;
  }

  return result;
};

export const getInstruction = (match: string) => {
  if (match.startsWith("mul(")) return "mul";
  if (match.startsWith("do(")) return "enable";
  if (match.startsWith("don't(")) return "disable";
  throw new Error("Unknown instruction: " + match);
};

export const calculatePart2 = (input: string) => {
  const iterator = tokenize2(input);

  let result = 0;
  let enabled = true; // enabled at start
  for (const [match] of iterator) {
    const instruction = getInstruction(match);
    if (instruction === "enable") {
      enabled = true;
    } else if (instruction === "disable") {
      enabled = false;
    } else if (instruction === "mul" && enabled) {
      const [a, b] = parseMatch(match);
      result += a * b;
    }
  }

  return result;
};

if (require.main === module) {
  const input = loadInput(path.join(__dirname, "input"));

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
