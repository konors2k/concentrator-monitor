use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub port: u16,
    #[serde(rename = "intervalSeconds")]
    pub interval_seconds: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig { port: 7799, interval_seconds: 5 }
    }
}

fn config_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    app.path().app_config_dir()
        .expect("no config dir")
        .join("config.json")
}

pub fn load_config(app: &tauri::AppHandle) -> AppConfig {
    let path = config_path(app);
    fs::read_to_string(&path)
        .ok()
        .and_then(|raw| serde_json::from_str::<AppConfig>(&raw).ok())
        .map(|c| {
            let port = if c.port >= 1 { c.port } else { AppConfig::default().port };
            let interval_seconds = if c.interval_seconds >= 1 && c.interval_seconds <= 3600 {
                c.interval_seconds
            } else {
                AppConfig::default().interval_seconds
            };
            AppConfig { port, interval_seconds }
        })
        .unwrap_or_default()
}

pub fn save_config(app: &tauri::AppHandle, config: &AppConfig) -> Result<(), String> {
    if config.port < 1 {
        return Err(format!("Invalid port: {}", config.port));
    }
    if config.interval_seconds < 1 || config.interval_seconds > 3600 {
        return Err(format!("Invalid interval: {}", config.interval_seconds));
    }
    let path = config_path(app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}
