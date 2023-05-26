import type { AsyncNocturne } from '@nocturne/fake-backend';
import { isProxy, toRaw } from 'vue';

interface VueNocturne {
    init(): Promise<void>;
    get nocturne(): AsyncNocturne;
    getNocturneValue(key: string): any;
    invokeNocturneFunction(key: string, ...args: any[]): any;
}

export class RawNocturneVueWrapper implements VueNocturne {
    private builtNocturne: any = {};
    constructor(private nocturneElectronWrapper: any) {}
    getNocturneValue(key: string) {
        return this.nocturneElectronWrapper.getNocturneValue(key);
    }

    invokeNocturneFunction(key: string, ...args: any[]) {
        args = args.map((arg) => (isProxy(arg) ? toRaw(arg) : arg));
        return this.nocturneElectronWrapper.invokeNocturneFunction(key, ...args);
    }

    async init() {
        const keysStr: string = await this.nocturneElectronWrapper.buildKeys();
        console.log(keysStr);
        const keys: Record<string, 'function' | 'value'> = JSON.parse(keysStr);
        for (const key in keys) {
            const separatedKey = key.split('.');
            const lastKey = separatedKey.pop()!;
            let value = this.builtNocturne;
            for (const part of separatedKey) {
                if (!value[part]) {
                    value[part] = {};
                }
                value = value[part];
            }
            if (keys[key] == 'function') {
                value[lastKey] = (...args: any[]) => this.invokeNocturneFunction(key, ...args);
            } else {
                value[lastKey] = () => this.getNocturneValue(key);
            }
        }
        return;
    }

    get nocturne() {
        return this.builtNocturne;
    }
}

interface HasNocturne {
    nocturne: VueNocturne;
    initialized: true;
}

interface NotNocturne {
    nocturne: null;
    initialized: false;
}

export type NocturneVueWrapper = HasNocturne | NotNocturne;
