import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Pages
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import OTP from "./OTP";
import ResetPassword from "./ResetPassword";

// Layout & Dashboard Pages
import DashboardLayout from "./DashboardLayout";
import Users from "./Users";
import Category from "./Category";
import SubCategory from "./SubCategory";
import Brands from "./Brands";
import Product from "./Product";

// RBAC Protected Route
import ProtectedRoute from "./ProtectedRoute";
import Store from "./Store";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* 1. Dashboard Home (Har logged-in user ko dikhega) */}
          <Route
            index
            element={
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h2 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
                  Dashboard Overview
                </h2>
                <p style={{ color: "#64748b" }}>
                  Welcome to Admin & Staff Panel. Select an option from the sidebar to manage records.
                </p>
              </div>
            }
          />

          {/* 2. Users Module (Sirf SUPER_ADMIN, ADMIN, etc.) */}
          <Route
            path="users"
            element={
              <ProtectedRoute permissionKey="users">
                <Users />
              </ProtectedRoute>
            }
          />

          {/* 3. Store / Inventory Module */}
          <Route
  path="store"
  element={
    <ProtectedRoute permissionKey="store">
      <Store />
    </ProtectedRoute>
  }
/>

          {/* 4. Category Module */}
          <Route
            path="category"
            element={
              <ProtectedRoute permissionKey="category">
                <Category />
              </ProtectedRoute>
            }
          />

          {/* 5. Sub-Category Module */}
          <Route
            path="sub-category"
            element={
              <ProtectedRoute permissionKey="sub-category">
                <SubCategory />
              </ProtectedRoute>
            }
          />

          {/* 6. Brands Module */}
          <Route
            path="brands"
            element={
              <ProtectedRoute permissionKey="brands">
                <Brands />
              </ProtectedRoute>
            }
          />

          {/* 7. Product Module */}
          <Route
            path="product"
            element={
              <ProtectedRoute permissionKey="product">
                <Product />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;