use serde::Serialize;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

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

    let cmd_str = format!(
        "netstat -na | findstr \":{port}\" | findstr \"ESTABLISHED\" | find /c \"ESTABLISHED\""
    );

    let result = Command::new("cmd")
        .args(["/C", &cmd_str])
        .output();

    match result {
        Err(e) => NetstatResult {
            count: 0,
            error: Some(e.to_string()),
            timestamp,
        },
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let raw = stdout.trim();
            match raw.parse::<i32>() {
                Ok(count) => NetstatResult { count, error: None, timestamp },
                Err(_) => {
                    // find /c exits with code 1 when count is 0, stdout is still "0"
                    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                    NetstatResult {
                        count: 0,
                        error: if stderr.is_empty() { None } else { Some(stderr) },
                        timestamp,
                    }
                }
            }
        }
    }
}
