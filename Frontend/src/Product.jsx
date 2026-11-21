import { useState, useEffect } from "react";
// import { toast } from "react-toastify";

function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedProd, setSelectedProd] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    subcategory: "",
    brand: "",
    unit: "piece",
    images: "",
    tags: "",
    description: "",
    isFeatured: false,
    isActive: true,
  });

  const [modalError, setModalError] = useState("");

  // Initial Fetching
  const fetchAllDependencies = async () => {
    try {
      const [pRes, cRes, sRes, bRes, statRes] = await Promise.all([
        fetch("http://localhost:5000/api/products"),
        fetch("http://localhost:5000/api/categories"),
        fetch("http://localhost:5000/api/subcategories"),
        fetch("http://localhost:5000/api/brands"),
        fetch("http://localhost:5000/api/products/stats"),
      ]);

      const [pData, cData, sData, bData, statData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        sRes.json(),
        bRes.json(),
        statRes.json(),
      ]);

      if (pRes.ok) setProducts(pData);
      if (cRes.ok) setCategories(cData);
      if (sRes.ok) setSubcategories(sData);
      if (bRes.ok) setBrands(bData);
      if (statRes.ok) setStats(statData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllDependencies();
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
  const handleView = (prod) => {
    setSelectedProd(prod);
    setIsViewModalOpen(true);
  };

  // 2. EDIT ACTION
  const handleEditOpen = (prod) => {
    setSelectedProd(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      category: prod.category?._id || prod.category || "",
      subcategory: prod.subcategory?._id || prod.subcategory || "",
      brand: prod.brand?._id || prod.brand || "",
      unit: prod.unit || "piece",
      images: prod.images ? prod.images.join(", ") : "",
      tags: prod.tags ? prod.tags.join(", ") : "",
      description: prod.description || "",
      isFeatured: prod.isFeatured || false,
      isActive: prod.isActive !== undefined ? prod.isActive : true,
    });
    setModalError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/products/${selectedProd._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditModalOpen(false);
        toast.success("Product update ho gaya!");
        fetchAllDependencies();
      } else {
        setModalError(data.message || "Update fail ho gaya");
        toast.error(data.message || "Update fail ho gaya");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  // 3. TOGGLE ACTIVE
  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/status`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.info("Active status update ho gaya!");
        fetchAllDependencies();
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  // 4. TOGGLE FEATURED
  const handleToggleFeatured = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/featured`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.info("Featured status update ho gaya!");
        fetchAllDependencies();
      }
    } catch (err) {
      toast.error("Error updating featured status");
    }
  };

  // 5. DELETE ACTION
  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap is product ko delete karna chahte hain?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product delete ho gaya!");
        fetchAllDependencies();
      }
    } catch (err) {
      toast.error("Error deleting product");
    }
  };

  // ADD SUBMIT
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subcategory || !formData.brand) {
      setModalError("Category, SubCategory aur Brand select karna zaroori hai!");
      toast.warn("Category, SubCategory aur Brand select karein!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          slug: "",
          category: "",
          subcategory: "",
          brand: "",
          unit: "piece",
          images: "",
          tags: "",
          description: "",
          isFeatured: false,
          isActive: true,
        });
        toast.success("Product successfully create ho gaya!");
        fetchAllDependencies();
      } else {
        setModalError(data.message || "Failed to create product");
        toast.error(data.message || "Failed to create product");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  // Filter Subcategories based on selected category in form
  const availableSubcategories = formData.category
    ? subcategories.filter((s) => (s.category?._id || s.category) === formData.category)
    : subcategories;

  const filtered = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.brand?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* 3 STATS BOXES */}
      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #3b82f6" }}>
          <div style={styles.statLabel}>Total Products</div>
          <div style={{ ...styles.statValue, color: "#1d4ed8" }}>{stats.totalProducts}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
          <div style={styles.statLabel}>Active Products</div>
          <div style={{ ...styles.statValue, color: "#047857" }}>{stats.activeProducts}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #f59e0b" }}>
          <div style={styles.statLabel}>Featured Products</div>
          <div style={{ ...styles.statValue, color: "#b45309" }}>{stats.featuredProducts}</div>
        </div>
      </div>

      {/* SEARCH & ADD PRODUCT BUTTON */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by product, category, brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button
          style={styles.actionBtn}
          onClick={() => {
            setFormData({
              name: "",
              slug: "",
              category: "",
              subcategory: "",
              brand: "",
              unit: "piece",
              images: "",
              tags: "",
              description: "",
              isFeatured: false,
              isActive: true,
            });
            setModalError("");
            setIsAddModalOpen(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Category / SubCategory</th>
                <th style={styles.th}>Brand</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Featured</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const mainImg = item.images && item.images.length > 0 ? item.images[0] : null;
                  return (
                    <tr key={item._id || index} style={styles.tr}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>
                        {mainImg ? (
                          <img
                            src={mainImg}
                            alt={item.name}
                            style={{ width: "42px", height: "42px", borderRadius: "6px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                          />
                        ) : (
                          <div style={styles.noImg}>📦</div>
                        )}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#1e293b" }}>{item.name}</td>
                      <td style={styles.td}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb" }}>
                          {item.category?.name || "N/A"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          ↳ {item.subcategory?.name || "N/A"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.brandBadge}>{item.brand?.name || "N/A"}</span>
                      </td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleToggleFeatured(item._id)}
                          style={{
                            border: "none",
                            background: item.isFeatured ? "#fef3c7" : "#f1f5f9",
                            color: item.isFeatured ? "#b45309" : "#94a3b8",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          {item.isFeatured ? "★ Featured" : "☆ Normal"}
                        </button>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: item.isActive ? "#dcfce7" : "#fee2e2",
                            color: item.isActive ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.btnGroup}>
                          <button style={styles.viewBtn} onClick={() => handleView(item)}>👁 View</button>
                          <button style={styles.editBtn} onClick={() => handleEditOpen(item)}>✏ Edit</button>
                          <button
                            style={{
                              ...styles.statusToggleBtn,
                              backgroundColor: item.isActive ? "#fff7ed" : "#f0fdf4",
                              color: item.isActive ? "#c2410c" : "#15803d",
                              border: item.isActive ? "1px solid #fdba74" : "1px solid #86efac",
                            }}
                            onClick={() => handleToggleActive(item._id)}
                          >
                            {item.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(item._id)}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    Koi Product nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedProd && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Product Details</h3>
              <button style={styles.closeBtn} onClick={() => setIsViewModalOpen(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              {selectedProd.images && selectedProd.images.length > 0 && (
                <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px" }}>
                  {selectedProd.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  ))}
                </div>
              )}
              <p><b>Name:</b> {selectedProd.name}</p>
              <p><b>Slug:</b> {selectedProd.slug}</p>
              <p><b>Category:</b> {selectedProd.category?.name || "N/A"}</p>
              <p><b>SubCategory:</b> {selectedProd.subcategory?.name || "N/A"}</p>
              <p><b>Brand:</b> {selectedProd.brand?.name || "N/A"}</p>
              <p><b>Unit:</b> {selectedProd.unit}</p>
              <p><b>Rating:</b> ⭐ {selectedProd.rating} ({selectedProd.totalReviews} reviews)</p>
              <p><b>Tags:</b> {selectedProd.tags?.join(", ") || "None"}</p>
              <p><b>Description:</b> {selectedProd.description || "N/A"}</p>
              <p><b>Status:</b> {selectedProd.isActive ? "Active" : "Inactive"}</p>
            </div>
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button style={styles.cancelBtn} onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>{isAddModalOpen ? "Add New Product" : "Edit Product"}</h3>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
              >
                ✕
              </button>
            </div>

            {modalError && <div style={styles.errorBox}>{modalError}</div>}

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} style={styles.modalForm}>
              {/* Row 1: Name & Slug */}
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro"
                    value={formData.name}
                    onChange={handleNameChange}
                    style={styles.inputField}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>

              {/* Row 2: Category, Subcategory, Brand */}
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                    style={styles.inputField}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>SubCategory *</label>
                  <select
                    required
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    style={styles.inputField}
                  >
                    <option value="">Select SubCategory</option>
                    {availableSubcategories.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Brand *</label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={styles.inputField}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Unit, Images */}
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. piece, kg, box"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
                <div style={{ ...styles.formGroup, flex: 2 }}>
                  <label style={styles.label}>Image URLs (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="https://img1.jpg, https://img2.jpg"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>

              {/* Row 4: Tags & Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="trending, apple, flagship"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.inputField}
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: "flex", gap: "25px", marginTop: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <b>Featured Product</b>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <b>Is Active</b>
                </label>
              </div>

              {/* Actions */}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {isAddModalOpen ? "Create Product" : "Save Changes"}
                </button>
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
  noImg: { width: "42px", height: "42px", borderRadius: "6px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  brandBadge: { backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" },
  statusBadge: { padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  btnGroup: { display: "flex", gap: "6px", alignItems: "center" },
  viewBtn: { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  editBtn: { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  statusToggleBtn: { padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modalBox: { backgroundColor: "#ffffff", borderRadius: "12px", width: "680px", maxWidth: "95%", padding: "25px", maxHeight: "90vh", overflowY: "auto" },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" },
  errorBox: { backgroundColor: "#ffebee", color: "#d32f2f", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "15px" },
  modalForm: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  inputField: { padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", fontFamily: "inherit" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" },
  cancelBtn: { backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  submitBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
};

export default Product;