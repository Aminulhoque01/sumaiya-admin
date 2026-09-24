 
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

 

export default function Router() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* Protected */}
      <Route
        path="/admin/dashboard"
        element={<Dashboard />}
      />

      {/* Default */}
      <Route
        path="/"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      {/* 404 */}
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
 
