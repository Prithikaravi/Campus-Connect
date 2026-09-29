import { NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/clubs", label: "Clubs", icon: "users" },
  { to: "/events", label: "Events", icon: "calendar" },
  { to: "/announcements", label: "Announcements", icon: "megaphone" },
  { to: "/discussions", label: "Discussions", icon: "chat" },
  { to: "/notifications", label: "Notifications", icon: "bell" },
  { to: "/profile", label: "My Profile", icon: "user" },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Dark overlay behind the menu on mobile */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-100 bg-white p-5 transition-transform
          lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo to="/dashboard" />
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-[#EEF4FF] text-[#4a68c7]" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon name={l.icon} className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 truncate px-3 text-xs text-slate-400">{user?.email}</p>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600">
            <Icon name="logout" className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}