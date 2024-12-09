import { isMain, loadDayInput } from "../shared";

// The digits alternate between indicating the length of a file and the length of free space.
// Each file on disk also has an ID number based on the order of the files as they appear before they are rearranged, starting with ID 0.
// The amphipod would like to move file blocks one at a time from the end of the disk to the leftmost free space block (until there are no gaps remaining between file blocks).
// To calculate the checksum, add up the result of multiplying each of these blocks' position with the file ID number it contains. The leftmost block is in position 0. If a block contains free space, skip it instead.

// const print = (arr: (number | undefined)[]) => {
//   for (let i = 0; i < arr.length; i++) {
//     const v = arr[i];
//     process.stdout.write(v === undefined ? "." : v.toString());
//     process.stdout.write("|");
//   }
//   process.stdout.write("\n");
// };

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

export const parseInput2 = (input: string) => {
  const lines = input.split("\n");
  if (lines.length !== 1) throw Error("Invalid input");

  type EmptyBlock = {
    start: number;
    len: number;
  };

  type FileBlock = {
    start: number;
    len: number;
    id: number;
  };

  const emptyBlocks: EmptyBlock[] = [];
  const fileBlocks: FileBlock[] = [];

  let fileIndex = 0;
  let isFile = true;
  let nextStart = 0;

  const line = lines[0];
  const len = line.length;
  for (let i = 0; i < len; i++) {
    const value = parseInt(line[i], 10);

    if (isFile) {
      fileBlocks.push({
        start: nextStart,
        len: value,
        id: fileIndex,
      });
      fileIndex++;
    } else {
      if (value > 0) {
        emptyBlocks.push({
          start: nextStart,
          len: value,
        });
      }
    }

    isFile = !isFile;
    nextStart += value;
  }

  return {
    length: nextStart,
    emptyBlocks,
    fileBlocks,
  };
};

const checksum = (arr: (number | undefined)[]) => {
  const len = arr.length;
  let sum = 0;

  for (let i = 0; i < len; i++) {
    const v = arr[i];
    if (v === undefined) continue;
    sum += v * i;
  }

  return sum;
};

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

  return checksum(arr);
};

export const calculatePart2 = (input: string) => {
  const { emptyBlocks, fileBlocks, length } = parseInput2(input);

  const arr = Array.from({ length }, () => undefined) as (number | undefined)[];
  const fileBlocksCount = fileBlocks.length;

  for (let i = fileBlocksCount - 1; i >= 0; i--) {
    const fileBlock = fileBlocks[i];

    let emptyBlockIndex = 0;
    inner: for (const emptyBlock of emptyBlocks) {
      if (emptyBlock.start >= fileBlock.start) break inner; // Can't move

      const lengthDifference = emptyBlock.len - fileBlock.len;

      if (lengthDifference >= 0) {
        // Move file block to empty block
        fileBlock.start = emptyBlock.start;

        if (lengthDifference > 0) {
          // Update empty block size
          emptyBlock.start += fileBlock.len;
          emptyBlock.len = lengthDifference;
        } else {
          // Remove empty block
          emptyBlocks.splice(emptyBlockIndex, 1);
          emptyBlockIndex--;
        }

        break inner;
      }

      emptyBlockIndex++;
    }
  }

  // Build array
  for (const fileBlock of fileBlocks) {
    arr.fill(fileBlock.id, fileBlock.start, fileBlock.start + fileBlock.len);
  }

  return checksum(arr);
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
