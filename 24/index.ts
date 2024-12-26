import { isMain, loadDayInput } from "../shared";

// AND gates output 1 if both inputs are 1; if either input is 0, these gates output 0.
// OR gates output 1 if one or both inputs is 1; if both inputs are 0, these gates output 0.
// XOR gates output 1 if the inputs are different; if the inputs are the same, these gates output 0.

const OpOr = 1;
const OpAnd = 2;
const OpXor = 3;
type Operator = typeof OpOr | typeof OpAnd | typeof OpXor;

export const parseInput = (input: string) => {
  const rows = input.split("\n");

  let depth = 0;

  type Gate = {
    op: Operator;
    inputs: string[];
    output: string;
  };

  // const gates = new Map<string, Partial<Gate>>();
  const gates: Gate[] = [];
  const initialValues = new Map<string, number>();

  let iv = 0;
  for (const row of rows) {
    if (row === "") {
      break;
    }

    iv++;

    const [name, value] = row.split(":").map((x) => x.trim());
    const nValue = parseInt(value);
    if (Number.isNaN(nValue)) throw Error("NaN");

    initialValues.set(name, nValue);
    // gates.set(name, {
    //   inputs: [nValue],
    //   output: nValue,
    // });
  }

  for (let i = iv; i < rows.length; i++) {
    const split = rows[i].split(" ");
    const gate1 = split[0];
    const gate2 = split[0];
    const op = split[1];
    const output = split[4];

    const operator: Operator | undefined =
      op === "AND"
        ? OpAnd
        : op === "OR"
          ? OpOr
          : op === "XOR"
            ? OpXor
            : undefined;

    if (operator === undefined) throw Error("Invalid operator");

    const gate: Gate = {
      op: operator,
      inputs: [gate1, gate2],
      output: output,
    };

    gates.push(gate);
  }

  const recurse = () => {};

  // form a graph with layers
  // for (const gate of gates) {
  // }
};

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
