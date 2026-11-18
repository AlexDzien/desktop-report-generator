# Generator raportów kampanii

Desktop tool for turning a campaign specialist's notes into a reviewed client report and printable document.

Generator porządkuje miesięczne podsumowania kampanii Google Ads. Specjalista wybiera klienta, opisuje działania i wyniki, sprawdza treść przygotowaną przez asystenta i zapisuje raport do historii. Aplikacja umożliwia przygotowanie wydruku z danymi klienta i identyfikacją firmy.

## Proces

1. Karta klienta przechowuje jego dane i historię raportów.
2. Kreator zbiera wyniki, wykonane optymalizacje, problemy i plan na kolejny miesiąc.
3. Komenda Tauri przekazuje podsumowanie do skonfigurowanego endpointu modelu. Odpowiedź ma ustrukturyzowany format, a brakujące dane mają osobną sekcję.
4. Operator sprawdza raport. Dane robocze i historia trafiają do lokalnej bazy SQLite.
5. Warstwa dokumentów renderuje i zapisuje HTML do przeglądu i wydruku, także do PDF przez okno drukowania. Szablon Typst znajduje się w źródłach jako osobny wariant dokumentu.

## Uruchomienie

Interfejs korzysta z Node.js, React, TypeScript i Vite. Wersja desktopowa wymaga dodatkowo Rust, Tauri 2 i zależności platformy. Operacje zapisu, analizy oraz eksportu wykonuje aplikacja desktopowa.

```bash
npm ci
npm run build
npm run tauri -- dev
```

Główne widoki są w `src/features`. Komendy aplikacji, migracje bazy i szablony znajdują się w `src-tauri`.
