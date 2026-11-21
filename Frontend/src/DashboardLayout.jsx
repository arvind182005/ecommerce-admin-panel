import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { ROLE_PERMISSIONS } from "./roleConfig";

function DashboardLayout() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Master Menu List (permission key ke saath)
  const allMenuItems = [
    { key: "dashboard", path: "/dashboard", label: "Dashboard", icon: "📊", end: true },
    { key: "users", path: "/dashboard/users", label: "User", icon: "👥" },
    { key: "store", path: "/dashboard/store", label: "Store / Inventory", icon: "🏪" },
    { key: "category", path: "/dashboard/category", label: "Category", icon: "📁" },
    { key: "sub-category", path: "/dashboard/sub-category", label: "Sub-Category", icon: "📂" },
    { key: "brands", path: "/dashboard/brands", label: "Brands", icon: "🏷️" },
    { key: "product", path: "/dashboard/product", label: "Product", icon: "📦" },
  ];

  // User ke role ke hisaab se allowed keys nikalo
  const userRole = userData?.role || "CUSTOMER";
  const allowedKeys = ROLE_PERMISSIONS[userRole] || ["dashboard"];

  // Sirf vahi menu items filter honge jinki permission user ke pass hai
  const visibleMenuItems = allMenuItems.filter((item) =>
    allowedKeys.includes(item.key)
  );

  return (
    <div style={styles.container}>
      {/* 1. HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>BY AJ</div>
        <div style={styles.userSection}>
          <div style={styles.avatar}>
            {userData?.name ? userData.name[0].toUpperCase() : "U"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={styles.userName}>{userData?.name || "User"}</span>
            <span style={styles.roleBadge}>{userRole}</span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* 2. BODY */}
      <div style={styles.body}>
        {/* SIDEBAR: Dynamically filtered based on role */}
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            {visibleMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  ...styles.menuItem,
                  backgroundColor: isActive ? "#3b82f6" : "transparent",
                  color: isActive ? "#ffffff" : "#475569",
                  fontWeight: isActive ? "600" : "500",
                })}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* NESTED PAGE CONTENT */}
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* 3. FOOTER */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} BY AJ Admin Panel. All Rights Reserved.
      </footer>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh", width: "100vw", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8fafc", overflow: "hidden" },
  header: { height: "65px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 25px", zIndex: 10 },
  logo: { fontSize: "22px", fontWeight: "800", color: "#2563eb" },
  userSection: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  userName: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  roleBadge: { fontSize: "10px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", backgroundColor: "#eff6ff", padding: "2px 6px", borderRadius: "4px", width: "fit-content" },
  logoutBtn: { backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: "240px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", padding: "20px 10px" },
  nav: { display: "flex", flexDirection: "column", gap: "6px" },
  menuItem: { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", boxSizing: "border-box" },
  main: { flex: 1, padding: "30px", overflowY: "auto" },
  footer: { height: "45px", backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#64748b" },
};

export default DashboardLayout;