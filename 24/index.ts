import { isMain, loadDayInput, loadTestInput, loadTextFile } from "../shared";

// AND gates output 1 if both inputs are 1; if either input is 0, these gates output 0.
// OR gates output 1 if one or both inputs is 1; if both inputs are 0, these gates output 0.
// XOR gates output 1 if the inputs are different; if the inputs are the same, these gates output 0.

const OpOr = "or";
const OpAnd = "and";
const OpXor = "xor";
type Operator = typeof OpOr | typeof OpAnd | typeof OpXor;

export const parseInput = (input: string) => {
  const rows = input.split("\n");

  type Gate = {
    i: number;
    op: Operator;
    inputs: string[];
    output: string;
  };

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
  }

  let gateIndex = 0;
  for (let i = iv + 1; i < rows.length; i++) {
    const split = rows[i].split(" ");
    const gate1 = split[0];
    const gate2 = split[2];
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
      i: gateIndex,
      op: operator,
      inputs: [gate1, gate2],
      output: output,
    };

    gateIndex++;
    gates.push(gate);
  }

  const gatesByDepth: Map<number, Gate[]> = new Map();

  const definedInputs = new Set<string>(
    gates
      .filter((g) => g.inputs.every((i) => initialValues.has(i)))
      .flatMap((g) => g.inputs)
  );

  const handledGates = new Set<Gate>();

  let depth = 0;
  while (true) {
    const gs = gates
      .filter((g) => g.inputs.every((i) => definedInputs.has(i)))
      .filter((g) => !handledGates.has(g));

    if (gs.length === 0) break;

    gs.forEach((g) => handledGates.add(g));
    gs.map((g) => g.output).forEach((o) => definedInputs.add(o));

    gatesByDepth.set(depth, gs);

    depth++;
  }

  return {
    initialValues,
    gatesByDepth,
  };
};

const calculatePart1 = (input: string) => {
  const { gatesByDepth, initialValues } = parseInput(input);

  const values = new Map<string, number>(initialValues);

  for (const [depth, gates] of gatesByDepth) {
    for (const gate of gates) {
      const [input1, input2] = gate.inputs.map((i) => values.get(i));
      if (input1 === undefined || input2 === undefined)
        throw Error("Inputs not defined");

      let output = 0;
      if (gate.op === OpAnd) {
        output = input1 & input2;
      } else if (gate.op === OpOr) {
        output = input1 | input2;
      } else if (gate.op === OpXor) {
        output = input1 ^ input2;
      }

      values.set(gate.output, output);
    }
  }

  const zValues = Array.from(values.entries())
    .filter((x) => x[0][0] === "z")
    .sort((a, b) => {
      const [nameA, valueA] = a;
      const [nameB, valueB] = b;
      // return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

  // z00 is the least significant bit
  const bitString = zValues.map((x) => ((x[1] & 1) === 1 ? "1" : "0")).join("");
  const intValue = parseInt(bitString, 2);

  return intValue;
};

export const calculatePart2 = (input: string) => {
  const x = parseInput(input);
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);
  // const input = loadTestInput(__dirname);
  // const input = loadTextFile("testinput2")(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  // const result2 = calculatePart2(input);
  // console.log("Part 2: " + result2);
}
