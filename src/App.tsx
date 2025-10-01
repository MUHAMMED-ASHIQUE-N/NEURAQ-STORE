import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login-Modules/Login";
import Register from "./pages/Login-Modules/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Unauthorized from "./pages/Login-Modules/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import MainAdminApprovals from "./components/MainAdminApprovals";
import AmazonAdminDashboard from "./pages/Dashboard/AmazonAdminDashboard";
import LocalAdminDashboard from "./pages/Dashboard/LocalAdminDashboard";
import SoftwareAdminDashboard from "./pages/Dashboard/SoftwareAdminDashboard";
import AllProducts from "./components/AllProducts";
import ForgotPassword from "./pages/Login-Modules/ForgotPassword";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import ProductsPage from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CartCheckout from "./pages/CartCheckout";
import Placeholder from "./pages/Placeholder";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import OrdersPage from "./pages/Orders";

const queryClient = new QueryClient();
function ShouldShowNavbar(pathname: string) {
  // Admin routes - add all admin path prefixes here
  const adminPaths = [
    "/admin/dashboard",
    "/admin/approvals",
    "/admin/all-products",
    "/admin/amazon-products",
    "/admin/local-products",
    "/admin/software-products",
    "/admin/approvals",
    "/unauthorized",
    "/forgot-password",
    "*",

    // add additional admin paths as needed
  ];
  const layoutPaths = [
    "/",
    "/products",
    "/product/:id",
    "/cart",
    "/wishlist",
    "/login",
    "/register",
    "/account",
    "/search",
    "/checkout",
    "/orders",
    "/deals",
    "/about",
    "/contact",
    "/blog",
    "/careers",
  ];
  const isAdminRoute = adminPaths.some((adminPath) =>
    pathname.startsWith(adminPath)
  );
  const isLayoutRoute = layoutPaths.some((layoutPath) =>
    pathname.startsWith(layoutPath)
  );
  return isAdminRoute || !isLayoutRoute;
}

export default function App() {
  const location = useLocation();
  const showNavbar = ShouldShowNavbar(location.pathname);
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showNavbar && <Navbar />}
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<CartCheckout />} />
              <Route path="wishlist" element={<Placeholder />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="account" element={<Login />} />
              <Route path="search" element={<ProductsPage />} />
              <Route path="checkout" element={<CartCheckout />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="admin" element={<Placeholder />} />
              <Route path="deals" element={<Placeholder />} />
              <Route path="about" element={<Placeholder />} />
              <Route path="contact" element={<Placeholder />} />
              <Route path="blog" element={<Placeholder />} />
              <Route path="careers" element={<Placeholder />} />
            </Route>
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
                <ProtectedRoute
                  allowedRoles={["main-admin", "amazon-semi-admin"]}
                >
                  <AmazonAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/local-products"
              element={
                <ProtectedRoute
                  allowedRoles={["main-admin", "local-semi-admin"]}
                >
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
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
