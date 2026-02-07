import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PwidHome from "./pages/PwidHome";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import Login from "./pages/Login";
import CaregiverLogin from "./pages/CaregiverLogin";
import UserLogin from "./pages/UserLogin";
import FaceLogin from "./pages/FaceLogin";
import UserSignup from "./pages/UserSignup";
import CaregiverSignup from "./pages/CaregiverSignup";
import CaregiverProfile from "./pages/CaregiverProfile";
import UserProfile from "./pages/UserProfile";
import Insights from "./pages/Insights";
import Streaks from "./pages/Streaks";
import UserTasks from "./pages/UserTasks";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/caregiver" element={<CaregiverLogin />} />
      <Route path="/login/face" element={<FaceLogin />} />
      <Route path="/login/code" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/caregiver/signup" element={<CaregiverSignup />} />
      <Route path="/caregiver/profile" element={<CaregiverProfile />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/pwid" element={<PwidHome />} />
      <Route path="/user-tasks" element={<UserTasks />} />
      <Route path="/streaks" element={<Streaks />} />
      <Route path="/caregiver" element={<CaregiverDashboard />} />
      <Route path="*" element={<div style={{ padding: 20 }}>404 Not Found</div>} />
      <Route path="/insights" element={<Insights />} />
    </Routes>
  );
}
