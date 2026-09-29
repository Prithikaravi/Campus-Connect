import { Link } from "react-router-dom";
import Icon from "./Icon";
import Badge from "./Badge";
import Button from "./Button";
import { formatDate } from "../utils/format";

const statusTone = { Open: "green", "Filling fast": "amber", Closed: "gray" };

export default function EventCard({ event, registered, onRegister }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <Badge>{event.category}</Badge>
        <Badge tone={statusTone[event.status] || "gray"}>{event.status}</Badge>
      </div>
      <Link to={`/events/${event._id}`} className="text-lg font-semibold text-slate-800 hover:text-[#5877D9]">
        {event.title}
      </Link>
      <p className="mt-1 text-sm text-slate-500">by {event.organizer}</p>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2"><Icon name="calendar" className="h-4 w-4 text-slate-400" />{formatDate(event.date)}, {event.time}</p>
        <p className="flex items-center gap-2"><Icon name="pin" className="h-4 w-4 text-slate-400" />{event.venue}</p>
      </div>
      <div className="mt-5 flex gap-2 pt-1">
        {registered ? (
          <Button variant="soft" full disabled><Icon name="check" className="h-4 w-4" />Registered</Button>
        ) : (
          <Button full disabled={event.status === "Closed"} onClick={() => onRegister?.(event._id)}>
            {event.status === "Closed" ? "Registration closed" : "Register"}
          </Button>
        )}
        <Link to={`/events/${event._id}`}><Button variant="secondary">Details</Button></Link>
      </div>
    </div>
  );
}