<template>
  <div class="home">
    <Tournament :matchs="matchs">
      <template slot-scope="{ i, j, match }">
        <input v-if="i ==0" style="width: 175px;" v-model="m[j].name">
        <tournament-match v-else :match="match"></tournament-match>
      </template>
    </Tournament>
    <button @click="add">Add</button>
  </div>
</template>

<script>
// @ is an alias to /src
import Tournament from "@/components/Tournament.vue";
import TournamentMatch from "@/components/TournamentMatch.vue";

export default {
  name: "home",
  data() {
    return {
      m: []
    };
  },
  computed: {
    matchs() {
      const res = [this.m];
      const len = this.m.length;
      for (let i = 0; i < (Math.sqrt(len) | 0); i++) {
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
    TournamentMatch
  },
  methods: {
    add() {
      if (this.m.length == 0) {
        this.m.push({
          name: "lul"
        });
        this.m.push({
          name: "lol"
        });
      } else {
        const len = this.m.length;
        for (let i = 0; i < len; i++)
          this.m.push({
            name: "blu"
          });
      }
    }
  }
};
</script>
