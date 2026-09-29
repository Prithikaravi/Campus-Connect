import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

export default function Navbar({ onMenu }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Icon name="menu" />
      </button>

      <div className="relative max-w-md flex-1">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Icon name="search" className="h-4 w-4" /></span>
        <input
          type="search"
          placeholder="Search clubs, events, announcements"
          className="w-full rounded-xl border border-slate-200 bg-[#F6F8FC] py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-[#5877D9] focus:outline-none focus:ring-2 focus:ring-[#5877D9]/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link to="/notifications" className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Notifications">
          <Icon name="bell" className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#5877D9]" />
        </Link>
        <Link to="/profile" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF4FF] text-sm font-semibold text-[#4a68c7]">
            {initials(user?.name)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold text-slate-800">{user?.name || "User"}</span>
            <span className="block text-xs capitalize text-slate-500">{user?.role}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}