// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// function Dashboard() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("User");
//   const [userData, setUserData] = useState(null);

//   // Users List & Stats States
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [userStats, setUserStats] = useState({
//     totalUsers: 0,
//     activeUsers: 0,
//     inactiveUsers: 0,
//   });

//   // Modal States
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalData, setModalData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     status: "active",
//   });
//   const [modalError, setModalError] = useState("");
//   const [modalLoading, setModalLoading] = useState(false);

//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");
//     if (savedUser) {
//       setUserData(JSON.parse(savedUser));
//     }
//   }, []);

//   //  Fetch Users List
//   const fetchUsers = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/users");
//       const data = await res.json();
//       if (res.ok) {
//         setUsers(data);
//       }
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     }
//   };

//   //  Fetch User Stats
//   const fetchStats = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/users/stats");
//       const data = await res.json();
//       if (res.ok) {
//         setUserStats({
//           totalUsers: data.totalUsers || 0,
//           activeUsers: data.activeUsers || 0,
//           inactiveUsers: data.inactiveUsers || 0,
//         });
//       }
//     } catch (err) {
//       console.error("Stats Error:", err);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "User") {
//       fetchUsers();
//       fetchStats();
//     }
//   }, [activeTab]);

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   // Delete User Action
//   const handleDeleteUser = async (id) => {
//     if (!window.confirm("Are you sure to delete this user?")) return;

//     try {
//       const res = await fetch(`http://localhost:5000/api/users/${id}`, {
//         method: "DELETE",
//       });
//       if (res.ok) {
//         fetchUsers();
//         fetchStats();
//       } else {
//         alert("Delete failed!");
//       }
//     } catch (err) {
//       console.error("Delete Error:", err);
//     }
//   };

//   // Add User Submit
//   const handleAddUserSubmit = async (e) => {
//     e.preventDefault();
//     setModalError("");
//     setModalLoading(true);

//     try {
//       const response = await fetch("http://localhost:5000/api/users/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(modalData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setIsModalOpen(false);
//         setModalData({ name: "", email: "", password: "", status: "active" });
//         fetchUsers();
//         fetchStats();
//       } else {
//         setModalError(data.message || "Failed to add user");
//       }
//     } catch (err) {
//       console.error(err);
//       setModalError("Server se connection nahi ho pa raha.");
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // Live Search Filter
//   const filteredUsers = users.filter((u) => {
//     const q = searchTerm.toLowerCase();
//     return (
//       u.name?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q)
//     );
//   });

//   const menuItems = [
//     { id: "Dashboard", label: "Dashboard", icon: "📊" },
//     { id: "User", label: "User", icon: "👥" },
//     { id: "Store", label: "Store / Inventory", icon: "🏪" },
//     { id: "Category", label: "Category", icon: "📁" },
//     { id: "Sub-Category", label: "Sub-Category", icon: "📂" },
//     { id: "Product", label: "Product", icon: "📦" },
//   ];

//   return (
//     <div style={styles.container}>
//       {/* 1. HEADER */}
//       <header style={styles.header}>
//         <div style={styles.logo}>BY AJ</div>
//         <div style={styles.userSection}>
//           <div style={styles.avatar}>
//             {userData?.name ? userData.name[0].toUpperCase() : "U"}
//           </div>
//           <span style={styles.userName}>{userData?.name || "Admin"}</span>
//           <button style={styles.logoutBtn} onClick={handleLogout}>
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* 2. BODY */}
//       <div style={styles.body}>
//         {/* SIDEBAR */}
//         <aside style={styles.sidebar}>
//           <nav style={styles.nav}>
//             {menuItems.map((item) => (
//               <button
//                 key={item.id}
//                 style={{
//                   ...styles.menuItem,
//                   backgroundColor: activeTab === item.id ? "#3b82f6" : "transparent",
//                   color: activeTab === item.id ? "#ffffff" : "#475569",
//                   fontWeight: activeTab === item.id ? "600" : "500",
//                 }}
//                 onClick={() => setActiveTab(item.id)}
//               >
//                 <span style={{ fontSize: "18px" }}>{item.icon}</span>
//                 <span>{item.label}</span>
//               </button>
//             ))}
//           </nav>
//         </aside>

//         {/* MAIN AREA */}
//         <main style={styles.main}>
//           {activeTab === "User" ? (
//             <div>
//               {/* 3 STATS BOXES */}
//               <div style={styles.statsContainer}>
//                 <div style={{ ...styles.statCard, borderLeft: "5px solid #3b82f6" }}>
//                   <div style={styles.statLabel}>Total Users</div>
//                   <div style={{ ...styles.statValue, color: "#1d4ed8" }}>
//                     {userStats.totalUsers}
//                   </div>
//                 </div>

//                 <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
//                   <div style={styles.statLabel}>Active Users</div>
//                   <div style={{ ...styles.statValue, color: "#047857" }}>
//                     {userStats.activeUsers}
//                   </div>
//                 </div>

//                 <div style={{ ...styles.statCard, borderLeft: "5px solid #ef4444" }}>
//                   <div style={styles.statLabel}>Inactive Users</div>
//                   <div style={{ ...styles.statValue, color: "#b91c1c" }}>
//                     {userStats.inactiveUsers}
//                   </div>
//                 </div>
//               </div>

