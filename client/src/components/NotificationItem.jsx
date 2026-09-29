import Icon from "./Icon";

// Icon per notification type (event, reminder, club, registration, campus)
const icons = { event: "calendar", reminder: "clock", club: "users", registration: "check", campus: "megaphone" };

export default function NotificationItem({ item }) {
  return (
    <div className={`flex gap-4 rounded-2xl border p-4 ${item.read ? "border-slate-100 bg-white" : "border-[#dbe5ff] bg-[#F7F9FF]"}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#5877D9]">
        <Icon name={icons[item.type] || "bell"} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
          <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{item.message}</p>
      </div>
      {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#5877D9]" />}
    </div>
  );
}