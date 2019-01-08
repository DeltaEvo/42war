<template>
    <div class="tournament-container">
        <div class="tournament-round" v-for="(round, i) in matchs" :key="i">
            <div v-for="(match, j) in round" :key="j" class="tournament-match">
                <slot :i="i" :j="j" :match="match"></slot>
            </div>
        </div>
    </div> 
</template>

<script>
/*
[
    {

    },
]
*/
export default {
  props: ["matchs"]
};
</script>

<style lang="stylus">
    .tournament-container {
        display: flex;

        & > .tournament-round {
            display: flex;
            flex-direction: column;

            &:not(:first-child) > .tournament-match::before {
                content: '';
                border-top: 2px solid #9e9e9e;
                left: 0;
            }

            &:not(:last-child) > .tournament-match:not(.single)::after {
                content: '';
                border-right: 2px solid #9e9e9e;
                right: 0;
                height: 50%;
            }

            &:not(:last-child) > .tournament-match.single::after {
                content: '';
                border-top: 2px solid #9e9e9e;
                right: 0;
            }

            & > .tournament-match {
                display: flex;
                align-items: center;
                height: 100%;
                padding: 0.5em 1em;
                position: relative;

                &:nth-child(odd)::after {
                    top: 50%;
                    border-top: 2px solid #9e9e9e;
                }

                &:nth-child(even)::after {
                    bottom: 50%;
                    border-bottom: 2px solid #9e9e9e;
                }

                &::after, &::before {
                    width: 1em;
                    position: absolute;
                    box-sizing: border-box;
                }
            }
        }
    }
</style>
