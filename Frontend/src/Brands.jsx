import { useState, useEffect } from "react";
// import { toast } from "react-toastify";

function Brands() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalBrands: 0,
    activeBrands: 0,
    inactiveBrands: 0,
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    description: "",
    status: "active",
  });
  const [modalError, setModalError] = useState("");

  const fetchBrands = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/brands");
      const data = await res.json();
      if (res.ok) setBrands(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/brands/stats");
      const data = await res.json();
      if (res.ok) {
        setStats({
          totalBrands: data.totalBrands || 0,
          activeBrands: data.activeBrands || 0,
          inactiveBrands: data.inactiveBrands || 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchStats();
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-");
    setFormData({
      ...formData,
      name: val,
      slug: generatedSlug,
    });
  };

  // 1. VIEW ACTION
  const handleView = (b) => {
    setSelectedBrand(b);
    setIsViewModalOpen(true);
  };

  // 2. EDIT ACTION
  const handleEditOpen = (b) => {
    setSelectedBrand(b);
    setFormData({
      name: b.name,
      slug: b.slug,
      logo: b.logo || "",
      description: b.description || "",
      status: b.status || "active",
    });
    setModalError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/brands/${selectedBrand._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditModalOpen(false);
        toast.success("Brand update ho gaya!");
        fetchBrands();
        fetchStats();
      } else {
        setModalError(data.message || "Update fail ho gaya");
        toast.error(data.message || "Update fail ho gaya");
      }
    } catch (err) {
      setModalError("Server connection error");
      toast.error("Server connection error");
    }
  };

  // 3. TOGGLE STATUS
  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/brands/${id}/status`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.info("Status update ho gaya!");
        fetchBrands();
        fetchStats();
      } else {
        toast.error("Status change fail ho gaya");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  // 4. DELETE ACTION
  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap is brand ko delete karna chahte hain?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/brands/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Brand delete ho gaya!");
        fetchBrands();
        fetchStats();
      } else {
        toast.error("Delete fail ho gaya");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  // ADD SUBMIT
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/brands/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ name: "", slug: "", logo: "", description: "", status: "active" });
        toast.success("Brand successfully add ho gaya!");
        fetchBrands();
        fetchStats();
      } else {
        setModalError(data.message || "Failed to add brand");
        toast.error(data.message || "Failed to add brand");
      }
    } catch (err) {
      setModalError("Server connection error");
      toast.error("Server connection error");
    }
  };

  const filtered = brands.filter((b) => {
    const q = searchTerm.toLowerCase();
    return b.name?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* 3 STATS BOXES */}
      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #3b82f6" }}>
          <div style={styles.statLabel}>Total Brands</div>
          <div style={{ ...styles.statValue, color: "#1d4ed8" }}>{stats.totalBrands}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
          <div style={styles.statLabel}>Active Brands</div>
          <div style={{ ...styles.statValue, color: "#047857" }}>{stats.activeBrands}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #ef4444" }}>
          <div style={styles.statLabel}>Inactive Brands</div>
          <div style={{ ...styles.statValue, color: "#b91c1c" }}>{stats.inactiveBrands}</div>
        </div>
      </div>

      {/* SEARCH & ADD BUTTON */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search brand by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button
          style={styles.actionBtn}
          onClick={() => {
            setFormData({ name: "", slug: "", logo: "", description: "", status: "active" });
            setModalError("");
            setIsAddModalOpen(true);
          }}
        >
          + Add Brand
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Logo</th>
                <th style={styles.th}>Brand Name</th>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const isActive = item.status !== "inactive";
                  return (
                    <tr key={item._id || index} style={styles.tr}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>
                        {item.logo ? (
                          <img
                            src={item.logo}
                            alt={item.name}
                            style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "contain", border: "1px solid #e2e8f0" }}
                          />
                        ) : (
                          <div style={styles.noImg}>🏷️</div>
                        )}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#1e293b" }}>{item.name}</td>
                      <td style={{ ...styles.td, color: "#64748b" }}>{item.slug}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
                            color: isActive ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button style={styles.viewBtn} onClick={() => handleView(item)}>👁 View</button>
                          <button style={styles.editBtn} onClick={() => handleEditOpen(item)}>✏ Edit</button>
                          <button
                            style={{
                              ...styles.statusToggleBtn,
                              backgroundColor: isActive ? "#fff7ed" : "#f0fdf4",
                              color: isActive ? "#c2410c" : "#15803d",
                              border: isActive ? "1px solid #fdba74" : "1px solid #86efac",
                            }}
                            onClick={() => handleToggleStatus(item._id)}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(item._id)}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    Koi Brand nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedBrand && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Brand Details</h3>
              <button style={styles.closeBtn} onClick={() => setIsViewModalOpen(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              {selectedBrand.logo && (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.name}
                    style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
              <p><b>Name:</b> {selectedBrand.name}</p>
              <p><b>Slug:</b> {selectedBrand.slug}</p>
              <p><b>Description:</b> {selectedBrand.description || "N/A"}</p>
              <p><b>Status:</b> {selectedBrand.status || "active"}</p>
              <p><b>Created At:</b> {selectedBrand.createdAt ? new Date(selectedBrand.createdAt).toLocaleString() : "N/A"}</p>
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
              <h3 style={{ margin: 0 }}>Edit Brand</h3>
              <button style={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            {modalError && <div style={styles.errorBox}>{modalError}</div>}
            <form onSubmit={handleEditSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Logo URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.inputField}
                />
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

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Add New Brand</h3>
              <button style={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            {modalError && <div style={styles.errorBox}>{modalError}</div>}
            <form onSubmit={handleAddSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Nike, Samsung"
                  value={formData.name}
                  onChange={handleNameChange}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Slug</label>
                <input
                  type="text"
                  required
                  placeholder="apple"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Logo URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Brand description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.inputField}
                />
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
                <button type="submit" style={styles.submitBtn}>Create Brand</button>
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
  noImg: { width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  statusBadge: { padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  btnGroup: { display: "flex", gap: "6px", alignItems: "center" },
  viewBtn: { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  editBtn: { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  statusToggleBtn: { padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modalBox: { backgroundColor: "#ffffff", borderRadius: "12px", width: "450px", maxWidth: "90%", padding: "25px", maxHeight: "90vh", overflowY: "auto" },
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

export default Brands;