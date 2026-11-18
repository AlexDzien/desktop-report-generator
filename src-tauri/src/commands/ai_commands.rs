use serde::{Deserialize, Serialize};
use std::time::Duration;

const AI_TIMEOUT_SECONDS: u64 = 120;
const AI_MAX_RETRIES: u32 = 2;

const SYSTEM_PROMPT: &str = r#"Jesteś asystentem specjalizującym się w tworzeniu raportów z kampanii Google Ads.
Twoim zadaniem jest przeanalizowanie podsumowania kampanii wpisanego przez specjalistę
i przygotowanie ustrukturyzowanego raporu dla klienta.

ZASADY:
1. Mów prostym, zrozumiałym językiem polskim.
2. NIE wymyślaj danych liczbowych. Jeśli użytkownik podał liczbę — użyj jej dokładnie.
   Jeśli nie podał — nie dodawaj jej.
3. NIE dodawaj faktów, których nie ma w podsumowaniu.
4. NIE obiecuj wyników na przyszłość.
5. NIE używaj pustych marketingowych fraz typu "kampania była sukcesem".
6. Upraszczaj język techniczny — tłumacz po ludzku.
7. Jeśli coś jest niepewne lub niejasne, oznacz to w pole "missing_data_notes".
8. Każda sekcja ma być krótka, konkretna, czytelna.
9. Preferuj krótkie zdania nad długie akapity.
10. Raport jest po polsku.

FORMA ODPOWIEDZI:
Zwróć TYLKO i WYŁĄCZNIE poprawny JSON zgodny z podanym schematem.
Bez komentarzy, bez tekstu poza JSON, bez markdown fence."#;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyzeSummaryInput {
    pub raw_summary: String,
    pub key_results: Option<String>,
    pub optimizations: Option<String>,
    pub issues: Option<String>,
    pub recommendations_input: Option<String>,
    pub next_month_plan: Option<String>,
    pub client_name: String,
    pub reporting_month: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiMetric {
    pub label: String,
    pub value: String,
    pub explanation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiReportOutput {
    pub client_summary: String,
    pub main_results: Vec<AiMetric>,
    pub actions_completed: Vec<String>,
    pub campaign_insights: Vec<String>,
    pub recommendations: Vec<String>,
    pub expert_comment: String,
    pub next_steps: Vec<String>,
    pub missing_data_notes: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiError {
    pub message: String,
    pub retryable: bool,
}

#[tauri::command]
pub async fn analyze_summary(
    input: AnalyzeSummaryInput,
    endpoint: String,
    model: String,
) -> Result<AiReportOutput, AiError> {
    let mut last_error: Option<String> = None;

    for attempt in 0..=AI_MAX_RETRIES {
        match try_analyze(&input, &endpoint, &model).await {
            Ok(output) => return Ok(output),
            Err(e) => {
                last_error = Some(e.clone());
                if attempt < AI_MAX_RETRIES {
                    tokio::time::sleep(Duration::from_secs(2)).await;
                }
            }
        }
    }

    Err(AiError {
        message: last_error.unwrap_or_else(|| "Nieznany błąd AI".to_string()),
        retryable: false,
    })
}

async fn try_analyze(
    input: &AnalyzeSummaryInput,
    endpoint: &str,
    model: &str,
) -> Result<AiReportOutput, String> {
    let user_prompt = build_user_prompt(input);

    let json_schema = serde_json::json!({
        "type": "object",
        "properties": {
            "client_summary": { "type": "string" },
            "main_results": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "label": { "type": "string" },
                        "value": { "type": "string" },
                        "explanation": { "type": "string" }
                    },
                    "required": ["label", "value", "explanation"]
                }
            },
            "actions_completed": { "type": "array", "items": { "type": "string" } },
            "campaign_insights": { "type": "array", "items": { "type": "string" } },
            "recommendations": { "type": "array", "items": { "type": "string" } },
            "expert_comment": { "type": "string" },
            "next_steps": { "type": "array", "items": { "type": "string" } },
            "missing_data_notes": { "type": "array", "items": { "type": "string" } }
        },
        "required": [
            "client_summary",
            "main_results",
            "actions_completed",
            "campaign_insights",
            "recommendations",
            "expert_comment",
            "next_steps",
            "missing_data_notes"
        ]
    });

    let request_body = serde_json::json!({
        "model": model,
        "system": SYSTEM_PROMPT,
        "prompt": user_prompt,
        "format": json_schema,
        "stream": false,
        "options": {
            "temperature": 0.1,
            "num_ctx": 8192
        }
    });

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(AI_TIMEOUT_SECONDS))
        .build()
        .map_err(|e| format!("Nie udało się utworzyć klienta HTTP: {}", e))?;

    let url = format!("{}/api/generate", endpoint.trim_end_matches('/'));

    let response = client
        .post(&url)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "Model odpowiada zbyt wolno. Sprawdź obciążenie GPU/CPU i spróbuj ponownie."
                    .to_string()
            } else if e.is_connect() {
                "Nie można połączyć się z Ollama. Upewnij się, że serwer jest uruchomiony (ollama serve)."
                    .to_string()
            } else {
                format!("Błąd połączenia z AI: {}", e)
            }
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("AI zwrócił błąd HTTP {}: {}", status, body));
    }

    let response_json: serde_json::Value = response.json().await.map_err(|e| {
        format!("Nie udało się odczytać odpowiedzi AI: {}", e)
    })?;

    let response_str = response_json["response"]
        .as_str()
        .ok_or("Odpowiedź AI nie zawiera pola 'response'")?;

    let output: AiReportOutput = serde_json::from_str(response_str).map_err(|e| {
        format!(
            "Odpowiedź AI nie jest prawidłowym JSON: {}. Surowa odpowiedź: {}",
            e,
            &response_str[..response_str.len().min(200)]
        )
    })?;

    Ok(output)
}

