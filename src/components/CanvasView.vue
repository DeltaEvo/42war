<template>
    <canvas>
    </canvas>
</template>

<script>
// Material design color palette
export const COLORS = [
  "#F44336", // red
  "#2196F3", // blue
  "#4CAF50", // green
  "#FFEB3B", // yellow
  "#FF9800", // orange
  "#795548", // brown
  "#9E9E9E" // gray
];

export default {
  props: ["data", "turn"],
  mounted() {
    const canvas = this.$el;
    const { width, height } = this.data.map;
    this.cell_width = canvas.clientWidth / width;
    this.context = canvas.getContext("2d");
    canvas.width = width * this.cell_width;
    canvas.height = height * this.cell_width;
    this.render(this.turn);
  },
  methods: {
    render(maxTurn = this.data.turns.length) {
      const { map, turns } = this.data;
      const cell_width = this.cell_width;

      this.context.clearRect(0, 0, this.$el.width, this.$el.height);
      for (const {
        piece,
        pos: [xo, yo],
        player
      } of turns.slice(0, maxTurn)) {
        this.context.fillStyle = COLORS[player];
        for (const [y, line] of piece.entries())
          for (const [x, char] of [...line].entries())
            if (char === "*")
              this.context.fillRect(
                (xo + x) * cell_width,
                (yo + y) * cell_width,
                cell_width,
                cell_width
              );
      }
      this.context.lineWidth = 3;
      const { spawns } = map;
      for (const [player, pspawns] of spawns.entries())
        for (const [x, y] of pspawns) {
          this.context.fillStyle = COLORS[player];
          this.context.fillRect(
            x * cell_width,
            y * cell_width,
            cell_width,
            cell_width
          );
          this.context.strokeRect(
            x * cell_width,
            y * cell_width,
            cell_width,
            cell_width
          );
        }
    }
  },
  watch: {
    turn: {
      immediate: true,
      handler(val) {
        if (this.context) this.render(val);
      }
    }
  }
};
</script>

<style lang="stylus">
</style>
