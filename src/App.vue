<template>
    <el-container class="big-frame">
        <el-header class="nocturne-header" height="48px">
            <h1>Nocturne</h1>
        </el-header>
        <el-main class="main-frame">
            <el-row class="big-frame">
                <el-col :span="12" class="main-col">
                    <div class="small-frame left-frame">
                        <PlayListList v-if="leftComponentId == 0" @play-first="playFirst" />
                        <PlayList ref="playListComponent" v-show="leftComponentId == 1" />
                        <PlayListEdit v-if="leftComponentId == 2" />
                    </div>
                </el-col>
                <el-col :span="12" class="main-col">
                    <div class="small-frame right-frame">
                        <Play @play-next="playNext" @play-prev="playPrev" />
                        <!-- TODO: 增加播放顺序API及可能的播放行为API -->
                    </div>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useGlobalStore } from './stores/global';
import { mapState } from 'pinia';

import PlayList from './components/playList/PlayList.vue';
import PlayListList from './components/playList/PlayListList.vue';
import PlayListEdit from './components/playList/PlayListEdit.vue';
import Play from './components/play/Play.vue';

export default defineComponent({
    setup() {
        const playListComponent = ref<InstanceType<typeof PlayList>>();
        return { playListComponent };
    },
    computed: {
        globalStore() {
            return useGlobalStore();
        },
        ...mapState(useGlobalStore, {
            leftComponentId: 'leftComponentId',
            rightComponentId: 'rightComponentId',
        }),
    },
    methods: {
        playFirst() {
            this.playListComponent?.playFirst();
        },
        playNext() {
            this.playListComponent?.playNext();
        },
        playPrev() {
            this.playListComponent?.playPrev();
        },
    },
    components: { PlayList, PlayListList, PlayListEdit, Play },
});
</script>

<style scoped lang="scss">
.nocturne-header {
    background: rgb(6, 56, 84);
    background: linear-gradient(
        144deg,
        rgba(6, 56, 84, 1) 20%,
        rgba(9, 51, 74, 1) 24%,
        rgba(22, 27, 30, 1) 36%,
        rgba(24, 24, 24, 1) 64%
    );
    border-bottom: 1px solid #333333;
    margin-bottom: 10px;
    box-shadow: 0px 2px 5px rgba(#333333, 0.5);

    h1 {
        line-height: 48px;
        margin: 0;
    }
}
.big-frame {
    height: 100%;
    width: 100%;
}
.main-frame {
    padding: 0;
    background-color: #111111;
    overflow: hidden;
}

.small-frame {
    margin: 10px;
    margin-top: 0px;
    background-color: #222222;
    height: calc(100% - 10px);
    border: 1px solid #444444;
    border-radius: 4px;
}

.left-frame {
    margin-right: 5px;
}

.right-frame {
    margin-left: 5px;
}

.main-col {
    height: 100%;
}
</style>
