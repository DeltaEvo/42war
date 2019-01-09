`<template>
    <div v-if="data" id="filler-run">
        <div class="view">
            <canvas-view :data="data" :turn="turn" class="canvas"></canvas-view>
            <div class="menu">
                <icon class="icon" :icon="isPlaying ? 'pause' : 'play'" @click="isPlaying ? pause() : play()"/>
                <slide-bar class="slider" v-model="turn" :max="data.turns.length - 1" :is-disabled="!data.ended" :speed="isPlaying ? 0 : 0.3"/>
            </div>
        </div>
        <div class="scores">
            <div
                v-for="(score, i) in scoresAtTurn"
                :key="i"
                class="score"
                :style="`background-color: ${colors[i]}; flex-grow: ${score+1};`"
            >
                {{score}}
            </div>
        </div>
        <div class="console">
        </div>
    </div>
    <span v-else>Loading</span>
</template>

<script>
import CanvasView, { COLORS } from "../components/CanvasView.vue";
import SlideBar from "vue-slide-bar";

export default {
  props: ["id"],
  data() {
    return {
      turn: 0,
      data: null,
      colors: COLORS,
      isPlaying: false
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
          } else if (this.data.ended) clearInterval(interval);
        }, 50);
      }, 1000);
      this.isPlaying = true;
      events.addEventListener("message", ({ data }) =>
        queue.push(JSON.parse(data))
      );
      events.addEventListener("close", () => {
        this.data.ended = true;
        this.isPlaying = false;
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
      }, 50);
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
    #filler-run {
        height: 100vh;
        width: 100%;
        display: flex;

        & > .view {
            overflow: hidden;
            padding: 20px;
            flex: 1;

            & > .canvas {
                height: calc(100% - 50px);
                background: #f7f9f9;
            }

            & > .menu {
                display: flex;
                align-items: flex-end;
                height: 50px;
                & > .icon:hover {
                    color: #1066FD;
                }

                & > .slider {
                    padding: 5px 10px;
                    width: 100%;
                }
            }
        }

        & > .scores {
            width: 60px;
            display: flex;
            flex-direction: column;

            & > .score {
                flex: 1;
                transition: flex-grow 250ms;
                color: white;
                font-weight: bold;
                height: 100%;
                display: flex;
                justify-content: center;
                flex-direction: column;
            }
        }

        & > .console {
            width: 400px;
            background-color: black;
        }
    }
</style>
`
