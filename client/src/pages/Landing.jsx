import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import Icon from "../components/Icon";

const features = [
  { icon: "users", title: "Find your clubs", text: "Browse every club on campus, see what they do and join in one click." },
  { icon: "calendar", title: "Never miss an event", text: "Search events by category and date, then register in seconds." },
  { icon: "megaphone", title: "Stay informed", text: "Official announcements and club updates arrive in one place." },
  { icon: "award", title: "Build your Growth Passport", text: "Every club, event and achievement adds to your student profile." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/register"><Button>Create account</Button></Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-slate-800 sm:text-5xl">
            Everything happening on campus, in one place.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-500">
            CampusConnect brings students, faculty, clubs and administrators together so you can discover
            events, join communities and track your growth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register"><Button className="px-6 py-3">Get started</Button></Link>
            <Link to="/login"><Button variant="secondary" className="px-6 py-3">Sign in</Button></Link>
          </div>
        </div>

        {/* Preview card of the Growth Passport */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-indigo-100/50">
          <p className="text-sm font-medium text-slate-500">Student Growth Passport</p>
          <p className="mt-2 text-5xl font-bold text-[#5877D9]">78</p>
          <p className="text-sm text-slate-500">Engagement score</p>
          <div className="mt-4 h-2 rounded-full bg-[#EEF4FF]"><div className="h-2 w-[78%] rounded-full bg-[#5877D9]" /></div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[["3", "Clubs"], ["8", "Events"], ["5", "Awards"]].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-[#F6F8FC] py-3">
                <p className="text-xl font-bold text-slate-800">{n}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#5877D9]">
                <Icon name={f.icon} />
              </div>
              <h3 className="font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}