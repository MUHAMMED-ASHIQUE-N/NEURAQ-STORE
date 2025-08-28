import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import MainAdminApprovals from "./components/MainAdminApprovals";
import AmazonAdminDashboard from "./pages/AmazonAdminDashboard";
import LocalAdminDashboard from "./pages/LocalAdminDashboard";
import SoftwareAdminDashboard from "./pages/SoftwareAdminDashboard";
import AllProducts from "./components/AllProducts";
import ForgotPassword from "./pages/ForgotPassword";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
          path="/admin/all-products"
          element={
            <ProtectedRoute allowedRoles={["main-admin"]}>
              <AllProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/amazon-products"
          element={
            <ProtectedRoute allowedRoles={["main-admin", "amazon-semi-admin"]}>
              <AmazonAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/local-products"
          element={
            <ProtectedRoute allowedRoles={["main-admin", "local-semi-admin"]}>
              <LocalAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/software-products"
          element={
            <ProtectedRoute
              allowedRoles={["main-admin", "software-semi-admin"]}
            >
              <SoftwareAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </>
  );
}
