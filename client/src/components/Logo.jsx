import { Link } from "react-router-dom";

export default function Logo({ to = "/", subtitle = false }) {
  return (
    <Link to={to} className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5877D9] text-lg font-bold text-white shadow-sm">
        C
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold text-slate-800">CampusConnect</span>
        {subtitle && <span className="block text-xs text-slate-500">College Community Portal</span>}
      </span>
    </Link>
  );
}