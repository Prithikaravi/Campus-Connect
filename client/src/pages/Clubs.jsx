import { useState } from "react";
import { clubs as mockClubs, clubCategories } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import ClubCard from "../components/ClubCard";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";

export default function Clubs() {
  // TODO (backend): replace mockClubs with data from  api.get("/api/clubs")
  const [clubs, setClubs] = useState(mockClubs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = clubs.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (c.name + c.description).toLowerCase().includes(search.toLowerCase())
  );

  // TODO (backend): call api.post(`/api/clubs/${id}/join`) here
  const handleJoin = (id) => setClubs(clubs.map((c) => (c._id === id ? { ...c, joined: true, members: c.members + 1 } : c)));

  return (
    <div>
      <PageHeader title="Clubs" subtitle="Find a community that matches your interests." />

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Icon name="search" className="h-4 w-4" /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clubs"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#5877D9] focus:outline-none focus:ring-2 focus:ring-[#5877D9]/20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...clubCategories].map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c ? "bg-[#5877D9] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No clubs found" message="Try a different search or category." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => <ClubCard key={c._id} club={c} joined={c.joined} onJoin={handleJoin} />)}
        </div>
      )}
    </div>
  );
}