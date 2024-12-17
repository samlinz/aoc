import path from "node:path";
import fs from "node:fs";
import { isMain, loadDayInput, loadTestInput } from "../shared";

// robots can wrap the map
// To determine the safest area, count the number of robots in each quadrant after 100 seconds
// middle doesn't count
// multiply quadrant counts

const getMapPrint = (map: Robot[], w: number, h: number) => {
  const grid = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => " ")
  );

  map.forEach((r) => {
    grid[r.y][r.x] = "█";
  });

  return grid.map((r) => r.join("")).join("\n");
};

type Robot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Square = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
type Quadrant = Square;

const quadrant = (x1: number, y1: number, x2: number, y2: number) => ({
  x1,
  y1,
  x2,
  y2,
});

const quadrants = (w: number, h: number): Quadrant[] => [
  quadrant(0, 0, Math.floor(w / 2), Math.floor(h / 2)), // top left
  quadrant(Math.ceil(w / 2), 0, w, Math.floor(h / 2)), // top right
  quadrant(0, Math.ceil(h / 2), Math.floor(w / 2), h), // bottom left
  quadrant(Math.ceil(w / 2), Math.ceil(h / 2), w, h), // bottom right
];

const inArea = (q: Quadrant) => (r: Robot) => {
  return r.x >= q.x1 && r.x < q.x2 && r.y >= q.y1 && r.y < q.y2;
};

export const parseInput = (input: string): Robot[] => {
  // p=0,4 v=3,-3
  return input.split("\n").map((line) => {
    const [, x, y, vx, vy] = line.match(/p=(.+),(.+)\s+v=(.+),(.+)/)!;
    return { x: +x, y: +y, vx: +vx, vy: +vy };
  });
};

type RobotStepFn = (r: Robot) => Robot;
const nextRobot =
  (mapW: number, mapH: number) =>
  (robot: Robot): Robot => {
    const nx = (robot.x + robot.vx + mapW) % mapW;
    const ny = (robot.y + robot.vy + mapH) % mapH;
    return {
      ...robot,
      x: nx,
      y: ny,
    };
  };

const step1 = (next: RobotStepFn) => (world: Robot[]) => {
  return world.map(next);
};

export const calculatePart1 = (input: string, mapW: number, mapH: number) => {
  const robots = parseInput(input);

  const step = step1(nextRobot(mapW, mapH));

  const q = quadrants(mapW, mapH);

  let c: Robot[] = robots;
  for (let i = 0; i < 100; i++) {
    c = step(c);
  }

  const count = q.map((quad) => {
    const fn = inArea(quad);
    return c.filter(fn).length;
  });

  // printMap(c, mapW, mapH);

  const total = count.reduce((acc, c) => acc * c, 1);
  return total === 1 ? 0 : total;
};

export const calculatePart2 = (input: string, mapW: number, mapH: number) => {
  const robots = parseInput(input);
  const step = step1(nextRobot(mapW, mapH));

  const fp = path.join(__dirname, "output.txt");
  if (fs.existsSync(fp)) fs.unlinkSync(fp);

  const fileStream = fs.createWriteStream(fp);

  try {
    let c: Robot[] = robots;
    for (let i = 0; i < 1000; i++) {
      c = step(c);

      fileStream.write("\n");
      fileStream.write(`Seconds: ${i + 1}\n`);

      const str = getMapPrint(c, mapW, mapH);
      fileStream.write(str);
    }
  } finally {
    fileStream.end();
  }
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);
  // const input = loadTestInput(__dirname);

  const result1 = calculatePart1(input, 101, 103);
  console.log("Part 1: " + result1);

  calculatePart2(input, 101, 103);
}
