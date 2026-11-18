use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::sync::OnceLock;
use tauri::Manager;

static DB: OnceLock<SqlitePool> = OnceLock::new();

pub fn get_db() -> &'static SqlitePool {
    DB.get().expect("Database not initialized")
}

pub async fn init(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("raporty.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    sqlx::query(include_str!("migrations.sql"))
        .execute(&pool)
        .await?;

    DB.set(pool).expect("Database already initialized");

    log::info!("Database initialized at {:?}", db_path);
    Ok(())
}
