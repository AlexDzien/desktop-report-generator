use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfInput {
    pub client_name: String,
    pub reporting_month: String,
    pub report_month_display: String,
    pub company_name: String,
    pub company_website: String,
    pub contact_email: String,
    pub contact_phone: String,
    pub logo_path: String,
    pub generation_date: String,
    pub client_summary: String,
    pub main_results: Vec<PdfMetric>,
    pub actions_completed: Vec<String>,
    pub campaign_insights: Vec<String>,
    pub recommendations: Vec<String>,
    pub expert_comment: String,
    pub next_steps: Vec<String>,
    pub missing_data_notes: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfMetric {
    pub label: String,
    pub value: String,
    pub explanation: String,
}

pub fn render_html(input: &PdfInput) -> String {
    let results_html = if input.main_results.is_empty() {
        "<p class=\"muted\">Brak danych o wynikach.</p>".to_string()
    } else {
        let rows = input
            .main_results
            .iter()
            .map(|r| {
                format!(
                    "<tr><td><strong>{}</strong></td><td>{}</td><td>{}</td></tr>",
                    escape_html(&r.label),
                    escape_html(&r.value),
                    escape_html(&r.explanation)
                )
            })
            .collect::<String>();

        format!(
            "<table class=\"metrics\"><thead><tr><th>Metryka</th><th>Wartość</th><th>Opis</th></tr></thead><tbody>{}</tbody></table>",
            rows
        )
    };

    let actions_html = render_list(&input.actions_completed);
    let insights_html = render_list(&input.campaign_insights);
    let recs_html = render_list(&input.recommendations);
    let steps_html = render_list(&input.next_steps);

    let logo_html = if !input.logo_path.is_empty() {
        format!("<img src=\"file:///{}\" class=\"logo\" alt=\"Logo\" />", escape_html(&input.logo_path))
    } else {
        String::new()
    };

    let missing_notes_html = if input.missing_data_notes.is_empty() {
        String::new()
    } else {
        let notes = input
            .missing_data_notes
            .iter()
            .map(|n| format!("<li>{}</li>", escape_html(n)))
            .collect::<String>();
        format!(
            "<div class=\"missing-notes\"><strong>Brakujące dane:</strong><ul>{}</ul></div>",
            notes
        )
    };

    let contact_parts = vec![
        Some(escape_html(&input.company_name)),
        if input.contact_email.is_empty() {
            None
        } else {
            Some(escape_html(&input.contact_email))
        },
        if input.contact_phone.is_empty() {
            None
        } else {
            Some(escape_html(&input.contact_phone))
        },
    ]
    .into_iter()
    .flatten()
    .collect::<Vec<_>>()
    .join(" | ");

    format!(
        r#"<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: A4;
    margin: 2.5cm 2cm;
    @bottom-center {{
      content: counter(page) " / " counter(pages);
      font-size: 8pt;
      color: #999;
    }}
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: "Inter", "Segoe UI", "Liberation Sans", sans-serif;
    font-size: 10pt;
    line-height: 1.6;
    color: #1a1a1a;
  }}
  .page-break {{ page-break-before: always; }}

  /* Strona tytułowa */
  .title-page {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
  }}
  .title-page .logo {{ max-height: 70pt; margin-bottom: 1.5cm; }}
  .title-page h1 {{ font-size: 28pt; font-weight: 700; margin-bottom: 0.5cm; }}
  .title-page .client {{ font-size: 18pt; margin-bottom: 0.3cm; }}
  .title-page .month {{ font-size: 14pt; color: #666; margin-bottom: 1cm; }}
  .title-page .meta {{ font-size: 10pt; color: #999; }}

  /* Sekcje */
  h2 {{
    font-size: 14pt;
    font-weight: 600;
    margin: 1em 0 0.4em 0;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #e0e0e0;
  }}
  p {{ margin-bottom: 0.5em; }}

  /* Tabela KPI */
  table.metrics {{
    width: 100%;
    border-collapse: collapse;
    margin: 0.5em 0 1em 0;
    font-size: 9.5pt;
  }}
  table.metrics th {{
    background: #f5f5f5;
    text-align: left;
    padding: 6px 8px;
    border: 0.5px solid #ddd;
    font-weight: 600;
  }}
  table.metrics td {{
    padding: 6px 8px;
    border: 0.5px solid #ddd;
  }}

  /* Listy */
  .content-list {{
    margin: 0.3em 0 0.8em 1.5em;
  }}
  .content-list li {{
    margin-bottom: 0.3em;
  }}

  /* Komentarz eksperta */
  .expert-comment {{
    background: #f0f4ff;
    border: 0.5px solid #d0d8f0;
    border-radius: 4px;
    padding: 10px 14px;
    margin: 0.5em 0 1em 0;
  }}

  /* Notatki */
  .missing-notes {{
    background: #fff8e1;
    border: 0.5px solid #ffe082;
    border-radius: 4px;
    padding: 10px 14px;
    margin: 1em 0;
    font-size: 9pt;
  }}
  .missing-notes ul {{ margin-left: 1.2em; margin-top: 0.3em; }}

  .muted {{ color: #999; font-style: italic; }}
</style>
</head>
<body>

<div class="title-page">
  {logo_html}
  <h1>Raport Google Ads</h1>
  <div class="client">{}</div>
  <div class="month">{}</div>
  <div class="meta">
    Przygotowane przez {}<br>
    {}
  </div>
</div>

<div class="page-break"></div>

<h2>Podsumowanie</h2>
<p>{}</p>

<h2>Najważniejsze wyniki</h2>
{}

<h2>Co zostało zrobione w tym miesiącu</h2>
{}

<h2>Wnioski z kampanii</h2>
{}

<h2>Rekomendacje na kolejny miesiąc</h2>
{}

<h2>Komentarz eksperta</h2>
<div class="expert-comment">{}</div>

<h2>Następne kroki</h2>
{}

{}

<div style="margin-top: 3cm; text-align: center; font-size: 8pt; color: #999; border-top: 0.5px solid #ddd; padding-top: 0.5cm;">
  {}
</div>

</body>
</html>"#,
        escape_html(&input.client_name),
        escape_html(&input.report_month_display),
        escape_html(&input.company_name),
        escape_html(&input.generation_date),
        escape_html(&input.client_summary),
        results_html,
        actions_html,
        insights_html,
        recs_html,
        escape_html(&input.expert_comment),
        steps_html,
        missing_notes_html,
        contact_parts,
    )
}

fn render_list(items: &[String]) -> String {
    if items.is_empty() {
        return "<p class=\"muted\">Brak danych.</p>".to_string();
    }
    let li = items
        .iter()
        .map(|i| format!("<li>{}</li>", escape_html(i)))
        .collect::<String>();
    format!("<ul class=\"content-list\">{}</ul>", li)
}

fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\n', "<br>")
}
