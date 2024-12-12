import { inBounds, isMain, loadDayInput, loadTestInput } from "../shared";

export const parseInput = (input: string) => {
  const rows = input.split("\n");
  const cells = rows.map((r) => r.split(""));

  return {
    cells,
    width: cells[0].length,
    height: cells.length,
  };
};

type Area = Map<number, Set<number>>;
const hash = (x: number, y: number) => `${x},${y}`;
const calculateAreas = (cells: string[][], height: number, width: number) => {
  const visited = new Set<string>();
  const areas: [string, Area][] = [];
  let currentArea: Area = new Map();

  const visit = (plot: string, x: number, y: number) => {
    if (!inBounds(x, y, width, height)) return;

    const value = cells[y][x];
    if (value !== plot) return;

    const h = hash(x, y);
    if (visited.has(h)) return;
    visited.add(h);

    if (!currentArea.has(x)) currentArea.set(x, new Set());

    currentArea.get(x)?.add(y);

    visit(plot, x - 1, y);
    visit(plot, x + 1, y);
    visit(plot, x, y - 1);
    visit(plot, x, y + 1);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const h = hash(x, y);
      if (visited.has(h)) continue;

      const value = cells[y][x];
      visit(value, x, y);

      areas.push([value, currentArea]);
      currentArea = new Map();
    }
  }

  return areas;
};

const directions = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

export const calculatePart1 = (input: string) => {
  const { cells, height, width } = parseInput(input);

  const areas = calculateAreas(cells, height, width);

  let totalCost = 0;
  for (const [c, cells] of areas) {
    let area = 0;
    let perimeter = 0;

    for (const [x, ys] of cells) {
      for (const y of ys) {
        const neighbours = directions.filter(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;

          return Boolean(cells.get(nx)?.has(ny));
        }).length;

        perimeter += 4 - neighbours;
        area++;
      }
    }

    // console.log(c, area, perimeter, totalCost);
    totalCost += area * perimeter;
  }

  return totalCost;
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
