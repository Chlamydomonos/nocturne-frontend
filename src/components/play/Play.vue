<template>
    <div class="big-frame">
        <div class="title">
            <h1>正在播放：</h1>
            <div class="vertical-center">
                <h1 class="center" :style="titleStyle">{{ title }}</h1>
            </div>
        </div>
        <div class="control">
            <div class="control-frame">
                <el-row class="buttons">
                    <el-col class="button-container first-button-container" :span="6">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            size="large"
                            v-if="currentStatus != 1"
                            @click="resume"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-play" />
                            </div>
                        </el-button>
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            size="large"
                            v-else
                            @click="pause"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-pause" />
                            </div>
                        </el-button>
                    </el-col>
                    <el-col class="button-container" :span="3">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            @click="$emit('playPrev')"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-step-backward" />
                            </div>
                        </el-button>
                    </el-col>
                    <el-col class="button-container" :span="3">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            @click="$emit('playNext')"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-step-forward" />
                            </div>
                        </el-button>
                    </el-col>
                    <el-col class="button-container" :span="3">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            @click="setDeltaTime(-30)"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-angles-left" />
                            </div>
                        </el-button>
                    </el-col>
                    <el-col class="button-container" :span="3">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            @click="setDeltaTime(-10)"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-angle-left" />
                            </div>
                        </el-button>
                    </el-col>
                    <el-col class="button-container" :span="3">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            @click="setDeltaTime(10)"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-angle-right" />
                            </div>
                        </el-button>
                    </el-col>
                    <el-col class="button-container" :span="3">
                        <el-button
                            class="button"
                            type="primary"
                            circle
                            @click="setDeltaTime(30)"
                            :disabled="buttonDisabled"
                        >
                            <div class="icon-wrapper">
                                <font-awesome-icon class="icon" icon="fa-solid fa-angles-right" />
                            </div>
                        </el-button>
                    </el-col>
                </el-row>
                <el-row class="progress">
                    <el-col :span="16" class="progress-col">
                        <div class="progress-container">
                            <el-slider
                                v-model="time"
                                :min="0"
                                :max="currentLength"
                                :step="0.001"
                                :format-tooltip="formatTime"
                                :disabled="buttonDisabled"
                                @input="onInput"
                                @change="finishInput"
                            />
                        </div>
                    </el-col>
                    <el-col :span="8" class="progress-col-right">
                        <div class="time-text">
                            {{ `${formatTime(currentTime)}/${formatTime(currentLength)}` }}
                        </div>
                    </el-col>
                </el-row>
                <el-row class="misc">
                    <el-col :span="12" class="misc-col misc-col-left">
                        <div class="misc-title">{{ `音量:${formatVolume(currentVolume)}` }}</div>
                        <div class="misc-container">
                            <el-slider
                                v-model="tempVolume"
                                :min="0"
                                :max="100"
                                :format-tooltip="formatVolume"
                                :disabled="buttonDisabled"
                                @change="setVolume"
                            />
                        </div>
                    </el-col>
                    <el-col :span="12" class="misc-col">
                        <div class="misc-title">{{ `速度:${formatSpeed(currentSpeed)}` }}</div>
                        <div class="misc-container">
                            <el-slider
                                v-model="tempSpeed"
                                :min="0.5"
                                :max="2"
                                :step="0.1"
                                :format-tooltip="formatSpeed"
                                :disabled="buttonDisabled"
                                @change="setSpeed"
                            />
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useGlobalStore } from '@/stores/global';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    },
    data() {
        return {
            time: 0,
            tempTime: 0,
            timerId: 0,
            tempVolume: 100,
            tempSpeed: 1,
        };
    },
    computed: {
        globalStore() {
            return useGlobalStore();
        },
        ...mapState(useGlobalStore, {
            currentSong: 'currentSong',
            currentStatus: 'currentStatus',
            currentTime: 'currentTime',
            currentLength: 'currentLength',
            currentVolume: 'currentVolume',
            currentSpeed: 'currentSpeed',
            nocturne: 'nocturne',
        }),
        title() {
            return this.currentSong.id > 0 ? this.currentSong.name : '暂无歌曲';
        },
        titleStyle() {
            return {
                color: this.currentSong.id > 0 ? '#a0a0a0' : 'gray',
            };
        },
        buttonDisabled() {
            return this.currentStatus == 0;
        },
    },
    methods: {
        onInput(time: number) {
            this.tempTime = time;
        },
        async finishInput() {
            await this.nocturne.ccLib.setTime(this.tempTime);
            await this.syncAll();
        },
        formatTime(time: number | string) {
            const value = parseFloat(time.toString());
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor(value / 60);
            const seconds = Math.floor(value % 60);
            const template = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            return hours > 0 ? `${hours}:${template}` : template;
        },
        formatVolume(volume: number | string) {
            const value = parseFloat(volume.toString());
            return `${value.toFixed(0)}%`;
        },
        formatSpeed(speed: number | string) {
            const value = parseFloat(speed.toString());
            return `${value.toFixed(1)}x`;
        },
        async syncAll() {
            this.globalStore.currentStatus = await this.nocturne.ccLib.getPlayStatus();
            this.globalStore.currentLength = await this.nocturne.ccLib.getLength();
            this.globalStore.currentTime = await this.nocturne.ccLib.getTime();
            this.globalStore.currentVolume = await this.nocturne.ccLib.getVolume();
            this.globalStore.currentSpeed = await this.nocturne.ccLib.getSpeed();
            this.tempVolume = this.currentVolume;
            this.tempSpeed = this.currentSpeed;
        },
        async pause() {
            await this.nocturne.ccLib.pause();
            await this.syncAll();
        },
        async resume() {
            await this.nocturne.ccLib.resume();
            await this.syncAll();
        },
        async setDeltaTime(deltaTime: number) {
            if (
                (deltaTime > 0 && this.currentTime + deltaTime > this.currentLength) ||
                (deltaTime < 0 && this.currentTime + deltaTime < 0)
            ) {
                return;
            }
            const time = this.currentTime + deltaTime;
            await this.nocturne.ccLib.setTime(time);
            await this.syncAll();
        },
        async setVolume(volume: number) {
            await this.nocturne.ccLib.setVolume(volume);
            await this.syncAll();
        },
        async setSpeed(speed: number) {
            await this.nocturne.ccLib.setSpeed(speed);
            await this.syncAll();
        },
    },
    mounted() {
        this.timerId = window.setInterval(async () => {
            this.globalStore.currentTime = await this.nocturne.ccLib.getTime();
            if (this.currentTime > this.currentLength) {
                this.$emit('playNext');
            }
            this.time = this.currentTime;
        }, 100);
    },
    beforeUnmount() {
        window.clearInterval(this.timerId);
    },
    emits: ['playNext', 'playPrev'],
});
</script>

