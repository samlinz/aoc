import { isMain, loadDayInput, loadTestInput, loadTextFile } from "../shared";

type Coords = {
  x: number;
  y: number;
};
type Box = Coords;
type Wall = Coords;

type CoordLookup = Map<number, Set<number>>;

type World = {
  walls: CoordLookup;
  boxes: CoordLookup;
  robot: Coords;
  w: number;
  h: number;
};

enum Move {
  Up,
  Down,
  Left,
  Right,
}

const directions: Record<Move, [number, number]> = {
  [Move.Up]: [0, -1],
  [Move.Down]: [0, 1],
  [Move.Left]: [-1, 0],
  [Move.Right]: [1, 0],
};

const gps = (c: Coords) => 100 * c.y + c.x;

const lookup = (c: Coords[]): CoordLookup => {
  const lookup = new Map<number, Set<number>>();

  for (const { x, y } of c) {
    const _x = lookup.get(x) || new Set();
    _x.add(y);
    lookup.set(x, _x);
  }

  return lookup;
};

export const parseInput = (
  input: string
): { world: World; movements: Move[] } => {
  const lines = input.split("\n");

  const boxes: Box[] = [];
  const robot: Coords = { x: 0, y: 0 };
  const walls: Wall[] = [];

  let y = 0;
  for (; y < lines.length; y++) {
    const line = lines[y];
    if (line === "") break;

    const split = lines[y].split("");
    for (let x = 0; x < split.length; x++) {
      const char = split[x];
      if (char === ".") continue;
      if (char === "O") {
        boxes.push({ x, y });
      } else if (char === "#") {
        walls.push({ x, y });
      } else if (char === "@") {
        robot.x = x;
        robot.y = y;
      }
    }
  }

  const h = y;

  let movementsStr = "";
  for (; y < lines.length; y++) {
    movementsStr += lines[y];
  }

  const movements = movementsStr.split("").map((m) => {
    if (m === "^") return Move.Up;
    if (m === "v") return Move.Down;
    if (m === "<") return Move.Left;
    if (m === ">") return Move.Right;
    throw new Error("Invalid movement");
  });

  return {
    world: {
      boxes: lookup(boxes),
      walls: lookup(walls),
      robot,
      w: lines[0].length,
      h,
    },
    movements,
  };
};

type BoxMove = [number, number, number, number];
const moveBox = (
  world: World,
  x: number,
  y: number,
  dir: Move
): (BoxMove | null | undefined)[] => {
  const hasBox = world.boxes.get(x)?.has(y) ?? false;
  const hasWall = world.walls.get(x)?.has(y) ?? false;

  const nx = x + directions[dir][0];
  const ny = y + directions[dir][1];

  const movement: BoxMove = [x, y, nx, ny];

  // Another box in the way, maybe can move? Recurse
  if (hasBox) return [movement, ...moveBox(world, nx, ny, dir)];
  if (hasWall) return [null];

  // Can move without obstruction
  return [undefined];
};

const step = (world: World, move: Move): World => {
  const { robot, boxes, walls } = world;

  const [dx, dy] = directions[move];
  const nx = robot.x + dx;
  const ny = robot.y + dy;

  const newRobot = {
    x: nx,
    y: ny,
  };

  const hasWall = walls.get(nx)?.has(ny) ?? false;
  if (hasWall) return world;

  const hasBox = boxes.get(nx)?.has(ny) ?? false;
  if (!hasBox)
    return {
      ...world,
      robot: newRobot,
    };

  const boxMovements = moveBox(world, nx, ny, move).filter(
    (x) => x !== undefined
  );

  const validMove = boxMovements.every((m) => m !== null);
  if (!validMove) return world;

  // Move boxes starting from end
  const newBoxes = new Map(boxes); // inner sets are mutable but oh well
  for (let i = boxMovements.length - 1; i >= 0; i--) {
    const [x, y, nx, ny] = boxMovements[i];

    // Remove old position
    newBoxes.get(x)?.delete(y);

    // Add new position
    const _x = newBoxes.get(nx) ?? new Set();
    _x.add(ny);
    newBoxes.set(nx, _x);
  }

  return {
    ...world,
    robot: newRobot,
    boxes: newBoxes,
  };
};

const printWorld = (world: World) => {
  const { w, h, robot, boxes, walls } = world;

  for (let y = 0; y < h; y++) {
    let line = "";
    for (let x = 0; x < w; x++) {
      if (robot.x === x && robot.y === y) {
        line += "@";
      } else if (boxes.get(x)?.has(y)) {
        line += "O";
      } else if (walls.get(x)?.has(y)) {
        line += "#";
      } else {
        line += ".";
      }
    }
    console.log(line);
  }
};

export const calculatePart1 = (input: string) => {
  const { world, movements } = parseInput(input);

  // Step through all movements
  let c: World = world;
  // printWorld(c);
  for (const move of movements) {
    c = step(c, move);
    // console.log(" - " + move);
    // printWorld(c);
  }

  // Calculate the final gps values total
  const gpss = Array.from(c.boxes.entries()).flatMap(([x, ys]) => {
    return Array.from(ys.values()).map((y) => gps({ x, y }));
  });

  const total = gpss.reduce((acc, gps) => acc + gps, 0);
  return total;
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
