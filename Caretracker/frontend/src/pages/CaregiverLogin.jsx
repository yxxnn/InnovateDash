import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CaregiverLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/caregiver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Successful login
      localStorage.setItem("caregiverToken", data.token);
      if (rememberMe) {
        localStorage.setItem("rememberDevice", "true");
      }
      navigate("/caregiver");
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
            Companion
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
                  admin_panel_settings
                </span>
              </div>
              <h1 className="text-zinc-900 text-2xl font-bold">
                Caregiver Portal
              </h1>
              <p className="text-zinc-500 text-sm mt-2">
                Professional login for routine management and support.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-zinc-700 text-sm font-semibold"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-xs font-semibold text-[#19e619] hover:underline"
                    href="#"
                  >
                    Forgot password?
                  </a>
                </div>
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
                    autoComplete="current-password"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Remember Device Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-[#19e619] focus:ring-[#19e619]"
                />
                <label
                  className="ml-2 block text-sm text-zinc-600"
                  htmlFor="remember-me"
                >
                  Remember this device
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#19e619] hover:bg-[#15c213] disabled:bg-zinc-400 text-zinc-900 text-sm font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.99] shadow-md shadow-[#19e619]/10 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Logging in..." : "Secure Login"}</span>
                <span className="material-symbols-outlined text-xl">login</span>
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

          {/* Switch to User Login */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-zinc-500">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/caregiver/signup")}
                className="text-[#19e619] font-bold hover:underline"
              >
                Create an account
              </button>
            </p>
            <p className="text-sm text-zinc-500">
              Are you a companion user?{" "}
              <button
                onClick={() => navigate("/?switchToUser=true")}
                className="text-[#19e619] font-bold hover:underline"
              >
                Switch to User Login
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-10 text-center text-zinc-400 text-xs">
        <p>© 2024 Companion Independent Living. All rights reserved.</p>
      </footer>

      {/* Background Blurs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#19e619]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#19e619]/5 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
