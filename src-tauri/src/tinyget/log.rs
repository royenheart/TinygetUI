/// Call tinyget and capture its output to GUI's log
/// The template is from https://github.com/marc2332/tauri-terminal
use portable_pty::{CommandBuilder, PtyPair, PtySize};
use serde::Serialize;
use std::{
    io::{BufRead, BufReader, Read, Write},
    process::exit,
    sync::Arc,
    time::Duration,
};

use log::warn;

use tauri::{async_runtime::Mutex as AsyncMutex, Manager, State};

use crate::tinyget_grpc::tinyget_grpc_client::TinygetGrpcClient;

pub struct TinygetTerminalState {
    pub pty_pair: Arc<AsyncMutex<PtyPair>>,
    pub writer: Arc<AsyncMutex<Box<dyn Write + Send>>>,
    pub reader: Arc<AsyncMutex<BufReader<Box<dyn Read + Send>>>>,
}

#[derive(Clone, Serialize)]
struct TinygetServerAlive {
    alive: bool,
    retcode: i16,
}

pub async fn listen_server_alive(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<TinygetTerminalState>();
    let current_user = whoami::username();
    let cmd = match current_user.as_str() {
        "root" => {
            warn!("It's not recommended to run tinyget as root!");
            let mut m = CommandBuilder::new("tinyget");
            m.args(["server"]);
            m
        }
        _ => {
            let mut m = CommandBuilder::new("pkexec");
            m.args(["tinyget", "server"]);
            m
        }
    };

    let mut child = state
        .pty_pair
        .lock()
        .await
        .slave
        .spawn_command(cmd.clone())
        .map_err(|err| err.to_string())?;

    loop {
        tokio::time::sleep(Duration::from_secs(3)).await;
        let status = child.try_wait();
        let connected =
            TinygetGrpcClient::connect("http://[::]:5051").await.is_ok();
        match status {
            Err(_) => {
                break;
            }
            Ok(Some(status)) => {
                let _ = app.get_window("main").and_then(|w| {
                    w.emit(
                        "tinygetServerStatus",
                        TinygetServerAlive {
                            alive: false,
                            retcode: status.exit_code() as i16,
                        },
                    )
                    .ok()
                });
            }
            Ok(None) => {
                match connected {
                    false => {
                        let _ = app.get_window("main").and_then(|w| {
                            w.emit(
                                "tinygetServerStatus",
                                TinygetServerAlive {
                                    alive: false,
                                    retcode: -99,
                                },
                            )
                            .ok()
                        });
                    }
                    true => {
                        let _ = app.get_window("main").and_then(|w| {
                            w.emit(
                                "tinygetServerStatus",
                                TinygetServerAlive {
                                    alive: true,
                                    retcode: 0,
                                },
                            )
                            .ok()
                        });
                    }
                }
                continue;
            }
        }
        child = state
            .pty_pair
            .lock()
            .await
            .slave
            .spawn_command(cmd.clone())
            .map_err(|err| err.to_string())?;
    }
    exit(1);
}

// write user input
#[tauri::command]
pub async fn async_write_to_pty(
    data: &str,
    state: State<'_, TinygetTerminalState>,
) -> Result<(), ()> {
    write!(state.writer.lock().await, "{}", data).map_err(|_| ())
}

// async terminal's output
#[tauri::command]
pub async fn async_read_from_pty(
    state: State<'_, TinygetTerminalState>,
) -> Result<Option<String>, ()> {
    let mut reader = state.reader.lock().await;
    let data = {
        // Read all available text
        let data = reader.fill_buf().map_err(|_| ())?;

        // Send te data to the webview if necessary
        if !data.is_empty() {
            std::str::from_utf8(data)
                .map(|v| Some(v.to_string()))
                .map_err(|_| ())?
        } else {
            None
        }
    };

    if let Some(data) = &data {
        reader.consume(data.len());
    }

    Ok(data)
}

// sync pty to frontend's szie for correct output
#[tauri::command]
pub async fn async_resize_pty(
    rows: u16,
    cols: u16,
    state: State<'_, TinygetTerminalState>,
) -> Result<(), ()> {
    state
        .pty_pair
        .lock()
        .await
        .master
        .resize(PtySize {
            rows,
            cols,
            ..Default::default()
        })
        .map_err(|_| ())
}
