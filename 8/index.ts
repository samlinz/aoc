import { createAllPossiblePairings, isMain, loadDayInput } from "../shared";

// Antenna
// - marked by lowercase letter
// Effect only on antinode
// - perfect in line with two antennas of same freq
// - when one of the antennas is twice as far away as the other
// - can be at the same location as antenna

type Node = {
  x: number;
  y: number;
  char: number;
};

const CHAR_EMPTY = ".";

type Vec2 = [number, number];

const vec2Hash = (v: Vec2) => `${v[0]}_${v[1]}`;
const vec2Add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];

const vec2Mul = (a: Vec2, b: number): Vec2 => [a[0] * b, a[1] * b];

const vec2OutofBounds = (v: Vec2, width: number, height: number) =>
  v[0] < 0 || v[0] >= width || v[1] < 0 || v[1] >= height;

const vec2BetweenNodes = (node1: Node, node2: Node): Vec2 => {
  return [node2.x - node1.x, node2.y - node1.y];
};

const parseInput = (input: string) => {
  const rows = input.split("\n");

  const w = rows[0].length;
  const h = rows.length;

  const result = rows.flatMap((line, y) => {
    const chars = line.split("");

    return chars
      .map((c, x) => {
        if (c === CHAR_EMPTY) return undefined;
        return { char: c.codePointAt(0), x, y } as Node;
      })
      .filter(Boolean) as Node[];
  });

  return {
    nodes: result,
    width: w,
    height: h,
  };
};

// const printResult = (
//   w: number,
//   h: number,
//   antinodes: [number, number][],
//   freq: Node[]
// ) => {
//   for (let y = 0; y < h; y++) {
//     let line = "";
//     for (let x = 0; x < w; x++) {
//       const isAntinode = antinodes.some(([ax, ay]) => ax === x && ay === y);
//       const f = freq.find((f) => f.x === x && f.y === y);

//       const isBoth = isAntinode && f;
//       line += isBoth
//         ? "B"
//         : f
//           ? String.fromCharCode(f.char)
//           : isAntinode
//             ? "X"
//             : ".";
//     }
//     console.log(line);
//   }
// };

export const calculatePart1 = (input: string) => {
  const { nodes, width, height } = parseInput(input);

  const nodesByChar = new Map<number, Node[]>();

  const foundAntiNodes = new Set<string>();

  for (const node of nodes) {
    if (!nodesByChar.has(node.char)) {
      nodesByChar.set(node.char, []);
    }
    nodesByChar.get(node.char)!.push(node);
  }

  for (const [char, nodes] of nodesByChar.entries()) {
    const nodePairings = createAllPossiblePairings(nodes);

    for (const pair of nodePairings) {
      const vectorBetween = vec2BetweenNodes(pair[0], pair[1]);
      const doubleVector = vec2Mul(vectorBetween, 2);
      const endpoint = vec2Add([pair[0].x, pair[0].y], doubleVector);
      const isValid = !vec2OutofBounds(endpoint, width, height);

      if (isValid) {
        foundAntiNodes.add(vec2Hash(endpoint));
      }
    }
  }

  return foundAntiNodes.size;
};

export const calculatePart2 = (input: string) => {
  const { nodes, width, height } = parseInput(input);

  const nodesByChar = new Map<number, Node[]>();
  const foundAntiNodes = new Set<string>();

  for (const node of nodes) {
    if (!nodesByChar.has(node.char)) {
      nodesByChar.set(node.char, []);
    }
    nodesByChar.get(node.char)!.push(node);
  }

  for (const [char, nodes] of nodesByChar.entries()) {
    const nodePairings = createAllPossiblePairings(nodes);

    for (const pair of nodePairings) {
      const vectorBetween = vec2BetweenNodes(pair[0], pair[1]);

      let currentVector: Vec2 = [pair[0].x, pair[0].y];
      while (!vec2OutofBounds(currentVector, width, height)) {
        foundAntiNodes.add(vec2Hash(currentVector));
        currentVector = vec2Add(currentVector, vectorBetween);
      }
    }
  }

  return foundAntiNodes.size;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
