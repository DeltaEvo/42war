<template>
  <div id="home">
    <Tournament :matchs="matchs">
      <template slot-scope="{ i, j, match }">
        <div v-if="i == 0" style="width: 175px;">
          <multi-select v-model="m[j]" :options="players" placeholder="Select player" track-by="name" label="name" :showLabels="false">
            <template slot="singleLabel" slot-scope="{ option }">
              <div class="select-option">
                <img :src="option.image">
                <span>{{ option.name }}</span>
              </div>
            </template>
          </multi-select>
        </div>
        <tournament-match v-else @run="run(match)" :match="match"></tournament-match>
      </template>
    </Tournament>
    <button class="add" @click="add">
      <icon icon="plus"/>
    </button>
  </div>
</template>

<script>
// @ is an alias to /src
import Tournament from "@/components/Tournament.vue";
import TournamentMatch from "@/components/TournamentMatch.vue";
import MultiSelect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";

export default {
  name: "home",
  data() {
    return {
      m: [],
      players: []
    };
  },
  mounted() {
    fetch("/api/players")
      .then(res => res.json())
      .then(players => (this.players = players));
  },
  computed: {
    matchs() {
      const res = [this.m];
      const len = this.m.length;
      for (let i = 0; i < (Math.log2(len) | 0); i++) {
        const tab = [];
        for (let j = 0; j < res[i].length; j += 2) {
          const p1 =
            i == 0 ? res[i][j] : res[i][j].oponents.find(e => e.winner);
          const p2 =
            i == 0 ? res[i][j + 1] : res[i][j + 1].oponents.find(e => e.winner);
          tab.push({
            oponents: [
              {
                ...p1,
                winner: true
              },
              {
                ...p2,
                winner: false
              }
            ]
          });
        }
        res.push(tab);
      }
      return res;
    }
  },
  components: {
    Tournament,
    TournamentMatch,
    MultiSelect
  },
  methods: {
    add() {
      if (this.m.length == 0) {
        this.m.push(null);
        this.m.push(null);
      } else {
        const len = this.m.length;
        for (let i = 0; i < len; i++) this.m.push(null);
      }
    },
    run(match) {
      fetch("/api/run", {
        body: JSON.stringify({
          players: match.oponents.map(({ name }) => name)
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
  }
};
</script>
<style lang="stylus">
  @import "../stylus/theme.styl"

  #home {
    .multiselect__input {
      max-width: 150px;
    }
    .select-option {
      display: flex;
      align-items: center;

      & > img {
        height: 25px;
        width: 25px;
        object-fit: cover;
        border-radius: 50%;
      }
      & > span {
        padding: 0 1em;
      }
    }
    .add {
      display: block;
      align-self: flex-start;
      border: none;
      padding: 1em;
      border-radius: 50%;
      box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
      margin: 16px;
      background-color: $color.primary;
      color: white;
      width: 35px;
      height: @width;

      &:hover {
        background-color: $color.secondary;
      }
    }
  }
</style>
