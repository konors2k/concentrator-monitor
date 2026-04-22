import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type { AppConfig } from '../shared/types';

const DEFAULT_CONFIG: AppConfig = {
  port: 7799,
  intervalSeconds: 5,
};

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'config.json');
}

export function loadConfig(): AppConfig {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      port: isValidPort(parsed.port) ? parsed.port! : DEFAULT_CONFIG.port,
      intervalSeconds: isValidInterval(parsed.intervalSeconds)
        ? parsed.intervalSeconds!
        : DEFAULT_CONFIG.intervalSeconds,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: AppConfig): void {
  if (!isValidPort(config.port)) throw new Error(`Invalid port: ${config.port}`);
  if (!isValidInterval(config.intervalSeconds))
    throw new Error(`Invalid interval: ${config.intervalSeconds}`);

  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}

function isValidPort(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 65535;
}

function isValidInterval(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 3600;
}
