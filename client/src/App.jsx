import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Announcements from "./pages/Announcements";
import Discussions from "./pages/Discussions";
import Notifications from "./pages/Notifications";
import RoleHome from "./pages/RoleHome";

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages for any logged-in user (sidebar + top bar layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Role-only pages */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/faculty" element={<RoleHome title="Faculty Dashboard" message="Manage your students and department events here." />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["club"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/club" element={<RoleHome title="Club Dashboard" message="Manage your club members, events and updates here." />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<RoleHome title="Admin Dashboard" message="Manage users, clubs, events and announcements here." />} />
        </Route>
      </Route>

      {/* Anything else */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}