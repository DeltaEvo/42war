<template>
    <div class="match">
        <div class="players">
            <div
                v-for="(oponent, i) of match.oponents"
                :key="i"
                class="player" :class="{ winner: oponent.winner }"
            >
                <span>{{ oponent.name }}</span>
            </div>
        </div>
        <div class="menu">
            <icon
                icon="play"
                class="play"
                @click="$router.push({ name: 'run' })"
            />
        </div>
    </div>
</template>

<script>
export default {
  props: ["match"]
};
</script>

<style lang="stylus">
    $green = #60c645;
    $gray = #858585;

    .match {
        background-color: white;
        width: 175px;
        display: flex;
        align-items: center;

        & > .players {
            flex: 2;
            & > .player {
                color: $gray;
                border-left: 5px solid $gray;
                width: 100%;
                text-align: left;
                padding: 0.1em 1em;

                &.winner {
                    color: $green;
                    border-color: $green;
                }
            }
        }

        & > .menu {
            flex: 1;

            & > .play {
                color: $gray;
                transition: color 250ms;
                &:hover {
                    color: $green;
                }
            }
        }
    }
</style>
