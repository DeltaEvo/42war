<template>
    <div id="filler-run">
        <div class="view">
            <canvas-view :data="data" :turn="turn"></canvas-view>
            <slide-bar class="slider" v-model="turn" :max="data.turns.length" :speed="isPlaying ? 0 : 0.3"/>
            <div v-for="(score, i) in scoresAtTurn" :key="i">
                {{data.players[i]}} ({{colors[i]}}): {{score}}
            </div>
            <button @click="play">
                Play
            </button>
            <button @click="pause">
                Pause
            </button>
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

            & > .slider {
                padding: 1em;
            }
        }

        & > .console {
            flex: 1;
            background-color: black;
        }
    }
</style>
