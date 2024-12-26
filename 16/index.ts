import path from "path";
import {
  CoordLookup,
  coordLookupSet,
  directionsMoveList,
  horizontalDirections,
  horizontalDirectionsMap,
  inBounds,
  isMain,
  loadDayInput,
  loadTestInput,
  loadTextFile,
  verticalDirectionsMap,
} from "../shared";
import { totalmem } from "os";

type Coords = {
  x: number;
  y: number;
};

enum NodeType {
  Start,
  End,
  Turn,
}

type Node = Coords & {
  i: number;
  type: NodeType;
};

// const CHAR_EMPTY = ".";
const CHAR_WALL = "#";
const CHAR_START = "S";
const CHAR_END = "E";

export const parseInput = (input: string) => {
  const rows = input.split("\n");

  let start: Coords | undefined;
  let end: Coords | undefined;

  const walls: CoordLookup = new Map();

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char === CHAR_START) {
        start = { x, y };
      } else if (char === CHAR_END) {
        end = { x, y };
      } else if (char === CHAR_WALL) {
        coordLookupSet(walls, x, y);
      }
    }
  }

  const w = rows[0].length;
  const h = rows.length;

  if (!start || !end) {
    throw new Error("Start and end nodes are required");
  }

  return {
    start: start as Coords,
    end: end as Coords,
    walls,
    w,
    h,
  };
};

type ParsedInput = ReturnType<typeof parseInput>;

const START_NODE_ID = 0;
const END_NODE_ID = 1;

// const hash = (x: number, y: number) => `${x},${y}`;
const buildNodes = (input: ParsedInput) => {
  const nodes: Node[] = [];

  nodes.push({ ...input.start, type: NodeType.Start, i: START_NODE_ID });
  nodes.push({ ...input.end, type: NodeType.End, i: END_NODE_ID });

  let i = 2;
  for (let y = 0; y < input.h; y++) {
    for (let x = 0; x < input.w; x++) {
      const isWall = input.walls.get(x)?.has(y);
      if (isWall) continue;

      let hasHorizontalMovement = false;
      let hasVerticalMovement = false;
      for (const [dx, dy] of horizontalDirectionsMap) {
        const x2 = x + dx;
        const y2 = y + dy;
        if (!input.walls.get(x2)?.has(y2)) {
          hasHorizontalMovement = true;
          break;
        }
      }

      for (const [dx, dy] of verticalDirectionsMap) {
        const x2 = x + dx;
        const y2 = y + dy;
        if (!input.walls.get(x2)?.has(y2)) {
          hasVerticalMovement = true;
          break;
        }
      }

      // Crossroads
      if (hasHorizontalMovement && hasVerticalMovement) {
        if (x === input.start.x && y === input.start.y) {
          continue;
        } else if (x === input.end.x && y === input.end.y) {
          continue;
        }

        nodes.push({ x, y, type: NodeType.Turn, i: ++i });
      }
    }
  }

  return nodes;
};

type Path = {
  length: number;
  start: number;
  end: number;
  plane: MovementPlane;
};

const pathHash = (start: Node, end: Node) =>
  start.i < end.i ? `${start.i},${end.i}` : `${end.i},${start.i}`;

type PathsResult = ReturnType<typeof buildPaths>;

enum MovementPlane {
  Horizontal = 1,
  Vertical = 2,
}

// Find all direct paths between crossroads
// const buildPaths = (input: ParsedInput, nodes: Node[]) => {
//   const pathsByHash = new Map<string, Path>();
//   const nodesById: Record<number, Node> = {};
//   const pathsFromNodes: Record<number, Path[]> = {};

//   for (const node of nodes) {
//     const { x: startX, y: startY } = node;

//     nodesById[node.i] = node;

//     const pathsForNode: Path[] = [];

//     for (const anotherNode of nodes) {
//       if (node === anotherNode) continue;
//       if (anotherNode.x !== startX && anotherNode.y !== startY) continue;