//               {/* SEARCH & ADD USER BUTTON */}
//               <div style={styles.searchSection}>
//                 <input
//                   type="text"
//                   placeholder="Search user by name or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   style={styles.searchInput}
//                 />
//                 <button
//                   style={styles.actionBtn}
//                   onClick={() => setIsModalOpen(true)}
//                 >
//                   + Add User
//                 </button>
//               </div>

//               {/* USER LIST TABLE */}
//               <div style={styles.tableCard}>
//                 <div style={styles.tableHeader}>
//                   <h3 style={{ margin: 0, color: "#1e293b" }}>Users List</h3>
//                   <span style={{ fontSize: "13px", color: "#64748b" }}>
//                     Showing {filteredUsers.length} Users
//                   </span>
//                 </div>

//                 <div style={{ overflowX: "auto" }}>
//                   <table style={styles.table}>
//                     <thead>
//                       <tr style={styles.thRow}>
//                         <th style={styles.th}>#</th>
//                         <th style={styles.th}>Name</th>
//                         <th style={styles.th}>Email</th>
//                         <th style={styles.th}>Status</th>
//                         <th style={styles.th}>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredUsers.length > 0 ? (
//                         filteredUsers.map((user, index) => {
//                           const isUserActive = user.status !== "inactive";
//                           return (
//                             <tr key={user._id || index} style={styles.tr}>
//                               <td style={styles.td}>{index + 1}</td>
//                               <td style={{ ...styles.td, fontWeight: "600", color: "#1e293b" }}>
//                                 {user.name}
//                               </td>
//                               <td style={styles.td}>{user.email}</td>
//                               <td style={styles.td}>
//                                 <span
//                                   style={{
//                                     ...styles.statusBadge,
//                                     backgroundColor: isUserActive ? "#dcfce7" : "#fee2e2",
//                                     color: isUserActive ? "#15803d" : "#b91c1c",
//                                   }}
//                                 >
//                                   {isUserActive ? "Active" : "Inactive"}
//                                 </span>
//                               </td>
//                               <td style={styles.td}>
//                                 <button
//                                   style={styles.deleteBtn}
//                                   onClick={() => handleDeleteUser(user._id)}
//                                 >
//                                   Delete
//                                 </button>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td colSpan="5" style={styles.emptyTd}>
//                             Koi user nahi mila.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div style={styles.tableCard}>
//               <h2>{activeTab} Management</h2>
//             </div>
//           )}
//         </main>
//       </div>

//       {/* 3. MODAL POPUP */}
//       {isModalOpen && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modalBox}>
//             <div style={styles.modalTop}>
//               <h3 style={{ margin: 0, color: "#1e293b" }}>Create New User</h3>
//               <button
//                 style={styles.closeBtn}
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 ✕
//               </button>
//             </div>

//             {modalError && <div style={styles.errorBox}>{modalError}</div>}

//             <form onSubmit={handleAddUserSubmit} style={styles.modalForm}>
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   placeholder="Enter full name"
//                   value={modalData.name}
//                   onChange={(e) =>
//                     setModalData({ ...modalData, [e.target.name]: e.target.value })
//                   }
//                   style={styles.inputField}
//                 />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   required
//                   placeholder="Enter email address"
//                   value={modalData.email}
//                   onChange={(e) =>
//                     setModalData({ ...modalData, [e.target.name]: e.target.value })
//                   }
//                   style={styles.inputField}
//                 />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   required
//                   placeholder="Enter password"
//                   value={modalData.password}
//                   onChange={(e) =>
//                     setModalData({ ...modalData, [e.target.name]: e.target.value })
//                   }
//                   style={styles.inputField}
//                 />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Status</label>
//                 <select
//                   name="status"
//                   value={modalData.status}
//                   onChange={(e) =>
//                     setModalData({ ...modalData, [e.target.name]: e.target.value })
//                   }
//                   style={styles.inputField}
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>

