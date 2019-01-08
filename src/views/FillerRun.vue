<template>
    <div id="filler-run">
        <div class="view">
            <canvas-view :data="data" :turn="turn" class="canvas"></canvas-view>
            <div class="menu">
                <slide-bar class="slider" v-model="turn" :max="data.turns.length" :speed="isPlaying ? 0 : 0.3"/>
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
</template>

<script>
import CanvasView, { COLORS } from "../components/CanvasView.vue";
import SlideBar from "vue-slide-bar";

export default {
  data() {
    return {
      turn: 0,
      data: require("../../turns.json"),
      colors: COLORS,
      isPlaying: false
    };
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
        if (this.turn > this.data.turns.length) this.pause();
      }, 50);
    },
    pause() {
      if (this.interval) clearInterval(this.interval);
      this.interval = null;
      this.isPlaying = 0;
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
            flex: 3;
            overflow: hidden;

            & > .canvas {
                height: 80%;
            }

            & > .menu {
                padding: 0 1em;
                height: 20%;
            }
        }

        & > .scores {
            flex: 0.2;
            display: flex;
            flex-direction: column;

            & > .score {
                flex: 1;
                transition: flex-grow 1s;
                color: white;
                font-weight: bold;
                height: 100%;
                display: flex;
                justify-content: center;
                flex-direction: column;
            }
        }

        & > .console {
            flex: 1;
            background-color: black;
        }
    }
</style>
