import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { events } from "../data/mockData";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { formatDate } from "../utils/format";

const statusTone = { Open: "green", "Filling fast": "amber", Closed: "gray" };

export default function EventDetails() {
  const { id } = useParams();
  // TODO (backend): replace with api.get(`/api/events/${id}`)
  const event = events.find((e) => e._id === id);
  const [registered, setRegistered] = useState(event?.registered || false);

  if (!event) return <EmptyState icon="calendar" title="Event not found" action={<Link to="/events"><Button>Back to events</Button></Link>} />;

  const info = [
    { icon: "calendar", label: "Date", value: formatDate(event.date) },
    { icon: "clock", label: "Time", value: event.time },
    { icon: "pin", label: "Venue", value: event.venue },
    { icon: "users", label: "Organizer", value: event.organizer },
  ];

  return (
    <div className="space-y-6">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
        <Icon name="back" className="h-4 w-4" />Back to events
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-br from-[#EEF4FF] to-[#E4E8FF] sm:h-44" />
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-2"><Badge>{event.category}</Badge><Badge tone={statusTone[event.status]}>{event.status}</Badge></div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{event.title}</h1>
            <h2 className="mb-2 mt-6 font-semibold text-slate-800">About this event</h2>
            <p className="leading-relaxed text-slate-600">{event.description}</p>
          </div>

          <aside className="space-y-4 rounded-2xl bg-[#F6F8FC] p-5">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#5877D9]"><Icon name={i.icon} className="h-4 w-4" /></span>
                <div><p className="text-xs text-slate-500">{i.label}</p><p className="text-sm font-semibold text-slate-800">{i.value}</p></div>
              </div>
            ))}
            <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">{event.participants + (registered && !event.registered ? 1 : 0)}</span> participants registered</p>
            {registered ? (
              <Button variant="soft" full disabled><Icon name="check" className="h-4 w-4" />You are registered</Button>
            ) : (
              <Button full disabled={event.status === "Closed"} onClick={() => setRegistered(true)}>
                {event.status === "Closed" ? "Registration closed" : "Register for event"}
              </Button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}