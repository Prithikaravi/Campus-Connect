import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../components/Icon";

// Admin is intentionally NOT in this list.
const roles = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "club", label: "Club" },
];

export default function Register() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "student" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={roleHome[user?.role] || "/dashboard"} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = "Use at least one letter and one number.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not create your account. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#F6F8FC] lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#EEF4FF] p-12 lg:flex">
        <Logo subtitle />
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight text-slate-800">Join your campus community.</h2>
          <p className="mt-4 max-w-md text-slate-600">Create an account to explore clubs, register for events and follow campus news.</p>
          <div className="mt-8 flex max-w-sm items-start gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-600">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-[#5877D9]" />
            Use your college email. Administrator accounts are created by the college.
          </div>
        </div>
        <p className="text-xs text-slate-500">CampusConnect College Community Portal</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo subtitle /></div>
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">It takes less than a minute.</p>
            {serverError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{serverError}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input label="Full name" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} error={errors.name} />
              <Input label="College email" type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} error={errors.email} />
              <Input
                label="Password" type={showPassword ? "text" : "password"} name="password" placeholder="At least 8 characters"
                value={form.password} onChange={handleChange} error={errors.password}
                right={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                  </button>
                }
              />
              <Input label="Confirm password" type={showPassword ? "text" : "password"} name="confirm" placeholder="Re-enter your password" value={form.confirm} onChange={handleChange} error={errors.confirm} />

              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">I am a</label>
                <select id="role" name="role" value={form.role} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#5877D9] focus:outline-none focus:ring-2 focus:ring-[#5877D9]/30">
                  {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <Button type="submit" full disabled={loading} className="py-3">{loading ? "Creating account..." : "Create account"}</Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-semibold text-[#5877D9] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}