use crate::db::get_db;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateReportInput {
    pub client_id: String,
    pub reporting_month: String,
    pub raw_summary: String,
    pub key_results: Option<String>,
    pub optimizations: Option<String>,
    pub issues: Option<String>,
    pub recommendations_input: Option<String>,
    pub next_month_plan: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateReportInput {
    pub id: String,
    pub raw_summary: Option<String>,
    pub key_results: Option<String>,
    pub optimizations: Option<String>,
    pub issues: Option<String>,
    pub recommendations_input: Option<String>,
    pub next_month_plan: Option<String>,
    pub ai_output_json: Option<String>,
    pub edited_output_json: Option<String>,
    pub status: Option<String>,
    pub pdf_path: Option<String>,
}

#[tauri::command]
pub async fn create_report(input: CreateReportInput) -> Result<String, String> {
    let db = get_db();
    let id = uuid::Uuid::new_v4().to_string().replace('-', "");
    let id = id[..16].to_string();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    sqlx::query(
        "INSERT INTO reports (id, client_id, reporting_month, raw_summary, key_results, optimizations, issues, recommendations_input, next_month_plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)"
    )
    .bind(&id)
    .bind(&input.client_id)
    .bind(&input.reporting_month)
    .bind(&input.raw_summary)
    .bind(&input.key_results)
    .bind(&input.optimizations)
    .bind(&input.issues)
    .bind(&input.recommendations_input)
    .bind(&input.next_month_plan)
    .bind(&now)
    .bind(&now)
    .execute(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub async fn get_reports() -> Result<Vec<serde_json::Value>, String> {
    let db = get_db();

    let rows: Vec<(String, String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, Option<String>, String, String, Option<String>)> = sqlx::query_as(
        "SELECT r.id, r.client_id, r.reporting_month, r.raw_summary, r.key_results, r.optimizations, r.issues, r.recommendations_input, r.next_month_plan, r.ai_output_json, r.edited_output_json, r.status, r.pdf_path, r.created_at, r.updated_at, r.generated_at FROM reports r ORDER BY r.created_at DESC"
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())?;

    let result: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|r| {
            serde_json::json!({
                "id": r.0,
                "client_id": r.1,
                "reporting_month": r.2,
                "raw_summary": r.3,
                "key_results": r.4,
                "optimizations": r.5,
                "issues": r.6,
                "recommendations_input": r.7,
                "next_month_plan": r.8,
                "ai_output_json": r.9,
                "edited_output_json": r.10,
                "status": r.11,
                "pdf_path": r.12,
                "created_at": r.13,
                "updated_at": r.14,
                "generated_at": r.15,
            })
        })
        .collect();

    Ok(result)
}

#[tauri::command]
pub async fn get_report(id: String) -> Result<serde_json::Value, String> {
    let db = get_db();

    let row: (String, String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, Option<String>, String, String, Option<String>) = sqlx::query_as(
        "SELECT id, client_id, reporting_month, raw_summary, key_results, optimizations, issues, recommendations_input, next_month_plan, ai_output_json, edited_output_json, status, pdf_path, created_at, updated_at, generated_at FROM reports WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "id": row.0,
        "client_id": row.1,
        "reporting_month": row.2,
        "raw_summary": row.3,
        "key_results": row.4,
        "optimizations": row.5,
        "issues": row.6,
        "recommendations_input": row.7,
        "next_month_plan": row.8,
        "ai_output_json": row.9,
        "edited_output_json": row.10,
        "status": row.11,
        "pdf_path": row.12,
        "created_at": row.13,
        "updated_at": row.14,
        "generated_at": row.15,
    }))
}

#[tauri::command]
pub async fn update_report(input: UpdateReportInput) -> Result<(), String> {
    let db = get_db();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    sqlx::query(
        "UPDATE reports SET raw_summary=COALESCE(?,raw_summary), key_results=COALESCE(?,key_results), optimizations=COALESCE(?,optimizations), issues=COALESCE(?,issues), recommendations_input=COALESCE(?,recommendations_input), next_month_plan=COALESCE(?,next_month_plan), ai_output_json=COALESCE(?,ai_output_json), edited_output_json=COALESCE(?,edited_output_json), status=COALESCE(?,status), pdf_path=COALESCE(?,pdf_path), updated_at=? WHERE id=?"
    )
    .bind(&input.raw_summary)
    .bind(&input.key_results)
    .bind(&input.optimizations)
    .bind(&input.issues)
    .bind(&input.recommendations_input)
    .bind(&input.next_month_plan)
    .bind(&input.ai_output_json)
    .bind(&input.edited_output_json)
    .bind(&input.status)
    .bind(&input.pdf_path)
    .bind(&now)
    .bind(&input.id)
    .execute(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_report(id: String) -> Result<(), String> {
    let db = get_db();

    sqlx::query("DELETE FROM reports WHERE id = ?")
        .bind(&id)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_reports_by_client(client_id: String) -> Result<Vec<serde_json::Value>, String> {
    let db = get_db();

    let rows: Vec<(String, String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, Option<String>, String, String, Option<String>)> = sqlx::query_as(
        "SELECT id, client_id, reporting_month, raw_summary, key_results, optimizations, issues, recommendations_input, next_month_plan, ai_output_json, edited_output_json, status, pdf_path, created_at, updated_at, generated_at FROM reports WHERE client_id = ? ORDER BY reporting_month DESC"
    )
    .bind(&client_id)
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())?;

    let result: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|r| {
            serde_json::json!({
                "id": r.0,
                "client_id": r.1,
                "reporting_month": r.2,
                "raw_summary": r.3,
                "key_results": r.4,
                "optimizations": r.5,
                "issues": r.6,
                "recommendations_input": r.7,
                "next_month_plan": r.8,
                "ai_output_json": r.9,
                "edited_output_json": r.10,
                "status": r.11,
                "pdf_path": r.12,
                "created_at": r.13,
                "updated_at": r.14,
                "generated_at": r.15,
            })
        })
        .collect();

    Ok(result)
}
