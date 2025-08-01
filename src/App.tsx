import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import AmazonProducts from "./pages/AmazonProducts";
import LocalProducts from "./pages/LocalProducts";
import SoftwareProducts from "./pages/SoftwareProducts";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["main-admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/amazon-products"
        element={
          <ProtectedRoute allowedRoles={["main-admin", "amazon-semi-admin"]}>
            <AmazonProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/local-products"
        element={
          <ProtectedRoute allowedRoles={["main-admin", "local-semi-admin"]}>
            <LocalProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/software-products"
        element={
          <ProtectedRoute allowedRoles={["main-admin", "software-semi-admin"]}>
            <SoftwareProducts />
          </ProtectedRoute>
        }
      />
      {/* Add other routes here */}
      <Route path="*" element={<Unauthorized />} />
    </Routes>
  );
}
