/// Define system tray functions
use serde::Serialize;
use tauri::{
    self, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
};

#[derive(Clone, Serialize)]
pub struct SystemTrayPayload {
    message: String,
}

impl SystemTrayPayload {
    pub fn new(message: &str) -> SystemTrayPayload {
        SystemTrayPayload {
            message: message.into(),
        }
    }
}

pub enum TrayState {
    NotPlaying,
    Paused,
    Playing,
}

pub fn create_tray_menu(lang: String) -> SystemTrayMenu {
    // TODO: tray internationalization https://docs.rs/rust-i18n/latest/rust_i18n/

    SystemTrayMenu::new()
        .add_item(CustomMenuItem::new(
            "toggle-visibility".to_string(),
            "Toggle Visible",
        ))
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
}

pub fn create_system_tray() -> SystemTray {
    SystemTray::new()
        .with_menu(create_tray_menu("en".into()))
        .with_id("main-tray")
}

#[tauri::command]
#[allow(unused_must_use)]
pub fn tray_update_lang(app: tauri::AppHandle, lang: String) {
    let tray_handle = app.tray_handle();
    tray_handle.set_menu(create_tray_menu(lang));
}

pub fn tray_event_handler(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let main_window = app.get_window("main").unwrap();
            main_window
                .emit("systemTray", SystemTrayPayload::new(&id))
                .unwrap();
            match id.as_str() {
                "quit" => {
                    // Quit tinyget
                    std::process::exit(0);
                }
                "toggle-visibility" => {
                    // Show / Hide window
                    if main_window.is_visible().unwrap() {
                        main_window.hide().unwrap();
                    } else {
                        main_window.show().unwrap();
                    }
                }
                _ => {}
            }
        }
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let main_window = app.get_window("main").unwrap();
            main_window
                .emit("system-tray", SystemTrayPayload::new("left-click"))
                .unwrap();
            println!("system tray received a left click");
        }
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a right click");
        }
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click");
        }
        _ => {}
    }
}
