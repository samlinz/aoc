import intersection from "set.prototype.intersection";
import union from "set.prototype.union";
import { isMain, loadDayInput } from "../shared";

type Combination = {
  i: number;
  cols: number[];
};

const CHAR_FILLED = "#";

const pairHash = (a: number, b: number) => {
  if (a < b) return a + "," + b;
  return b + "," + a;
};

export const parseInput = (input: string) => {
  const rows = input.split("\n");

  const keys: string[][][] = [];
  const locks: string[][][] = [];

  const width = rows[0].length;
  const height = rows.length;

  const lookup = new Map<number, Combination>();
  const lookup2 = new Map<number, Map<number, Set<number>>>();

  let i = 0;
  let currentRows: string[][] = [];
  let type: undefined | "key" | "lock" = undefined;

  for (const row of rows) {
    if (row === "") {
      if (type === "key") {
        keys.push(currentRows);
      } else if (type === "lock") {
        locks.push(currentRows);
      }

      i = 0;
      currentRows = [];

      continue;
    }

    if (i === 0) {
      const isFullRow = row.split("").every((x) => x === CHAR_FILLED);
      type = isFullRow ? "lock" : "key";
    }

    currentRows.push(row.split(""));
    i++;
  }

  const getHeight = (arr: string[][], col: number) => {
    let h = -1;

    for (let y = 0; y < arr.length; y++) {
      if (arr[y][col] === CHAR_FILLED) {
        h++;
      }
    }

    return h;
  };

  const buildCombination = (arr: string[][]) => {
    const combination: number[] = [];

    for (let x = 0; x < width; x++) {
      combination.push(getHeight(arr, x));
    }

    return combination;
  };

  const asd = (ind: number, combination: number[]) => {
    lookup.set(ind, { i: ind, cols: combination });
    for (let a = 0; a < combination.length; a++) {
      if (!lookup2.has(a)) {
        lookup2.set(a, new Map());
      }
      const colVal = combination[a];

      if (!lookup2.get(a)!.has(colVal)) {
        lookup2.get(a)!.set(colVal, new Set());
      }

      lookup2.get(a)!.get(colVal)!.add(ind);
    }
  };

  const locks2 = locks.map((lock, i): Combination => {
    const combination = buildCombination(lock);
    const ind = i + 1;

    asd(ind, combination);

    return {
      cols: combination,
      i: ind,
    };
  });

  const allKeys: number[] = [];
  const keys2 = keys.map((lock, i): Combination => {
    const combination = buildCombination(lock);
    const ind = i * -1 - 1;

    // asd(ind, combination);
    allKeys.push(ind);

    return {
      cols: combination,
      i: ind,
    };
  });

  return {
    width,
    height,
    locks: locks2,
    keys: keys2,
    lookup,
    lookup2,
    allKeys,
  };
};

const calculatePart1 = (input: string) => {
  const { keys, width, lookup2 } = parseInput(input);

  let total = 0;
  for (const { cols } of keys) {
    let allSets = undefined;

    for (let c = 0; c < width; c++) {
      const colVal = cols[c];
      const treshold = 5 - colVal;
      let colSets = new Set();

      for (let i = 0; i <= treshold; i++) {
        const s = lookup2.get(c)?.get(i);
        if (s === undefined) continue;

        colSets = union(colSets, s);
      }

      allSets = allSets ? intersection(allSets, colSets) : colSets;
    }

    // console.log(cols, " fits ", allSets);
    total += allSets.size;
  }

  return total;
};

export const calculatePart2 = (input: string) => {
  const x = parseInput(input);
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);
  // const input = loadTestInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  // const result2 = calculatePart2(input);
  // console.log("Part 2: " + result2);
}
