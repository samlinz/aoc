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
  width: number;
  height: number;

  // visited: Set<PositionId>;
  // Consecutive steps in visited blocks - for loop detection
  // visitedSteps: number;
  // isFinished: boolean;
};

const positionHash = (position: Position): PositionId =>
  `${position.x},${position.y}`;

const copyWorld = (world: World): World => {
  return {
    ...world,
    guard: { ...world.guard },
    blocks: new Set(world.blocks),
    // visited: new Set(world.visited),
  };
};

const CHAR_GUARD = "^";
const CHAR_EMPTY = ".";
const CHAR_BLOCK = "#";
const CHAR_VISITED = "X";

const parseInput = (input: string) => {
  return input
    .split("\n")
    .filter((x) => x.length > 0)
    .map((x) => x.split(""));
};

// Unnecessarily complex because I changed the approach mid-way,
// but don't bother to simplify now because it works
// First approach used state-machine
const buildWorld = (input: string): World => {
  const rowChars = parseInput(input);

  // Build world
  const width = rowChars[0].length;
  const height = rowChars.length;

  const newWorld: Partial<World> = {
    width,
    height,
    blocks: new Set<PositionId>(),
    // isFinished: false,
    // visited: new Set<PositionId>(),
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
        // newWorld.visited!.add(positionHash({ x, y }));
      } else if (char === CHAR_BLOCK) {
        newWorld.blocks!.add(positionHash({ x, y }));
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

const directionsMap: Record<Direction, number> = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};

const movement = [
  [0, -1], // up
  [1, 0], // right
  [0, 1], // down
  [-1, 0], // left
];

// duplicate travelsal code, yeah i know but ei jaks
function* getSteps(world: World) {
  const w = world.width;
  const h = world.height;

  let d = directionsMap[world.guard.direction];

  let x: number = world.guard.position.x;
  let y: number = world.guard.position.y;

  while (x >= 0 && y >= 0 && x < w && y < h) {
    yield [x, y];

    const move = movement[d];
    const x2 = x + move[0];
    const y2 = y + move[1];
    const p2 = positionHash({ x: x2, y: y2 });

    if (world.blocks.has(p2)) {
      d = (d + 1) % 4;
    } else {
      x = x2;
      y = y2;
    }
  }
}

/**
 * The main loop checking algo.
 * Build vectors between direction changes, if same vector is detected twice, loop detected.
 * Stops on either exiting the area or detecting a loop.
 */
const hasLoops = (world: World) => {
  const w = world.width;
  const h = world.height;

  let x1 = world.guard.position.x;
  let y1 = world.guard.position.y;
  let d = directionsMap[world.guard.direction];

  const vectorHashes = new Set<string>();

  let x: number = x1;
  let y: number = y1;

  // While in bounds
  while (x >= 0 && y >= 0 && x < w && y < h) {
    // Potential move
    const move = movement[d];
    const x2 = x + move![0];
    const y2 = y + move![1];
    const p2 = positionHash({ x: x2, y: y2 });

    // Check for collision
    if (world.blocks.has(p2)) {
      // Change direction
      d = (d + 1) % 4;

      const hash = `${x1},${y1},${x},${y}`;

      if (vectorHashes.has(hash)) {
        // LOOP DETECTED
        return true;
      }

      vectorHashes.add(hash);

      // Start point of new vector
      x1 = x;
      y1 = y;
    } else {
      // Move
      x = x2;
      y = y2;
    }
  }

  // Exited normally, no loopety loops
  return false;
};

export const calculatePart1 = (input: string) => {
  const world = buildWorld(input);

  const visited = new Set();

  for (const step of getSteps(world)) {
    const position = positionHash({ x: step[0], y: step[1] });
    visited.add(position);
  }

  return visited.size;
};

export const calculatePart2 = (input: string) => {
  const world = buildWorld(input);

  let totalLoops = 0;

  const startX = world.guard.position.x;
  const startY = world.guard.position.y;
  const initialWorldCopy = copyWorld(world);
  const triedPositions = new Set<string>();

  for (const step of getSteps(world)) {
    // Skip starting position
    if (step[0] === startX && step[1] === startY) {
      continue;
    }

    const worldCopy = copyWorld(initialWorldCopy);

    const p = positionHash({ x: step[0], y: step[1] });

    if (triedPositions.has(p)) continue;
    triedPositions.add(p);

    // Add block for testing
    worldCopy.blocks.add(p);

    if (hasLoops(worldCopy)) {
      totalLoops++;
    }
  }

  return totalLoops;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}

// const printWorld = (world: World) => {
//   for (let y = 0; y < world.height; y++) {
//     for (let x = 0; x < world.width; x++) {
//       const positionId = getPositionId({ x, y });

//       if (getPositionId(world.guard.position) === positionId) {
//         process.stdout.write(CHAR_GUARD);
//       } else if (world.blocks.has(positionId)) {
//         process.stdout.write(CHAR_BLOCK);
//       } else if (world.visited.has(positionId)) {
//         process.stdout.write(CHAR_VISITED);
//       } else {
//         process.stdout.write(CHAR_EMPTY);
//       }
//     }

//     process.stdout.write("\n");
//   }
// };

// const getNextPosition =
//   (step = 1) =>
//   (direction: Direction) =>
//   (position: Position) => {
//     switch (direction) {
//       case "up":
//         return { x: position.x, y: position.y - step };
//       case "down":
//         return { x: position.x, y: position.y + step };
//       case "left":
//         return { x: position.x - step, y: position.y };
//       case "right":
//         return { x: position.x + step, y: position.y };
//       default:
//         throw new Error(`Unknown direction: ${direction}`);
//     }
//   };

// const turnRight = (direction: Direction): Direction => {
//   switch (direction) {
//     case "up":
//       return "right";
//     case "down":
//       return "left";
//     case "left":
//       return "up";
//     case "right":
//       return "down";
//     default:
//       throw new Error(`Unknown direction: ${direction}`);
//   }
// };

// State machine step function
// const getNextStep =
//   (nextPosition: ReturnType<typeof getNextPosition>) =>
//   (world: World): World => {
//     const positionCandidate = nextPosition(world.guard.direction)(
//       world.guard.position
//     );
//     const positionCandidateId = positionHash(positionCandidate);
//     const isOutside = isLocationOutside(
//       world.width,
//       world.height
//     )(positionCandidate);

//     // End run if guard is outside
//     if (isOutside) {
//       return { ...world, isFinished: true };
//     }

//     // Turn guard
//     const isBlocked = world.blocks.has(positionCandidateId);
//     if (isBlocked) {
//       return {
//         ...world,
//         guard: { ...world.guard, direction: turnRight(world.guard.direction) },
//       };
//     }

//     const newVisited = new Set(world.visited);
//     newVisited.add(positionCandidateId);
//     // world.visited.add(positionCandidateId);

//     // Entering visited block
//     const newPositionVisited = world.visited.has(positionCandidateId);

//     // Move
//     return {
//       ...world,
//       guard: { ...world.guard, position: positionCandidate },
//       visited: newVisited,
//       visitedSteps: newPositionVisited ? world.visitedSteps + 1 : 0,
//     };
//   };
// const isLocationOutside = (w: number, h: number) => (position: Position) =>
//   position.x < 0 || position.y < 0 || position.x >= w || position.y >= h;
