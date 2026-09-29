import { useAuth } from "../context/AuthContext";
import { studentProfile, clubs } from "../data/mockData";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Icon from "../components/Icon";
import { formatDate, initials } from "../utils/format";

// Small titled card used for each section of the profile
function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

export default function Profile() {
  const { user } = useAuth();
  // TODO (backend): replace studentProfile with api.get("/api/users/me")
  const p = studentProfile;
  const myClubs = clubs.filter((c) => c.joined);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#EEF4FF] text-3xl font-bold text-[#4a68c7]">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{user?.name || "Your name"}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="mt-2 text-sm text-slate-600">{p.department} · {p.year}</p>
          </div>
          <Button variant="secondary" onClick={() => alert("Edit profile will be connected to the backend soon.")}>Edit profile</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Interests">
          <div className="flex flex-wrap gap-2">{p.interests.map((i) => <Badge key={i}>{i}</Badge>)}</div>
        </Section>
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">{p.skills.map((s) => <Badge key={s} tone="gray">{s}</Badge>)}</div>
        </Section>
        <Section title="Clubs">
          <div className="space-y-3">
            {myClubs.map((c) => (
              <div key={c._id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF4FF] font-bold text-[#5877D9]">{c.name[0]}</span>
                <div><p className="text-sm font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-500">{c.category}</p></div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Achievements">
          <ul className="space-y-3">
            {p.achievements.map((a) => (
              <li key={a} className="flex items-center gap-3 text-sm text-slate-600">
                <Icon name="award" className="h-5 w-5 shrink-0 text-[#5877D9]" />{a}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Events attended">
        <div className="divide-y divide-slate-100">
          {p.eventsAttended.map((e) => (
            <div key={e.title} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-slate-800">{e.title}</span>
              <span className="text-slate-500">{formatDate(e.date)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}