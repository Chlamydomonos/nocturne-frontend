const { Nocturne } = require('@nocturne/backend');
import type { Nocturne as TypeNocturne } from '@nocturne/backend';

export interface ElectronNocturne {
    buildKeys(): string;
}

export default class NocturneElectronWrapper implements ElectronNocturne {
    private nocturne = new Nocturne() as TypeNocturne;
    private static OBJ_FIELDS = new Set<string>(Object.getOwnPropertyNames(Object.prototype));

    getNocturneValue(key: string) {
        const separatedKey = key.split('.');
        let value: any = this.nocturne;
        for (const k of separatedKey) {
            value = value[k];
        }
        return value;
    }

    invokeNocturneFunction(key: string, ...args: any[]) {
        const separatedKey = key.split('.');
        const last = separatedKey.pop()!;
        let value: any = this.nocturne;
        for (const k of separatedKey) {
            value = value[k];
        }
        return value[last](...args);
    }

    private findKey(key: string) {
        const separatedKey = key.split('.');
        let value: any = this.nocturne;
        for (const k of separatedKey) {
            value = value[k];
            if (!value) {
                throw new Error(`Key ${key} not found`);
            }
        }
        return value;
    }

    private listKeys(obj: any) {
        const prototype = Object.getPrototypeOf(obj);
        const result = Object.getOwnPropertyNames(obj);
        if (prototype) {
            const result2 = Object.getOwnPropertyNames(prototype);
            for (const key of result2) {
                if (!NocturneElectronWrapper.OBJ_FIELDS.has(key)) {
                    result.push(key);
                }
            }
        }
        return result;
    }

    buildKeys() {
        console.log('Build Keys');
        const queue: string[] = [];
        for (const key of this.listKeys(this.nocturne)) {
            if (typeof key == 'string' && this.nocturne[key]) {
                queue.push(key);
            }
        }

        const keys: Record<string, 'function' | 'value'> = {};
        while (queue.length > 0) {
            const key = queue.shift()!;
            console.log('Key:', key);
            const value = this.findKey(key);
            if (!value) {
                continue;
            }
            console.log('keys:', this.listKeys(value));
            if (this.nocturne.isIgnored(key)) {
                console.log('Ignored:', key);
                continue;
            }
            if (typeof value == 'object') {
                for (const k of this.listKeys(value)) {
                    if (typeof k == 'string') {
                        queue.push(`${key}.${k}`);
                    }
                }
            } else {
                if (typeof value == 'function') {
                    keys[key] = 'function';
                } else {
                    keys[key] = 'value';
                }
            }
        }
        console.log('Keys:', JSON.stringify(keys));
        return JSON.stringify(keys);
    }
}
