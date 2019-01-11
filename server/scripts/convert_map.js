const { readFileSync } = require("fs");
const [file] = process.argv.slice(2);

if (file) {
  const map = readFileSync(file, "utf-8")
    .split("\n")
    .filter(e => e);
  const height = map.length;
  const width = map[0].length;

  const spawns = [];

  for (const [y, line] of map.entries())
    for (const [x, char] of [...line].entries())
      if (char !== ".") {
        const player = "OX".indexOf(char);
        const arr = spawns[player] || [];
        arr.push([x, y]);
        spawns[player] = arr;
      }
  console.log(
    JSON.stringify(
      {
        height,
        width,
        spawns
      },
      null,
      2
    )
  );
}
