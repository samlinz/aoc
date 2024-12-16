import { isMain, loadDayInput, loadTestInput } from "../shared";

type Machine = {
  dX1: number;
  dX2: number;
  dY1: number;
  dY2: number;
  costA: number;
  costB: number;
  targetX: number;
  targetY: number;
};

const r = /(\d+)/g;
const parseMachines = (input: string) => {
  const rows = input.split("\n");

  const machines: Machine[] = [];
  let newMachine: Partial<Machine> = {};
  for (const row of rows) {
    if (row === "") continue;
    const [a, b] = Array.from(row.matchAll(r)).map((x) => Number(x[0]));
    if (row.startsWith("Button A")) {
      newMachine.dX1 = a;
      newMachine.dY1 = b;
    } else if (row.startsWith("Button B")) {
      newMachine.dX2 = a;
      newMachine.dY2 = b;
    } else if (row.startsWith("Prize")) {
      newMachine.targetX = a;
      newMachine.targetY = b;
      machines.push(newMachine as Machine);
      newMachine = {};
    }
  }

  return machines;
};

const calc = (a: number, b: number, machine: Machine) => {
  const x = a * machine.dX1 + b * machine.dX2 - machine.targetX;
  const y = a * machine.dY1 + b * machine.dY2 - machine.targetY;
  return Math.abs(x) + Math.abs(y);
};

const cost = (a: number, b: number, machine: Machine) => {
  return a * machine.costA + b * machine.costB;
};

export const calculatePart1 = (input: string) => {
  const machines = parseMachines(input);
  machines.forEach((m) => {
    m.costA = 3;
    m.costB = 1;
  });
  console.log(machines);
  // const x = parseInput(input);
  const limit = 100;
  // const range = Array.from({ length: 100 }, (_, i) => i);

  let i = 0;
  let total = 0;
  for (const m of machines) {
    let min: number | undefined = undefined;
    for (let a = 0; a < limit; a++) {
      for (let b = 0; b < limit; b++) {
        const c = calc(a, b, m);
        if (c === 0) {
          console.log("Found it", a, b);
          min = cost(a, b, m);
        }
      }
    }

    if (min !== undefined) {
      total += min;
    }

    i++;
    if (i % 100 === 0) {
      console.log(`${i}/${machines.length}`);
    }
  }

  return total;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);
  // const input = loadTestInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  // const result2 = calculatePart2(input);
  // console.log("Part 2: " + result2);
}
