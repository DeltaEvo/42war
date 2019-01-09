`<template>
    <div v-if="data" id="filler-run">
        <div class="view">
            <canvas-view :data="data" :turn="turn" class="canvas"></canvas-view>
            <div class="menu">
                <slide-bar class="slider" v-model="turn" :max="data.turns.length" :is-disabled="!data.ended" :speed="isPlaying ? 0 : 0.3"/>
                <button @click="play">
                    Play
                </button>
                <button @click="pause">
                    Pause
                </button>
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
      turns,
      players,
      ended,
      map
    };
    if (!ended) {
      const events = new EventSource(`/api/run/${this.id}/stream`);
      this.turn = turns.length;
      this.isPlaying = true;
      events.addEventListener("message", ({ data }) => {
        this.data.turns.push(JSON.parse(data));
        this.turn++;
      });
      events.addEventListener("close", () => {
        this.data.ended = true;
        this.isPlaying = false;
      });
    }
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
      this.turn = 0;
      this.interval = setInterval(() => {
        this.turn++;
        if (this.turn >= this.data.turns.length) this.pause();
      }, 50);
    },
    pause() {
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
        width: 100vw;
        display: flex;

        & > .view {
            overflow: hidden;
            padding: 20px;
            flex: 1;

            & > .canvas {
                height: calc(100% - 100px);
                background: #f7f9f9;
            }

            & > .menu {
                height: 100px;
            }
        }

        & > .scores {
            width: 100px;
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
