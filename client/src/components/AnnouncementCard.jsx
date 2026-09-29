import Badge from "./Badge";
import { formatDate } from "../utils/format";

const tone = { High: "red", Medium: "amber", Low: "gray" };

export default function AnnouncementCard({ item, compact = false }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800">{item.title}</h3>
        <Badge tone={tone[item.priority]}>{item.priority} priority</Badge>
      </div>
      {!compact && <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>}
      <p className="mt-3 text-xs text-slate-400">Posted by {item.postedBy} on {formatDate(item.date)}</p>
    </div>
  );
}