<style scoped lang="scss">
.big-frame {
    width: 100%;
    height: 100%;
}

.title {
    width: calc(100% - 20px);
    height: calc(50% - 21px);
    border-bottom: 1px solid #444444;
    padding: 10px;
    h1 {
        font-size: 24px;
        line-height: 30px;
        margin: 0;
    }

    .vertical-center {
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(100% - 30px);
        overflow: hidden;
    }
    .center {
        font-size: 18px;
        text-align: center;
    }
}

.control {
    width: calc(100% - 20px);
    height: calc(50% - 20px);
    background-color: #333333;
    padding: 10px;
}
.control-frame {
    width: 100%;
    height: 100%;
}

.buttons {
    height: 30%;
}

.button-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.first-button-container {
    justify-content: flex-start;
}

.icon-wrapper {
    width: 14px;
    height: 14px;
    padding-top: 2px;
    margin: 0 auto;
    text-align: center;
    line-height: 14px;
    .icon {
        width: 14px;
        height: 14px;
    }
}

.progress {
    height: 30%;
}

.progress-col {
    display: flex;
    justify-content: center;
    align-items: center;
}

.progress-col-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.progress-container {
    width: calc(100% - 30px);
    padding-left: 15px;
    padding-right: 15px;
}

.time-text {
    color: #a0a0a0;
    padding-right: 5px;
}

.misc {
    height: 40%;
    border: 1px solid #555555;
    border-radius: 4px;
}

.misc-col {
    height: 100%;
}

.misc-col-left {
    border-right: 1px solid #555555;
}

.misc-title {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    text-align: center;
    color: #a0a0a0;
}

.misc-container {
    height: calc(100% - 50px);
    width: calc(100% - 40px);
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    align-items: center;
}
</style>
