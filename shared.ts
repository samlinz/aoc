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
