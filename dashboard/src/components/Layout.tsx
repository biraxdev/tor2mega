import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSocketNotifications } from "../hooks/useSocketNotifications";
import {
  LayoutDashboard,
  Download,
  FolderUp,
  ListOrdered,
  ScrollText,
  Settings as SettingsIcon,
  LogOut,
  Cloud,
  PlusCircle,
  Film,
  Globe,
  Users,
  CreditCard,
  KeyRound,
} from "lucide-react";
import { clearToken } from "../api";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/videos", label: "Library", icon: Film, end: false },
  { to: "/dashboard/browser", label: "Browser", icon: Globe, end: false },
  { to: "/dashboard/downloads", label: "Downloads", icon: Download, end: false },
  { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon, end: false },
];

const secondaryItems = [
  { to: "/dashboard/add-url", label: "Add URL", icon: PlusCircle, end: false },
  { to: "/dashboard/destinations", label: "Destinations", icon: FolderUp, end: false },
  { to: "/dashboard/queue", label: "Queue", icon: ListOrdered, end: false },
  { to: "/dashboard/logs", label: "Logs", icon: ScrollText, end: false },
  { to: "/dashboard/team", label: "Team", icon: Users, end: false },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard, end: false },
  { to: "/dashboard/api-keys", label: "API Keys", icon: KeyRound, end: false },
];

export default function Layout() {
  const navigate = useNavigate();
  useSocketNotifications();

  const logout = () => {
    clearToken();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 flex items-center gap-2 border-b border-gray-800">
          <Cloud className="w-6 h-6 text-brand" />
          <span className="font-bold text-lg text-white">TOR2MEGA</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-800">
            <p className="px-3 mb-1 text-xs text-gray-600 uppercase tracking-wider">More</p>
            {secondaryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
