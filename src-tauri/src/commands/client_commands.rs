use crate::db::get_db;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateClientInput {
    pub name: String,
    pub contact_name: Option<String>,
    pub contact_email: Option<String>,
    pub industry: Option<String>,
    pub notes: Option<String>,
    pub default_reports_folder: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateClientInput {
    pub id: String,
    pub name: String,
    pub contact_name: Option<String>,
    pub contact_email: Option<String>,
    pub industry: Option<String>,
    pub notes: Option<String>,
    pub default_reports_folder: Option<String>,
}

#[tauri::command]
pub async fn create_client(input: CreateClientInput) -> Result<String, String> {
    let db = get_db();
    let id = uuid::Uuid::new_v4().to_string().replace('-', "");
    let id = id[..16].to_string();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    sqlx::query(
        "INSERT INTO clients (id, name, contact_name, contact_email, industry, notes, default_reports_folder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.contact_name)
    .bind(&input.contact_email)
    .bind(&input.industry)
    .bind(&input.notes)
    .bind(&input.default_reports_folder)
    .bind(&now)
    .bind(&now)
    .execute(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub async fn get_clients() -> Result<Vec<serde_json::Value>, String> {
    let db = get_db();

    let rows: Vec<(String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, String)> = sqlx::query_as(
        "SELECT id, name, contact_name, contact_email, industry, notes, default_reports_folder, created_at, updated_at FROM clients ORDER BY name ASC"
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())?;

    let result: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|r| {
            serde_json::json!({
                "id": r.0,
                "name": r.1,
                "contact_name": r.2,
                "contact_email": r.3,
                "industry": r.4,
                "notes": r.5,
                "default_reports_folder": r.6,
                "created_at": r.7,
                "updated_at": r.8,
            })
        })
        .collect();

    Ok(result)
}

#[tauri::command]
pub async fn get_client(id: String) -> Result<serde_json::Value, String> {
    let db = get_db();

    let row: (String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, String) = sqlx::query_as(
        "SELECT id, name, contact_name, contact_email, industry, notes, default_reports_folder, created_at, updated_at FROM clients WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "id": row.0,
        "name": row.1,
        "contact_name": row.2,
        "contact_email": row.3,
        "industry": row.4,
        "notes": row.5,
        "default_reports_folder": row.6,
        "created_at": row.7,
        "updated_at": row.8,
    }))
}

#[tauri::command]
pub async fn update_client(input: UpdateClientInput) -> Result<(), String> {
    let db = get_db();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    sqlx::query(
        "UPDATE clients SET name=?, contact_name=?, contact_email=?, industry=?, notes=?, default_reports_folder=?, updated_at=? WHERE id=?"
    )
    .bind(&input.name)
    .bind(&input.contact_name)
    .bind(&input.contact_email)
    .bind(&input.industry)
    .bind(&input.notes)
    .bind(&input.default_reports_folder)
    .bind(&now)
    .bind(&input.id)
    .execute(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_client(id: String) -> Result<(), String> {
    let db = get_db();

    sqlx::query("DELETE FROM clients WHERE id = ?")
        .bind(&id)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
