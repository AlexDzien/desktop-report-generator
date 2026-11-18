use crate::pdf::{self, PdfInput};

#[tauri::command]
pub async fn generate_report_html(input: PdfInput) -> Result<String, String> {
    let html = pdf::render_html(&input);
    Ok(html)
}

#[tauri::command]
pub async fn save_report_html(html: String, path: String) -> Result<(), String> {
    let parent = std::path::Path::new(&path)
        .parent()
        .ok_or("Nieprawidłowa ścieżka")?;
    std::fs::create_dir_all(parent).map_err(|e| format!("Nie udało się utworzyć folderów: {}", e))?;

    std::fs::write(&path, &html).map_err(|e| format!("Nie udało się zapisać pliku: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn open_file(path: String) -> Result<(), String> {
    opener::open(&path).map_err(|e| format!("Nie udało się otworzyć pliku: {}", e))
}

#[tauri::command]
pub async fn reveal_in_explorer(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    let dir = p.parent().unwrap_or(p);
    opener::open(dir).map_err(|e| format!("Nie udało się otworzyć folderu: {}", e))
}