//               <div style={styles.modalActions}>
//                 <button
//                   type="button"
//                   style={styles.cancelBtn}
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   style={styles.submitBtn}
//                   disabled={modalLoading}
//                 >
//                   {modalLoading ? "Saving..." : "Save User"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* 4. FOOTER */}
//       <footer style={styles.footer}>
//         © {new Date().getFullYear()} BY AJ Admin Panel. All Rights Reserved.
//       </footer>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     display: "flex",
//     flexDirection: "column",
//     height: "100vh",
//     width: "100vw",
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//     backgroundColor: "#f8fafc",
//     overflow: "hidden",
//   },
//   header: {
//     height: "65px",
//     backgroundColor: "#ffffff",
//     borderBottom: "1px solid #e2e8f0",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "0 25px",
//   },
//   logo: {
//     fontSize: "22px",
//     fontWeight: "800",
//     color: "#2563eb",
//   },
//   userSection: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//   },
//   avatar: {
//     width: "38px",
//     height: "38px",
//     borderRadius: "50%",
//     backgroundColor: "#2563eb",
//     color: "#ffffff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontWeight: "700",
//   },
//   userName: {
//     fontSize: "14px",
//     fontWeight: "600",
//     color: "#334155",
//   },
//   logoutBtn: {
//     backgroundColor: "#fee2e2",
//     color: "#dc2626",
//     border: "1px solid #fecaca",
//     padding: "6px 14px",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "13px",
//     fontWeight: "600",
//   },
//   body: {
//     display: "flex",
//     flex: 1,
//     overflow: "hidden",
//   },
//   sidebar: {
//     width: "240px",
//     backgroundColor: "#ffffff",
//     borderRight: "1px solid #e2e8f0",
//     padding: "20px 10px",
//   },
//   nav: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "6px",
//   },
//   menuItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     width: "100%",
//     padding: "12px 16px",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontSize: "14px",
//   },
//   main: {
//     flex: 1,
//     padding: "30px",
//     overflowY: "auto",
//   },
//   statsContainer: {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, 1fr)",
//     gap: "20px",
//     marginBottom: "25px",
//   },
//   statCard: {
//     backgroundColor: "#ffffff",
//     padding: "20px",
//     borderRadius: "10px",
//     border: "1px solid #e2e8f0",
//   },
//   statLabel: {
//     fontSize: "14px",
//     color: "#64748b",
//     fontWeight: "600",
//     marginBottom: "8px",
//   },
//   statValue: {
//     fontSize: "28px",
//     fontWeight: "800",
//   },
//   searchSection: {
//     display: "flex",
//     gap: "15px",
//     marginBottom: "25px",
//   },
//   searchInput: {
//     flex: 1,
//     padding: "12px 18px",
//     borderRadius: "8px",
//     border: "1px solid #cbd5e1",
//     fontSize: "14px",
//     outline: "none",
//     backgroundColor: "#ffffff",
//   },
//   actionBtn: {
//     backgroundColor: "#2563eb",
//     color: "#ffffff",
//     border: "none",
//     padding: "0 24px",
//     borderRadius: "8px",
//     fontWeight: "600",
//     fontSize: "14px",
//     cursor: "pointer",
//   },
//   tableCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: "12px",
//     border: "1px solid #e2e8f0",
//     padding: "20px",
//     boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
//   },
//   tableHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "15px",
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     textAlign: "left",
//   },
//   thRow: {
//     borderBottom: "2px solid #e2e8f0",
//   },
//   th: {
//     padding: "12px 16px",
//     fontSize: "13px",
//     fontWeight: "700",
//     color: "#475569",
//     textTransform: "uppercase",
//     letterSpacing: "0.5px",
//   },
//   tr: {
//     borderBottom: "1px solid #f1f5f9",
//   },
//   td: {
//     padding: "14px 16px",
//     fontSize: "14px",
//     color: "#475569",
//   },
//   statusBadge: {
//     padding: "4px 10px",
//     borderRadius: "12px",
//     fontSize: "12px",
//     fontWeight: "600",
//     display: "inline-block",
//   },
//   deleteBtn: {
//     backgroundColor: "#fee2e2",
//     color: "#dc2626",
//     border: "none",
//     padding: "6px 12px",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "12px",
//     fontWeight: "600",
//   },
//   emptyTd: {
//     textAlign: "center",
//     padding: "30px",
//     color: "#94a3b8",
//     fontSize: "14px",
//   },
//   footer: {
//     height: "45px",
//     backgroundColor: "#ffffff",
//     borderTop: "1px solid #e2e8f0",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "13px",
//     color: "#64748b",
//   },
//   modalOverlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100vw",
//     height: "100vh",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 999,
//   },
//   modalBox: {
//     backgroundColor: "#ffffff",
//     borderRadius: "12px",
//     width: "420px",
//     maxWidth: "90%",
//     padding: "25px",
//   },
//   modalTop: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "20px",
//   },
//   closeBtn: {
//     background: "none",
//     border: "none",
//     fontSize: "18px",
//     cursor: "pointer",
//     color: "#64748b",
//   },
//   errorBox: {
//     backgroundColor: "#ffebee",
//     color: "#d32f2f",
//     padding: "10px",
//     borderRadius: "6px",
//     fontSize: "13px",
//     marginBottom: "15px",
//   },
//   modalForm: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "15px",
//   },
//   formGroup: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "6px",
//   },
//   label: {
//     fontSize: "13px",
//     fontWeight: "600",
//     color: "#475569",
//   },
//   inputField: {
//     padding: "10px 12px",
//     borderRadius: "6px",
//     border: "1px solid #cbd5e1",
//     fontSize: "14px",
//     outline: "none",
//   },
//   modalActions: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: "10px",
//     marginTop: "10px",
//   },
//   cancelBtn: {
//     backgroundColor: "#f1f5f9",
//     color: "#475569",
//     border: "none",
//     padding: "8px 16px",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "14px",
//   },
//   submitBtn: {
//     backgroundColor: "#2563eb",
//     color: "#ffffff",
//     border: "none",
//     padding: "8px 18px",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontWeight: "600",
//     fontSize: "14px",
//   },
// };

// export default Dashboard;