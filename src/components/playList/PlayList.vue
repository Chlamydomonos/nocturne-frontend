<template>
    <el-container class="big-frame">
        <el-header height="36px" class="list-header">
            <el-row class="header-row">
                <el-col :span="3" class="button-center">
                    <el-button link :icon="Back" circle @click="goBack" />
                </el-col>
                <el-col :span="18">
                    <h2>{{ currentPlayList.name }}</h2>
                </el-col>
                <el-col :span="3" />
            </el-row>
        </el-header>
        <el-main class="main-frame">
            <div class="table-container">
                <el-table
                    ref="songTable"
                    stripe
                    :show-header="false"
                    :data="songs"
                    style="width: 100%"
                    :height="songs.length > 0 ? '100%' : '100px'"
                    highlight-current-row
                    @current-change="handleCurrentChange"
                >
                    <el-table-column>
                        <template #default="scope">
                            <div>{{ scope.row.name }}</div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="button-container">
                <div class="button-wrapper">
                    <div class="error-message" v-if="error">歌曲已失效</div>
                </div>
                <div class="button-wrapper">
                    <el-button size="small" class="big-button" @click="editPlayList"> 编辑播放列表 </el-button>
                </div>
            </div>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import { useGlobalStore } from '@/stores/global';
import type { models } from '@nocturne/backend';
import { mapState } from 'pinia';
import { defineComponent, ref } from 'vue';
import { Back } from '@element-plus/icons-vue';
import { ElTable } from 'element-plus/es';

export default defineComponent({
    setup() {
        const songTable = ref<InstanceType<typeof ElTable>>();
        return { Back, songTable };
    },
    data() {
        return {
            error: false,
            autoPlaying: false,
        };
    },
    computed: {
        globalStore() {
            return useGlobalStore();
        },
        ...mapState(useGlobalStore, {
            nocturne: 'nocturne',
            currentPlayList: 'currentPlayList',
            songs: 'songs',
        }),
    },
    methods: {
        goBack() {
            this.globalStore.leftComponentId = 0;
        },
        async handleCurrentChange(current: models.Song) {
            if (this.autoPlaying) {
                this.autoPlaying = false;
                return;
            }
            await this.playSong(current, false);
        },
        async playSong(song: models.Song, highlight: boolean, index?: number) {
            if (highlight) {
                const inPlayListId = index !== undefined ? index : this.songs.findIndex((s) => s.id === song.id);
                this.globalStore.currentSongIndex = inPlayListId;
                this.songTable?.setCurrentRow(this.songs[inPlayListId]);
            }
            this.error = false;
            const songValid = await this.nocturne.songManager.checkSong(song);
            if (!songValid) {
                this.error = true;
                return;
            }
            const code = await this.nocturne.play(song);
            if (code !== 0) {
                this.error = true;
                return;
            }
            this.globalStore.currentStatus = await this.nocturne.player.getPlayStatus();
            this.globalStore.currentLength = await this.nocturne.player.getLength();
            this.globalStore.currentTime = await this.nocturne.player.getTime();
            this.globalStore.currentVolume = await this.nocturne.player.getVolume();
            this.globalStore.currentSpeed = await this.nocturne.player.getSpeed();
            this.globalStore.currentSong = song;
        },
        async playNext() {
            this.autoPlaying = true;
            if (this.songs.length == 0) {
                await this.nocturne.player.stop();
                this.globalStore.currentStatus = await this.nocturne.player.getPlayStatus();
                this.globalStore.currentLength = await this.nocturne.player.getLength();
                this.globalStore.currentTime = await this.nocturne.player.getTime();
                this.globalStore.currentVolume = await this.nocturne.player.getVolume();
                this.globalStore.currentSpeed = await this.nocturne.player.getSpeed();
                this.globalStore.currentSong = { id: -1, name: '', path: '' };
                return;
            }
            if (this.globalStore.currentSongIndex === this.songs.length - 1) {
                await this.playSong(this.songs[0], true, 0);
            } else {
                await this.playSong(this.songs[this.globalStore.currentSongIndex + 1], true);
            }
        },
        async playPrev() {
            this.autoPlaying = true;
            if (this.songs.length == 0) {
                await this.nocturne.player.stop();
                this.globalStore.currentStatus = await this.nocturne.player.getPlayStatus();
                this.globalStore.currentLength = await this.nocturne.player.getLength();
                this.globalStore.currentTime = await this.nocturne.player.getTime();
                this.globalStore.currentVolume = await this.nocturne.player.getVolume();
                this.globalStore.currentSpeed = await this.nocturne.player.getSpeed();
                this.globalStore.currentSong = { id: -1, name: '', path: '' };
                return;
            }
            if (this.globalStore.currentSongIndex === 0) {
                await this.playSong(this.songs[this.songs.length - 1], true, this.songs.length - 1);
            } else {
                await this.playSong(this.songs[this.globalStore.currentSongIndex - 1], true);
            }
        },
        async playFirst() {
            this.autoPlaying = true;
            if (this.songs.length == 0) {
                await this.nocturne.player.stop();
                this.globalStore.currentStatus = await this.nocturne.player.getPlayStatus();
                this.globalStore.currentLength = await this.nocturne.player.getLength();
                this.globalStore.currentTime = await this.nocturne.player.getTime();
                this.globalStore.currentVolume = await this.nocturne.player.getVolume();
                this.globalStore.currentSpeed = await this.nocturne.player.getSpeed();
                this.globalStore.currentSong = { id: -1, name: '', path: '' };
                return;
            }
            await this.playSong(this.songs[0], true, 0);
        },
        editPlayList() {
            this.globalStore.leftComponentId = 2;
        },
    },
    components: { Back },
});
</script>

<style scoped lang="scss">
.big-frame {
    width: 100%;
    height: 100%;
}

.list-header {
    background-color: #333333;
    text-align: center;
    padding: 0;

    h2 {
        font-size: 16px;
        margin: 0;
        line-height: 36px;
        overflow: hidden;
    }
}
.header-row {
    height: 100%;
}

.main-frame {
    padding: 0px;
}

.table-container {
    height: calc(100% - 72px);
}

.button-center {
    display: flex;
    justify-content: center;
    padding: 4px;
}

.button-container {
    width: 100%;
    padding-top: 7px;
    border-top: 1px solid #444444;
    background-color: #242628;
}
.button-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 32px;
}

.big-button {
    width: calc(100% - 16px);
}

.small-item {
    margin-right: 4px;
}
</style>
