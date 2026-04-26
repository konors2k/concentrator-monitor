#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod netstat;

use config::{load_config, save_config, AppConfig};
use netstat::{query_netstat, NetstatResult};

#[tauri::command]
async fn cmd_query_netstat(port: u16) -> NetstatResult {
    query_netstat(port).await
}

#[tauri::command]
fn cmd_load_config(app: tauri::AppHandle) -> AppConfig {
    load_config(&app)
}

#[tauri::command]
fn cmd_save_config(app: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    save_config(&app, &config)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd_query_netstat,
            cmd_load_config,
            cmd_save_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
