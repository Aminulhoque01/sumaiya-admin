 
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";

 
export default function Router() {
  return (
    <Routes>
      {/* =========================
          Public Routes
      ========================== */}

      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* =========================
          Protected Routes
      ========================== */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Default
      ========================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      {/* =========================
          404
      ========================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />
    </Routes>
  );
}
 
