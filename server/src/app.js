const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const sse = require("koa-sse-stream");
const { promises: fs } = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const runFiller = require("./vm");
const EventEmiter = require("events");
const uuid = require("uuid/v4");

const app = new Koa();
const router = new Router();

const PORT = 3000;
const ROOT = path.resolve(__dirname, "..");

const EXT = ".filler";

// TODO: memoize
async function getImageUrl(name) {
  const studentUrl = `https://cdn.intra.42.fr/users/small_${name}.jpg`;
  const isStudent = await fetch(studentUrl).then(res => res.status !== 404);
  if (isStudent) return studentUrl;
  else return `https://ui-avatars.com/api/?name=${name}`;
}

router.get("/players", async ctx => {
  const files = await fs.readdir(path.join(ROOT, "players"));
  ctx.body = await Promise.all(
    files
      .filter(path => path.endsWith(EXT))
      .map(path => path.slice(0, -EXT.length))
      .map(async name => ({
        name,
        image: await getImageUrl(name)
      }))
  );
});

const currentGames = new Map();

function runGame(players, id) {
  const mapFile = path.join(ROOT, "map02");
  const game = {
    events: new EventEmiter(),
    turns: [],
    players,
    map: fs
      .readFile(mapFile, "utf-8")
      .then(map => map.split("\n").filter(e => e)),
    ended: false
  };
  currentGames.set(id, game);
  (async () => {
    const map = await game.map;
    const playersBinary = players.map(player =>
      path.join(ROOT, "players", player + EXT)
    );

    for await (const { turn } of runFiller(playersBinary, map)) {
      if (turn) {
        game.events.emit("turn", turn);
        game.turns.push(turn);
      }
    }
    game.events.emit("end");
    game.ended = true;
    game.events = null;
  })();
}

router.post("/run", bodyParser({ enableTypes: ["json"] }), async ctx => {
  const { players } = ctx.request.body;
  if (players.some(player => player.includes("."))) {
    throw new Error("Invalid player name");
  }
  const id = uuid();
  runGame(players, id);
  ctx.body = { id };
});

router.get("/run/:id", async ctx => {
  const { id } = ctx.params;
  if (currentGames.has(id)) {
    const { turns, ended, players, map: mapPromise } = currentGames.get(id);
    const map = await mapPromise;
    ctx.body = { turns, ended, players, map };
  } else ctx.status = 404;
});

router.get(
  "/run/:id/stream",
  sse({
    maxClients: 5000,
    pingInterval: 30000
  }),
  async ctx => {
    const { id } = ctx.params;
    const { ["last-event-id"]: lastEventId } = ctx.query;
    if (currentGames.has(id)) {
      const { turns, ended, events } = currentGames.get(id);
      if (ended) ctx.status = 404;
      else {
        for (const turn of turns.slice(lastEventId))
          ctx.sse.send(JSON.stringify(turn));
        events.on("turn", turn => ctx.sse.send(JSON.stringify(turn)));
        events.on("end", () => ctx.sse.end());
      }
    } else ctx.status = 404;
  }
);

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => console.log(`App listening on ${PORT}`));
