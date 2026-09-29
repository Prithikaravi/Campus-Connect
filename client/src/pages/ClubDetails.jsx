import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { clubs, events } from "../data/mockData";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { formatDate } from "../utils/format";

export default function ClubDetails() {
  const { id } = useParams();
  // TODO (backend): replace with api.get(`/api/clubs/${id}`)
  const club = clubs.find((c) => c._id === id);
  const [joined, setJoined] = useState(club?.joined || false);

  if (!club) return <EmptyState title="Club not found" action={<Link to="/clubs"><Button>Back to clubs</Button></Link>} />;

  const clubEvents = events.filter((e) => e.organizer === club.name);

  return (
    <div className="space-y-6">
      <Link to="/clubs" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
        <Icon name="back" className="h-4 w-4" />Back to clubs
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-br from-[#EEF4FF] to-[#E4E8FF] sm:h-44" />
        <div className="p-6 sm:p-8">
          <div className="-mt-16 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-[#5877D9] text-3xl font-bold text-white shadow-sm">
            {club.name[0]}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{club.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <Badge>{club.category}</Badge>
                <span className="flex items-center gap-1.5"><Icon name="users" className="h-4 w-4" />{club.members + (joined && !club.joined ? 1 : 0)} members</span>
                <span>Faculty coordinator: {club.coordinator}</span>
              </div>
            </div>
            {joined ? (
              <Button variant="soft" disabled><Icon name="check" className="h-4 w-4" />Joined</Button>
            ) : (
              <Button onClick={() => setJoined(true)}>Join club</Button>
            )}
          </div>
          <p className="mt-5 max-w-2xl leading-relaxed text-slate-600">{club.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Activities</h2>
          <ul className="space-y-3">
            {club.activities.map((a) => (
              <li key={a} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF4FF] text-[#5877D9]"><Icon name="check" className="h-3.5 w-3.5" /></span>{a}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Upcoming events</h2>
          {clubEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming events from this club yet.</p>
          ) : (
            <div className="space-y-3">
              {clubEvents.map((e) => (
                <Link key={e._id} to={`/events/${e._id}`} className="block rounded-xl bg-[#F6F8FC] p-4 hover:bg-[#EEF4FF]">
                  <p className="font-semibold text-slate-800">{e.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(e.date)} · {e.venue}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}