//       const hash = pathHash(node, anotherNode);
//       const cachedPath = pathsByHash.get(hash);
//       if (cachedPath) {
//         pathsForNode.push({
//           ...cachedPath,
//           start: node.i,
//           end: anotherNode.i,
//         });
//       }

//       for (const [dx, dy] of directionsMoveList) {
//         let x = startX;
//         let y = startY;

//         const plane =
//           dx === 0 ? MovementPlane.Vertical : MovementPlane.Horizontal;

//         let length = 0;
//         while (true) {
//           x += dx;
//           y += dy;

//           length++;

//           if (x === anotherNode.x && y === anotherNode.y) {
//             if (input.walls.get(x)?.has(y)) {
//               break;
//             }

//             if (!inBounds(x, y, input.w, input.h)) {
//               break;
//             }

//             const newPath = {
//               length,
//               start: node.i,
//               end: anotherNode.i,
//               plane,
//             };

//             pathsForNode.push(newPath);
//             pathsByHash.set(hash, newPath);
//           }
//         }
//       }
//     }

//     pathsFromNodes[node.i] = pathsForNode;
//   }

//   return {
//     pathsFromNodes,
//     nodesById,
//     pathsByHash,
//   };
// };

const buildPaths = (input: ParsedInput, nodes: Node[]) => {
  // const pathsByHash = new Map<string, Path>();
  const nodesById: Record<number, Node> = {};
  const pathsFromNodes: Record<number, Path[]> = {};

  const nodesByLocation = new Map<number, Map<number, Node>>();

  for (const node of nodes) {
    if (!nodesByLocation.has(node.x)) {
      nodesByLocation.set(node.x, new Map());
    }

    nodesByLocation.get(node.x)?.set(node.y, node);
  }

  for (const node of nodes) {
    const { x: startX, y: startY } = node;

    nodesById[node.i] = node;

    const pathsForNode: Path[] = [];

    for (const [dx, dy] of directionsMoveList) {
      let x = startX;
      let y = startY;

      const plane =
        dx === 0 ? MovementPlane.Vertical : MovementPlane.Horizontal;

      let length = 0;
      while (true) {
        x += dx;
        y += dy;

        length++;

        if (input.walls.get(x)?.has(y)) break;
        if (!inBounds(x, y, input.w, input.h)) break;

        const anotherNode = nodesByLocation.get(x)?.get(y);
        if (anotherNode) {
          const newPath = {
            length,
            start: node.i,
            end: anotherNode.i,
            plane,
          };

          pathsForNode.push(newPath);
        }
      }
    }

    pathsFromNodes[node.i] = pathsForNode;
  }

  return {
    pathsFromNodes,
    nodesById,
  };
};

