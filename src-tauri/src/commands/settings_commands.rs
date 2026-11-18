use crate::db::get_db;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateSettingsInput {
    pub company_name: Option<String>,
    pub company_website: Option<String>,
    pub company_logo_path: Option<String>,
    pub contact_email: Option<String>,
    pub contact_phone: Option<String>,
    pub reports_base_folder: Option<String>,
    pub local_ai_endpoint: Option<String>,
    pub local_ai_model_name: Option<String>,
    pub pdf_template_name: Option<String>,
}

#[tauri::command]
pub async fn get_settings() -> Result<serde_json::Value, String> {
    let db = get_db();

    let row: Result<(i32, String, String, Option<String>, Option<String>, Option<String>, Option<String>, String, String, String, String, String), _> = sqlx::query_as(
        "SELECT id, company_name, company_website, company_logo_path, contact_email, contact_phone, reports_base_folder, local_ai_endpoint, local_ai_model_name, pdf_template_name, created_at, updated_at FROM settings WHERE id = 1"
    )
    .fetch_one(db)
    .await;

    match row {
        Ok(r) => Ok(serde_json::json!({
            "id": r.0,
            "company_name": r.1,
            "company_website": r.2,
            "company_logo_path": r.3,
            "contact_email": r.4,
            "contact_phone": r.5,
            "reports_base_folder": r.6,
            "local_ai_endpoint": r.7,
            "local_ai_model_name": r.8,
            "pdf_template_name": r.9,
            "created_at": r.10,
            "updated_at": r.11,
        })),
        Err(_) => {
            let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();
            sqlx::query(
                "INSERT INTO settings (id, company_name, company_website, local_ai_endpoint, local_ai_model_name, pdf_template_name, created_at, updated_at) VALUES (1, 'alldayit.pl', 'https://alldayit.pl', 'http://localhost:11434', 'qwen2.5:7b', 'default', ?, ?)"
            )
            .bind(&now)
            .bind(&now)
            .execute(db)
            .await
            .map_err(|e| e.to_string())?;

            let r: (i32, String, String, Option<String>, Option<String>, Option<String>, Option<String>, String, String, String, String, String) = sqlx::query_as(
                "SELECT id, company_name, company_website, company_logo_path, contact_email, contact_phone, reports_base_folder, local_ai_endpoint, local_ai_model_name, pdf_template_name, created_at, updated_at FROM settings WHERE id = 1"
            )
            .fetch_one(db)
            .await
            .map_err(|e| e.to_string())?;

            Ok(serde_json::json!({
                "id": r.0,
                "company_name": r.1,
                "company_website": r.2,
                "company_logo_path": r.3,
                "contact_email": r.4,
                "contact_phone": r.5,
                "reports_base_folder": r.6,
                "local_ai_endpoint": r.7,
                "local_ai_model_name": r.8,
                "pdf_template_name": r.9,
                "created_at": r.10,
                "updated_at": r.11,
            }))
        }
    }
}

#[tauri::command]
pub async fn update_settings(input: UpdateSettingsInput) -> Result<(), String> {
    let db = get_db();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    sqlx::query(
        "UPDATE settings SET company_name=COALESCE(?,company_name), company_website=COALESCE(?,company_website), company_logo_path=COALESCE(?,company_logo_path), contact_email=COALESCE(?,contact_email), contact_phone=COALESCE(?,contact_phone), reports_base_folder=COALESCE(?,reports_base_folder), local_ai_endpoint=COALESCE(?,local_ai_endpoint), local_ai_model_name=COALESCE(?,local_ai_model_name), pdf_template_name=COALESCE(?,pdf_template_name), updated_at=? WHERE id=1"
    )
    .bind(&input.company_name)
    .bind(&input.company_website)
    .bind(&input.company_logo_path)
    .bind(&input.contact_email)
    .bind(&input.contact_phone)
    .bind(&input.reports_base_folder)
    .bind(&input.local_ai_endpoint)
    .bind(&input.local_ai_model_name)
    .bind(&input.pdf_template_name)
    .bind(&now)
    .execute(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
