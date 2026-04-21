import type { AppConfig, NetstatResult } from '../../shared/types';

declare global {
  interface Window {
    concentratorAPI: {
      queryNetstat(port: number): Promise<NetstatResult>;
      loadConfig(): Promise<AppConfig>;
      saveConfig(config: AppConfig): Promise<void>;
    };
  }
}

export {};
