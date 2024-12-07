import { isMain, loadDayInput } from "../shared";

const parseInput = (input: string) => {
  return input
    .split("\n")
    .filter((x) => x.length > 0)
    .map((x) => {
      const [result, ...rest] = x.split(": ");
      const numbers = rest[0].split(" ").map(Number);
      return {
        result: Number(result),
        numbers,
      };
    });
};

type OperatorPlus = "+";
type OperatorMul = "*";
type OperatorConcat = "||";
type Operator = OperatorPlus | OperatorMul | OperatorConcat;

const solve = (numbers: number[], operators: Operator[]) => {
  let result = numbers[0];
  let i = 1;

  for (const operator of operators) {
    if (operator === "+") {
      result += numbers[i];
    } else if (operator === "*") {
      result *= numbers[i];
    } else if (operator === "||") {
      const resultStr = result.toString();
      const nextValue = numbers[i].toString();
      const newValue = Number(resultStr + nextValue);
      result = newValue;
    }

    i++;
  }

  return result;
};

const generateOperatorCombinations = (
  length: number,
  operators: Operator[]
): Operator[][] => {
  const result: Operator[][] = [];

  const generate = (current: Operator[], depth: number) => {
    if (depth === length) {
      result.push([...current]);
      return;
    }

    for (const operator of operators) {
      current.push(operator);
      generate(current, depth + 1);
      current.pop();
    }
  };

  generate([], 0);
  return result;
};

const isSolvable = (
  numbers: number[],
  expectedResult: number,
  operators: Operator[]
) => {
  const operatorPermutations = generateOperatorCombinations(
    numbers.length - 1,
    operators
  );

  for (const perm of operatorPermutations) {
    if (solve(numbers, perm) === expectedResult) {
      return true;
    }
  }

  return false;
};

export const calculatePart1 = (input: string) => {
  const data = parseInput(input);

  let sum = 0;
  for (const { numbers, result } of data) {
    if (isSolvable(numbers, result, ["+", "*"])) {
      sum += result;
    }
  }

  return sum;
};

export const calculatePart2 = (input: string) => {
  const data = parseInput(input);

  let sum = 0;
  for (const { numbers, result } of data) {
    if (isSolvable(numbers, result, ["+", "*", "||"])) {
      sum += result;
    }
  }

  return sum;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
