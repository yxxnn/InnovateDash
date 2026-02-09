import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE } from "../api";

export default function AddResident() {
  const navigate = useNavigate();
  const caregiverId = localStorage.getItem("caregiverId");
  const [residentCode, setResidentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!residentCode.trim()) {
      setError("Please enter a resident code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE}/caregiver/${caregiverId}/residents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ residentCode: residentCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add resident. Please check the code and try again.");
        return;
      }

      // Successful addition
      setSuccess("Resident added successfully! Redirecting...");
      setTimeout(() => {
        navigate("/caregiver");
      }, 2000);
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-background-light border-b border-slate-100">
        <button 
          onClick={() => navigate("/caregiver")} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary p-1.5 rounded text-white">
            <span className="material-symbols-outlined block text-2xl">
              diversity_1
            </span>
          </div>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">
            CompanionCare
          </h2>
        </button>
        <button 
          onClick={() => navigate("/caregiver")}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 pt-32">
        <div className="w-full max-w-[480px]">
          <div className="bg-white shadow-md rounded-2xl border border-slate-100 p-8 md:p-10">
            {/* Form Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">
                  person_add
                </span>
              </div>
              <h1 className="text-slate-900 text-3xl font-bold">
                Add New Resident
              </h1>
              <p className="text-slate-500 text-base mt-3 leading-relaxed">
                Enter your resident's special code to add them to your care list
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  {success}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-700 font-bold text-sm mb-2">
                  Resident Code
                </label>
                <input
                  type="text"
                  value={residentCode}
                  onChange={(e) => setResidentCode(e.target.value.toUpperCase())}
                  placeholder="Enter unique resident code"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder-slate-400 font-medium text-lg tracking-wide"
                  disabled={loading}
                />
                <p className="text-slate-500 text-xs mt-2">
                  The resident should provide you with their unique code
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !residentCode.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Resident...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Resident
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Help & Support</span>
              </div>
            </div>

            {/* Help Section */}
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">help</span>
                  Where to find the code?
                </p>
                <p className="text-slate-600">
                  Ask your resident or care facility administrator for their unique resident code. Each resident receives this code during registration.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">lock</span>
                  Is it secure?
                </p>
                <p className="text-slate-600">
                  Yes, each code is unique and can only be used once. After a resident is added, they cannot be re-added with the same code.
                </p>
              </div>
            </div>

            {/* Footer Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-600 text-sm">
                Having trouble?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/caregiver")}
                  className="text-primary font-bold hover:underline"
                >
                  Return to Dashboard
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
