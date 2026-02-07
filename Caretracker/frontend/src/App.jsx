import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PwidHome from "./pages/PwidHome";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import Login from "./pages/Login";
import Insights from "./pages/Insights";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pwid" element={<PwidHome />} />
      <Route path="/caregiver" element={<CaregiverDashboard />} />
      <Route path="*" element={<div style={{ padding: 20 }}>404 Not Found</div>} />
      <Route path="/insights" element={<Insights />} />
    </Routes>
  );
}
