import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    status: "active",
  });
  const [modalError, setModalError] = useState("");

  // SUPER_ADMIN removed: ADMIN is the top role
  const availableRoles = [
    { label: "Admin", value: "ADMIN" },
    { label: "Store Manager", value: "STORE_MANAGER" },
    { label: "Inventory Manager", value: "INVENTORY_MANAGER" },
    { label: "Delivery Partner", value: "DELIVERY_PARTNER" },
    { label: "Support Agent", value: "SUPPORT_AGENT" },
    { label: "Customer", value: "CUSTOMER" },
  ];

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/users/stats");
      const data = await res.json();
      if (res.ok) {
        setUserStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          inactiveUsers: data.inactiveUsers || 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // 1. VIEW ACTION
  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // 2. EDIT ACTION
  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role || "CUSTOMER",
      status: user.status || "active",
    });
    setModalError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://ecommerce-backend-api-2r29.onrender.com/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditModalOpen(false);
        toast.success("User successfully update ho gaya!");
        fetchUsers();
        fetchStats();
      } else {
        setModalError(data.message || "Update fail ho gaya");
        toast.error(data.message || "Update fail ho gaya");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  // 3. TOGGLE STATUS
  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`https://ecommerce-backend-api-2r29.onrender.com/api/users/${id}/status`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.info("Status update ho gaya!");
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error("Status update error");
    }
  };

  // 4. DELETE ACTION
  const handleDeleteUser = async (id) => {
    if (!window.confirm("User delete karna hai?")) return;
    try {
      const res = await fetch(`https://ecommerce-backend-api-2r29.onrender.com/api/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("User delete ho gaya!");
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error("Delete fail ho gaya");
    }
  };

  // ADD SUBMIT
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: "CUSTOMER", status: "active" });
        toast.success("User create ho gaya!");
        fetchUsers();
        fetchStats();
      } else {
        setModalError(data.message || "Failed to add user");
        toast.error(data.message || "Failed to add user");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* STATS */}
      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #3b82f6" }}>
          <div style={styles.statLabel}>Total Users</div>
          <div style={{ ...styles.statValue, color: "#1d4ed8" }}>{userStats.totalUsers}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
          <div style={styles.statLabel}>Active Users</div>
          <div style={{ ...styles.statValue, color: "#047857" }}>{userStats.activeUsers}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #ef4444" }}>
          <div style={styles.statLabel}>Inactive Users</div>
          <div style={{ ...styles.statValue, color: "#b91c1c" }}>{userStats.inactiveUsers}</div>
        </div>
      </div>

      {/* SEARCH & ADD BAR */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button
          style={styles.actionBtn}
          onClick={() => {
            setFormData({ name: "", email: "", password: "", role: "CUSTOMER", status: "active" });
            setModalError("");
            setIsAddModalOpen(true);
          }}
        >
          + Add User
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => {
                  const isUserActive = user.status !== "inactive";
                  return (
                    <tr key={user._id || index} style={styles.tr}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#1e293b" }}>
                        {user.name}
                      </td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        <span style={styles.roleTag}>{user.role || "CUSTOMER"}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: isUserActive ? "#dcfce7" : "#fee2e2",
                            color: isUserActive ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {isUserActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button style={styles.viewBtn} onClick={() => handleView(user)}>👁 View</button>
                          <button style={styles.editBtn} onClick={() => handleEditOpen(user)}>✏ Edit</button>
                          <button
                            style={{
                              ...styles.statusToggleBtn,
                              backgroundColor: isUserActive ? "#fff7ed" : "#f0fdf4",
                              color: isUserActive ? "#c2410c" : "#15803d",
                              border: isUserActive ? "1px solid #fdba74" : "1px solid #86efac",
                            }}
                            onClick={() => handleToggleStatus(user._id)}
                          >
                            {isUserActive ? "Deactivate" : "Activate"}
                          </button>
                          <button style={styles.deleteBtn} onClick={() => handleDeleteUser(user._id)}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    Koi user nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>User Details</h3>
              <button style={styles.closeBtn} onClick={() => setIsViewModalOpen(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <p><b>Name:</b> {selectedUser.name}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Role:</b> <span style={styles.roleTag}>{selectedUser.role || "CUSTOMER"}</span></p>
              <p><b>Status:</b> {selectedUser.status || "active"}</p>
              <p><b>Created At:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"}</p>
            </div>
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button style={styles.cancelBtn} onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Edit User</h3>
              <button style={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            {modalError && <div style={styles.errorBox}>{modalError}</div>}
            <form onSubmit={handleEditSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={styles.inputField}
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.inputField}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Update Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Add New User</h3>
              <button style={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            {modalError && <div style={styles.errorBox}>{modalError}</div>}
            <form onSubmit={handleAddUserSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assign Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={styles.inputField}
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.inputField}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  statsContainer: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "25px" },
  statCard: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" },
  statLabel: { fontSize: "14px", color: "#64748b", fontWeight: "600", marginBottom: "8px" },
  statValue: { fontSize: "28px", fontWeight: "800" },
  searchSection: { display: "flex", gap: "15px", marginBottom: "25px" },
  searchInput: { flex: 1, padding: "12px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#ffffff" },
  actionBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "0 24px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
  tableCard: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { borderBottom: "2px solid #e2e8f0" },
  th: { padding: "12px 14px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", fontSize: "14px", color: "#475569" },
  roleTag: { backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", border: "1px solid #bfdbfe", textTransform: "uppercase" },
  statusBadge: { padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  btnGroup: { display: "flex", gap: "6px", alignItems: "center" },
  viewBtn: { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  editBtn: { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  statusToggleBtn: { padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modalBox: { backgroundColor: "#ffffff", borderRadius: "12px", width: "420px", maxWidth: "90%", padding: "25px" },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" },
  errorBox: { backgroundColor: "#ffebee", color: "#d32f2f", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "15px" },
  modalForm: { display: "flex", flexDirection: "column", gap: "15px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  inputField: { padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", fontFamily: "inherit" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" },
  cancelBtn: { backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  submitBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
};

export default Users;