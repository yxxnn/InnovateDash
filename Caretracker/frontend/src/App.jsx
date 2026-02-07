import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PwidHome from "./pages/PwidHome";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import Login from "./pages/Login";
import CaregiverLogin from "./pages/CaregiverLogin";
import UserSignup from "./pages/UserSignup";
import CaregiverSignup from "./pages/CaregiverSignup";
import Insights from "./pages/Insights";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/caregiver" element={<CaregiverLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/caregiver/signup" element={<CaregiverSignup />} />
      <Route path="/login/face" element={<div style={{ padding: 20 }}>Face Login - Coming Soon</div>} />
      <Route path="/login/code" element={<div style={{ padding: 20 }}>Code Login - Coming Soon</div>} />
      <Route path="/help" element={<div style={{ padding: 20 }}>Help Page - Coming Soon</div>} />
      <Route path="/pwid" element={<PwidHome />} />
      <Route path="/caregiver" element={<CaregiverDashboard />} />
      <Route path="*" element={<div style={{ padding: 20 }}>404 Not Found</div>} />
      <Route path="/insights" element={<Insights />} />
    </Routes>
  );
}
