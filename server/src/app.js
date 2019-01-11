const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { promises: fs } = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const runFiller = require("./vm");
const EventEmiter = require("events");
const uuid = require("uuid/v4");
const { PassThrough } = require("stream");

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

function runGame(players, map, id) {
  const game = {
    events: new EventEmiter(),
    turns: [],
    players,
    map,
    ended: false
  };
  currentGames.set(id, game);
  (async () => {
    const playersBinary = players.map(player =>
      path.join(ROOT, "players", player + EXT)
    );

    for await (const { turn, error } of runFiller(playersBinary, map)) {
      if (turn) {
        game.events.emit("turn", turn);
        game.turns.push(turn);
      } else if (error) game.events.emit("error", error);
    }
    game.events.emit("end");
    game.ended = true;
    game.events = null;
  })().catch(error => {
    game.events.emit("vm-error", error);
    return Promise.reject(error);
  });
}

router.post("/run", bodyParser({ enableTypes: ["json"] }), async ctx => {
  const { players, map } = ctx.request.body;
  if (players.some(player => player.includes("."))) {
    throw new Error("Invalid player name");
  }
  const id = uuid();
  runGame(players, map || require("../maps/02.json"), id);
  ctx.body = { id };
});

router.get("/run/:id", async ctx => {
  const { id } = ctx.params;
  if (currentGames.has(id)) {
    const { turns, ended, players: playerNames, map } = currentGames.get(id);
    const players = await Promise.all(
      playerNames.map(async name => ({
        name,
        image: await getImageUrl(name)
      }))
    );
    ctx.body = { turns, ended, players, map };
  } else ctx.status = 404;
});

router.get("/run/:id/stream", async ctx => {
  const { id } = ctx.params;
  const { ["last-event-id"]: lastEventId } = ctx.query;

  if (currentGames.has(id)) {
    const { turns, ended, events } = currentGames.get(id);
    if (ended) ctx.status = 404;
    else {
      const stream = new PassThrough();
      const send = (event, data) => {
        stream.write(`event:${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };
      for (const turn of turns.slice(lastEventId)) send("turn", turn);
      events.on("turn", turn => send("turn", turn));
      events.on("error", error => send("error", error));
      events.once("end", () => send("end"));
      events.once("vm-error", error =>
        send("vm-error", { message: error.message })
      );
      ctx.req.once("close", () => ctx.res.end());
      ctx.req.once("finish", () => ctx.res.end());
      ctx.req.once("error", () => ctx.res.end());
      ctx.type = "text/event-stream";
      ctx.body = stream;
    }
  } else ctx.status = 404;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => console.log(`App listening on ${PORT}`));
