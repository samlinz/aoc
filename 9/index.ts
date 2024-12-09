import { isMain, loadDayInput } from "../shared";

// The digits alternate between indicating the length of a file and the length of free space.
// Each file on disk also has an ID number based on the order of the files as they appear before they are rearranged, starting with ID 0.
// The amphipod would like to move file blocks one at a time from the end of the disk to the leftmost free space block (until there are no gaps remaining between file blocks).
// To calculate the checksum, add up the result of multiplying each of these blocks' position with the file ID number it contains. The leftmost block is in position 0. If a block contains free space, skip it instead.

export const parseInput = (input: string) => {
  const lines = input.split("\n");
  if (lines.length !== 1) throw Error("Invalid input");

  const line = lines[0];
  const len = line.length;

  const arr = Array.from({ length: len }, () => undefined) as (
    | number
    | undefined
  )[];

  let fileIndex = 0;
  let isFile = true;
  let nextStart = 0;
  for (let i = 0; i < len; i++) {
    const value = parseInt(line[i], 10);

    if (isFile) {
      for (let j = 0; j < value; j++) {
        arr[nextStart + j] = fileIndex;
      }
      fileIndex++;
    }

    isFile = !isFile;
    nextStart += value;
  }

  return arr;
};

// const print = (arr: (number | undefined)[]) => {
//   for (let i = 0; i < arr.length; i++) {
//     const v = arr[i];
//     process.stdout.write(v === undefined ? "." : v.toString());
//     process.stdout.write("|");
//   }
//   process.stdout.write("\n");
// };

export const calculatePart1 = (input: string) => {
  const arr = parseInput(input);
  const len = arr.length;

  let x = 0;

  // Move files to the left, filling empty spaces
  outer: for (let i = len - 1; i >= 0; i--) {
    const value = arr[i];

    if (value === undefined) continue;

    while (arr[x] !== undefined) {
      x++;

      if (x > i) {
        // All processed
        break outer;
      }
    }

    arr[x] = value;
    arr[i] = undefined;
  }

  // Count checksum
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const v = arr[i];
    if (v === undefined) break;
    sum += v * i;
  }

  return sum;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  console.log("Part 1: " + result1);
}
