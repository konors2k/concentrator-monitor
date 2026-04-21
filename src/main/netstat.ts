import { exec, ExecException } from 'child_process';
import type { NetstatResult } from '../shared/types';

export function runNetstatQuery(port: number): Promise<NetstatResult> {
  return new Promise((resolve) => {
    const safePort = Math.floor(Number(port));
    if (!Number.isFinite(safePort) || safePort < 1 || safePort > 65535) {
      resolve({ count: 0, error: `Invalid port: ${port}`, timestamp: Date.now() });
      return;
    }

    const cmd = `netstat -na | findstr ":${safePort}" | findstr "ESTABLISHED" | find /c "ESTABLISHED"`;
    exec(cmd, { shell: 'cmd.exe', timeout: 8000 }, (err: ExecException | null, stdout: string, stderr: string) => {
      const timestamp = Date.now();
      const raw = stdout.trim();
      const count = parseInt(raw, 10);

      // find /c exits with code 1 when count is 0, but stdout is still "0"
      if (!isNaN(count)) {
        resolve({ count, error: null, timestamp });
        return;
      }

      resolve({
        count: 0,
        error: err?.message ?? stderr ?? 'Unknown error',
        timestamp,
      });
    });
  });
}
