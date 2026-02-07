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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 md:px-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined block text-3xl">
              diversity_1
            </span>
          </div>
          <h1 className="text-[#0e1b0e] dark:text-white text-2xl font-bold tracking-tight">
            Companion
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-6 py-2 rounded-full font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">help</span>
            Support
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-16 max-w-2xl">
          <h2 className="text-[#0e1b0e] dark:text-white text-4xl md:text-5xl font-bold leading-tight mb-4">
            Hello! How can we help you today?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xl">
            Choose the option that best describes you to get started.
          </p>
        </div>

        {/* Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* User Card */}
          <button
            onClick={handleUserPath}
            className="gateway-card group relative flex flex-col items-center bg-white dark:bg-zinc-900 border-2 border-accent-green dark:border-zinc-800 p-10 rounded-[2.5rem] shadow-xl shadow-green-900/5 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/10 text-center cursor-pointer hover:scale-105"
          >
            <div className="illustration-circle size-48 md:size-56 bg-primary/10 rounded-full flex items-center justify-center mb-10 transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-primary text-[120px]">
                person
              </span>
            </div>
            <h3 className="text-[#0e1b0e] dark:text-white text-3xl font-bold mb-4">
              I am a User
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xs">
              I want to manage my daily routines and live independently.
            </p>
            <div className="mt-8 size-14 bg-primary text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                arrow_forward
              </span>
            </div>
          </button>

          {/* Caregiver Card */}
          <button
            onClick={handleCaregiverPath}
            className="gateway-card group relative flex flex-col items-center bg-white dark:bg-zinc-900 border-2 border-accent-green dark:border-zinc-800 p-10 rounded-[2.5rem] shadow-xl shadow-green-900/5 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/10 text-center cursor-pointer hover:scale-105"
          >
            <div className="illustration-circle size-48 md:size-56 bg-primary/10 rounded-full flex items-center justify-center mb-10 transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-primary text-[120px]">
                group
              </span>
            </div>
            <h3 className="text-[#0e1b0e] dark:text-white text-3xl font-bold mb-4">
              I am a Caregiver
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xs">
              I want to support a loved one and help them succeed.
            </p>
            <div className="mt-8 size-14 bg-primary text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                arrow_forward
              </span>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 px-10 text-center">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
          Privacy-first • Secure • Simple
        </p>
        <div className="mt-6 flex justify-center opacity-50 select-none">
          <div className="flex gap-4">
            <div className="size-3 bg-primary/40 rounded-full"></div>
            <div className="size-3 bg-primary/20 rounded-full"></div>
            <div className="size-3 bg-primary/10 rounded-full"></div>
          </div>
        </div>
      </footer>

      {/* Background Blurs */}
      <div className="absolute -z-10 top-20 -left-20 size-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
      <div className="absolute -z-10 bottom-20 -right-20 size-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
    </div>
  );
}
