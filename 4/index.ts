import { isMain, loadDayInput } from "../shared";

export const preprocess1 = (input: string) => {
  const textRows = input.split("\n").map((x) => x.trim());
  const cellRows: string[][] = [];

  for (const textRow of textRows) {
    const cells = textRow.split("");
    cellRows.push(cells);
  }

  const w = cellRows[0].length;
  const h = cellRows.length;

  // check if cell is within grid bounds
  const inBounds = (x: number, y: number) => x >= 0 && x < w && y >= 0 && y < h;

  // identify a cell in a set
  type Id = `${number},${number}`;
  const cellId = (x: number, y: number): Id => `${x},${y}`;

  type Direction = "h" | "v" | "d1" | "d2";
  const dirs = ["h", "v", "d1", "d2"] as Direction[];

  // lookup table for cells that have been included in a direction
  // - a cell can exists in a given direction vector only once - all
  // others are the same vector
  const lookup = new Map<Direction, Set<Id>>();
  lookup.set("h", new Set());
  lookup.set("v", new Set());
  lookup.set("d1", new Set());
  lookup.set("d2", new Set());

  // recursively build a "substring" / series of cells in a given direction,
  // update lookup tables on the fly
  const substring = (
    x: number,
    y: number,
    direction: "h" | "v" | "d1" | "d2"
  ): undefined | string[] => {
    if (!inBounds(x, y)) {
      return undefined;
    }

    const id = cellId(x, y);
    const value = cellRows[y][x];

    let nextX = x;
    let nextY = y;

    // cell has been included in the direction's check previously
    if (lookup.get(direction)!.has(id)) return;
    lookup.get(direction)!.add(id);

    if (direction === "h") {
      nextX = x + 1;
    } else if (direction === "v") {
      nextY = y + 1;
    } else if (direction === "d1") {
      nextX = x + 1;
      nextY = y + 1;
    } else if (direction === "d2") {
      nextX = x - 1;
      nextY = y + 1;
    } else {
      throw Error("Unknown direction: " + direction);
    }

    const nextCells = substring(nextX, nextY, direction);
    if (nextCells) {
      return [value, ...nextCells];
    } else {
      return [value];
    }
  };

  const allSeries: string[][] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const newSeries = dirs
        .map((dir) => substring(x, y, dir))
        .filter((x) => x !== undefined && x.length > 1) as string[][];

      // remember to include also reversed vectors
      const reversedSeries = newSeries.map((x) => [...x].reverse());

      allSeries.push(...newSeries);
      allSeries.push(...reversedSeries);
    }
  }

  return allSeries;
};

export const calculatePart2 = (input: string) => {
  const textRows = input.split("\n").map((x) => x.trim());
  const cellRows: string[][] = [];

  for (const textRow of textRows) {
    const cells = textRow.split("");
    cellRows.push(cells);
  }

  const w = cellRows[0].length;
  const h = cellRows.length;

  const isXmas = (x: number, y: number) => {
    const value = cellRows[y][x];

    if (value !== "A") return false;

    const directions = [
      [y - 1, x - 1, y + 1, x + 1],
      [y - 1, x + 1, y + 1, x - 1],
    ];

    for (const [y1, x1, y2, x2] of directions) {
      const d1 = cellRows[y1]?.[x1];
      const d2 = cellRows[y2]?.[x2];

      if (!((d1 === "M" && d2 === "S") || (d1 === "S" && d2 === "M")))
        return false;
    }

    return true;
  };

  let total = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isXmas(x, y)) total += 1;
    }
  }

  return total;
};

export const calculatePart1 = (input: string) => {
  const series = preprocess1(input);

  let total = 0;
  for (const s of series) {
    const word = s.join("");
    const count = (word.match(/XMAS/g) || []).length;
    total += count;
  }

  return total;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
