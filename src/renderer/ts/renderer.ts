import type { AppConfig } from '../../shared/types';
import { initMonitorView, updateMonitorConfig } from './monitor-view.js';
import { initSettingsView } from './settings-view.js';

async function bootstrap(): Promise<void> {
  const config: AppConfig = await window.concentratorAPI.loadConfig();

  initMonitorView(config);
  initSettingsView(config, (newConfig) => {
    updateMonitorConfig(newConfig);
  });

  setupNavigation();
}

function setupNavigation(): void {
  const navItems = document.querySelectorAll<HTMLButtonElement>('.nav-item');
  const views = document.querySelectorAll<HTMLElement>('.view');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.view;
      navItems.forEach((n) => n.classList.remove('active'));
      views.forEach((v) => v.classList.remove('active'));
      item.classList.add('active');
      const view = document.getElementById(`view-${target}`);
      if (view) view.classList.add('active');
    });
  });
}

bootstrap();
