import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
