import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/klienci", label: "Klienci", icon: "👥" },
  { to: "/nowy-raport", label: "Raport", icon: "📝" },
  { to: "/historia", label: "Historia", icon: "📁" },
  { to: "/ustawienia", label: "Ustawienia", icon: "⚙️" },
];

export function BottomNavigation() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors duration-150 ${
                isActive ? "text-accent" : "text-text-muted"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
