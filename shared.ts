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
