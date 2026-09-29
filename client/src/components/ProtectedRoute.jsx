import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";

// Usage in App.jsx:
//   <Route element={<ProtectedRoute />}> ... any logged-in user ... </Route>
//   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}> ... admin only ... </Route>
export default function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuth();
  const location = useLocation();

  // No token -> go to login
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  // Wrong role -> send them to their own home page
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={roleHome[user?.role] || "/login"} replace />;
  }

  return <Outlet />;
}