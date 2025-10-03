use std::{env, vec};

use tauri::{command, AppHandle};
use tauri::menu::{AboutMetadataBuilder, MenuBuilder, PredefinedMenuItem, SubmenuBuilder, Menu};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // TODO: Make this work for snaps: https://v2.tauri.app/plugin/single-instance/#snap
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {}))
        .invoke_handler(tauri::generate_handler![my_custom_command])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            build_menu(app);
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn my_custom_command() {
    println!("I was invoked from JavaScript!");
}

#[command]
async fn restart_app(app_handle: AppHandle) -> Result<(), String> {
    app_handle.restart();
    Ok(())
}

fn build_menu(app: &tauri::App) {
    let about_submenu = SubmenuBuilder::new(app, "About")
        .about(AboutMetadataBuilder::new()
            .version(env!("CARGO_PKG_VERSION").into())
            .authors(vec![app.package_info().authors.to_string()].into())
            .website("https://altair.sirmuel.design".to_string().into())
            .license("MIT".to_string().into())
            .build().into())
        .services()
        .hide()
        .build().expect("Failed to build about submenu");
    let edit_submenu = SubmenuBuilder::new(app, "Edit")
        .copy()
        .separator()
        .undo()
        .redo()
        .cut()
        .paste()
        .select_all()
        .item(&PredefinedMenuItem::copy(app, Some("Custom Copy")).unwrap())
        .build().expect("Failed to build edit submenu");

    let menu = MenuBuilder::new(app)
        .items(&[&about_submenu, &edit_submenu])
        .build().expect("Failed to build menu");

    app.set_menu(menu);
}