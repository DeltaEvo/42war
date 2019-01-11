`<template>
    <div v-if="data" id="filler-run">
        <div class="view">
            <canvas-view :data="data" :turn="turn" class="canvas"></canvas-view>
            <div class="menu">
                <icon class="icon" :icon="isPlaying ? 'pause' : 'play'" @click="isPlaying ? pause() : play()"/>
                <slide-bar class="slider" v-model="turn" :max="Math.max(data.turns.length - 1, 0)" :is-disabled="!data.ended" :speed="isPlaying ? 0 : 0.3"/>
            </div>
        </div>
        <div class="scores">
            <div
                v-for="(score, i) in scoresAtTurn"
                :key="i"
                class="score-container"
                :style="`background-color: ${colors[i]}; flex-grow: ${score+1};`"
            >
              <span class="name">{{data.players[i].name}}</span>
              <img :src="data.players[i].image">
              <span class="score">{{score}}</span>
            </div>
        </div>
        <div class="console">
          <pre>{{ consoleContent }}</pre>
        </div>
    </div>
    <span v-else>Loading</span>
</template>

<script>
import CanvasView, { COLORS } from "../components/CanvasView.vue";
import SlideBar from "vue-slide-bar";

const TIME_PER_TURNS = 25;

export default {
  props: ["id"],
  data() {
    return {
      turn: 0,
      data: null,
      colors: COLORS,
      isPlaying: false,
      consoleContent: "Roses are red\nViolets are Blue\n"
    };
  },
  async mounted() {
    const { turns, ended, players, map } = await fetch(
      `/api/run/${this.id}`
    ).then(res => res.json());
    this.data = {
      turns: [],
      players,
      ended,
      map
    };
    if (!ended) {
      const events = new EventSource(
        `/api/run/${this.id}/stream?last-event-id=${turns.length}`
      );
      const queue = turns;
      setTimeout(() => {
        const interval = setInterval(() => {
          if (queue.length) {
            this.data.turns.push(queue.shift());
            this.turn = this.data.turns.length - 1;
          } else if (this.data.ended) {
            clearInterval(interval);
            this.isPlaying = false;
          }
        }, TIME_PER_TURNS);
      }, 500);
      this.isPlaying = true;
      events.addEventListener("turn", ({ data }) =>
        queue.push(JSON.parse(data))
      );
      events.addEventListener("end", () => {
        events.close();
        this.data.ended = true;
      });
      events.addEventListener("error", ({ data }) => {
        const error = JSON.parse(data);
        if (error.type == "Invalid")
          this.consoleContent += `Invalid move from ${
            players[error.player].name
          } "${error.line}"\n`;
        else this.consoleContent += data;
      });
      events.addEventListener("vm-error", ({ data }) => {
        events.close();
        this.consoleContent += `VM Error: "${JSON.parse(data).message}"\n`;
        this.data.ended = true;
      });
    } else this.data.turns = turns;
  },
  computed: {
    scoresAtTurn() {
      const { turns, players } = this.data;
      const scores = players.map(() => 0);
      for (const { player } of turns.slice(0, this.turn)) scores[player]++;
      return scores;
    }
  },
  methods: {
    play() {
      this.isPlaying = true;
      if (this.turn >= this.data.turns.length - 1) this.turn = 0;
      this.interval = setInterval(() => {
        this.turn++;
        if (this.turn >= this.data.turns.length) this.pause();
      }, TIME_PER_TURNS);
    },
    pause() {
      if (!this.data.ended) return;
      if (this.interval) clearInterval(this.interval);
      this.interval = null;
      this.isPlaying = false;
    }
  },
  components: {
    CanvasView,
    SlideBar
  }
};
</script>

<style lang="stylus">
    @import "../stylus/theme.styl"

    #filler-run {
        height: 100vh;
        width: 100%;
        display: flex;

        .view {
            overflow: hidden;
            padding: 20px;
            flex: 1;

            .canvas {
                height: calc(100vh - 90px);
                background: #f7f9f9;
                box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
            }

            .menu {
                display: flex;
                align-items: flex-end;
                height: 50px;

                .icon {
                  color: $color.primary;

                  &:hover {
                    color: $color.secondary;
                  }
                }

                .slider {
                    padding: 5px 10px;
                    width: 100%;

                    .vue-slide-bar-tooltip, .vue-slide-bar-process {
                      background: $color.primary;
                      border-color: $color.primary;
                    }
                }
            }
        }

        .scores {
            width: 60px;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .score-container {
                min-height: 150px;
                flex: 1;
                transition: flex-grow 250ms;
                color: white;
                height: 100%;
                display: flex;
                justify-content: center;
                flex-direction: column;
                clip-path: polygon(0 0,100% 15px,100% 100%,0 calc(100% - 15px));
                margin: -15px 0;

                .name {
                  font-weight: bold;
                  font-size: 12px;
                }

                .score {
                  font-weight: bold;
                }

                & > img {
                  width: 60px;
                  height: 60px;
                  object-fit: cover;
                }
            }
        }

        .console {
            width: 400px;
            background-color: black;
            color: white;
            text-align: left;
            padding: 1em;
            font-weight: bold;
            overflow-y: scroll;
        }
    }
</style>
`
