import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { loginUser } from "../../api/auth";
import { getHomePathForRole } from "../../context/auth-context";
import AuthVisualAside from "../../components/auth/AuthVisualAside";

const inputClass =
  "h-12 w-full rounded-lg border border-[#dce2ec] bg-white px-4 text-sm text-[#1d2433] shadow-[0_2px_5px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#9298a5] focus:border-[#1f6fd1] focus:ring-4 focus:ring-[#1f6fd1]/15 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(getHomePathForRole(user.role), { replace: true });
  }, [navigate, user]);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.ac\.za$/i.test(value.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please use your CPUT email address (e.g. 221234567@mycput.ac.za)");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const authResponse = await loginUser({ email: email.trim(), password });
      login(authResponse);
      navigate(getHomePathForRole(authResponse.role), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f6f8fb] font-sans text-[#1d2433] lg:grid-cols-2">
      <AuthVisualAside />

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-14" aria-labelledby="login-title">
        <div className="w-full max-w-[450px]">
          <header className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1f6fd1] lg:hidden">UniVent</p>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#1f6fd1]">Welcome back</p>
            <h1 id="login-title" className="text-3xl font-bold leading-tight tracking-[-0.025em]">Sign in to UniVent</h1>
            <p className="mt-2 text-sm leading-6 text-[#6b7385]">Use your CPUT account to discover events, manage registrations and keep up with campus life.</p>
          </header>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2.5">
              <label htmlFor="email" className="text-sm font-semibold">CPUT email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="student@mycput.ac.za" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} aria-describedby="email-hint" className={inputClass} />
              <span id="email-hint" className="text-xs leading-5 text-[#6b7385]">Use your university email ending in .ac.za</span>
            </div>

            <div className="grid gap-2.5">
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} className={inputClass} />
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password} className="mt-1 min-h-12 w-full rounded-lg bg-[#1f6fd1] text-sm font-bold text-white shadow-[0_4px_12px_rgba(31,111,209,0.22)] transition hover:bg-[#195fb3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f6fd1]/20 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 border-t border-[#e3e7ef] pt-6">
            <p className="text-sm text-[#6b7385]">
              New to UniVent?{" "}
              <Link to="/register" className="font-semibold text-[#1f6fd1] hover:text-[#195fb3] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f6fd1]/20">Create an account</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
