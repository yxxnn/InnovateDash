import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "user";

  // Redirect caregivers to caregiver login
  useEffect(() => {
    if (role === "caregiver") {
      navigate("/login/caregiver");
    }
  }, [role, navigate]);

  const handleFaceLogin = () => {
    navigate(`/login/face?role=${role}`);
  };

  const handleCodeLogin = () => {
    navigate(`/login/code?role=${role}`);
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div
      className="relative w-full min-h-screen flex flex-col bg-[#f0f9f0] transition-colors duration-300"
      style={{ backgroundColor: "#f0f9f0" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#19e619] p-1.5 rounded-lg text-white">
            <span className="material-symbols-outlined block text-2xl">
              diversity_1
            </span>
          </div>
          <h2 className="text-[#0e1b0e] text-xl font-bold tracking-tight">
            Companion
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white border-2 border-[#19e619]/20 px-4 py-1.5 rounded-full font-bold text-[#444] hover:bg-gray-50 transition-colors shadow-sm text-sm">
            <span className="material-symbols-outlined text-lg">help</span>
            How it works
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-3xl text-center mb-8">
          <h1 className="text-[#0e1b0e] text-3xl md:text-4xl font-bold leading-tight mb-3">
            Hello! How do you want to sign in?
          </h1>
          <p className="text-[#666] text-base md:text-lg">
            Pick the one that is easiest for you.
          </p>
        </div>

        {/* Login Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4 mb-8">
          {/* Face Login Card */}
          <button
            onClick={handleFaceLogin}
            className="flex flex-col items-center justify-center bg-white border-4 border-transparent hover:border-[#19e619] p-8 rounded-xl shadow-lg transition-all group active:scale-95"
          >
            <div className="size-32 bg-[#e7f3e7] rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#19e619] text-6xl">
                face
              </span>
            </div>
            <span className="text-2xl font-bold text-[#0e1b0e]">
              Face Login
            </span>
            <p className="mt-3 text-[#999] text-base">Use your camera</p>
          </button>

          {/* Name and Code Login Card */}
          <button
            onClick={handleCodeLogin}
            className="flex flex-col items-center justify-center bg-white border-4 border-transparent hover:border-[#19e619] p-8 rounded-xl shadow-lg transition-all group active:scale-95"
          >
            <div className="size-32 bg-[#e7f3e7] rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#19e619] text-6xl">
                keyboard
              </span>
            </div>
            <span className="text-2xl font-bold text-[#0e1b0e]">
              Name and Code
            </span>
            <p className="mt-3 text-[#999] text-base">Type your details</p>
          </button>
        </div>

        {/* Create Account Button */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-[#666]">
            Don't have an account?{" "}
            <button
              onClick={handleSignup}
              className="text-[#19e619] font-bold hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 flex justify-center opacity-40 select-none flex-shrink-0">
        <div className="flex gap-4">
          <div className="size-3 bg-[#19e619] rounded-full"></div>
          <div className="size-3 bg-[#19e619]/60 rounded-full"></div>
          <div className="size-3 bg-[#19e619]/30 rounded-full"></div>
        </div>
      </footer>

      {/* Background Blurs */}
      <div className="absolute -z-10 top-20 -left-20 size-80 bg-[#19e619]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -z-10 bottom-10 -right-20 size-96 bg-[#19e619]/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
