import { isMain, loadDayInput } from "../shared";
import fs from "node:fs";
import regression from "regression";

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

export const run2 = (numbers: number[], n: number) => {
  let current = [...numbers];
  // let len = [];
  let values: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    current = getNextState(current);
    // console.log(current.length);
    // len.push(current.length);
    values.push([i + 1, current.length]);
  }

  // let y: [number, number][] = [];
  // for (let i = 0; i < current.length; i++) {
  //   // console.log(i, len[i]);
  //   y.push([i, current[i]]);
  // }

  // Input array
  // const dataArray = [1, 4, 9, 16, 25]; // e.g., y = x^2
  // const data = current.map((y, x) => [x + 1, y]) as [number, number][];

  // Fit a quadratic curve
  const result1 = regression.linear(values).predict(75);

  const result2 = regression.polynomial(values).predict(75);

  const result3 = regression.exponential(values).predict(75);
  const result4 = regression.power(values).predict(75);

  console.log(result1, result2, result3, result4);
  // const fit = exponentialFit(y);
  // console.log(fit);

  return current;
};

// function exponentialFit(data: [number, number][]) {
//   let a = 1,
//     b = 1; // Initial guesses
//   const learningRate = 0.01;
//   const iterations = 1000;

//   for (let iter = 0; iter < iterations; iter++) {
//     let da = 0,
//       db = 0;

//     for (const [x, y] of data) {
//       const yPred = a * Math.exp(b * x);
//       const error = y - yPred;
//       da += -2 * error * Math.exp(b * x);
//       db += -2 * error * a * x * Math.exp(b * x);
//     }

//     a -= (learningRate * da) / data.length;
//     b -= (learningRate * db) / data.length;
//   }

//   return { a, b };
// }
// function linearRegression(data) {
//   const n = data.length;
//   let sumX = 0,
//     sumY = 0,
//     sumXY = 0,
//     sumXX = 0;

//   for (const [x, y] of data) {
//     sumX += x;
//     // sumY += y;
//     // sumXY += x * y;
//     // sumXX += x * x;
//   }

//   const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
//   const intercept = (sumY - slope * sumX) / n;

//   return { slope, intercept };
// }

const calculatePart1 = (input: string) => {
  const numbers = parseInput(input);

  return run(numbers, 25).length;
};

const calculatePart2 = (input: string) => {
  const numbers = parseInput(input);

  return run2(numbers, 30).length;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  // const result1 = calculatePart1(input);
  // console.log("Part 1: " + result1);

  const result2 = calculatePart2(input);
  console.log("Part 2: " + result2);
}
