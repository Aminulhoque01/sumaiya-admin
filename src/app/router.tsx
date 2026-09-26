 
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
import EditProject from "../pages/projects/EditProject";
import Categories from "../pages/categories/Categories";
import Services from "../pages/services/Services";
import Skills from "../pages/skills/Skills";
import Experience from "../pages/experience/Experience";
import Testimonials from "../pages/testimonials/Testimonials";
import Profile from "../pages/profile/Profile";
import Contacts from "../pages/contacts/Contacts";

 

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

    <Route path="/admin/projects/edit/:id" element={ <ProtectedRoute> <AdminLayout> <EditProject /> </AdminLayout> </ProtectedRoute> } />
    <Route path="/admin/categories" element={ <ProtectedRoute> <AdminLayout> <Categories /> </AdminLayout> </ProtectedRoute> } />
    <Route
  path="/admin/services"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Services />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/skills"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Skills />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/testimonials"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Testimonials />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/experience"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Experience />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/profile"
  element={
    <AdminLayout>
      <Profile />
    </AdminLayout>
  }
/>

<Route
  path="/admin/contacts"
  element={
    <AdminLayout>
      <Contacts />
    </AdminLayout>
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
 
