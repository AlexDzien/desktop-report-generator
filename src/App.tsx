import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardView } from "./features/dashboard/DashboardView";
import { ClientListView } from "./features/clients/ClientListView";
import { ReportWizard } from "./features/reports/ReportWizard";
import { ReportHistoryView } from "./features/history/ReportHistoryView";
import { SettingsView } from "./features/settings/SettingsView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardView />} />
          <Route path="/klienci" element={<ClientListView />} />
          <Route path="/nowy-raport" element={<ReportWizard />} />
          <Route path="/historia" element={<ReportHistoryView />} />
          <Route path="/ustawienia" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
