#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2cm, left: 2.5cm, right: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 8pt, fill: luma(150))
      #h(1fr) alldayit.pl — Raport Google Ads
    ]
  },
  footer: context [
    #set align(center)
    #set text(size: 8pt, fill: luma(150))
    #h(1fr)
    #counter(page).display("1 / 1", both: true)
    #h(1fr)
  ],
)

#set text(font: ("Inter", "Liberation Sans", "Noto Sans"), size: 10pt, fill: black)
#set par(justify: true, leading: 0.7em)
#set heading(numbering: none)

#show heading.where(level: 1): it => {
  v(0.8em)
  it
  v(0.3em)
}

#show heading.where(level: 2): it => {
  v(0.5em)
  it
  v(0.2em)
}

// ===== STRONA TYTUŁOWA =====
#align(center)[
  #v(4cm)

  #if logo_path != "" {
    image(logo_path, height: 70pt)
    v(1cm)
  }

  #text(size: 28pt, weight: "bold")[Raport Google Ads]
  #v(0.8cm)
  #text(size: 18pt)[#client_name]
  #v(0.5cm)
  #text(size: 14pt, fill: luma(100))[#report_month_display]
  #v(1cm)
  #text(size: 10pt, fill: luma(120))[
    Przygotowane przez #company_name \
    #generation_date
  ]
]

#pagebreak()

// ===== PODSUMOWANIE =====
= Podsumowanie

#client_summary

// ===== NAJWAŻNIEJSZE WYNIKI =====
= Najważniejsze wyniki

#let result_rows = ()
#for item in main_results {
  result_rows.push((
    text(weight: "bold")[#item.label],
    [#item.value],
    [#item.explanation],
  ))
}

#if result_rows.len() > 0 {
  table(
    columns: (auto, auto, 1fr),
    align: (left, left, left),
    inset: 8pt,
    stroke: 0.5pt + luma(200),
    fill: (_, row) => if row == 0 { luma(240) } else { white },
    table.header(
      [Metryka], [Wartość], [Opis]
    ),
    ..result_rows.flatten()
  )
} else {
  text(fill: luma(120))[Brak danych o wynikach.]
}

// ===== CO ZOSTAŁO ZROBIONE =====
= Co zostało zrobione w tym miesiącu

#let actions_text = actions_completed.join("\n")
#actions_text

// ===== WNIOSKI =====
= Wnioski z kampanii

#let insights_text = campaign_insights.join("\n")
#insights_text

// ===== REKOMENDACJE =====
= Rekomendacje na kolejny miesiąc

#let recs_text = recommendations.join("\n")
#recs_text

// ===== KOMENTARZ EKSPERTA =====
= Komentarz eksperta

#block(
  width: 100%,
  inset: (x: 12pt, y: 10pt),
  fill: rgb("#f0f4ff"),
  radius: 4pt,
  stroke: 0.5pt + rgb("#d0d8f0"),
  [#expert_comment]
)

// ===== NASTĘPNE KROKI =====
= Następne kroki

#let steps_text = next_steps.join("\n")
#steps_text

// ===== NOTATKI O BRAKUJĄCYCH DANYCH =====
#if missing_data_notes.len() > 0 {
  = Uwagi

  #block(
    width: 100%,
    inset: (x: 12pt, y: 10pt),
    fill: rgb("#fff8e1"),
    radius: 4pt,
    stroke: 0.5pt + rgb("#ffe082"),
    [
      #text(weight: "bold", size: 9pt)[Brakujące dane:]

      #for note in missing_data_notes [
        #text(size: 9pt)[• #note]
        #v(2pt)
      ]
    ]
  )
}
