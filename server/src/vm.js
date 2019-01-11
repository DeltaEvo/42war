const { spawn } = require("child_process");
const readline = require("readline");
const ndarray = require("ndarray");

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

function isValid(map, piece, xo, yo, player) {
  const [width, height] = map.shape;
  let overlap = false;
  for (const [y, line] of piece.entries())
    for (const [x, char] of [...line].entries())
      if (char === "*") {
        if (yo + y > height || yo + y < 0 || xo + x > width || xo + x < 0)
          return false;
        else if (map.get(yo + y, xo + x) === 0) continue;
        else if (!overlap && map.get(yo + y, xo + x) === player + 1)
          overlap = true;
        else return false;
      }
  return overlap;
}

function placePiece(map, piece, xo, yo, player) {
  for (const [y, line] of piece.entries())
    for (const [x, char] of [...line].entries())
      if (char == "*") map.set(yo + y, xo + x, player + 1);
}

function sendMap(map, player, stream) {
  const [height, width] = map.shape;
  stream.write(`Plateau ${height} ${width}:\n`);
  stream.write(
    `    ${Array.from({ length: width })
      .map((_, i) => i % 10)
      .join("")}\n`
  );
  for (let y = 0; y < height; y++) {
    stream.write(`${y.toString().padStart(3, "0")} `);
    const line = map.data
      .slice(map.index(y, 0), map.index(y, width))
      .reduce((c, v) => {
        if (v === 0) return c + ".";
        else return c + (v === player + 1 ? "O" : "X");
      }, "");
    stream.write(line);
    stream.write("\n");
  }
}

function sendPiece(piece, stream) {
  const height = piece.length;
  const width = piece[0].length;
  stream.write(`Piece ${height} ${width}:\n`);
  piece.forEach(line => stream.write(`${line}\n`));
}

module.exports = async function* run(players, startMap) {
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
    process.stdin.write(`$$$ exec p1 : [${players[i]}]\n`);
    process.stderr.pipe(global.process.stderr);
    process.on("error", console.error);
    process.on("close", code => {
      console.log(`child process exited with code ${code}`);
    });
  }
  const { height, width } = startMap;
  const map = ndarray(new Uint8Array(width * height), [height, width]);
  for (const [i, spawns] of startMap.spawns.entries())
    for (const [x, y] of spawns) map.set(y, x, i + 1);
  while (processes.length) {
    for (const [j, { process, rl, i }] of processes.entries()) {
      sendMap(map, i, process.stdin);
      const piece = generatePiece(height, width);

      sendPiece(piece, process.stdin);
      const res = await nextLine(rl);

      const [y, x] = res.split(" ", 2).map(e => +e);
      if (!isNaN(y) && !isNaN(x) && isValid(map, piece, x, y, i)) {
        yield {
          turn: {
            pos: [x, y],
            piece,
            player: i
          }
        };
        placePiece(map, piece, x, y, i);
      } else {
        yield {
          error: {
            type: "Invalid",
            line: res,
            player: i
          }
        };
        process.kill();
        processes.splice(j, 1);
      }
    }
  }
};
