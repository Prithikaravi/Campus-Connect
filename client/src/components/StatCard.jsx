import Icon from "./Icon";

export default function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#5877D9]">
        <Icon name={icon} className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}