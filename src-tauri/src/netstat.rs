use serde::Serialize;
use std::os::windows::process::CommandExt;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize)]
pub struct NetstatResult {
    pub count: i32,
    pub error: Option<String>,
    pub timestamp: u64,
}

pub async fn query_netstat(port: u16) -> NetstatResult {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    let result = Command::new("netstat")
        .args(["-na"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    match result {
        Err(e) => NetstatResult {
            count: 0,
            error: Some(e.to_string()),
            timestamp,
        },
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let port_str = format!(":{port}");
            let count = stdout
                .lines()
                .filter(|line| line.contains(&port_str) && line.contains("ESTABLISHED"))
                .count() as i32;
            NetstatResult { count, error: None, timestamp }
        }
    }
}
