import { invoke } from '@tauri-apps/api/core';
import type { AppConfig } from '../../shared/types';

type OnSaveCallback = (config: AppConfig) => void;

const inputPort = document.getElementById('input-port') as HTMLInputElement;
const inputInterval = document.getElementById('input-interval') as HTMLInputElement;
const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
const saveStatus = document.getElementById('save-status') as HTMLElement;

export function initSettingsView(config: AppConfig, onSave: OnSaveCallback): void {
  inputPort.value = String(config.port);
  inputInterval.value = String(config.intervalSeconds);

  btnSave.addEventListener('click', async () => {
    const port = parseInt(inputPort.value, 10);
    const intervalSeconds = parseInt(inputInterval.value, 10);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      showStatus('Invalid port (1–65535)', 'error');
      return;
    }
    if (!Number.isInteger(intervalSeconds) || intervalSeconds < 1 || intervalSeconds > 3600) {
      showStatus('Invalid interval (1–3600)', 'error');
      return;
    }

    const newConfig: AppConfig = { port, intervalSeconds };
    try {
      await invoke('cmd_save_config', { config: newConfig });
      showStatus('Settings saved', 'success');
      onSave(newConfig);
    } catch (err) {
      showStatus(`Save failed: ${err}`, 'error');
    }
  });
}

export function updateSettingsView(config: AppConfig): void {
  inputPort.value = String(config.port);
  inputInterval.value = String(config.intervalSeconds);
}

let statusTimer: ReturnType<typeof setTimeout> | null = null;

function showStatus(msg: string, type: 'success' | 'error'): void {
  saveStatus.textContent = msg;
  saveStatus.className = `save-status save-status-${type}`;
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    saveStatus.textContent = '';
    saveStatus.className = 'save-status';
  }, 3000);
}
