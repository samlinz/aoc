import { isMain, loadDayInput } from "../shared";

// If the stone is engraved with the number 0, it is replaced by a stone engraved with the number 1.
// If the stone is engraved with a number that has an even number of digits, it is replaced by two stones. The left half of the digits are engraved on the new left stone, and the right half of the digits are engraved on the new right stone. (The new numbers don't keep extra leading zeroes: 1000 would become stones 10 and 0.)
// If none of the other rules apply, the stone is replaced by a new stone; the old stone's number multiplied by 2024 is engraved on the new stone.

export const parseInput = (input: string) =>
  input.split("\n")[0].split(/\s+/).map(Number);

const getNextStone = (stone: number): number[] => {
  if (stone === 0) return [1];

  const str = String(stone);
  if (str.length % 2 === 0) {
    const half = str.length / 2;
    return [Number(str.slice(0, half)), Number(str.slice(half))];
  }

  return [stone * 2024];
};

const getNextState = (state: number[]): number[] => {
  const newState: number[] = [];

  for (const stone of state) {
    newState.push(...getNextStone(stone));
  }

  return newState;
};

export const run = (numbers: number[], n: number) => {
  let current = [...numbers];

  for (let i = 0; i < n; i++) {
    current = getNextState(current);
  }

  return current;
};

type Cache = Map<number, Map<number, number>>;
export const run2 = (
  mem: Cache,
  numbers: number[],
  depth: number,
  stopDepth: number
) => {
  if (depth === stopDepth) {
    return numbers.length;
  }

  let totalLength = 0;

  for (let i = 0; i < numbers.length; i++) {
    const nextStones = getNextStone(numbers[i]);

    for (const nextStone of nextStones) {
      let m = mem.get(nextStone);
      if (!m) {
        const m2 = new Map<number, number>();
        mem.set(nextStone, m2);
        m = m2;
      }

      const c = m.get(depth);
      if (c !== undefined) {
        totalLength += c;
        continue;
      }

      const result = run2(mem, [nextStone], depth + 1, stopDepth);

      m.set(depth, result);
      totalLength += result;
    }
  }

  return totalLength;
};

const calculatePart1 = (input: string) => {
  const numbers = parseInput(input);

  return run(numbers, 25).length;
};

export const calculatePart2 = (input: string) => {
  const numbers = parseInput(input);
  const mem = new Map<number, Map<number, number>>();
  return run2(mem, numbers, 0, 75);
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  const result2 = calculatePart2(input);
  console.log("Part 2: " + result2);
}
