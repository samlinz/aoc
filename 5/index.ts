import { isMain, loadDayInput } from "../shared";

type Rule = [string, string];
type Rules = Rule[];
type Update = string[];
type Updates = Update[];

export const parseInput = (
  input: string
): { rules: Rules; updates: Updates } => {
  const lines = input.split("\n").map((x) => x.trim());

  const rules: Rules = [];
  const updates: Updates = [];

  let phase = "rules";

  for (const line of lines) {
    if (line === "") {
      if (phase === "rules") {
        phase = "updates";
        continue;
      } else {
        continue;
      }
    }

    if (phase === "rules") {
      const [before, after] = line.split("|");
      rules.push([before, after]);
    } else if (phase === "updates") {
      updates.push(line.split(","));
    }
  }

  return { rules, updates };
};

type Lookup = Map<string, Set<string>>;
export const buildRuleLookup = (rules: Rules) => {
  const lookupBefore: Lookup = new Map();
  const lookupAfter: Lookup = new Map();

  for (const [before, after] of rules) {
    {
      const set = lookupBefore.get(after) || new Set();
      set.add(before);
      lookupBefore.set(after, set);
    }

    {
      const set = lookupAfter.get(before) || new Set();
      set.add(after);
      lookupAfter.set(before, set);
    }
  }

  return { lookupBefore, lookupAfter };
};

export const isUpdateValid = (lookupAfter: Lookup) => (update: Update) => {
  for (let i = 0; i < update.length; i++) {
    const cell = update[i];

    for (let j = 0; j < i; j++) {
      const otherCell = update[j];
      if (lookupAfter.get(cell)?.has(otherCell)) {
        return false;
      }
    }
  }

  return true;
};

const swapInvalidCells = (
  update: Update,
  currentPosition: number,
  invalidPosition: number
) => {
  const newUpdate = [...update];
  newUpdate[invalidPosition] = update[currentPosition];
  newUpdate[currentPosition] = update[invalidPosition];
  return newUpdate;
};

export const mangleToValidUpdate =
  (lookupAfter: Lookup) =>
  (update: Update): [Update, boolean] => {
    let wasModified = false;
    let possiblyFixedUpdate = [...update];

    for (let i = 0; i < possiblyFixedUpdate.length; i++) {
      const cell = possiblyFixedUpdate[i];

      for (let j = 0; j < i; j++) {
        const otherCell = possiblyFixedUpdate[j];
        if (lookupAfter.get(cell)?.has(otherCell)) {
          possiblyFixedUpdate = swapInvalidCells(possiblyFixedUpdate, i, j);
          wasModified = true;
          i = -1;
          break;
        }
      }
    }

    return [possiblyFixedUpdate, wasModified];
  };

const getMiddleValue = (update: Update) => {
  const len = update.length;

  if (len % 2 === 0) {
    throw Error("Update length must be odd");
  }

  return update[Math.floor(len / 2)];
};

export const calculatePart1 = (input: string) => {
  const { rules, updates } = parseInput(input);
  const { lookupAfter } = buildRuleLookup(rules);

  let total = 0;
  for (const update of updates) {
    if (isUpdateValid(lookupAfter)(update)) {
      total += Number(getMiddleValue(update));
    }
  }

  return total;
};

export const calculatePart2 = (input: string) => {
  const { rules, updates } = parseInput(input);
  const { lookupAfter } = buildRuleLookup(rules);

  let total = 0;
  for (const update of updates) {
    const [transformedUpdate, wasModified] =
      mangleToValidUpdate(lookupAfter)(update);

    if (wasModified) {
      total += Number(getMiddleValue(transformedUpdate));
    }
  }

  return total;
};

if (isMain(module)) {
  const input = loadDayInput(__dirname);

  const result1 = calculatePart1(input);
  const result2 = calculatePart2(input);
  console.log("Part 1: " + result1);
  console.log("Part 2: " + result2);
}
