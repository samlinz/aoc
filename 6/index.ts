import { isMain, loadDayInput } from "../shared";

type Position = {
  x: number;
  y: number;
};

type PositionId = `${number},${number}`;
type WithPosition = {
  position: Position;
};

type Direction = "up" | "down" | "left" | "right";
type WithDirection = {
  direction: Direction;
};

type Guard = WithPosition & WithDirection;

type World = {
  blocks: Set<PositionId>;

  guard: Guard;
  visited: Set<PositionId>;

  isFinished: boolean;

  width: number;
  height: number;
};

const getPositionId = (position: Position): PositionId =>
  `${position.x},${position.y}`;
const isLocationOutside = (w: number, h: number) => (position: Position) =>
  position.x < 0 || position.y < 0 || position.x >= w || position.y >= h;

const getNextPosition =
  (step = 1) =>
  (direction: Direction) =>
  (position: Position) => {
    switch (direction) {
      case "up":
        return { x: position.x, y: position.y - step };
      case "down":
        return { x: position.x, y: position.y + step };
      case "left":
        return { x: position.x - step, y: position.y };
      case "right":
        return { x: position.x + step, y: position.y };
      default:
        throw new Error(`Unknown direction: ${direction}`);
    }
  };

const turnRight = (direction: Direction): Direction => {
  switch (direction) {
    case "up":
      return "right";
    case "down":
      return "left";
    case "left":
      return "up";
    case "right":
      return "down";
    default:
      throw new Error(`Unknown direction: ${direction}`);
  }
};

// State machine step function
const getNextStep =
  (nextPosition: ReturnType<typeof getNextPosition>) =>
  (world: World): World => {
    const positionCandidate = nextPosition(world.guard.direction)(
      world.guard.position
    );
    const positionCandidateId = getPositionId(positionCandidate);
    const isOutside = isLocationOutside(
      world.width,
      world.height
    )(positionCandidate);

    // End run if guard is outside
    if (isOutside) {
      return { ...world, isFinished: true };
    }

    // Turn guard
    const isBlocked = world.blocks.has(positionCandidateId);
    if (isBlocked) {
      return {
        ...world,
        guard: { ...world.guard, direction: turnRight(world.guard.direction) },
      };
    }

    const newVisited = new Set(world.visited);
    newVisited.add(positionCandidateId);

    // Move
    return {
      ...world,
      guard: { ...world.guard, position: positionCandidate },
      visited: newVisited,
    };
  };

const CHAR_GUARD = "^";
const CHAR_EMPTY = ".";
const CHAR_BLOCK = "#";
const CHAR_VISITED = "X";

const buildWorld = (input: string): World => {
  const rowChars = input
    .split("\n")
    .filter((x) => x.length > 0)
    .map((x) => x.split(""));

  // Build world
  const width = rowChars[0].length;
  const height = rowChars.length;

  const newWorld: Partial<World> = {
    width,
    height,
    isFinished: false,
    visited: new Set<PositionId>(),
    blocks: new Set<PositionId>(),
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = rowChars[y][x];
      if (char === CHAR_GUARD) {
        if (newWorld.guard) throw Error("Multiple guards found");
        newWorld.guard = {
          position: { x, y },
          direction: "up",
        };

        // Initial position is visited
        newWorld.visited!.add(getPositionId({ x, y }));
      } else if (char === CHAR_BLOCK) {
        newWorld.blocks!.add(getPositionId({ x, y }));
      } else if (char === CHAR_EMPTY) {
        // Ignore
      } else {
        throw new Error(`Unknown character: ${char}`);
      }
    }
  }

  if (!newWorld.guard) throw Error("Guard not found");

  return newWorld as World;
};

const printWorld = (world: World) => {
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const positionId = getPositionId({ x, y });

      if (getPositionId(world.guard.position) === positionId) {
        process.stdout.write(CHAR_GUARD);
      } else if (world.blocks.has(positionId)) {
        process.stdout.write(CHAR_BLOCK);
      } else if (world.visited.has(positionId)) {
        process.stdout.write(CHAR_VISITED);
      } else {
        process.stdout.write(CHAR_EMPTY);
      }
    }

    process.stdout.write("\n");
  }
};

export const calculatePart1 = (input: string) => {
  const step = getNextStep(getNextPosition(1));

  const world = buildWorld(input);

  let currentWorld: World = world;
  while (!currentWorld.isFinished) {
    currentWorld = step(currentWorld);
  }

  // printWorld(currentWorld);
  return currentWorld.visited.size;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);
  // const input = loadTestInput(__dirname);

  const result1 = calculatePart1(input);
  // const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  // console.log("Part 2: " + result2);
}
