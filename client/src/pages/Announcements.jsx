import { useState } from "react";
import { announcements } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import AnnouncementCard from "../components/AnnouncementCard";
import EmptyState from "../components/EmptyState";

export default function Announcements() {
  // TODO (backend): replace `announcements` with data from  api.get("/api/announcements")
  const [priority, setPriority] = useState("All");
  const list = announcements.filter((a) => priority === "All" || a.priority === priority);

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Official updates from the college and your clubs." />
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", "High", "Medium", "Low"].map((p) => (
          <button key={p} onClick={() => setPriority(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              priority === p ? "bg-[#5877D9] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {p === "All" ? "All" : `${p} priority`}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon="megaphone" title="No announcements" message="Nothing to show for this filter." />
      ) : (
        <div className="space-y-4">{list.map((a) => <AnnouncementCard key={a._id} item={a} />)}</div>
      )}
    </div>
  );
}