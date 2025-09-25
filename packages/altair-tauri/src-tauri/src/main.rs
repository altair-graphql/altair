// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, AppHandle, Manager, State, Window, WindowEvent};
use tauri_plugin_store::{with_store, StoreCollection};
use uuid::Uuid;

// Application state
#[derive(Default)]
struct AppState {
    request_headers: std::sync::Mutex<HashMap<String, String>>,
}

// Data structures for IPC
#[derive(Debug, Clone, Serialize, Deserialize)]
struct HeaderState {
    headers: Vec<HeaderItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct HeaderItem {
    key: String,
    value: String,
    enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SettingsState {
    // This would contain the full settings structure
    // For now, we'll keep it flexible
    #[serde(flatten)]
    settings: serde_json::Map<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct WindowInfo {
    window_id: String,
    title: String,
    url: Option<String>,
    collection_id: Option<String>,
    window_id_in_collection: Option<String>,
    fixed_title: Option<bool>,
}

// Tauri commands
#[command]
async fn create_new_window(app_handle: AppHandle) -> Result<String, String> {
    let window_id = Uuid::new_v4().to_string();
    let window_label = format!("altair-{}", window_id);
    
    match tauri::WindowBuilder::new(
        &app_handle,
        &window_label,
        tauri::WindowUrl::App("index.html".into()),
    )
    .title("Altair GraphQL Client")
    .inner_size(1200.0, 800.0)
    .resizable(true)
    .build()
    {
        Ok(_) => Ok(window_id),
        Err(e) => Err(format!("Failed to create window: {}", e)),
    }
}

#[command]
async fn close_current_window(window: Window) -> Result<(), String> {
    match window.close() {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to close window: {}", e)),
    }
}

#[command]
async fn set_headers(
    state: State<'_, AppState>,
    headers: HeaderState,
) -> Result<(), String> {
    let mut request_headers = state.request_headers.lock().unwrap();
    request_headers.clear();
    
    for header in headers.headers {
        if header.enabled {
            request_headers.insert(header.key, header.value);
        }
    }
    
    Ok(())
}

#[command]
async fn get_auth_token() -> Result<Option<String>, String> {
    // This would integrate with the auth server like the Electron version
    // For now, return None
    Ok(None)
}

#[command]
async fn get_autobackup_data(
    app_handle: AppHandle,
    stores: State<'_, StoreCollection<tauri::Wry>>,
) -> Result<Option<String>, String> {
    let path = std::path::PathBuf::from("autobackup.json");
    
    with_store(app_handle.clone(), stores.clone(), path, |store| {
        store.get("backup_data")
            .map(|value| value.as_str().map(|s| s.to_string()))
            .unwrap_or(None)
    })
    .map_err(|e| format!("Failed to get backup data: {}", e))
}

#[command]
async fn save_autobackup_data(
    app_handle: AppHandle,
    stores: State<'_, StoreCollection<tauri::Wry>>,
    data: String,
) -> Result<(), String> {
    let path = std::path::PathBuf::from("autobackup.json");
    
    with_store(app_handle.clone(), stores.clone(), path, |store| {
        store.insert("backup_data".to_string(), serde_json::Value::String(data))
    })
    .map_err(|e| format!("Failed to save backup data: {}", e))?;
    
    Ok(())
}

#[command]
async fn get_altair_app_settings_from_file(
    app_handle: AppHandle,
    stores: State<'_, StoreCollection<tauri::Wry>>,
) -> Result<Option<SettingsState>, String> {
    let path = std::path::PathBuf::from("settings.json");
    
    with_store(app_handle.clone(), stores.clone(), path, |store| {
        store.get("app_settings").and_then(|value| {
            serde_json::from_value(value.clone()).ok()
        })
    })
    .map_err(|e| format!("Failed to get settings: {}", e))
}

#[command]
async fn update_altair_app_settings_on_file(
    app_handle: AppHandle,
    stores: State<'_, StoreCollection<tauri::Wry>>,
    settings: SettingsState,
) -> Result<(), String> {
    let path = std::path::PathBuf::from("settings.json");
    
    let settings_value = serde_json::to_value(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    with_store(app_handle.clone(), stores.clone(), path, |store| {
        store.insert("app_settings".to_string(), settings_value)
    })
    .map_err(|e| format!("Failed to save settings: {}", e))?;
    
    Ok(())
}

#[command]
async fn import_file() -> Result<Option<String>, String> {
    use tauri_plugin_dialog::{DialogExt, FileDialogBuilder};
    
    tauri::async_runtime::spawn(async {
        let file_path = FileDialogBuilder::new()
            .add_filter("JSON", &["json"])
            .add_filter("GraphQL", &["graphql", "gql"])
            .pick_file()
            .await;
            
        match file_path {
            Some(path) => {
                match std::fs::read_to_string(&path) {
                    Ok(contents) => Ok(Some(contents)),
                    Err(e) => Err(format!("Failed to read file: {}", e)),
                }
            }
            None => Ok(None),
        }
    }).await.map_err(|e| format!("Task join error: {}", e))?
}

#[command]
async fn export_file(data: String, filename: Option<String>) -> Result<(), String> {
    use tauri_plugin_dialog::{DialogExt, FileDialogBuilder};
    
    let default_name = filename.unwrap_or_else(|| "export.json".to_string());
    
    tauri::async_runtime::spawn(async move {
        let file_path = FileDialogBuilder::new()
            .set_file_name(&default_name)
            .save_file()
            .await;
            
        match file_path {
            Some(path) => {
                match std::fs::write(&path, data) {
                    Ok(_) => Ok(()),
                    Err(e) => Err(format!("Failed to write file: {}", e)),
                }
            }
            None => Ok(()), // User cancelled
        }
    }).await.map_err(|e| format!("Task join error: {}", e))?
}

#[command]
async fn restart_app(app_handle: AppHandle) -> Result<(), String> {
    app_handle.restart();
    Ok(())
}

#[command]
async fn perform_app_update() -> Result<(), String> {
    // This would trigger the updater
    // For now, just return success
    Ok(())
}

#[command]
async fn show_notification(title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;
    
    tauri::async_runtime::spawn(async move {
        let _ = tauri_plugin_notification::Notification::new("altair")
            .title(title)
            .body(body)
            .show();
    });
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            create_new_window,
            close_current_window,
            set_headers,
            get_auth_token,
            get_autobackup_data,
            save_autobackup_data,
            get_altair_app_settings_from_file,
            update_altair_app_settings_on_file,
            import_file,
            export_file,
            restart_app,
            perform_app_update,
            show_notification
        ])
        .setup(|app| {
            // Set up custom protocol handler for altair:// URLs
            app.handle().plugin(
                tauri_plugin_shell::Builder::default()
                    .build()
            ).expect("Failed to setup shell plugin");
            
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                WindowEvent::CloseRequested { .. } => {
                    // Handle window close
                    let app_handle = window.app_handle();
                    let windows = app_handle.webview_windows();
                    
                    // If this is the last window, quit the app
                    if windows.len() <= 1 {
                        app_handle.exit(0);
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}