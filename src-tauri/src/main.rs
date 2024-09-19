// Hides the console for Windows release builds
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use portable_pty::{native_pty_system, PtySize};
use serde::Serialize;
use std::sync::Mutex;
use std::{io::BufReader, sync::Arc};
use tauri::{
    self,
    Manager,
    // state is used in Linux
    State,
};
use tinyget_ui::sys_tray::{
    create_system_tray, tray_event_handler, tray_update_lang, TrayState,
    __cmd__tray_update_lang,
};
use tinyget_ui::tinyget::get::{__cmd__list, list};
use tinyget_ui::tinyget::history::{__cmd__histories, histories};
use tinyget_ui::tinyget::install::{__cmd__install, install};
use tinyget_ui::tinyget::log::{
    __cmd__async_read_from_pty, __cmd__async_resize_pty,
    __cmd__async_write_to_pty, async_read_from_pty, async_resize_pty,
    async_write_to_pty, listen_server_alive, TinygetTerminalState,
};
use tinyget_ui::tinyget::uninstall::{__cmd__uninstall, uninstall};
use tinyget_ui::tinyget::update::{__cmd__update, update};
use tinyget_ui::utils::DbusState;
use window_shadows::set_shadow;

use tauri::async_runtime::Mutex as AsyncMutex;

#[derive(Clone, Serialize)]
struct SingleInstancePayload {
    args: Vec<String>,
    cwd: String,
}

#[cfg(target_os = "linux")]
fn webkit_hidpi_workaround() {
    // See: https://github.com/spacedriveapp/spacedrive/issues/1512#issuecomment-1758550164
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
}

fn main_prelude() {
    #[cfg(target_os = "linux")]
    webkit_hidpi_workaround();
}

fn main() {
    // Create pty
    let pty_system = native_pty_system();
    let pty_pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .unwrap();
    let reader = pty_pair.master.try_clone_reader().unwrap();
    let writer = pty_pair.master.take_writer().unwrap();
    main_prelude();
    // main window should be invisible to allow either the setup delay or the plugin to show the window
    tauri::Builder::default()
        .system_tray(create_system_tray())
        .on_system_tray_event(tray_event_handler)
        .manage(TinygetTerminalState {
            pty_pair: Arc::new(AsyncMutex::new(pty_pair)),
            writer: Arc::new(AsyncMutex::new(writer)),
            reader: Arc::new(AsyncMutex::new(BufReader::new(reader))),
        })
        // custom commands
        .invoke_handler(tauri::generate_handler![
            list,
            tray_update_lang,
            async_write_to_pty,
            async_resize_pty,
            async_read_from_pty,
            histories,
            update,
            install,
            uninstall
        ])
        // allow only one instance and propagate args and cwd to existing instance
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            app.emit_all("newInstance", SingleInstancePayload { args, cwd })
                .unwrap();
        }))
        // persistent storage with filesystem
        .plugin(tauri_plugin_store::Builder::default().build())
        // save window position and size between sessions
        // if you remove this, make sure to uncomment the show_main_window code in this file and TauriProvider.jsx
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // custom setup code
        .setup(|app| {
            app.manage(Mutex::new(TrayState::NotPlaying));
            if let Some(window) = app.get_window("main") {
                set_shadow(&window, true).ok();
            }

            #[cfg(target_os = "linux")]
            app.manage(DbusState(Mutex::new(
                dbus::blocking::SyncConnection::new_session().ok(),
            )));

            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                listen_server_alive(&app_handle).await
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
