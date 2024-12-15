import { Dir } from "node:fs";
import {
  inBounds,
  isMain,
  loadDayInput,
  loadTestInput,
  loadTextFile,
} from "../shared";

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

const directions: [number, number][] = [
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

    totalCost += area * perimeter;
  }

  return totalCost;
};

// entering goblin mode here, very very adhoc and ugly, don't look for advice
const getPerimeter = (c: string, perimeter: Area, all: Area) => {
  enum Perim {
    TopHorizontal,
    BottomHorizontal,
    LeftVertical,
    RightVertical,
  }

  const PerimKeys = [
    Perim.TopHorizontal,
    Perim.BottomHorizontal,
    Perim.LeftVertical,
    Perim.RightVertical,
  ];

  const found = new Map<Perim, Set<string>>();
  PerimKeys.forEach((k) => found.set(Number(k), new Set()));

  // i'm going insane
  const rullakebab = (
    x: number,
    y: number,
    dir: Perim,
    dx: number,
    dy: number,
    depth: number,
    b: number
  ) => {
    const h = hash(x, y);

    // check that we ignore the starting point when looking into the second direction
    if (!(b === 1 && depth === 1)) {
      if (found.get(dir)?.has(h)) return 0; // already processed for this dir
    }
    if (!perimeter.get(x)?.has(y)) return 0; // not perimeter

    // check that we are indeed on the correct edge
    if (dir === Perim.TopHorizontal && all.get(x)?.has(y - 1)) return 0;
    if (dir === Perim.BottomHorizontal && all.get(x)?.has(y + 1)) return 0;
    if (dir === Perim.LeftVertical && all.get(x - 1)?.has(y)) return 0;
    if (dir === Perim.RightVertical && all.get(x + 1)?.has(y)) return 0;

    found.get(dir)!.add(h);

    const nx = x + dx;
    const ny = y + dy;

    return 1 + rullakebab(nx, ny, dir, dx, dy, depth + 1, b);
  };

  // programming and its consequences
  let total: number = 0;
  for (const x of perimeter.keys()) {
    for (const y of perimeter.get(x)!.keys()) {
      for (const dir of PerimKeys) {
        const isHorizontal =
          dir === Perim.TopHorizontal || dir === Perim.BottomHorizontal;
        const isVertical = !isHorizontal;

        // augh
        const dx = isHorizontal ? 1 : 0;
        const dx2 = isHorizontal ? -1 : 0;
        const dy = isVertical ? 1 : 0;
        const dy2 = isVertical ? -1 : 0;

        // flag
        let b = 0;
        let totalPerimLength = 0;

        // check to both directions
        for (const [nx, ny] of [
          [dx, dy],
          [dx2, dy2],
        ]) {
          const pl = rullakebab(x, y, dir, nx, ny, 1, b);
          totalPerimLength += pl;
          if (pl > 0) b = 1;
        }

        if (totalPerimLength > 0) {
          total++;
        }
      }
    }
  }

  return total;
};

export const calculatePart2 = (input: string) => {
  const { cells, height, width } = parseInput(input);

  const areas = calculateAreas(cells, height, width);

  let totalCost = 0;
  for (const [c, cells] of areas) {
    let area = 0;

    const perimeterCells: Area = new Map();

    for (const [x, ys] of cells) {
      for (const y of ys) {
        const neighbours = directions.filter(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;

          return Boolean(cells.get(nx)?.has(ny));
        }).length;

        area++;

        if (neighbours < 4) {
          if (!perimeterCells.has(x)) {
            perimeterCells.set(x, new Set());
          }
          perimeterCells.get(x)?.add(y);
        }
      }
    }

    const perimeterLines = getPerimeter(c, perimeterCells, cells);
    totalCost += area * perimeterLines;
  }

  return totalCost;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  const result2 = calculatePart2(input);
  console.log("Part 2: " + result2);
}
