<template>
    <el-header height="36px" class="list-header">
        <el-row class="header-row">
            <el-col :span="3" class="button-center">
                <el-button link :icon="Back" circle @click="goBack" />
            </el-col>
            <el-col :span="16" class="button-center">
                <el-input size="small" v-model="newPlayListName"></el-input>
            </el-col>
            <el-col :span="5" class="button-center">
                <el-button size="small">保存</el-button>
            </el-col>
        </el-row>
    </el-header>
    <el-main class="main-frame">
        <div class="half-main first-row">
            <div class="top-button-container">
                <div class="button-wrapper">
                    <el-form inline class="temp-form">
                        <el-form-item class="small-item">
                            <el-select size="small" placeholder="选择播放列表" v-model="tempPlayList" value-key="id">
                                <el-option
                                    v-for="playList in selectablePlayLists"
                                    :key="playList.id"
                                    :label="playList.name"
                                    :value="playList"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-button size="small" @click="loadPlayList">加载</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div class="top-table-container">
                <el-table
                    v-if="topTableVisible"
                    stripe
                    :show-header="false"
                    :data="tempSongs"
                    style="width: 100%"
                    :height="tempSongs.length > 0 ? '100%' : '100px'"
                >
                    <el-table-column>
                        <template #default="scope">
                            <div>{{ scope.row.name }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column width="80">
                        <template #default="scope">
                            <el-button
                                text
                                bg
                                size="small"
                                :disabled="songs.some((s) => s.id === scope.row.id)"
                                @click="add(scope.row)"
                            >
                                添加
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-else style="height: color: gray">加载中……</div>
            </div>
        </div>
        <div class="half-main">
            <div class="table-container">
                <el-table
                    v-if="bottomTableVisible"
                    stripe
                    :show-header="false"
                    :data="songs"
                    style="width: 100%"
                    :highlight-current-row="renaming"
                    @current-change="handleCurrentChange"
                    :height="songs.length > 0 ? '100%' : '100px'"
                >
                    <el-table-column>
                        <template #default="scope">
                            <div>{{ scope.row.name }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column width="80">
                        <template #default="scope">
                            <el-button text bg size="small" type="danger" @click="deleteSong(scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-else style="height: color: gray">加载中……</div>
            </div>
            <div class="button-container">
                <div class="button-wrapper">
                    <div class="error-message" v-if="importing && importError == 1">歌曲已存在</div>
                    <div class="error-message" v-if="importing && importError == 2">文件不存在</div>
                    <div class="error-message" v-if="renaming && renameError">未选择歌曲</div>
                </div>
                <div class="button-wrapper">
                    <el-form inline v-if="importing" class="temp-form">
                        <el-form-item class="small-item">
                            <el-input size="small" placeholder="文件路径" v-model="newSongPath" />
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-button size="small" @click="importSong">确定</el-button>
                            <el-button size="small" @click="importing = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                    <el-button size="small" class="big-button" v-else @click="startImport"> 导入音乐文件 </el-button>
                </div>
                <div class="button-wrapper">
                    <el-form inline v-if="renaming" class="temp-form">
                        <el-form-item class="small-item">
                            <el-input size="small" placeholder="重命名为：" v-model="newSongName" />
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-button size="small" @click="renameSong">确定</el-button>
                            <el-button size="small" @click="renaming = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                    <el-button size="small" class="big-button" v-else @click="startRename"> 重命名音乐 </el-button>
                </div>
            </div>
        </div>
    </el-main>
</template>

<script lang="ts">
import { useGlobalStore } from '@/stores/global';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import { Back } from '@element-plus/icons-vue';
import type { models } from '@nocturne/fake-backend';

export default defineComponent({
    setup() {
        return { Back };
    },
    data() {
        return {
            headerVisible: true,
            topTableVisible: true,
            bottomTableVisible: true,
            tempPlayList: { id: -1, name: '' } as models.PlayList,
            tempSongs: [] as models.Song[],
            importing: false,
            importError: 0,
            renaming: false,
            renameError: false,
            newPlayListName: '',
            newSongName: '',
            newSongPath: '',
            currentSong: { id: -1, name: '', path: '' } as models.Song,
        };
    },
    computed: {
        globalStore() {
            return useGlobalStore();
        },
        ...mapState(useGlobalStore, {
            nocturne: 'nocturne',
            playLists: 'playLists',
            currentPlayList: 'currentPlayList',
            songs: 'songs',
        }),
        selectablePlayLists() {
            return this.playLists.filter((playList) => playList.id !== this.currentPlayList.id);
        },
    },
    methods: {
        goBack() {
            this.globalStore.leftComponentId = 1;
        },
        async loadPlayList() {
            if (this.currentPlayList.id < 0) {
                return;
            }
            this.topTableVisible = false;
            this.tempSongs = await this.nocturne.songManager.getSongs(this.tempPlayList);
            this.topTableVisible = true;
        },
        startImport() {
            this.importing = true;
            this.renaming = false;
            this.importError = 0;
            this.newSongPath = '';
        },
        startRename() {
            this.renaming = true;
            this.importing = false;
            this.renameError = false;
            this.newSongName = '';
        },
        async add(song: models.Song) {
            this.topTableVisible = false;
            this.bottomTableVisible = false;
            await this.nocturne.songManager.addSong(this.currentPlayList, song);
            this.globalStore.songs = await this.nocturne.songManager.getSongs(this.currentPlayList);
            this.topTableVisible = true;
            this.bottomTableVisible = true;
        },
        async importSong() {
            this.importError = 0;
            if (this.songs.some((song) => song.path === this.newSongPath)) {
                this.importError = 1;
                return;
            }
            const song = await this.nocturne.songManager.getSong(this.newSongPath);
            if (song) {
                await this.nocturne.songManager.addSong(this.currentPlayList, song);
            } else {
                try {
                    await this.nocturne.songManager.loadSong(this.newSongPath, this.currentPlayList);
                } catch (error) {
                    this.importError = 2;
                    return;
                }
            }
            this.bottomTableVisible = false;
            this.globalStore.songs = await this.nocturne.songManager.getSongs(this.currentPlayList);
            this.bottomTableVisible = true;
        },
        async renameSong() {
            if (this.currentSong.id < 0) {
                this.renameError = true;
                return;
            }
            this.topTableVisible = false;
            this.bottomTableVisible = false;
            await this.nocturne.songManager.renameSong(this.currentSong, this.newSongName);
            this.globalStore.songs = await this.nocturne.songManager.getSongs(this.currentPlayList);
            if (this.tempPlayList.id >= 0) {
                this.tempSongs = await this.nocturne.songManager.getSongs(this.tempPlayList);
            }
            this.topTableVisible = true;
            this.bottomTableVisible = true;
        },
        async deleteSong(song: models.Song) {
            this.topTableVisible = false;
            this.bottomTableVisible = false;
            await this.nocturne.songManager.removeSong(this.currentPlayList, song);
            this.globalStore.songs = await this.nocturne.songManager.getSongs(this.currentPlayList);
            this.topTableVisible = true;
            this.bottomTableVisible = true;
        },
        handleCurrentChange(song: models.Song) {
            this.currentSong = song;
        },
    },
    mounted() {
        this.newPlayListName = this.currentPlayList.name;
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
}

.header-row {
    height: 100%;
}

.main-frame {
    padding: 0px;
    height: calc(100% - 35px);
}

.button-center {
    display: flex;
    justify-content: center;
    padding: 4px;
}

.half-main {
    width: 100%;
    height: calc(50% + 30px);
}
.first-row {
    border-bottom: 2px solid #444444;
    height: calc(50% - 32px);
}

.top-button-container {
    width: 100%;
    padding-bottom: 7px;
    background-color: #242628;
    border-bottom: 1px solid #444444;
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

.temp-form {
    width: calc(100% - 16px);
    display: flex;
    justify-content: space-between;
}

.small-item {
    margin-right: 4px;
    margin-bottom: 0px;
}

.top-table-container {
    width: 100%;
    height: calc(100% - 40px);
}

.table-container {
    height: calc(100% - 104px);
}

.big-button {
    width: calc(100% - 16px);
}

.error-message {
    color: #a00000;
    font-size: 12px;
    line-height: 32px;
}
</style>
