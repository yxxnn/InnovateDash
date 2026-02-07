import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleUserPath = () => {
    navigate("/login?role=user");
  };

  const handleCaregiverPath = () => {
    navigate("/login?role=caregiver");
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#f6f8f6] dark:bg-[#112111] transition-colors duration-300" style={{ backgroundColor: "#f6f8f6" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#19e619] p-1.5 rounded-lg text-white">
            <span className="material-symbols-outlined block text-2xl">
              diversity_1
            </span>
          </div>
          <h1 className="text-[#0e1b0e] text-xl font-bold tracking-tight">
            Companion
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-white border border-[#e0e0e0] px-4 py-1.5 rounded-full font-semibold text-[#666] text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">help</span>
            Support
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="text-center mb-8 max-w-2xl">
          <h2 className="text-[#0e1b0e] text-3xl md:text-4xl font-bold leading-tight mb-3">
            Hello! How can we help you today?
          </h2>
          <p className="text-[#666] text-base md:text-lg">
            Choose the option that best describes you to get started.
          </p>
        </div>

        {/* Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* User Card */}
          <button
            onClick={handleUserPath}
            className="group relative flex flex-col items-center bg-white border-2 border-[#e7f3e7] p-6 rounded-3xl shadow-lg transition-all hover:border-[#19e619] hover:shadow-xl text-center cursor-pointer hover:scale-105"
          >
            <div className="bg-[#e7f3e7] size-28 md:size-32 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
              <span className="material-symbols-outlined text-[#19e619] text-6xl md:text-7xl">
                person
              </span>
            </div>
            <h3 className="text-[#0e1b0e] text-2xl md:text-2xl font-bold mb-2">
              I am a User
            </h3>
            <p className="text-[#999] text-sm md:text-base max-w-xs mb-4">
              I want to manage my daily routines and live independently.
            </p>
            <div className="size-10 md:size-12 bg-[#19e619] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">
                arrow_forward
              </span>
            </div>
          </button>

          {/* Caregiver Card */}
          <button
            onClick={handleCaregiverPath}
            className="group relative flex flex-col items-center bg-white border-2 border-[#e7f3e7] p-6 rounded-3xl shadow-lg transition-all hover:border-[#19e619] hover:shadow-xl text-center cursor-pointer hover:scale-105"
          >
            <div className="bg-[#e7f3e7] size-28 md:size-32 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
              <span className="material-symbols-outlined text-[#19e619] text-6xl md:text-7xl">
                group
              </span>
            </div>
            <h3 className="text-[#0e1b0e] text-2xl md:text-2xl font-bold mb-2">
              I am a Caregiver
            </h3>
            <p className="text-[#999] text-sm md:text-base max-w-xs mb-4">
              I want to support a loved one and help them succeed.
            </p>
            <div className="size-10 md:size-12 bg-[#19e619] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">
                arrow_forward
              </span>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center flex-shrink-0">
        <p className="text-[#999] text-xs md:text-sm font-medium">
          Privacy-first • Secure • Simple
        </p>
        <div className="mt-3 flex justify-center opacity-50 select-none">
          <div className="flex gap-2">
            <div className="size-2 bg-[#19e619]/40 rounded-full"></div>
            <div className="size-2 bg-[#19e619]/20 rounded-full"></div>
            <div className="size-2 bg-[#19e619]/10 rounded-full"></div>
          </div>
        </div>
      </footer>

      {/* Background Blurs */}
      <div className="absolute -z-10 top-10 -left-20 size-80 bg-[#19e619]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -z-10 bottom-10 -right-20 size-96 bg-[#19e619]/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
