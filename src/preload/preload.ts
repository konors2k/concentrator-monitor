import { contextBridge, ipcRenderer } from 'electron';
import type { AppConfig, NetstatResult } from '../shared/types';

contextBridge.exposeInMainWorld('concentratorAPI', {
  queryNetstat: (port: number): Promise<NetstatResult> =>
    ipcRenderer.invoke('netstat:query', { port }),

  loadConfig: (): Promise<AppConfig> =>
    ipcRenderer.invoke('config:load'),

  saveConfig: (config: AppConfig): Promise<void> =>
    ipcRenderer.invoke('config:save', { config }),
});
