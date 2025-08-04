import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import AmazonProducts from "./pages/AmazonProducts";
import LocalProducts from "./pages/LocalProducts";
import SoftwareProducts from "./pages/SoftwareProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import MainAdminApprovals from "./components/MainAdminApprovals";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["main-admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={["main-admin"]}>
              <MainAdminApprovals />
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
            <ProtectedRoute
              allowedRoles={["main-admin", "software-semi-admin"]}
            >
              <SoftwareProducts />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </>
  );
}
