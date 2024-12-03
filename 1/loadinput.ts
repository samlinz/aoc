import fs from "node:fs";

const url = "https://adventofcode.com/2024/day/1/input";

const run = async (url: string, file: string) => {
  console.log("Loading input", url);
  const input = await fetch(url);

  if (fs.existsSync(file)) {
    console.log("File already exists, skipping");
    return;
  }

  console.log("Writing to", file);
  const text = await input.text();

  fs.writeFileSync(file, text, "utf-8");
};

run(url, "input")
  .then(() => console.log("Done"))
  .catch(console.error);
