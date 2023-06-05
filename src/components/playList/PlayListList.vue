<template>
    <el-container class="big-frame">
        <el-header height="36px" class="list-header">
            <h2>全部播放列表</h2>
        </el-header>
        <el-main class="main-frame">
            <div class="table-container">
                <el-table
                    v-if="tableVisible"
                    stripe
                    :show-header="false"
                    :data="playLists"
                    style="width: 100%"
                    :height="playLists.length > 0 ? '100%' : '100px'"
                    :highlight-current-row="deleting"
                    @current-change="handleCurrentChange"
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
                                type="danger"
                                v-if="deleting"
                                @click="deletePlayList(scope.row)"
                            >
                                删除
                            </el-button>
                            <el-button text bg size="small" v-else @click="enterPlayList(scope.row)"> 打开 </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-else style="height: color: gray">加载中……</div>
            </div>
            <div class="button-container">
                <div class="button-wrapper">
                    <div class="error-message" v-if="creating && createError">播放列表已存在</div>
                    <div class="error-message" v-if="deleting && deleteError == 1">未选择播放列表</div>
                    <div class="error-message" v-if="deleting && deleteError == 2">无法重命名为此名称</div>
                    <div class="error-message" v-if="importing && importError == 1">目录无效</div>
                    <div class="error-message" v-if="importing && importError == 2">播放列表已存在</div>
                </div>
                <div class="button-wrapper">
                    <el-form inline v-if="creating" class="temp-form">
                        <el-form-item class="small-item">
                            <el-input size="small" v-model="newName" placeholder="新播放列表名" />
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-button size="small" @click="create">确定</el-button>
                            <el-button size="small" @click="creating = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                    <el-button size="small" class="big-button" v-else @click="startCreate">新建</el-button>
                </div>
                <div class="button-wrapper">
                    <el-form inline v-if="importing" class="temp-form">
                        <el-form-item class="small-item">
                            <el-input size="small" v-model="newPath" placeholder="文件路径" />
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-checkbox size="small" label="递归" v-model="recursive" />
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-button size="small" @click="importList">确定</el-button>
                            <el-button size="small" @click="importing = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                    <el-button size="small" class="big-button" v-else @click="startImport"> 导入 </el-button>
                </div>
                <div class="button-wrapper">
                    <el-form inline v-if="deleting" class="temp-form">
                        <el-form-item class="small-item">
                            <el-input size="small" v-model="renameName" placeholder="重命名为：" />
                        </el-form-item>
                        <el-form-item class="small-item">
                            <el-button size="small" @click="renamePlayList">重命名</el-button>
                            <el-button size="small" @click="deleting = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                    <el-button size="small" class="big-button" type="danger" v-else @click="startDelete">
                        重命名/删除
                    </el-button>
                </div>
            </div>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import { useGlobalStore } from '@/stores/global';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import type { models } from '@nocturne/backend';

export default defineComponent({
    data() {
        return {
            renaming: -1,
            creating: false,
            createError: false,
            importing: false,
            recursive: false,
            importError: 0,
            deleting: false,
            deleteError: 0,
            newName: '',
            renameName: '',
            newPath: '',
            tableVisible: true,
        };
    },
    methods: {
        handleCurrentChange(current: models.PlayList) {
            this.renaming = current.id;
        },
        startCreate() {
            this.creating = true;
            this.deleting = false;
            this.importing = false;
            this.createError = false;
            this.newName = '';
        },
        startImport() {
            this.importing = true;
            this.deleting = false;
            this.creating = false;
            this.importError = 0;
            this.newPath = '';
            this.recursive = false;
        },
        startDelete() {
            this.deleting = true;
            this.creating = false;
            this.importing = false;
            this.deleteError = 0;
            this.renameName = '';
        },
        async enterPlayList(playList: models.PlayList) {
            this.globalStore.currentPlayList = playList;
            this.globalStore.songs = await this.nocturne.songManager.getSongs(playList);
            this.globalStore.currentSongIndex = 0;
            this.globalStore.leftComponentId = 1;
            this.$emit('playFirst');
        },
        async deletePlayList(playList: models.PlayList) {
            this.tableVisible = false;
            await this.nocturne.playListManager.deletePlayList(playList);
            this.globalStore.getPlayLists();
            this.tableVisible = true;
        },
        async renamePlayList() {
            this.deleteError = 0;
            const has = await this.nocturne.playListManager.hasPlayList(this.renameName);
            if (has) {
                this.deleteError = 2;
                return;
            }
            this.tableVisible = false;
            try {
                await this.nocturne.playListManager.renamePlayList(this.renaming, this.renameName);
                this.globalStore.getPlayLists();
            } catch (err) {
                this.deleteError = 1;
            } finally {
                this.tableVisible = true;
            }
        },
        async create() {
            this.tableVisible = false;
            this.createError = false;
            try {
                await this.nocturne.playListManager.createPlayList(this.newName);
                await this.globalStore.getPlayLists();
            } catch (err) {
                this.createError = true;
            } finally {
                this.tableVisible = true;
            }
        },
        async importList() {
            this.importError = 0;
            if (await this.nocturne.playListManager.hasPlayList(this.newPath)) {
                this.importError = 2;
                return;
            }
            this.tableVisible = false;
            try {
                await this.nocturne.playListManager.loadSongs(this.newPath, this.recursive);
                await this.globalStore.getPlayLists();
            } catch (err) {
                this.importError = 1;
                return;
            } finally {
                this.tableVisible = true;
            }
        },
    },
    computed: {
        globalStore() {
            return useGlobalStore();
        },
        ...mapState(useGlobalStore, {
            playLists: 'playLists',
            nocturne: 'nocturne',
        }),
    },
    mounted() {
        this.globalStore.getPlayLists();
    },
    emits: ['playFirst'],
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
    h2 {
        font-size: 16px;
        margin: 0;
        line-height: 36px;
    }
}

.main-frame {
    padding: 0px;
}

.table-container {
    height: calc(100% - 136px);
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

.error-message {
    color: #a00000;
    font-size: 12px;
    line-height: 32px;
}

.temp-form {
    width: calc(100% - 16px);
    display: flex;
    justify-content: space-between;
}
</style>
