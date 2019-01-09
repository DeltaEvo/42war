<template>
    <canvas>
    </canvas>
</template>

<script>
export const COLORS = ["blue", "red", "green"];

export default {
  props: ["data", "turn"],
  mounted() {
    const canvas = this.$el;
    const { map } = this.data;
    const height = map.length;
    const width = map[0].length;
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
      for (const [y, line] of map.entries())
        for (const [x, char] of [...line].entries())
          if (char !== ".") {
            const player = "OX".indexOf(char);
            this.context.fillStyle = COLORS[player];
            this.context.beginPath();
            const size = cell_width / 2;
            this.context.ellipse(
              x * cell_width + size,
              y * cell_width + size,
              size,
              size,
              0,
              0,
              2 * Math.PI
            );
            this.context.fill();
            this.context.stroke();
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