let cc = 0;
const traversePaths1 = ({
  nodesById,
  // pathsByHash,
  pathsFromNodes,
}: PathsResult) => {
  const startNode = nodesById[START_NODE_ID];

  let globalShortestPathLength = Infinity;
  let shortestPathNodes: Node[] = [];
  // const pathsToEndCache = new Map<number, number>();
  // const pathsToEndCache = new Map<string, number>();
  const cache = new Map<MovementPlane, Map<number, number>>();
  cache.set(MovementPlane.Horizontal, new Map());
  cache.set(MovementPlane.Vertical, new Map());
  // let shortestPathDebug: string[] = [];

  const recurse = (
    visitedNodes: Set<number>,
    totalCost: number,
    previousPlane: MovementPlane | undefined,
    node: Node
    // debug: string[]
  ) => {
    const paths = pathsFromNodes[node.i];

    let nodeShortestPathToEnd = Infinity;

    for (const { end, length, plane, start } of paths) {
      if (visitedNodes.has(end)) continue; // No circles
      if (plane === previousPlane) continue;

      let additionalCost = 0;

      // Corner cases for the first node
      const isFirstNode = start === START_NODE_ID;
      const walkedLength = length;

      if (isFirstNode) {
        const anotherNode = nodesById[end];
        const dx = anotherNode.x - startNode.x;
        const dy = anotherNode.y - startNode.y;
        let initialTurns = 0;
        if (dx > 0) {
          initialTurns = 0;
        } else if (dx < 0) {
          initialTurns = 2;
        } else if (dy > 0) {
          initialTurns = 1;
        } else if (dy < 0) {
          initialTurns = 1;
        }
        additionalCost += initialTurns * 1000;
      }

      additionalCost += walkedLength;

      // Take account the turn cost
      const hasTurned = previousPlane !== undefined && plane !== previousPlane;
      // const newTotalCostWithTurn = newTotalCost + (hasTurned ? 1000 : 0);
      additionalCost += hasTurned ? 1000 : 0;

      const newTotalCost = totalCost + additionalCost;

      if (newTotalCost >= globalShortestPathLength) continue; // Don't even bother

      const cached = cache.get(plane)?.get(end);
      if (cached !== undefined) {
        const fromHereToEnd = cached + additionalCost;
        nodeShortestPathToEnd = Math.min(nodeShortestPathToEnd, fromHereToEnd);
        const total = fromHereToEnd + totalCost;
        if (total < globalShortestPathLength) {
          globalShortestPathLength = total;
        }

        // console.log("skipped", cached, fromHereToEnd, total);
        continue;
      }

      // const cached = pathsToEndCache.get(hash);
      // if (cached) {
      //   const totalCostWithCached = newTotalCost + cached;
      //   if (totalCostWithCached < globalShortestPathLength) {
      //     globalShortestPathLength = totalCostWithCached;
      //   }
      //   // console.log("asdf" + hash);
      //   continue;
      // }

      const newVisitedNodes = new Set(visitedNodes);
      newVisitedNodes.add(end);

      // const newDebug = [
      //   ...debug,
      //   `${JSON.stringify(nodesById[node.i])} -> ${JSON.stringify(nodesById[end])} ${length} ${newTotalCostWithTurn} ${hasTurned}`,
      // ];

      cc++;

      if (end === END_NODE_ID) {
        // console.log("end");
        // Reached the end!
        if (newTotalCost < globalShortestPathLength) {
          globalShortestPathLength = newTotalCost;
          shortestPathNodes = Array.from(visitedNodes).map((i) => nodesById[i]);
          // pathToEndFromHere = additionalCost;
          nodeShortestPathToEnd = Math.min(
            nodeShortestPathToEnd,
            additionalCost
          );
          console.log(newTotalCost);
          // shortestPathDebug = newDebug;
          // console.log("found", cc);
        }
        continue;
      }

      // Check the new paths
      const pathToEndUsingThis = recurse(
        newVisitedNodes,
        newTotalCost,
        plane,
        nodesById[end]
        // newDebug
      );

      if (pathToEndUsingThis < Infinity) {
        const fromHereToEnd = pathToEndUsingThis + additionalCost;
        // console.log(
        //   "caching",
        //   end,
        //   pathToEndUsingThis,
        //   additionalCost,
        //   newTotalCost
        // );
        nodeShortestPathToEnd = Math.min(nodeShortestPathToEnd, fromHereToEnd);
        // console.log(hash, pathToEndUsingThis);
        cache.get(plane)?.set(end, pathToEndUsingThis);
      }
      // if (pathToEndUsingThis < Infinity)
      // const maybeShortestPathLength = pathToEndUsingThis + additionalCost;
      // if (maybeShortestPathLength < pathToEndFromHere) {
      //   pathToEndFromHere = maybeShortestPathLength;
      // }
    }

    // if (pathToEndFromHere < Infinity) {
    //   console.log(node.x, node.y, node.i, pathToEndFromHere);
    //   pathsToEndCache.set(node.i, pathToEndFromHere);
    // }

    // pathsToEndCache.set(hash, fromHereToEnd);
    // if (nodeShortestPathToEnd < Infinity) {
    //   // console.log(node.x, node.y, node.i, nodeShortestPathToEnd);
    //   nodeToEndCache.set(node.i, nodeShortestPathToEnd);
    // }

    return nodeShortestPathToEnd;
  };

  recurse(new Set([startNode.i]), 0, undefined, startNode);

  return {
    shortestPathLength: globalShortestPathLength,
    shortestPathNodes,
    // shortestPathDebug,
  };
};

