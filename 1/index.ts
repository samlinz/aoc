import fs from "node:fs";

export const loadInput = (file: string): [number[], number[]] => {
  const text = fs.readFileSync(file, "utf-8");

  const arr1 = [];
  const arr2 = [];

  const rows = text.split("\n");
  for (const row of rows) {
    if (!row) continue;
    const [a, b] = row.trim().split(/\s+/);
    arr1.push(Number(a));
    arr2.push(Number(b));
  }

  return [arr1, arr2];
};

const sortAscending = (arr: number[]) => [...arr].sort((a, b) => a - b);

const preprocessLists = (arr1: number[], arr2: number[]) => {
  const sorted1 = sortAscending(arr1);
  const sorted2 = sortAscending(arr2);

  return [sorted1, sorted2];
};

export const calculatePart1 = (arr1: number[], arr2: number[]) => {
  const [sorted1, sorted2] = preprocessLists(arr1, arr2);

  const distances = [];
  for (let i = 0; i < sorted1.length; i++) {
    const diff = Math.abs(sorted1[i] - sorted2[i]);
    distances.push(diff);
  }

  const sum = distances.reduce((acc, curr) => acc + curr, 0);
  return sum;
};

const occurrenceMap = (arr: number[]): Map<number, number> => {
  const map = new Map<number, number>();

  for (const num of arr) {
    map.set(num, (map.get(num) || 0) + 1);
  }

  return map;
};

export const calculatePart2 = (arr1: number[], arr2: number[]) => {
  const map = occurrenceMap(arr2);

  let total = 0;
  for (let i = 0; i < arr1.length; i++) {
    const num = arr1[i];
    total = total + (map.get(num) || 0) * num;
  }

  return total;
};

if (require.main === module) {
  const input = loadInput("./1/input");

  if (input[0].length !== input[1].length) {
    throw new Error("Arrays must be of equal length");
  }

  const result1 = calculatePart1(...input);
  const result2 = calculatePart2(...input);

  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
