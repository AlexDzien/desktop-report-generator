mod commands;
mod db;
mod pdf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                db::init(&handle).await.expect("Failed to initialize database");
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::client_commands::create_client,
            commands::client_commands::get_clients,
            commands::client_commands::get_client,
            commands::client_commands::update_client,
            commands::client_commands::delete_client,
            commands::report_commands::create_report,
            commands::report_commands::get_reports,
            commands::report_commands::get_report,
            commands::report_commands::update_report,
            commands::report_commands::delete_report,
            commands::report_commands::get_reports_by_client,
            commands::settings_commands::get_settings,
            commands::settings_commands::update_settings,
            commands::ai_commands::analyze_summary,
            commands::ai_commands::test_ai_connection,
            commands::pdf_commands::generate_report_html,
            commands::pdf_commands::save_report_html,
            commands::pdf_commands::open_file,
            commands::pdf_commands::reveal_in_explorer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
