const { spawn } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");
const readline = require("readline");

const mapFile = "../filler/resources/maps/map02";

const players = [
  "../filler/dde-jesu.filler",
  //'../filler/resources/players/carli.filler',
  //'../PFiller/prastoin.filler',
  //'../lole/roliveir.filler'
  "../filler/dde-jesu.filler"
];

const map = readFileSync(mapFile, "utf-8")
  .split("\n")
  .filter(e => e);

const processes = players.map((cmd, i) => {
  const process = spawn(cmd);
  return {
    process,
    rl: readline.createInterface({
      input: process.stdout,
      crlfDelay: Infinity
    }),
    i
  };
});

for (const [i, { process }] of processes.entries()) {
  process.stdin.write(`$$$ exec p${i + 1} : [${players[i]}]\n`);
  process.stderr.pipe(global.process.stderr);
  process.on("error", console.error);
  process.on("close", code => {
    console.log(`child process exited with code ${code}`);
  });
}

function nextLine(rl) {
  return new Promise(resolve => rl.once("line", resolve));
}

function generatePiece(mapHeight, mapWidth) {
  const height = Math.min(5, Math.ceil((Math.random() * mapHeight) / 5)) + 1;
  const width = Math.min(5, Math.ceil((Math.random() * mapWidth) / 5)) + 1;

  const piece = Array.from({ length: height }).map(() =>
    ".".repeat(width).split("")
  );
  let x = Math.floor(Math.random() * width);
  let y = Math.floor(Math.random() * height);
  for (let i = 0; i < height * width * 0.6; i++) {
    piece[y][x] = "*";
    if (x < width - 1 && piece[y][x + 1] == "." && Math.random() >= 0.5) x++;
    else if (y < height - 1 && piece[y + 1][x] == "." && Math.random() >= 0.5)
      y++;
    else if (x > 0 && piece[y][x - 1] == "." && Math.random() >= 0.5) x--;
    else if (y > 0 && piece[y - 1][x] == "." && Math.random() >= 0.5) y--;
  }
  return piece.map(e => e.join(""));
}

function removeProcess(i) {
  processes[i].process.kill();
  processes.splice(i, 1);
}

void (async function() {
  const turns = [];
  const scores = processes.map(() => 0);
  const height = map.length;
  const width = map[0].length;
  let cmap = map;
  while (processes.length) {
    for (const [j, { process, rl, i }] of processes.entries()) {
      sendMap(cmap, process.stdin);
      const piece = generatePiece(height, width);
      /*console.log("Piece:")
            piece.forEach(l => console.log(l))*/

      sendPiece(piece, process.stdin);
      const res = await nextLine(rl);

      const [y, x] = res.split(" ", 2).map(e => +e);
      if (isNaN(y) || isNaN(x) || y < 0 || x < 0 || y > height || x > width) {
        console.log(`Invalid input "${res}" from ${i}`);
        removeProcess(j);
      } else if (isValid(cmap, piece, x, y, "OX"[i])) {
        turns.push({
          pos: [x, y],
          piece,
          player: i
        });
        scores[i]++;
        cmap = placePiece(cmap, piece, x, y, "OX"[i]);
      } else {
        console.log("Invalid move", x, y, "from player", i);
        removeProcess(j);
      }
      /*console.log("Map:")
            cmap.forEach(l => console.log(l))*/
    }
  }
  //console.log(scores);
  for (const { process } of processes) process.kill();
  writeFileSync(
    "turns.json",
    JSON.stringify(
      {
        map,
        turns,
        players
      },
      null,
      2
    ),
    "utf-8"
  );
})();

function isValid(map, piece, xo, yo, playerChar) {
  let overlap = false;
  for (const [y, line] of piece.entries())
    for (const [x, char] of [...line].entries())
      if (char === "*") {
        if (map[yo + y][xo + x] === ".") continue;
        else if (!overlap && map[yo + y][xo + x] == playerChar) overlap = true;
        else return false;
      }
  return overlap;
}

function placePiece(map, piece, xo, yo, playerChar) {
  const sub = map.slice(yo, yo + piece.length).map(e => e.split(""));

  for (const [y, line] of piece.entries())
    for (const [x, char] of [...line].entries())
      if (char == "*") sub[y][xo + x] = playerChar;

  return map
    .slice(0, yo)
    .concat(sub.map(e => e.join("")))
    .concat(map.slice(yo + piece.length));
}

function sendMap(map, stream) {
  const height = map.length;
  const width = map[0].length;
  stream.write(`Plateau ${height} ${width}:\n`);
  stream.write(
    `    ${Array.from({ length: width })
      .map((_, i) => i % 10)
      .join("")}\n`
  );
  for (const [i, line] of map.entries())
    stream.write(`${i.toString().padStart(3, "0")} ${line}\n`);
}

function sendPiece(piece, stream) {
  const height = piece.length;
  const width = piece[0].length;
  stream.write(`Piece ${height} ${width}:\n`);
  piece.forEach(line => stream.write(`${line}\n`));
}