const djikstra = ({ nodesById, pathsFromNodes }: PathsResult) => {
  const unvisited = new Set(Object.keys(nodesById).map(Number));
  const distances = new Map<number, number>();
  distances.set(START_NODE_ID, 0);

  let lowest = START_NODE_ID;

  while (unvisited.size > 0) {
    unvisited.delete(lowest);

    const paths = pathsFromNodes[lowest];
    for (const { end, length } of paths) {
      const newDistance = distances.get(lowest)! + length;
      const currentDistance = distances.get(end);
      if (currentDistance === undefined || newDistance < currentDistance) {
        distances.set(end, newDistance);
      }
    }

    let min = Infinity;
    let minNode = -1;
    for (const [node, distance] of distances.entries()) {
      if (distance < min && unvisited.has(node)) {
        min = distance;
        minNode = node;
      }
    }

    if (minNode === -1) {
      break;
    }

    lowest = minNode;
  }
};

// const traversePaths2 = ({
//   nodesById,
//   // pathsByHash,
//   pathsFromNodes,
// }: PathsResult) => {
//   const startNode = nodesById[START_NODE_ID];

//   let globalShortestPathLength = Infinity;
//   let shortestPathNodes: Node[] = [];
//   // const pathsToEndCache = new Map<number, number>();
//   // const pathsToEndCache = new Map<string, number>();
//   const nodeToEndCache = new Map<number, number>();
//   // let shortestPathDebug: string[] = [];

//   const recurse = (
//     visitedNodes: Set<number>,
//     totalCost: number,
//     previousPlane: MovementPlane | undefined,
//     node: Node
//     // debug: string[]
//   ) => {
//     const paths = pathsFromNodes[node.i];

//     // let pathToEndFromHere = Infinity;
//     // const cachedPathToEnd = nodeToEndCache.get(node.i);
//     // if (cachedPathToEnd !== undefined) {
//     //   const total = totalCost + cachedPathToEnd;
//     //   // console.log("cached" + cachedPathToEnd + " " + total);
//     //   if (total < globalShortestPathLength) {
//     //     globalShortestPathLength = total;
//     //   }
//     //   return cachedPathToEnd;
//     // }

//     let nodeShortestPathToEnd = Infinity;

//     for (const { end, length, plane, start } of paths) {
//       if (visitedNodes.has(end)) continue; // No circles

//       // const hash = pathHash(node, nodesById[end]);

//       // let newTotalCost = totalCost;
//       let additionalCost = 0;

//       // Corner cases for the first node
//       const isFirstNode = start === START_NODE_ID;
//       // const walkedLength = isFirstNode ? length : length - 1;
//       const walkedLength = length;
//       if (isFirstNode) {
//         const anotherNode = nodesById[end];
//         const dx = anotherNode.x - startNode.x;
//         const dy = anotherNode.y - startNode.y;
//         let initialTurns = 0;
//         if (dx > 0) {
//           initialTurns = 0;
//         } else if (dx < 0) {
//           initialTurns = 2;
//         } else if (dy > 0) {
//           initialTurns = 1;
//         } else if (dy < 0) {
//           initialTurns = 1;
//         }
//         additionalCost += initialTurns * 1000;
//       }

//       additionalCost += walkedLength;

//       // Only handle turns
//       // if (plane === previousPlane) continue;

//       // Take account the turn cost
//       const hasTurned = previousPlane !== undefined && plane !== previousPlane;
//       // const newTotalCostWithTurn = newTotalCost + (hasTurned ? 1000 : 0);
//       additionalCost += hasTurned ? 1000 : 0;

//       const newTotalCost = totalCost + additionalCost;

