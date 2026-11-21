import { Navigate } from "react-router-dom";
import { ROLE_PERMISSIONS } from "./roleConfig";

function ProtectedRoute({ permissionKey, children }) {
  const savedUser = localStorage.getItem("user");

  // 1. Check karein ki user logged in hai ya nahi
  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(savedUser);
  const userRole = user.role || "CUSTOMER";

  // 2. Check karein ki user ke role ke paas permissionKey ka access hai ya nahi
  const allowedKeys = ROLE_PERMISSIONS[userRole] || ["dashboard"];

  if (permissionKey && !allowedKeys.includes(permissionKey)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          textAlign: "center",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          margin: "20px",
        }}
      >
        <span style={{ fontSize: "50px", marginBottom: "10px" }}>🚫</span>
        <h2 style={{ color: "#dc2626", margin: "0 0 10px 0" }}>Access Denied</h2>
        <p style={{ color: "#64748b", maxWidth: "400px", lineHeight: "1.5" }}>
          Aapka role <b>{userRole}</b> hai aur aapke paas is page ko access karne ki permissions nahi hain.
        </p>
      </div>
    );
  }

  // Agar permissions valid hain, toh component render karo
  return children;
}

export default ProtectedRoute;