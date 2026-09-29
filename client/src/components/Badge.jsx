const tones = {
  blue: "bg-[#EEF4FF] text-[#4a68c7]",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-600",
  gray: "bg-slate-100 text-slate-600",
};

export default function Badge({ tone = "blue", children }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}