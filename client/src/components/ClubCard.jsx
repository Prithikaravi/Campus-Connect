import { Link } from "react-router-dom";
import Icon from "./Icon";
import Badge from "./Badge";
import Button from "./Button";

export default function ClubCard({ club, joined, onJoin }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4FF] text-lg font-bold text-[#5877D9]">
          {club.name[0]}
        </div>
        <Badge>{club.category}</Badge>
      </div>
      <Link to={`/clubs/${club._id}`} className="text-lg font-semibold text-slate-800 hover:text-[#5877D9]">
        {club.name}
      </Link>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{club.description}</p>
      <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <Icon name="users" className="h-4 w-4 text-slate-400" />{club.members} members
      </p>
      <div className="mt-4 flex gap-2">
        {joined ? (
          <Button variant="soft" full disabled><Icon name="check" className="h-4 w-4" />Joined</Button>
        ) : (
          <Button full onClick={() => onJoin?.(club._id)}>Join club</Button>
        )}
        <Link to={`/clubs/${club._id}`}><Button variant="secondary">View</Button></Link>
      </div>
    </div>
  );
}