import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  Stethoscope,
  Microscope,
  User,
  KeyRound,
  RefreshCw,
  X,
} from "lucide-react";
import { usersApi } from "../../api/users";

export default function UserManagementConsole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserModal, setDeleteUserModal] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // New User Form State
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    secondary_email: "",
    emergency_phone: "+91 98333 44556",
    role: "patient",
    hospital_affiliation: "AIIMS Clinical AI OPD",
    license_number: "",
  });

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.listUsers();
      if (data?.users) setUsers(data.users);
    } catch (err) {
      setError(err.message || "Failed to load platform users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      await usersApi.createUser(newUser);
      setSuccessMsg(`User account '${newUser.username}' created successfully.`);
      setCreateModalOpen(false);
      setNewUser({
        username: "",
        password: "",
        name: "",
        email: "",
        secondary_email: "",
        emergency_phone: "+91 98333 44556",
        role: "patient",
        hospital_affiliation: "AIIMS Clinical AI OPD",
        license_number: "",
      });
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to create user.");
    }
  }

  async function handleUpdate(e) {
    if (e) e.preventDefault();
    if (!editUser) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await usersApi.updateUser(editUser.user_id, {
        name: editUser.name,
        email: editUser.email,
        secondary_email: editUser.secondary_email,
        emergency_phone: editUser.emergency_phone,
        role: editUser.role,
        hospital_affiliation: editUser.hospital_affiliation,
        license_number: editUser.license_number,
      });
      setSuccessMsg(`User account '${editUser.username}' updated successfully.`);
      setEditUser(null);
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to update user.");
    }
  }

  async function handleDelete(userId) {
    setError(null);
    setSuccessMsg(null);
    try {
      await usersApi.deleteUser(userId);
      setSuccessMsg(`User account '${userId}' deleted.`);
      setDeleteUserModal(null);
      setDeleteConfirmText("");
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchQuery && matchRole;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
      {/* Header Bar */}
      <div className="panel" style={{ padding: "14px 18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", background: "var(--primary-soft)", color: "var(--primary)" }}>
              <Users size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Enterprise User & Authority Management
              </h2>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>
                Manage role access control, credentials, institutional profiles, and emergency routing in SQLite.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCreateModalOpen(true)}
            style={{ padding: "6px 14px", fontSize: "0.78rem", borderRadius: 0 }}
          >
            <UserPlus size={14} />
            <span>Add New User Account</span>
          </button>
        </div>

        {/* Search & Role Filter Bar */}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "6px 10px 6px 28px", border: "1px solid var(--border-default)", fontSize: "0.76rem", background: "var(--bg-canvas)", borderRadius: 0 }}
            />
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            {["all", "patient", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                className={`view-pill-btn ${filterRole === r ? "active" : ""}`}
                style={{ borderRadius: 0, padding: "4px 10px", fontSize: "0.70rem", textTransform: "capitalize" }}
                onClick={() => setFilterRole(r)}
              >
                {r === "all" ? "All Users" : (r === "patient" ? "Patients" : "Admins")}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={loadUsers}
            style={{ padding: "5px 10px", fontSize: "0.72rem", borderRadius: 0 }}
            title="Refresh user list"
          >
            <RefreshCw size={12} className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: "var(--risk-low-bg)", color: "var(--risk-low)", border: "1px solid var(--risk-low)", padding: "8px 12px", fontSize: "0.76rem", fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Bento Stat Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        <div className="bento-stat">
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num">{users.length}</div>
          <div className="bento-stat-label">Total Accounts</div>
        </div>
        <div className="bento-stat" style={{ background: "var(--bg-surface-alt)" }}>
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num" style={{ color: "var(--primary)" }}>
            {users.filter((u) => u.role === "patient").length}
          </div>
          <div className="bento-stat-label">Patients</div>
        </div>
        <div className="bento-stat">
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num" style={{ color: "var(--text-primary)" }}>
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="bento-stat-label">Admins & SecOps</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-panel" style={{ borderRadius: 0, border: "1px solid var(--border-default)", padding: 0 }}>
        <div className="data-table-wrap" style={{ borderRadius: 0, border: "none" }}>
          <table className="clinical-data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name & Username</th>
                <th>Authority Role</th>
                <th>Primary Contact</th>
                <th>Hospital / Lab Affiliation</th>
                <th>Medical License</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><code>{u.id}</code></td>
                    <td>
                      <strong style={{ display: "block" }}>{u.name}</strong>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>@{u.username}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        border: "1px solid var(--border-default)",
                        borderRadius: 0,
                        background: u.role === "admin" ? "var(--accent-violet-soft)" : "var(--risk-low-bg)",
                        color: u.role === "admin" ? "var(--accent-violet)" : "var(--risk-low)",
                        textTransform: "capitalize",
                      }}>
                        {u.role === "admin" ? "Administrator" : "Patient"}
                      </span>
                    </td>
                    <td>
                      <div>{u.email}</div>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{u.emergency_phone}</span>
                    </td>
                    <td>{u.hospital_affiliation || "—"}</td>
                    <td><code style={{ fontSize: "0.70rem" }}>{u.license_number || "—"}</code></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setEditUser(u)}
                          style={{ padding: "3px 8px", fontSize: "0.68rem", borderRadius: 0 }}
                          title="Edit user profile & authority"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setDeleteUserModal(u)}
                          style={{ padding: "3px 8px", fontSize: "0.68rem", color: "var(--risk-high)", borderColor: "var(--risk-high)", borderRadius: 0 }}
                          title="Delete user account"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "16px" }}>
                    {loading ? "Loading users from SQLite database..." : "No matching user profiles found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New User */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px", padding: "20px", borderRadius: 0, border: "1px solid var(--border-default)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
              <strong style={{ fontSize: "1.05rem", color: "var(--primary)" }}>Register New Platform User</strong>
              <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Username</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="e.g. rahul.user"
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Authority Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  >
                    <option value="patient">Patient (Autonomous Health Checkups & Twin)</option>
                    <option value="admin">Administrator (Audit & Security)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Primary Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="patient@healthnet.org"
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Emergency Phone Number</label>
                  <input
                    type="text"
                    value={newUser.emergency_phone}
                    onChange={(e) => setNewUser({ ...newUser, emergency_phone: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Hospital / Lab Affiliation</label>
                  <input
                    type="text"
                    value={newUser.hospital_affiliation}
                    onChange={(e) => setNewUser({ ...newUser, hospital_affiliation: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Health Record / Staff ID</label>
                  <input
                    type="text"
                    value={newUser.license_number}
                    onChange={(e) => setNewUser({ ...newUser, license_number: e.target.value })}
                    placeholder="PT-REC-2026-XXXX"
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "6px" }}>
                <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User Authority & Profile */}
      {editUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px", padding: "20px", borderRadius: 0, border: "1px solid var(--border-default)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
              <strong style={{ fontSize: "1.05rem", color: "var(--primary)" }}>Edit Authority: {editUser.name}</strong>
              <button type="button" onClick={() => setEditUser(null)} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Full Name</label>
                  <input
                    type="text"
                    value={editUser.name || ""}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Authority Role</label>
                  <select
                    value={editUser.role || "patient"}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  >
                    <option value="patient">Patient (Autonomous Health Checkups & Twin)</option>
                    <option value="admin">Administrator (Audit & Security)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Email</label>
                  <input
                    type="email"
                    value={editUser.email || ""}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={editUser.emergency_phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, emergency_phone: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>Affiliation</label>
                  <input
                    type="text"
                    value={editUser.hospital_affiliation || ""}
                    onChange={(e) => setEditUser({ ...editUser, hospital_affiliation: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>License Number</label>
                  <input
                    type="text"
                    value={editUser.license_number || ""}
                    onChange={(e) => setEditUser({ ...editUser, license_number: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "6px" }}>
                <button type="button" className="btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteUserModal && (
        <div className="modal-overlay" style={{ backdropFilter: "blur(6px)" }}>
          <div className="modal-content" style={{ maxWidth: "480px", padding: "22px", borderRadius: 0, border: "2px solid var(--risk-high)", background: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--risk-high)", marginBottom: "10px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <AlertCircle size={20} />
              <div>
                <strong style={{ fontSize: "0.95rem", textTransform: "uppercase" }}>Confirm User Account Deletion</strong>
                <span style={{ fontSize: "0.62rem", display: "block", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  TARGET: {deleteUserModal.name} ({deleteUserModal.username})
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
              Are you sure you want to permanently delete user <strong>{deleteUserModal.name}</strong> (<code>{deleteUserModal.username}</code>) from SQLite? This action will be logged in the immutable WORM audit trail.
            </p>

            <div style={{ marginBottom: "14px", background: "var(--bg-canvas)", padding: "12px", border: "1px solid var(--border-default)" }}>
              <label style={{ display: "block", fontSize: "0.70rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "5px" }}>
                Type <code style={{ color: "var(--risk-high)", fontWeight: 900, background: "var(--risk-high-bg)", padding: "1px 5px" }}>confirm deletion account</code> to authorize:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="confirm deletion account"
                style={{
                  width: "100%",
                  padding: "7px 9px",
                  border: deleteConfirmText.trim().toLowerCase() === "confirm deletion account" ? "2px solid var(--risk-low)" : "1px solid var(--border-default)",
                  fontSize: "0.80rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                }}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setDeleteUserModal(null);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (deleteConfirmText.trim().toLowerCase() === "confirm deletion account") {
                    handleDelete(deleteUserModal.id);
                    setDeleteConfirmText("");
                  }
                }}
                disabled={deleteConfirmText.trim().toLowerCase() !== "confirm deletion account"}
                style={{
                  background: deleteConfirmText.trim().toLowerCase() === "confirm deletion account" ? "var(--risk-high)" : "#CBD5E1",
                  borderColor: deleteConfirmText.trim().toLowerCase() === "confirm deletion account" ? "var(--risk-high)" : "#CBD5E1",
                  cursor: deleteConfirmText.trim().toLowerCase() === "confirm deletion account" ? "pointer" : "not-allowed",
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                Permanently Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
