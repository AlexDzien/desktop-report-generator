import { NavLink } from "react-router-dom";
import { COMPANY_NAME } from "@/lib/constants";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/klienci", label: "Klienci", icon: "👥" },
  { to: "/nowy-raport", label: "Nowy raport", icon: "📝" },
  { to: "/historia", label: "Historia", icon: "📁" },
  { to: "/ustawienia", label: "Ustawienia", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-bg-secondary border-r border-border h-screen sticky top-0">
      <div className="p-5 border-b border-border">
        <h1 className="text-lg font-bold text-text-primary">{COMPANY_NAME}</h1>
        <p className="text-xs text-text-secondary mt-0.5">Generator Raportów</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-[11px] text-text-muted text-center">
          v0.1.0 — 100% lokalnie
        </p>
      </div>
    </aside>
  );
}
