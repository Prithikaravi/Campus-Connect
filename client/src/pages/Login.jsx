import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../components/Icon";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Go straight to your home page.
  if (isAuthenticated) return <Navigate to={roleHome[user?.role] || "/dashboard"} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Enter your email and password.");
    setLoading(true);
    try {
      const loggedIn = await login(form.email.trim(), form.password, remember);
      navigate(roleHome[loggedIn.role] || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in. Check your details and that the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#F6F8FC] lg:grid-cols-2">
      {/* Branded side (hidden on small screens) */}
      <div className="hidden flex-col justify-between bg-[#EEF4FF] p-12 lg:flex">
        <Logo subtitle />
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight text-slate-800">
            Your campus, connected.
          </h2>
          <p className="mt-4 max-w-md text-slate-600">
            Join clubs, register for events and build your Student Growth Passport.
          </p>
          <div className="mt-8 max-w-sm space-y-3">
            {["Discover clubs and events", "Get announcements instantly", "Track your growth"].map((t) => (
              <div key={t} className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-3 text-sm font-medium text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5877D9] text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">CampusConnect College Community Portal</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo subtitle /></div>
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your CampusConnect account.</p>

            {location.state?.registered && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Account created. Sign in to continue.</p>
            )}
            {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Email" type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} autoComplete="email" />
              <Input
                label="Password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password"
                value={form.password} onChange={handleChange} autoComplete="current-password"
                right={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                  </button>
                }
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#5877D9]" />
                  Remember me
                </label>
                <button type="button" className="font-medium text-[#5877D9] hover:underline" onClick={() => alert("Password reset is not available yet.")}>
                  Forgot password?
                </button>
              </div>
              <Button type="submit" full disabled={loading} className="py-3">{loading ? "Signing in..." : "Sign in"}</Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to CampusConnect? <Link to="/register" className="font-semibold text-[#5877D9] hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}