fn build_user_prompt(input: &AnalyzeSummaryInput) -> String {
    let mut parts = vec![
        format!(
            "Przeanalizuj poniższe podsumowanie kampanii Google Ads i przygotuj raport."
        ),
        format!("OKRES RAPORTU: {}", input.reporting_month),
        format!("KLIENT: {}", input.client_name),
        String::new(),
        "=== PODSUMOWANIE KAMPANII ===".to_string(),
        input.raw_summary.clone(),
    ];

    if let Some(ref results) = input.key_results {
        if !results.is_empty() {
            parts.push(String::new());
            parts.push("=== NAJWAŻNIEJSZE WYNIKI ===".to_string());
            parts.push(results.clone());
        }
    }

    if let Some(ref opts) = input.optimizations {
        if !opts.is_empty() {
            parts.push(String::new());
            parts.push("=== WYKONANE OPTYMALIZACJE ===".to_string());
            parts.push(opts.clone());
        }
    }

    if let Some(ref issues) = input.issues {
        if !issues.is_empty() {
            parts.push(String::new());
            parts.push("=== PROBLEMY ===".to_string());
            parts.push(issues.clone());
        }
    }

    if let Some(ref recs) = input.recommendations_input {
        if !recs.is_empty() {
            parts.push(String::new());
            parts.push("=== REKOMENDACJE ===".to_string());
            parts.push(recs.clone());
        }
    }

    if let Some(ref plan) = input.next_month_plan {
        if !plan.is_empty() {
            parts.push(String::new());
            parts.push("=== PLAN NA KOLEJNY MIESIĄC ===".to_string());
            parts.push(plan.clone());
        }
    }

    parts.push(String::new());
    parts.push("=== INSTRUKCJA ===".to_string());
    parts.push(
        "Zwróć JSON zgodny ze schematem. Używaj wyłącznie informacji z powyższego tekstu."
            .to_string(),
    );
    parts.push(
        "Jeśli jakaś informacja jest niepełna lub niepewna, dodaj notatkę w \"missing_data_notes\".".to_string(),
    );

    parts.join("\n")
}

#[tauri::command]
pub async fn test_ai_connection(endpoint: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Błąd klienta HTTP: {}", e))?;

    let url = format!("{}/api/tags", endpoint.trim_end_matches('/'));

    let response = client.get(&url).send().await.map_err(|e| {
        if e.is_connect() {
            "Nie można połączyć się z Ollama. Upewnij się, że serwer jest uruchomiony (ollama serve)."
                .to_string()
        } else {
            format!("Błąd połączenia: {}", e)
        }
    })?;

    if !response.status().is_success() {
        return Err(format!("Ollama zwrócił błąd: {}", response.status()));
    }

    let body: serde_json::Value = response.json().await.map_err(|e| {
        format!("Nie udało się odczytać odpowiedzi: {}", e)
    })?;

    let models = body["models"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|m| m["name"].as_str())
                .collect::<Vec<_>>()
                .join(", ")
        })
        .unwrap_or_else(|| "brak modeli".to_string());

    Ok(format!("Połączenie OK. Dostępne modele: {}", models))
}
