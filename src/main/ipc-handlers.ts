import { ipcMain } from 'electron';
import { runNetstatQuery } from './netstat';
import { loadConfig, saveConfig } from './config-store';
import type { RunQueryPayload, SaveConfigPayload } from '../shared/types';

export function registerIpcHandlers(): void {
  ipcMain.handle('netstat:query', async (_event, payload: RunQueryPayload) => {
    return runNetstatQuery(payload.port);
  });

  ipcMain.handle('config:load', async () => {
    return loadConfig();
  });

  ipcMain.handle('config:save', async (_event, payload: SaveConfigPayload) => {
    saveConfig(payload.config);
  });
}
