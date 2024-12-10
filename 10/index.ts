import { isMain, loadDayInput } from "../shared";

// For all practical purposes, this means that a hiking trail is
// - any path that starts at height 0, ends at height 9
// - always increases by a height of exactly 1 at each step
// - never includes diagonal steps - only up, down, left, or right (from the perspective of the map).
// trailhead's score is the number of 9-height positions reachable from that trailhead via a hiking trail.

// What is the sum of the scores of all trailheads on your topographic map?

type Point = [number, number];

enum Dir {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

const dirMap: Record<Dir, [number, number]> = {
  [Dir.Up]: [0, -1],
  [Dir.Down]: [0, 1],
  [Dir.Left]: [-1, 0],
  [Dir.Right]: [1, 0],
};

const parseInput = (input: string) => {
  const map: number[][] = [];
  const rows = input.split("\n");

  const tilesByNumber = new Map<number, Point[]>();

  const w = rows[0].length;
  const h = rows.length;

  for (let y = 0; y < h; y++) {
    const builtRow: number[] = [];
    for (let x = 0; x < w; x++) {
      const tile = Number(rows[y][x]);
      if (Number.isNaN(tile)) throw new Error("Invalid input");

      builtRow.push(tile);

      const tileByNumber = tilesByNumber.get(tile) ?? [];
      tilesByNumber.set(tile, [...tileByNumber, [x, y]]);
    }

    map.push(builtRow);
  }

  return {
    map,
    tilesByNumber,
    w,
    h,
  };
};

type Trail = {
  steps: Point[];
};

const inBounds = (x: number, y: number, w: number, h: number) => {
  return x >= 0 && x < w && y >= 0 && y < h;
};

const allDirs = [Dir.Up, Dir.Down, Dir.Left, Dir.Right];

const pointHash = (x: number, y: number) => `${x},${y}`;

// Ugly recursive solution
const findPaths = (
  map: number[][],
  previousX: number | undefined,
  previousY: number | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  builtTrail: Point[],
  visited: Set<string>
): Trail[] => {
  if (!inBounds(x, y, w, h)) return [];

  const hash = pointHash(x, y);
  if (visited.has(hash)) return [];

  const value = map[y][x];
  const previousValue =
    previousY !== undefined && previousX !== undefined
      ? map[previousY][previousX]
      : null;

  // Check gradient
  if (previousValue !== null && value - previousValue !== 1) return [];

  const newBuiltTrail: Point[] = [...builtTrail, [x, y]];
  const newVisited = new Set(visited);
  newVisited.add(hash);

  // End condition
  if (value === 9) return [{ steps: newBuiltTrail }];

  const result: Trail[] = [];
  for (const dir of allDirs) {
    const [dx, dy] = dirMap[dir];
    const newX = x + dx;
    const newY = y + dy;

    if (newX === previousX && newY === previousY) continue;

    // Recursively check all direction and append resulting paths if any
    const newTrails = findPaths(
      map,
      x,
      y,
      newX,
      newY,
      w,
      h,
      newBuiltTrail,
      newVisited
    );

    result.push(...newTrails);
  }

  return result;
};

export const countDistinctEndpoints = (paths: Trail[]) => {
  const endpoints = new Set<string>();

  for (const path of paths) {
    const lastStep = path.steps[path.steps.length - 1];
    endpoints.add(pointHash(lastStep[0], lastStep[1]));
  }

  return endpoints.size;
};

export const calculatePart1 = (input: string) => {
  const { map, w, h, tilesByNumber } = parseInput(input);
  const trailHeads = tilesByNumber.get(0)!;

  let totalScore = 0;
  for (const trailHead of trailHeads) {
    const paths = findPaths(
      map,
      undefined,
      undefined,
      trailHead[0],
      trailHead[1],
      w,
      h,
      [],
      new Set()
    );

    totalScore += countDistinctEndpoints(paths);
  }

  return totalScore;
};

export const calculatePart2 = (input: string) => {
  const { map, w, h, tilesByNumber } = parseInput(input);
  const trailHeads = tilesByNumber.get(0)!;

  let totalScore = 0;
  for (const trailHead of trailHeads) {
    const paths = findPaths(
      map,
      undefined,
      undefined,
      trailHead[0],
      trailHead[1],
      w,
      h,
      [],
      new Set()
    );

    // Just count the distinct paths to get the rating, otherwise identical to part 1
    totalScore += paths.length;
  }

  return totalScore;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
