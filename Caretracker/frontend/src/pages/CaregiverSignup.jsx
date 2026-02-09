import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE } from "../api";

export default function CaregiverSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE}/caregiver/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      // Successful signup
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login/caregiver");
      }, 2000);
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f9f0]" style={{ backgroundColor: "#f0f9f0" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-[#f0f9f0]" style={{ backgroundColor: "#f0f9f0" }}>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-[#19e619] p-1.5 rounded text-white">
            <span className="material-symbols-outlined block text-2xl">
              diversity_1
            </span>
          </div>
          <h2 className="text-[#0e1b0e] text-xl font-bold tracking-tight">
            CompanionCare
          </h2>
        </button>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white border-2 border-[#19e619]/20 px-4 py-1.5 rounded-full font-bold text-[#444] hover:bg-gray-50 transition-colors shadow-sm text-sm">
            <span className="material-symbols-outlined text-lg">help</span>
            How it works
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 pt-28">
        <div className="w-full max-w-[440px]">
          <div className="bg-white shadow-xl shadow-black/5 rounded-xl border border-zinc-200 p-8 md:p-10">
            {/* Form Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#e7f3e7] rounded-full mb-4">
                <span className="material-symbols-outlined text-[#19e619] text-3xl">
                  person_add
                </span>
              </div>
              <h1 className="text-zinc-900 text-2xl font-bold">
                Create Your Account
              </h1>
              <p className="text-zinc-500 text-sm mt-2">
                Professional caregiver registration for task management.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  className="block text-zinc-700 text-sm font-semibold mb-2"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">
                      person
                    </span>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  className="block text-zinc-700 text-sm font-semibold mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">
                      mail
                    </span>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    autoComplete="email"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  className="block text-zinc-700 text-sm font-semibold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">
                      lock
                    </span>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  className="block text-zinc-700 text-sm font-semibold mb-2"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">
                      lock_check
                    </span>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#19e619] hover:bg-[#15c213] disabled:bg-zinc-400 text-zinc-900 text-sm font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.99] shadow-md shadow-[#19e619]/10 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Creating account..." : "Create Account"}</span>
                <span className="material-symbols-outlined text-xl">
                  person_add
                </span>
              </button>
            </form>

            {/* Security Message */}
            <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
              <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">shield</span>
                Encrypted, HIPAA-compliant connection
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login/caregiver")}
                className="text-[#19e619] font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-10 text-center text-zinc-400 text-xs">
        <p>© 2024 CompanionCare. All rights reserved.</p>
      </footer>

      {/* Background Blurs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#19e619]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#19e619]/5 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
