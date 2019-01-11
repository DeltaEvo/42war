<template>
    <div id="battleroyale">
        <multi-select class="select" v-model="players" :options="options" placeholder="Select players" track-by="name" label="name" :preserve-search="true" :multiple="true" :closeOnSelect="false">
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="players.length && !isOpen"> {{ values.length }} players selected</span>
            </template>
        </multi-select>
        <div class="players">
            <div
                v-for="(player, i) in players"
                :key="i"
                class="player"
            >
                <img :src="player.image">
                <span>{{ player.name }}</span>
            </div>
        </div>
        <button @click="run">Run</button>
    </div>
</template>

<script>
import MultiSelect from "vue-multiselect";
export default {
  data() {
    return {
      options: [],
      players: []
    };
  },
  mounted() {
    fetch("/api/players")
      .then(res => res.json())
      .then(players => (this.options = players));
  },
  methods: {
    run() {
      const SIZE = 200;
      const PADDING = 5;
      fetch("/api/run", {
        body: JSON.stringify({
          players: this.players.map(({ name }) => name),
          map: {
            width: SIZE,
            height: SIZE,
            spawns: this.players.map((_, i, { length }) => {
              return [
                [
                  PADDING +
                    Math.floor((i / (length - 1)) * (SIZE - PADDING * 2)),
                  PADDING +
                    Math.floor((i / (length - 1)) * (SIZE - PADDING * 2))
                ]
              ];
            })
          }
        }),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      })
        .then(res => res.json())
        .then(({ id }) => {
          this.$router.push({ name: "run", params: { id } });
        });
    }
  },
  components: {
    MultiSelect
  }
};
</script>

<style lang="stylus">
    #battleroyale {
        padding: 20px;
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;

        & > .select {
            width: 300px;
        }

        .players {
            display: flex;
            flex-wrap: wrap;

            .player {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100px;
                height: @width;

                & > img {
                    width: 60px;
                    height: @width;
                    object-fit: cover;
                }

                & > span {
                    text-overflow: ellipsis;
                    max-width: 100px;
                    overflow: hidden;
                }
            }
        }
    }
</style>
