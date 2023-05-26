import { RawNocturneVueWrapper, type NocturneVueWrapper } from '@/nocturne/NocturneVueWrapper';
import type { AsyncNocturne, models, PlayStatus } from '@nocturne/fake-backend';
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
    state() {
        return {
            leftComponentId: 0,
            rightComponentId: 0,
            nocturneWrapper: { nocturne: null, initialized: false } as NocturneVueWrapper,
            playLists: [] as models.PlayList[],
            currentPlayList: { id: -1, name: 'error' } as models.PlayList,
            songs: [] as models.Song[],
            currentSong: { id: -1, name: 'error', path: 'error' } as models.Song,
            currentSongIndex: 0,
            currentStatus: 0 as PlayStatus,
            currentTime: 0,
            currentLength: 0,
            currentVolume: 100,
            currentSpeed: 1,
        };
    },
    getters: {
        nocturne(): AsyncNocturne {
            if (this.nocturneWrapper.initialized) {
                return this.nocturneWrapper.nocturne.nocturne;
            }
            throw new Error('Nocturne is not initialized');
        },
    },
    actions: {
        async initNocturne() {
            if (this.nocturneWrapper.initialized) {
                return;
            }

            try {
                this.nocturneWrapper = {
                    nocturne: new RawNocturneVueWrapper((window as any).nocturne),
                    initialized: true,
                };
                await this.nocturneWrapper.nocturne.init();
                await this.nocturneWrapper.nocturne.nocturne.init();
                return;
            } catch (err) {
                this.nocturneWrapper = { nocturne: null, initialized: false };
            }
        },
        async getPlayLists() {
            this.playLists = await this.nocturne.playListManager.getPlayLists();
        },
    },
});
