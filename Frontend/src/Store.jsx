import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Store() {
  const [activeTab, setActiveTab] = useState("stores"); // "stores" or "inventory"
  const [stores, setStores] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [managers, setManagers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalInventories: 0,
  });

  // Modal States
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Store Form
  const [storeForm, setStoreForm] = useState({
    name: "",
    code: "",
    manager: "",
    phone: "",
    address: "",
    serviceRadius: 5,
    status: "active",
  });

  // Stock Form
  const [stockForm, setStockForm] = useState({
    store: "",
    product: "",
    quantity: 10,
    reorderLevel: 10,
    maxStockLevel: 500,
  });

  const fetchData = async () => {
    try {
      const [sRes, iRes, uRes, pRes, statRes] = await Promise.all([
        fetch("http://localhost:5000/api/stores"),
        fetch("http://localhost:5000/api/inventory"),
        fetch("http://localhost:5000/api/users"),
        fetch("http://localhost:5000/api/products"),
        fetch("http://localhost:5000/api/stores/stats"),
      ]);

      const [sData, iData, uData, pData, statData] = await Promise.all([
        sRes.json(),
        iRes.json(),
        uRes.json(),
        pRes.json(),
        statRes.json(),
      ]);

      if (sRes.ok) setStores(sData);
      if (iRes.ok) setInventories(iData);
      if (uRes.ok) {
        // Sirf STORE_MANAGER ya ADMIN users filter karein manager dropdown ke liye
        const eligibleManagers = uData.filter(
          (u) => u.role === "STORE_MANAGER" || u.role === "ADMIN"
        );
        setManagers(eligibleManagers);
      }
      if (pRes.ok) setProducts(pData);
      if (statRes.ok) setStats(statData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add Store Submit
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/stores/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeForm),
      });
      const data = await res.json();
      if (res.ok) {
        setIsStoreModalOpen(false);
        setStoreForm({ name: "", code: "", manager: "", phone: "", address: "", serviceRadius: 5, status: "active" });
        toast.success("Store successfully ban gaya!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to add store");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  // Add Inventory Submit

  const handleStockSubmit = async (e) => {
  e.preventDefault();

  if (!stockForm.store || !stockForm.product) {
    toast.warn("Store aur Product select karein!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/inventory/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store: stockForm.store,
        product: stockForm.product,
        quantity: Number(stockForm.quantity),
        reorderLevel: Number(stockForm.reorderLevel) || 10,
        maxStockLevel: Number(stockForm.maxStockLevel) || 500,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setIsStockModalOpen(false);
      setStockForm({ store: "", product: "", quantity: 10, reorderLevel: 10, maxStockLevel: 500 });
      toast.success(data.message || "Stock update ho gaya!");
      fetchData();
    } else {
      toast.error(data.message || "Failed to update stock");
    }
  } catch (err) {
    toast.error("Server connection error");
  }
};

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventories.filter((i) =>
    i.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.store?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* 3 STATS BOXES */}
      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #3b82f6" }}>
          <div style={styles.statLabel}>Total Outlets / Stores</div>
          <div style={{ ...styles.statValue, color: "#1d4ed8" }}>{stats.totalStores}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
          <div style={styles.statLabel}>Active Outlets</div>
          <div style={{ ...styles.statValue, color: "#047857" }}>{stats.activeStores}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #8b5cf6" }}>
          <div style={styles.statLabel}>Stock Line Items</div>
          <div style={{ ...styles.statValue, color: "#6d28d9" }}>{stats.totalInventories}</div>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div style={styles.tabsRow}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTab("stores")}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === "stores" ? "#2563eb" : "#ffffff",
              color: activeTab === "stores" ? "#ffffff" : "#475569",
            }}
          >
            🏪 Warehouses & Stores
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === "inventory" ? "#2563eb" : "#ffffff",
              color: activeTab === "inventory" ? "#ffffff" : "#475569",
            }}
          >
            📦 Live Store Inventory
          </button>
        </div>

        {/* ACTION BUTTON DEPENDING ON ACTIVE TAB */}
        {activeTab === "stores" ? (
          <button style={styles.actionBtn} onClick={() => setIsStoreModalOpen(true)}>
            + Add New Store
          </button>
        ) : (
          <button style={styles.actionBtn} onClick={() => setIsStockModalOpen(true)}>
            + Restock Inventory
          </button>
        )}
      </div>

      {/* SEARCH SECTION */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder={
            activeTab === "stores"
              ? "Search store by name or code..."
              : "Search inventory by product or store..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* TABLE CARD */}
      <div style={styles.tableCard}>
        {activeTab === "stores" ? (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Store Name</th>
                  <th style={styles.th}>Manager</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Radius</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.length > 0 ? (
                  filteredStores.map((s) => (
                    <tr key={s._id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "700", color: "#2563eb" }}>{s.code}</td>
                      <td style={{ ...styles.td, fontWeight: "600" }}>{s.name}</td>
                      <td style={styles.td}>
                        <div>{s.manager?.name || "Unassigned"}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{s.manager?.email}</div>
                      </td>
                      <td style={styles.td}>{s.phone}</td>
                      <td style={styles.td}>{s.serviceRadius} KM</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: s.status === "active" ? "#dcfce7" : "#fee2e2",
                            color: s.status === "active" ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      Koi Store nahi mila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Store</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Total Qty</th>
                  <th style={styles.th}>Reserved</th>
                  <th style={styles.th}>Available</th>
                  <th style={styles.th}>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((i) => (
                    <tr key={i._id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#1e293b" }}>
                        {i.store?.name} ({i.store?.code})
                      </td>
                      <td style={styles.td}>
                        <b>{i.product?.name}</b>
                        <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "5px" }}>
                          ({i.product?.unit})
                        </span>
                      </td>
                      <td style={styles.td}>{i.quantity}</td>
                      <td style={{ ...styles.td, color: "#d97706" }}>{i.reservedQuantity}</td>
                      <td style={{ ...styles.td, fontWeight: "700", color: "#15803d" }}>
                        {i.availableQuantity}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              i.status === "in_stock"
                                ? "#dcfce7"
                                : i.status === "low_stock"
                                ? "#fef3c7"
                                : "#fee2e2",
                            color:
                              i.status === "in_stock"
                                ? "#15803d"
                                : i.status === "low_stock"
                                ? "#b45309"
                                : "#b91c1c",
                          }}
                        >
                          {i.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      Koi Inventory record nahi mila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD STORE MODAL */}
      {isStoreModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Create New Store / Outlet</h3>
              <button style={styles.closeBtn} onClick={() => setIsStoreModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleStoreSubmit} style={styles.modalForm}>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Store Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Warehouse Jaipur"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JPR-01"
                    value={storeForm.code}
                    onChange={(e) => setStoreForm({ ...storeForm, code: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Store Manager *</label>
                  <select
                    required
                    value={storeForm.manager}
                    onChange={(e) => setStoreForm({ ...storeForm, manager: e.target.value })}
                    style={styles.inputField}
                  >
                    <option value="">Select Manager</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Service Radius (in KM)</label>
                <input
                  type="number"
                  value={storeForm.serviceRadius}
                  onChange={(e) => setStoreForm({ ...storeForm, serviceRadius: e.target.value })}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Address</label>
                <textarea
                  rows="2"
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsStoreModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK INVENTORY MODAL */}
      {isStockModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Add / Restock Inventory</h3>
              <button style={styles.closeBtn} onClick={() => setIsStockModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleStockSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Store *</label>
                <select
                  required
                  value={stockForm.store}
                  onChange={(e) => setStockForm({ ...stockForm, store: e.target.value })}
                  style={styles.inputField}
                >
                  <option value="">Select Target Store</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Select Product *</label>
                <select
                  required
                  value={stockForm.product}
                  onChange={(e) => setStockForm({ ...stockForm, product: e.target.value })}
                  style={styles.inputField}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity to Add *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Reorder Level Alert</label>
                  <input
                    type="number"
                    value={stockForm.reorderLevel}
                    onChange={(e) => setStockForm({ ...stockForm, reorderLevel: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsStockModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Update Stock
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
  tabsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  tabBtn: { padding: "10px 20px", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  actionBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
  searchSection: { display: "flex", gap: "15px", marginBottom: "20px" },
  searchInput: { flex: 1, padding: "12px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#ffffff" },
  tableCard: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { borderBottom: "2px solid #e2e8f0" },
  th: { padding: "12px 14px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", fontSize: "14px", color: "#475569" },
  statusBadge: { padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modalBox: { backgroundColor: "#ffffff", borderRadius: "12px", width: "550px", maxWidth: "90%", padding: "25px" },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" },
  modalForm: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  inputField: { padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" },
  cancelBtn: { backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  submitBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
};

export default Store;