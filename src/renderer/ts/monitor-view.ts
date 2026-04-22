import type { AppConfig, NetstatResult } from '../../shared/types';

let isRunning = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let currentConfig: AppConfig = { port: 7799, intervalSeconds: 5 };

const countDisplay = document.getElementById('count-display') as HTMLElement;
const statusLine = document.getElementById('status-line') as HTMLElement;
const lastUpdated = document.getElementById('last-updated') as HTMLElement;
const btnToggle = document.getElementById('btn-toggle') as HTMLButtonElement;
const portBadge = document.getElementById('port-badge') as HTMLElement;
const detailPort = document.getElementById('detail-port') as HTMLElement;
const detailInterval = document.getElementById('detail-interval') as HTMLElement;

export function initMonitorView(config: AppConfig): void {
  currentConfig = config;
  updatePortBadge();
  btnToggle.addEventListener('click', toggleMonitoring);
}

export function updateMonitorConfig(config: AppConfig): void {
  currentConfig = config;
  updatePortBadge();
  if (isRunning) {
    stopMonitoring();
    startMonitoring();
  }
}

function toggleMonitoring(): void {
  if (isRunning) {
    stopMonitoring();
  } else {
    startMonitoring();
  }
}

function startMonitoring(): void {
  isRunning = true;
  btnToggle.textContent = 'Stop Monitoring';
  btnToggle.classList.add('btn-danger');
  statusLine.textContent = 'Monitoring...';
  statusLine.className = 'status-line status-running';

  runQuery();
  intervalHandle = setInterval(runQuery, currentConfig.intervalSeconds * 1000);
}

function stopMonitoring(): void {
  isRunning = false;
  if (intervalHandle !== null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  btnToggle.textContent = 'Start Monitoring';
  btnToggle.classList.remove('btn-danger');
  statusLine.textContent = 'Idle';
  statusLine.className = 'status-line';
}

async function runQuery(): Promise<void> {
  const result: NetstatResult = await window.concentratorAPI.queryNetstat(currentConfig.port);
  animateCount(result);
}

function animateCount(result: NetstatResult): void {
  countDisplay.style.opacity = '0';
  setTimeout(() => {
    if (result.error) {
      countDisplay.textContent = 'ERR';
      countDisplay.classList.add('count-error');
      statusLine.textContent = `Error: ${result.error}`;
      statusLine.className = 'status-line status-error';
    } else {
      countDisplay.textContent = String(result.count);
      countDisplay.classList.remove('count-error');
      if (isRunning) {
        statusLine.textContent = 'Monitoring...';
        statusLine.className = 'status-line status-running';
      }
    }
    lastUpdated.textContent = `Last updated: ${new Date(result.timestamp).toLocaleTimeString()}`;
    countDisplay.style.opacity = '1';
  }, 150);
}

function updatePortBadge(): void {
  if (portBadge) portBadge.textContent = `:${currentConfig.port}`;
  if (detailPort) detailPort.textContent = String(currentConfig.port);
  if (detailInterval) detailInterval.textContent = `${currentConfig.intervalSeconds}s`;
}
