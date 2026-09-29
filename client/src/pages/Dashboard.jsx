import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { events, clubs, announcements, growthPassport } from "../data/mockData";
import StatCard from "../components/StatCard";
import AnnouncementCard from "../components/AnnouncementCard";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Button from "../components/Button";

const quickActions = [
  { to: "/clubs", label: "Explore clubs", icon: "users" },
  { to: "/events", label: "Browse events", icon: "calendar" },
  { to: "/announcements", label: "View announcements", icon: "megaphone" },
  { to: "/profile", label: "Update profile", icon: "user" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";
  const upcoming = events.filter((e) => e.status !== "Closed").slice(0, 3);
  const myClubs = clubs.filter((c) => c.joined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">Here is what is happening on campus today.</p>
      </div>

      {/* Student Growth Passport (mock data) */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Student Growth Passport</h2>
            <p className="text-sm text-slate-500">Your campus journey at a glance.</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-[#5877D9]">{growthPassport.engagementScore}</p>
            <p className="text-xs text-slate-500">Engagement score</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#EEF4FF]">
          <div className="h-2 rounded-full bg-[#5877D9]" style={{ width: `${growthPassport.engagementScore}%` }} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Clubs" value={growthPassport.clubs} icon="users" />
          <StatCard label="Events attended" value={growthPassport.eventsAttended} icon="calendar" />
          <StatCard label="Achievements" value={growthPassport.achievements} icon="award" />
          <StatCard label="Skills" value={growthPassport.skills} icon="check" />
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#5877D9]/40">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#5877D9]"><Icon name={a.icon} /></span>
            {a.label}
          </Link>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming events */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming events</h2>
            <Link to="/events" className="text-sm font-medium text-[#5877D9] hover:underline">See all</Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon="calendar" title="No upcoming events" message="New events will show up here." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((e) => (
                <Link key={e._id} to={`/events/${e._id}`} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-[#5877D9]/40">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EEF4FF] text-[#4a68c7]">
                    <span className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</span>
                    <span className="text-xs">{new Date(e.date).toLocaleString("en-IN", { month: "short" })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{e.title}</p>
                    <p className="truncate text-sm text-slate-500">{e.venue} · {e.organizer}</p>
                  </div>
                  <Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* My clubs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">My clubs</h2>
            <Link to="/clubs" className="text-sm font-medium text-[#5877D9] hover:underline">Explore</Link>
          </div>
          {myClubs.length === 0 ? (
            <EmptyState icon="users" title="No clubs yet" message="Join a club to see it here."
              action={<Link to="/clubs"><Button>Explore clubs</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {myClubs.map((c) => (
                <Link key={c._id} to={`/clubs/${c._id}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-[#5877D9]/40">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] font-bold text-[#5877D9]">{c.name[0]}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent announcements */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Recent announcements</h2>
          <Link to="/announcements" className="text-sm font-medium text-[#5877D9] hover:underline">See all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.slice(0, 2).map((a) => <AnnouncementCard key={a._id} item={a} compact />)}
        </div>
      </section>
    </div>
  );
}