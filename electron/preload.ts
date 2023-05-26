import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nocturne', {
    getNocturneValue: (key: string) => ipcRenderer.invoke('getNocturneValue', key),
    invokeNocturneFunction: (key: string, ...args: any[]) => ipcRenderer.invoke('invokeNocturneFunction', key, ...args),
    buildKeys: () => ipcRenderer.invoke('buildKeys'),
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