//       const newVisitedNodes = new Set(visitedNodes);
//       newVisitedNodes.add(end);

//       // const newDebug = [
//       //   ...debug,
//       //   `${JSON.stringify(nodesById[node.i])} -> ${JSON.stringify(nodesById[end])} ${length} ${newTotalCostWithTurn} ${hasTurned}`,
//       // ];

//       if (end === END_NODE_ID) {
//         // console.log("end");
//         // Reached the end!
//         if (newTotalCost < globalShortestPathLength) {
//           globalShortestPathLength = newTotalCost;
//           shortestPathNodes = Array.from(visitedNodes).map((i) => nodesById[i]);
//           // pathToEndFromHere = additionalCost;
//           nodeShortestPathToEnd = Math.min(
//             nodeShortestPathToEnd,
//             additionalCost
//           );
//           // shortestPathDebug = newDebug;
//         }
//         continue;
//       }

//       // Check the new paths
//       const pathToEndUsingThis = recurse(
//         newVisitedNodes,
//         newTotalCost,
//         plane,
//         nodesById[end]
//         // newDebug
//       );

//       if (pathToEndUsingThis < Infinity) {
//         const fromHereToEnd = pathToEndUsingThis + additionalCost;
//         nodeShortestPathToEnd = Math.min(nodeShortestPathToEnd, fromHereToEnd);
//         // console.log(hash, pathToEndUsingThis);
//       }

//       // if (pathToEndUsingThis < Infinity)
//       // const maybeShortestPathLength = pathToEndUsingThis + additionalCost;
//       // if (maybeShortestPathLength < pathToEndFromHere) {
//       //   pathToEndFromHere = maybeShortestPathLength;
//       // }
//     }

//     // if (pathToEndFromHere < Infinity) {
//     //   console.log(node.x, node.y, node.i, pathToEndFromHere);
//     //   pathsToEndCache.set(node.i, pathToEndFromHere);
//     // }

//     // pathsToEndCache.set(hash, fromHereToEnd);
//     if (nodeShortestPathToEnd < Infinity) {
//       // console.log(node.x, node.y, node.i, nodeShortestPathToEnd);
//       nodeToEndCache.set(node.i, nodeShortestPathToEnd);
//     }

//     return nodeShortestPathToEnd;
//   };

//   recurse(new Set([startNode.i]), 0, undefined, startNode);

//   return {
//     shortestPathLength: globalShortestPathLength,
//     shortestPathNodes,
//     // shortestPathDebug,
//   };
// };

const printMap = (input: ParsedInput, nodes: Node[]) => {
  const map = Array.from({ length: input.h }, () =>
    Array.from({ length: input.w }, () => " ")
  );

  for (const node of nodes) {
    const c =
      node.type === NodeType.Start
        ? "S"
        : node.type === NodeType.End
          ? "E"
          : "T";
    map[node.y][node.x] = c;
  }

  for (const [x, ySet] of input.walls.entries()) {
    for (const y of ySet) {
      map[y][x] = "#";
    }
  }

  for (const row of map) {
    console.log(row.join(""));
  }
};

const calculatePart1 = (input: string) => {
  const parsedInput = parseInput(input);
  const nodes = buildNodes(parsedInput);
  printMap(parsedInput, nodes);
  const paths = buildPaths(parsedInput, nodes);
  // const result = traversePaths1(paths);
  const result = traversePaths1(paths);
  console.log({ cc });
  // printMap(parsedInput, result.shortestPathNodes);
  // console.log(result.shortestPathDebug.join("\n"));
  return result.shortestPathLength;
};

export const calculatePart2 = (input: string) => {
  const x = parseInput(input);
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);
  // const input = loadTextFile("testinput2")(__dirname);
  // const input = loadTestInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);

  // const result2 = calculatePart2(input);
  // console.log("Part 2: " + result2);
}

// 2 + 1000 + 2 + 1000 + 4
// 1000
// 7
// 1000
// 6
// 1000
// 2
// 1000
// 12
