 
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Projects from "../pages/projects/Projects";
import CreateProject from "../pages/projects/CreateProject";

 

export default function Router() {
  return (
    <Routes>
      {/* =========================
          Public
      ========================== */}

      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* =========================
          Protected Admin
      ========================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ========================= Projects ========================= */} 
    <Route path="/admin/projects" element={ <ProtectedRoute> <AdminLayout> <Projects /> </AdminLayout> </ProtectedRoute> } />

    <Route path="/admin/projects/new" element={ <ProtectedRoute> <AdminLayout> <CreateProject /> </AdminLayout> </ProtectedRoute> } />

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
 
