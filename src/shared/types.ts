export interface AppConfig {
  port: number;
  intervalSeconds: number;
}

export interface NetstatResult {
  count: number;
  error: string | null;
  timestamp: number;
}

export interface RunQueryPayload {
  port: number;
}

export interface SaveConfigPayload {
  config: AppConfig;
}
