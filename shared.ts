import Module from "node:module";
import fs from "node:fs";
import path from "node:path";

export const isMain = (module: Module) => require.main === module;

export const loadTextFile =
  (file: string) =>
  (dir: string): string => {
    const fullpath = path.join(dir, file);
    if (!fs.existsSync(fullpath)) {
      throw new Error(`File not found: ${fullpath}`);
    }

    return fs.readFileSync(fullpath, "utf-8");
  };

export const loadDayInput = (dir: string) => loadTextFile("input")(dir);
export const loadTestInput = (dir: string) => loadTextFile("testinput")(dir);

export type Vec2 = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const vec2Equals = (a: Vec2, b: Vec2) =>
  a.x1 === b.x1 && a.y1 === b.y1 && a.x2 === b.x2 && a.y2 === b.y2;

export const reverseVec2 = (vec: Vec2): Vec2 => ({
  x1: vec.x2,
  y1: vec.y2,
  x2: vec.x1,
  y2: vec.y1,
});

export const permutations = <T>(arr: T[]): T[][] => {
  if (arr.length === 0) return [[]];
  const [first, ...rest] = arr;
  const perms = permutations(rest);
  return perms.flatMap((perm) =>
    Array.from({ length: perm.length + 1 }, (_, i) => [
      ...perm.slice(0, i),
      first,
      ...perm.slice(i),
    ])
  );
};

// export const combinations = <T>(length: number, operators: T[]): T[][] => {
//   const result: T[][] = [];

//   const generate = (current: T[], depth: number) => {
//     if (depth === length) {
//       result.push([...current]);
//       return;
//     }

//     for (const operator of operators) {
//       current.push(operator);
//       generate(current, depth + 1);
//       current.pop();
//     }
//   };

//   generate([], 0);
//   return result;
// };

// export const

export const min = (arr: number[]) => Math.min(...arr);
export const max = (arr: number[]) => Math.max(...arr);

export const createAllPossiblePairings = <T>(array: T[]): [T, T][] => {
  const pairings: [T, T][] = [];

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length; j++) {
      if (i !== j) {
        // Avoid pairing an element with itself
        pairings.push([array[i], array[j]]);
      }
    }
  }

  return pairings;
};

export const inBounds = (x: number, y: number, width: number, height: number) =>
  x >= 0 && x < width && y >= 0 && y < height;

export enum Move {
  Up,
  Down,
  Left,
  Right,
}

export type Direction = Move;
export const horizontalDirections = [Move.Left, Move.Right];
export const verticalDirections = [Move.Up, Move.Down];

export const directionsMap: Record<Move, [number, number]> = {
  [Move.Up]: [0, -1],
  [Move.Down]: [0, 1],
  [Move.Left]: [-1, 0],
  [Move.Right]: [1, 0],
};

export const horizontalDirectionsMap = horizontalDirections.map(
  (d) => directionsMap[d]
);
export const verticalDirectionsMap = verticalDirections.map(
  (d) => directionsMap[d]
);

export const directionsList = [Move.Up, Move.Down, Move.Left, Move.Right];
export const directionsMoveList = directionsList.map((d) => directionsMap[d]);

export type CoordLookup = Map<number, Set<number>>;

export const coordLookupSet = (lookup: CoordLookup, x: number, y: number) => {
  if (!lookup.has(x)) {
    lookup.set(x, new Set());
  }

  lookup.get(x)?.add(y);
};
