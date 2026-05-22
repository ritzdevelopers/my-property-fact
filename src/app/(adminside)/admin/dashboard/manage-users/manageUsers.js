"use client";
import { useState, useEffect, useMemo } from "react";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faMagnifyingGlass, faFilter, faCircleCheck, faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { ADMIN_PERMISSIONS } from "../../adminPermissions";

const apiWithAuth = () => ({
  withCredentials: true,
  headers: {
    ...(typeof window !== "undefined" && Cookies.get("token")
      ? { Authorization: `Bearer ${Cookies.get("token")}` }
      : {}),
  },
});

const USER_CATEGORY_OPTIONS = [
  { value: "APP_USER", label: "App User", hint: "Registered from website/app flows" },
  { value: "ADMIN_USER", label: "Admin User", hint: "Created from admin portal side" },
  { value: "TEST_USER", label: "Test User", hint: "Internal QA/testing account" },
];

const USER_CATEGORY_LABELS = {
  APP_USER: "App User",
  ADMIN_USER: "Admin User",
  TEST_USER: "Test User",
};

function normalizeUserCategory(value) {
  const v = String(value || "").trim().toUpperCase();
  return USER_CATEGORY_LABELS[v] ? v : "APP_USER";
}

export default function ManageUsers({ users: initialUsers }) {
  const router = useRouter();
  const { isSuperAdmin, currentUserId } = useAdminRole();
  const [users, setUsers] = useState(initialUsers || []);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [permissionDefinitions, setPermissionDefinitions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  /** { row, keys } — Super Admin permission detail modal */
  const [permView, setPermView] = useState(null);
  /** One-time PIN display after save (plaintext not stored server-side) */
  const [enquiryPinReveal, setEnquiryPinReveal] = useState(null);
  /** Account details after Super Admin creates a user (copy to clipboard) */
  const [accountCreatedReveal, setAccountCreatedReveal] = useState(null);
  /** Pending permanent delete confirmation (modal). */
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  /** Reject pending portal registration (modal). */
  const [rejectStaffUser, setRejectStaffUser] = useState(null);
  const [rejectStaffSubmitting, setRejectStaffSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    email: "",
    phone: "",
    location: "",
    enabled: true,
    verified: false,
    roleIds: [],
    newPassword: "",
    confirmPassword: "",
    dashboardUsername: "",
    adminPermissions: [],
    enquiryAccessPin: "",
    userCategory: "APP_USER",
  });

  // Fetch roles and users on the client with the same auth as other admin calls.
  // The server render often cannot forward the HttpOnly session cookie to the API the
  // way the browser can withCredentials — so /admin/roles may work while SSR users stay empty.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setRolesLoading(true);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}admin/roles`,
          apiWithAuth(),
        );

        if (
          !cancelled &&
          response.data &&
          response.data.success &&
          response.data.roles
        ) {
          setRoles(response.data.roles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        if (!cancelled) setRoles([]);
      }

      try {
        const permRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}admin-portal/auth/admin-permission-definitions`,
          apiWithAuth(),
        );
        if (!cancelled && Array.isArray(permRes.data)) {
          setPermissionDefinitions(permRes.data);
        }
      } catch {
        if (!cancelled) setPermissionDefinitions([]);
      }

      try {
        const usersRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}users`,
          apiWithAuth(),
        );

        if (
          !cancelled &&
          usersRes.status === 200 &&
          Array.isArray(usersRes.data)
        ) {
          setUsers(usersRes.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isCreateMode = !formData.id;

  const assignableRoles = useMemo(
    () =>
      (roles || []).filter(
        (r) => String(r?.roleName || "").toUpperCase() !== "SUPERADMIN",
      ),
    [roles],
  );

  const openCreateModal = () => {
    setEditingUser(null);
    const userRole = assignableRoles.find(
      (r) => String(r?.roleName || "").toUpperCase() === "USER",
    );
    setFormData({
      id: null,
      fullName: "",
      email: "",
      phone: "",
      location: "",
      enabled: true,
      verified: true,
      roleIds: userRole ? [userRole.id] : [],
      newPassword: "",
      confirmPassword: "",
      dashboardUsername: "",
      adminPermissions: [],
      enquiryAccessPin: "",
      userCategory: "ADMIN_USER",
    });
    setShowModal(true);
  };

  const buildAccountClipboardText = (details) => {
    if (!details) return "";
    const lines = [
      "My Property Fact — new account",
      `Full name: ${details.fullName || "—"}`,
      `Email: ${details.email || "—"}`,
      `Password: ${details.password || "—"}`,
      `Dashboard username: ${details.dashboardUsername || "—"}`,
      `Roles: ${details.roles || "—"}`,
      `User segment: ${details.userCategory || "—"}`,
      `Status: ${details.enabled ? "Active" : "Inactive"}`,
      `Sign in: ${details.signInUrl || "https://mypropertyfact.in/admin"}`,
    ];
    if (details.enquiryAccessPin) {
      lines.push(`Enquiries access code: ${details.enquiryAccessPin}`);
    }
    return lines.join("\n");
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    const userRoleIds = user.roles ? user.roles.map((role) => role.id) : [];
    setFormData({
      id: user.id,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      enabled: user.enabled !== undefined ? user.enabled : true,
      verified: user.verified !== undefined ? user.verified : false,
      roleIds: userRoleIds,
      newPassword: "",
      confirmPassword: "",
      dashboardUsername: user.dashboardUsername || "",
      adminPermissions: Array.isArray(user.adminPermissions)
        ? [...user.adminPermissions]
        : [],
      enquiryAccessPin: "",
      userCategory: normalizeUserCategory(user.userCategory),
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      id: null,
      fullName: "",
      email: "",
      phone: "",
      location: "",
      enabled: true,
      verified: false,
      roleIds: [],
      newPassword: "",
      confirmPassword: "",
      dashboardUsername: "",
      adminPermissions: [],
      enquiryAccessPin: "",
      userCategory: "APP_USER",
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => {
        if (name === "enquiryAccessPin") {
          const digits = String(value).replace(/\D/g, "").slice(0, 4);
          return { ...prev, [name]: digits };
        }
        return { ...prev, [name]: value };
      });
    }
  };

  const handleRoleChange = (roleId) => {
    setFormData((prev) => {
      const roleIds = prev.roleIds || [];
      const togglingOffAdmin =
        roleIds.includes(roleId) &&
        roles.find((r) => r.id === roleId && String(r.roleName).toUpperCase() === "ADMIN");
      if (roleIds.includes(roleId)) {
        return {
          ...prev,
          roleIds: roleIds.filter((id) => id !== roleId),
          adminPermissions: togglingOffAdmin ? [] : prev.adminPermissions,
        };
      } else {
        return {
          ...prev,
          roleIds: [...roleIds, roleId],
        };
      }
    });
  };

  const handleUserCategoryPick = (value) => {
    setFormData((prev) => ({
      ...prev,
      userCategory: normalizeUserCategory(value),
    }));
  };

  const handleAdminPermissionToggle = (key) => {
    setFormData((prev) => {
      const cur = prev.adminPermissions || [];
      const k = String(key).toUpperCase();
      if (cur.map((x) => String(x).toUpperCase()).includes(k)) {
        const nextPerms = cur.filter((x) => String(x).toUpperCase() !== k);
        return {
          ...prev,
          adminPermissions: nextPerms,
          enquiryAccessPin:
            k === ADMIN_PERMISSIONS.MANAGE_ENQUIRIES ? "" : prev.enquiryAccessPin,
        };
      }
      return { ...prev, adminPermissions: [...cur, k] };
    });
  };

  const editorHasAdminRole = () => {
    const names = (roles || [])
      .filter((r) => formData.roleIds.includes(r.id))
      .map((r) => String(r.roleName || "").toUpperCase());
    return names.includes("ADMIN");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCreateMode) {
      if (!formData.email?.trim()) {
        toast.error("Email is required.");
        return;
      }
      if (!formData.newPassword || formData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Password and confirmation do not match.");
        return;
      }
      const hasAdminRoleSelected = editorHasAdminRole();
      if (hasAdminRoleSelected && !formData.dashboardUsername?.trim()) {
        toast.error("Dashboard username is required when Admin role is selected.");
        return;
      }

      const permsUpper = (formData.adminPermissions || []).map((x) =>
        String(x || "").toUpperCase(),
      );
      const hasEnquiryPerm = permsUpper.includes(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);
      const pinTrim = (formData.enquiryAccessPin || "").trim();
      if (isSuperAdmin && hasAdminRoleSelected && hasEnquiryPerm && !/^\d{4}$/.test(pinTrim)) {
        toast.error(
          "Set a 4-digit enquiries access code when enabling Manage enquiries.",
        );
        return;
      }

      setShowLoading(true);
      try {
        const jsonAuth = {
          ...apiWithAuth(),
          headers: {
            ...apiWithAuth().headers,
            "Content-Type": "application/json",
          },
        };
        const payload = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.newPassword,
          phone: formData.phone?.trim() || undefined,
          dashboardUsername: formData.dashboardUsername?.trim() || undefined,
          roleIds: formData.roleIds?.length ? formData.roleIds : undefined,
          enabled: formData.enabled,
          verified: formData.verified,
          userCategory: normalizeUserCategory(formData.userCategory),
        };
        if (hasAdminRoleSelected) {
          payload.adminPermissions = formData.adminPermissions || [];
          if (hasEnquiryPerm && /^\d{4}$/.test(pinTrim)) {
            payload.enquiryAccessPin = pinTrim;
          }
        }

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}users`,
          payload,
          jsonAuth,
        );

        const u = res.data?.user || {};
        const roleLabel = Array.isArray(res.data?.roleNames)
          ? res.data.roleNames.join(", ")
          : getRoleNames(u.roles || []);
        const signInUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/admin`
            : "https://mypropertyfact.in/admin";

        setAccountCreatedReveal({
          fullName: u.fullName || formData.fullName,
          email: u.email || formData.email,
          password: res.data?.password || formData.newPassword,
          dashboardUsername: u.dashboardUsername || formData.dashboardUsername || "—",
          roles: roleLabel,
          userCategory:
            USER_CATEGORY_LABELS[normalizeUserCategory(u.userCategory || formData.userCategory)],
          enabled: u.enabled !== false,
          enquiryAccessPin: res.data?.enquiryAccessPin || "",
          signInUrl,
        });

        toast.success("User created successfully");
        await reloadUsersList();
        handleClose();
      } catch (error) {
        console.error("Error creating user:", error);
        const msg =
          error.response?.data?.message ||
          (Array.isArray(error.response?.data?.errors)
            ? error.response.data.errors.map((x) => x.defaultMessage || x).join(", ")
            : null) ||
          "Failed to create user";
        toast.error(msg);
      } finally {
        setShowLoading(false);
      }
      return;
    }

    const wantPasswordChange =
      (formData.newPassword || "").trim().length > 0 ||
      (formData.confirmPassword || "").trim().length > 0;

    if (wantPasswordChange) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirmation do not match.");
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
    }

    const permsUpper = (formData.adminPermissions || []).map((x) =>
      String(x || "").toUpperCase(),
    );
    const hasEnquiryPerm = permsUpper.includes(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);
    const pinTrim = (formData.enquiryAccessPin || "").trim();
    if (isSuperAdmin && editorHasAdminRole() && hasEnquiryPerm) {
      if (!editingUser?.enquiryAccessPinSet) {
        if (!/^\d{4}$/.test(pinTrim)) {
          toast.error(
            "Set a 4-digit enquiries access code when enabling Manage enquiries.",
          );
          return;
        }
      } else if (pinTrim.length > 0 && !/^\d{4}$/.test(pinTrim)) {
        toast.error("Enquiries code must be exactly 4 digits.");
        return;
      }
    }

    setShowLoading(true);

    try {
      const auth = apiWithAuth();
      const jsonAuth = {
        ...auth,
        headers: { ...auth.headers, "Content-Type": "application/json" },
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${formData.id}/roles`,
        formData.roleIds,
        jsonAuth,
      );

      const userPayload = {
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        verified: formData.verified,
        enabled: formData.enabled,
        dashboardUsername: formData.dashboardUsername,
      };
      if (isSuperAdmin) {
        userPayload.userCategory = normalizeUserCategory(formData.userCategory);
      }
      if (editorHasAdminRole()) {
        userPayload.adminPermissions = formData.adminPermissions || [];
      }
      if (
        isSuperAdmin &&
        editorHasAdminRole() &&
        hasEnquiryPerm &&
        /^\d{4}$/.test(pinTrim)
      ) {
        userPayload.enquiryAccessPin = pinTrim;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${formData.id}`,
        userPayload,
        jsonAuth,
      );

      if (wantPasswordChange) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}users/${formData.id}/password`,
          { newPassword: formData.newPassword },
          jsonAuth,
        );
      }

      const revealPinAfterSave =
        isSuperAdmin &&
        editorHasAdminRole() &&
        hasEnquiryPerm &&
        /^\d{4}$/.test(pinTrim);
      const revealLabel =
        formData.fullName || editingUser?.email || "User";
      const revealPin = pinTrim;

      toast.success(
        wantPasswordChange
          ? "User updated and password changed."
          : "User updated successfully",
      );
      await reloadUsersList();
      handleClose();
      if (revealPinAfterSave) {
        setEnquiryPinReveal({ fullName: revealLabel, pin: revealPin });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.map((x) => x.defaultMessage || x).join(", ")
          : null) ||
        "Failed to update user";
      toast.error(msg);
    } finally {
      setShowLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/activate`,
        {},
        apiWithAuth(),
      );

      toast.success("User activated successfully");
      await reloadUsersList();
    } catch (error) {
      console.error("Error activating user:", error);
      toast.error("Failed to activate user");
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/deactivate`,
        {},
        apiWithAuth(),
      );
      if (response.status === 200) {
        toast.success("User deactivated successfully");
        await reloadUsersList();
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate user");
    }
  };

  const openDeleteConfirm = (row) => {
    if (
      currentUserId != null &&
      Number(row?.id) === Number(currentUserId)
    ) {
      toast.error("You cannot delete your own account.");
      return;
    }
    setDeleteConfirmUser(row);
  };

  const closeDeleteConfirm = () => {
    if (!deleteSubmitting) {
      setDeleteConfirmUser(null);
    }
  };

  const confirmDeletePermanently = async () => {
    const row = deleteConfirmUser;
    if (!row?.id) return;
    setDeleteSubmitting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}users/${row.id}`,
        apiWithAuth(),
      );
      toast.success("User deleted.");
      setDeleteConfirmUser(null);
      await reloadUsersList();
      if (
        editingUser &&
        Number(editingUser.id) === Number(row.id)
      ) {
        handleClose();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete user.";
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const reloadUsersList = async () => {
    try {
      const usersRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}users`,
        apiWithAuth(),
      );
      if (usersRes.status === 200 && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      }
    } catch (e) {
      console.error(e);
    }
    router.refresh();
  };

  const handleApproveAdminStaff = async (userRow) => {
    const userId = userRow?.id ?? userRow;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/approve-admin-staff`,
        {},
        apiWithAuth(),
      );
      toast.success("Registration approved.");
      await reloadUsersList();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    }
  };

  const openRejectStaffConfirm = (userRow) => {
    setRejectStaffUser(userRow);
  };

  const closeRejectStaffConfirm = () => {
    if (!rejectStaffSubmitting) {
      setRejectStaffUser(null);
    }
  };

  const confirmRejectAdminStaff = async () => {
    const userRow = rejectStaffUser;
    if (!userRow) return;
    const userId = userRow?.id ?? userRow;
    setRejectStaffSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/reject-admin-staff`,
        {},
        apiWithAuth(),
      );
      toast.success("Rejected.");
      setRejectStaffUser(null);
      await reloadUsersList();
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed");
    } finally {
      setRejectStaffSubmitting(false);
    }
  };

  const getRoleNames = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return "No roles";
    return userRoles.map((role) => role.roleName).join(", ");
  };

  const allRoleNames = useMemo(() => {
    const set = new Set();
    users.forEach((u) => (u.roles || []).forEach((r) => r?.roleName && set.add(r.roleName)));
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter) {
        const hasRole = (user.roles || []).some(
          (r) => String(r?.roleName ?? "").toUpperCase() === roleFilter.toUpperCase()
        );
        if (!hasRole) return false;
      }
      if (!q) return true;
      const blob = [
        user.fullName,
        user.email,
        user.phone,
        user.dashboardUsername,
        user.location,
        String(user.id ?? ""),
        ...(user.roles || []).map((r) => String(r?.roleName ?? "")),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [users, userSearch, roleFilter]);

  return (
    <div className="container-fluid px-0">
      <DashboardHeader heading="Manage Users" pageStyle="executivePlain" />

      <div className="mt-2">
        <div className="manage-users-toolbar">
          <InputGroup className="manage-users-search">
            <InputGroup.Text
              className="bg-white border-end-0"
              style={{ borderColor: "rgba(27, 46, 36, 0.12)" }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search name, email, phone, username…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              aria-label="Search users"
              style={{ borderLeft: "none" }}
            />
          </InputGroup>
          <InputGroup style={{ maxWidth: 200, flex: "0 0 auto" }}>
            <InputGroup.Text className="bg-white border-end-0" style={{ borderColor: "rgba(27,46,36,0.12)" }}>
              <FontAwesomeIcon icon={faFilter} className="text-muted" style={{ fontSize: "0.78rem" }} />
            </InputGroup.Text>
            <Form.Select
              size="sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by role"
              style={{ borderLeft: "none", fontSize: "0.85rem", borderColor: "rgba(27,46,36,0.12)" }}
            >
              <option value="">All roles</option>
              {allRoleNames.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Form.Select>
          </InputGroup>
          <span className="manage-users-count">
            Showing {filteredUsers.length} of {users.length} users
          </span>
          {isSuperAdmin ? (
            <Button
              type="button"
              className="manage-users-create-btn ms-auto"
              onClick={openCreateModal}
            >
              Create user
            </Button>
          ) : null}
        </div>

        <div className="manage-users-table-scroll" style={{ borderRadius: "12px", border: "1px solid #f3f4f6" }}>
          <table className="table table-sm manage-users-compact-table mb-0" style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Dash. user</th>
                <th>Phone</th>
                <th>Roles</th>
                <th>User type</th>
                {isSuperAdmin ? (
                  <>
                    <th>Admin</th>
                    <th>Perms</th>
                    <th>Enq. code</th>
                  </>
                ) : null}
                <th>Status</th>
                <th>Ver.</th>
                <th style={{ minWidth: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 13 : 10}
                    className="text-center text-muted py-4"
                  >
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleNamesUpper = (user.roles || []).map((r) =>
                    String(r?.roleName || "").toUpperCase(),
                  );
                  const waitingPortalActivation =
                    typeof user.portalActivationPending === "boolean"
                      ? user.portalActivationPending
                      : user.adminStaffApproved === false &&
                          !roleNamesUpper.includes("SUPERADMIN");
                  const pendingPortalApproval =
                    isSuperAdmin && waitingPortalActivation;
                  const roleLabel = getRoleNames(user.roles);
                  const roleParts = roleLabel.split(", ");
                  const enabled =
                    user.enabled !== undefined ? user.enabled : true;

                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td className="fw-medium">{user.fullName || "—"}</td>
                      <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }} title={user.email}>
                        {user.email || "—"}
                      </td>
                      <td>{user.dashboardUsername || "—"}</td>
                      <td>{user.phone || "—"}</td>
                      <td>
                        {roleParts.length === 1 && roleParts[0] === "No roles" ? (
                          <span className="admin-chip-role-muted">No roles</span>
                        ) : (
                          roleParts.map((role, idx) => (
                            <span key={idx} className="admin-chip-role">
                              {role}
                            </span>
                          ))
                        )}
                      </td>
                      <td>
                        <span className="admin-chip-user-type">
                          {USER_CATEGORY_LABELS[normalizeUserCategory(user.userCategory)]}
                        </span>
                      </td>
                      {isSuperAdmin ? (
                        <>
                          <td>
                            {waitingPortalActivation ? (
                              <span className="admin-chip-warn">Pending</span>
                            ) : !roleNamesUpper.includes("ADMIN") ? (
                              <span className="text-muted small">—</span>
                            ) : (
                              <span className="admin-chip-ok">OK</span>
                            )}
                          </td>
                          <td>
                            {(() => {
                              const keys = user.adminPermissions || [];
                              const isStaffAdmin =
                                roleNamesUpper.includes("ADMIN") &&
                                !roleNamesUpper.includes("SUPERADMIN");
                              if (!isStaffAdmin) {
                                return (
                                  <span className="text-muted small">—</span>
                                );
                              }
                              if (!keys.length) {
                                return (
                                  <span className="text-muted small">None</span>
                                );
                              }
                              return (
                                <Button
                                  variant="link"
                                  className="p-0 small admin-perm-view-link"
                                  onClick={() =>
                                    setPermView({
                                      row: user,
                                      keys: [...keys],
                                    })
                                  }
                                >
                                  View ({keys.length})
                                </Button>
                              );
                            })()}
                          </td>
                          <td>
                            {(() => {
                              const isStaffAdmin =
                                roleNamesUpper.includes("ADMIN") &&
                                !roleNamesUpper.includes("SUPERADMIN");
                              const hasEnq = (user.adminPermissions || [])
                                .map((x) => String(x || "").toUpperCase())
                                .includes(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);
                              if (!isStaffAdmin || !hasEnq) {
                                return (
                                  <span className="text-muted small">—</span>
                                );
                              }
                              if (user.enquiryAccessPinSet) {
                                return (
                                  <span
                                    className="admin-chip-ok"
                                    title="Stored securely; the code cannot be shown again. Edit user to set a new code."
                                  >
                                    Set
                                  </span>
                                );
                              }
                              return (
                                <span className="admin-chip-warn">Not set</span>
                              );
                            })()}
                          </td>
                        </>
                      ) : null}
                      <td>
                        {enabled ? (
                          <span className="admin-chip-ok">Active</span>
                        ) : (
                          <span className="admin-chip-role-muted">Off</span>
                        )}
                      </td>
                      <td>
                        {user.verified ? (
                          <span className="admin-chip-ok">Yes</span>
                        ) : (
                          <span className="admin-chip-role-muted">No</span>
                        )}
                      </td>
                      <td>
                        <div className="manage-users-actions-grid" style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                          {pendingPortalApproval ? (
                            <>
                              <button
                                className="mu-action-btn mu-action-btn--approve"
                                title="Approve registration"
                                onClick={() => handleApproveAdminStaff(user)}
                              >
                                <FontAwesomeIcon icon={faCircleCheck} />
                              </button>
                              <button
                                className="mu-action-btn mu-action-btn--reject"
                                title="Reject registration"
                                onClick={() => openRejectStaffConfirm(user)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </>
                          ) : null}
                          <button
                            className="mu-action-btn mu-action-btn--edit"
                            title="Edit user"
                            onClick={() => openEditModal(user)}
                          >
                            <img
                              src="/images/admin/edit.svg"
                              alt="Edit"
                              width={16}
                              height={16}
                              style={{ pointerEvents: "none" }}
                            />
                          </button>
                          {enabled ? (
                            <button
                              className="mu-action-btn mu-action-btn--deactivate"
                              title="Deactivate"
                              onClick={() => handleDeactivate(user.id)}
                            >
                              <img
                                src="/images/admin/delete.svg"
                                alt="Deactivate"
                                width={14}
                                height={14}
                                style={{ pointerEvents: "none" }}
                              />
                            </button>
                          ) : (
                            <button
                              className="mu-action-btn mu-action-btn--activate"
                              title="Activate"
                              onClick={() => handleActivate(user.id)}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          )}
                          {isSuperAdmin ? (
                            <button
                              type="button"
                              className="mu-action-btn mu-action-btn--danger"
                              title="Permanently delete user"
                              disabled={
                                currentUserId != null &&
                                Number(user.id) === Number(currentUserId)
                              }
                              aria-label="Permanently delete user"
                              onClick={() => openDeleteConfirm(user)}
                              style={{
                                opacity:
                                  currentUserId != null &&
                                  Number(user.id) === Number(currentUserId)
                                    ? 0.45
                                    : 1,
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject pending registration confirmation */}
      <Modal
        show={!!rejectStaffUser}
        onHide={closeRejectStaffConfirm}
        centered
        backdrop={rejectStaffSubmitting ? "static" : true}
        keyboard={!rejectStaffSubmitting}
        dialogClassName="admin-modal-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary-subtle">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faTimes} className="text-danger" aria-hidden />
            Reject registration?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rejectStaffUser ? (
            <>
              <p className="mb-3">
                {(() => {
                  const rolesUpper = (rejectStaffUser.roles || []).map((r) =>
                    String(r?.roleName || "").toUpperCase(),
                  );
                  return rolesUpper.includes("ADMIN")
                    ? "The Admin role and dashboard username will be removed."
                    : "The portal account will be disabled.";
                })()}
              </p>
              <div
                className="rounded p-3 mb-0"
                style={{
                  background: "rgba(220, 38, 38, 0.06)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                }}
              >
                <div className="fw-semibold">{rejectStaffUser.fullName || "—"}</div>
                <div className="small text-break" style={{ wordBreak: "break-all" }}>
                  {rejectStaffUser.email || "—"}
                </div>
                <div className="text-muted small mt-1">User ID: {rejectStaffUser.id}</div>
              </div>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-secondary-subtle gap-2 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            className="btn-admin-secondary"
            disabled={rejectStaffSubmitting}
            onClick={closeRejectStaffConfirm}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={rejectStaffSubmitting}
            onClick={confirmRejectAdminStaff}
          >
            {rejectStaffSubmitting ? "Rejecting…" : "Reject registration"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permanent delete confirmation */}
      <Modal
        show={!!deleteConfirmUser}
        onHide={closeDeleteConfirm}
        centered
        backdrop={deleteSubmitting ? "static" : true}
        keyboard={!deleteSubmitting}
        dialogClassName="admin-modal-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary-subtle">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faTrash} className="text-danger" aria-hidden />
            Delete user permanently?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteConfirmUser ? (
            <>
              <p className="mb-2">
                This will permanently remove the account from the system. This action
                cannot be undone.
              </p>
              <p className="text-muted small mb-3">
                Deletion only succeeds if this user has no property listings. Otherwise
                remove or transfer those listings first (see error message from the
                server).
              </p>
              <div
                className="rounded p-3 mb-0"
                style={{
                  background: "rgba(220, 38, 38, 0.06)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                }}
              >
                <div className="fw-semibold">{deleteConfirmUser.fullName || "—"}</div>
                <div className="small text-break" style={{ wordBreak: "break-all" }}>
                  {deleteConfirmUser.email || "—"}
                </div>
                <div className="text-muted small mt-1">User ID: {deleteConfirmUser.id}</div>
              </div>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-secondary-subtle gap-2 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            className="btn-admin-secondary"
            disabled={deleteSubmitting}
            onClick={closeDeleteConfirm}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleteSubmitting}
            onClick={confirmDeletePermanently}
          >
            {deleteSubmitting ? "Deleting…" : "Delete permanently"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        scrollable
        dialogClassName="admin-modal-dialog admin-modal-dialog-wide"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isCreateMode ? "Create user" : "Edit user"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
          <Modal.Body>
            <div className="admin-modal-section-title">Profile</div>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-1">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-1">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isCreateMode}
                    readOnly={!isCreateMode}
                    required={isCreateMode}
                  />
                  <Form.Text className="text-muted">
                    {isCreateMode
                      ? "Used for sign-in and account recovery."
                      : "Email cannot be changed"}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mt-0">
              <Col md={6}>
                <Form.Group className="mb-1">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-1">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Dashboard username</Form.Label>
                  <Form.Control
                    type="text"
                    name="dashboardUsername"
                    value={formData.dashboardUsername || ""}
                    onChange={handleChange}
                    placeholder="Required for Admin login at /admin"
                  />
                  <Form.Text className="text-muted">
                    Used with email and password on the admin sign-in page.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="admin-modal-section-title">Account status</div>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="enabled"
                    label="Active (can sign in)"
                    checked={!!formData.enabled}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="verified"
                    label="Email verified"
                    checked={!!formData.verified}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            {isSuperAdmin ? (
              <div className="admin-user-type-card mb-3">
                <div className="admin-modal-section-title mb-2">User segment</div>
                <div className="admin-user-type-options" role="radiogroup" aria-label="User segment">
                  {USER_CATEGORY_OPTIONS.map((opt) => {
                    const active = normalizeUserCategory(formData.userCategory) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`admin-user-type-option${active ? " is-active" : ""}`}
                        onClick={() => handleUserCategoryPick(opt.value)}
                      >
                        <span className="admin-user-type-option-title">{opt.label}</span>
                        <span className="admin-user-type-option-hint">{opt.hint}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="admin-user-type-preview mt-2">
                  Current label:{" "}
                  <span className="admin-chip-user-type">
                    {USER_CATEGORY_LABELS[normalizeUserCategory(formData.userCategory)]}
                  </span>
                </div>
                <Form.Text className="text-muted">
                  Super Admin can mark each account as App User, Admin User, or Test User.
                </Form.Text>
              </div>
            ) : null}

            <div className="admin-modal-section-title">
              {isCreateMode ? "Password" : "Password"}
            </div>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isCreateMode ? "Password" : "New password (optional)"}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder={
                      isCreateMode
                        ? "At least 8 characters"
                        : "Leave blank to keep current password"
                    }
                    value={formData.newPassword}
                    onChange={handleChange}
                    required={isCreateMode}
                    minLength={isCreateMode ? 8 : undefined}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isCreateMode ? "Confirm password" : "Confirm new password"}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder={
                      isCreateMode ? "Repeat password" : "Repeat if changing password"
                    }
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={isCreateMode}
                    minLength={isCreateMode ? 8 : undefined}
                  />
                  <Form.Text className="text-muted">
                    {isCreateMode
                      ? "Share these credentials securely with the new user."
                      : "Min. 8 characters. Only applies when you reset this user\u2019s password."}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="admin-modal-section-title">Roles</div>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <div className="admin-modal-check-scroll">
                    {rolesLoading ? (
                      <div className="text-center py-3">
                        <small className="text-muted">Loading roles...</small>
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="text-center py-3">
                        <small className="text-muted">
                          No roles available. You may not have permission to
                          view roles.
                        </small>
                      </div>
                    ) : (
                      assignableRoles.map((role) => (
                        <Form.Check
                          key={role.id}
                          type="checkbox"
                          id={`role-${role.id}`}
                          label={role.roleName}
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => handleRoleChange(role.id)}
                        />
                      ))
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            {isSuperAdmin && editorHasAdminRole() && permissionDefinitions.length > 0 && (
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-2">
                    <div className="admin-modal-section-title">
                      Admin permissions
                    </div>
                    <div className="admin-modal-check-scroll admin-modal-check-scroll-lg">
                      {permissionDefinitions.map((def) => {
                        const key = def.key;
                        const checked = (formData.adminPermissions || [])
                          .map((x) => String(x).toUpperCase())
                          .includes(String(key).toUpperCase());
                        return (
                          <Form.Check
                            key={key}
                            type="checkbox"
                            id={`perm-${key}`}
                            label={
                              <span>
                                <strong>{def.label}</strong>
                                {def.description ? (
                                  <span className="text-muted small d-block">
                                    {def.description}
                                  </span>
                                ) : null}
                              </span>
                            }
                            checked={checked}
                            onChange={() => handleAdminPermissionToggle(key)}
                          />
                        );
                      })}
                    </div>
                    <Form.Text className="text-muted">
                      Only applies to users with the Admin role. Super Admin always has full access.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            )}
            {isSuperAdmin &&
              editorHasAdminRole() &&
              (formData.adminPermissions || [])
                .map((x) => String(x || "").toUpperCase())
                .includes(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES) && (
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enquiries 4-digit access code</Form.Label>
                    <Form.Control
                      type="password"
                      name="enquiryAccessPin"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder={
                        isCreateMode || !editingUser?.enquiryAccessPinSet
                          ? "Required (4 digits)"
                          : "•••• (leave blank to keep)"
                      }
                      value={formData.enquiryAccessPin}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      {editingUser?.enquiryAccessPinSet
                        ? "Leave blank to keep the current code, or enter a new 4-digit code to replace it. After save, the new code is shown once for you to copy."
                        : "The admin will enter this code on the Enquiries page to view leads. After save, the code is shown once for you to copy; it is not stored in readable form."}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="d-flex flex-wrap justify-content-end">
            <Button
              type="button"
              variant="secondary"
              className="btn-admin-secondary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-admin-primary text-white"
              disabled={showLoading}
            >
              {showLoading
                ? isCreateMode
                  ? "Creating…"
                  : "Saving…"
                : isCreateMode
                  ? "Create user"
                  : "Save changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={!!permView}
        onHide={() => setPermView(null)}
        centered
        scrollable
        dialogClassName="admin-modal-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Permissions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {permView ? (
            <>
              <p className="mb-1 fw-semibold" style={{ fontSize: "1.05rem" }}>
                {permView.row.fullName || "—"}
              </p>
              <p className="text-muted small mb-3" style={{ wordBreak: "break-all" }}>
                {permView.row.email}
              </p>
              <ul className="list-unstyled mb-0 admin-modal-perm-list">
                {permView.keys.map((key) => {
                  const def = permissionDefinitions.find(
                    (d) =>
                      String(d.key).toUpperCase() === String(key).toUpperCase(),
                  );
                  return (
                    <li
                      key={key}
                      className="mb-3 pb-3 border-bottom"
                      style={{ borderColor: "rgba(27, 46, 36, 0.1)" }}
                    >
                      <div className="fw-semibold">
                        {def?.label || key}
                      </div>
                      {def?.description ? (
                        <div className="text-muted small mt-1">
                          {def.description}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-admin-secondary"
            variant="secondary"
            onClick={() => setPermView(null)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!enquiryPinReveal}
        onHide={() => setEnquiryPinReveal(null)}
        centered
        dialogClassName="admin-modal-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Enquiries code saved</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {enquiryPinReveal ? (
            <>
              <p className="mb-2">
                Share this 4-digit code with{" "}
                <strong>{enquiryPinReveal.fullName}</strong> for the Enquiries
                page. It cannot be retrieved later from the dashboard.
              </p>
              <div
                className="d-flex align-items-center gap-2 flex-wrap mb-3"
                style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.2em" }}
              >
                <span
                  className="fs-3 fw-bold user-select-all px-3 py-2 rounded"
                  style={{
                    background: "rgba(0, 80, 50, 0.1)",
                    border: "1px solid rgba(0, 80, 50, 0.2)",
                  }}
                >
                  {enquiryPinReveal.pin}
                </span>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  className="btn-admin-secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        enquiryPinReveal.pin,
                      );
                      toast.success("Code copied to clipboard");
                    } catch {
                      toast.error("Could not copy — select and copy manually");
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} className="me-1" />
                  Copy
                </Button>
              </div>
              <p className="text-muted small mb-0">
                If you lose this code, edit the user and set a new 4-digit
                code.
              </p>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-admin-primary text-white"
            onClick={() => setEnquiryPinReveal(null)}
          >
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!accountCreatedReveal}
        onHide={() => setAccountCreatedReveal(null)}
        centered
        scrollable
        dialogClassName="admin-modal-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Account created</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {accountCreatedReveal ? (
            <>
              <p className="mb-3">
                Share these details with{" "}
                <strong>{accountCreatedReveal.fullName}</strong>. The password
                is not stored in plain text and cannot be shown again from this
                screen.
              </p>
              <pre
                className="user-select-all p-3 rounded small mb-3"
                style={{
                  background: "rgba(0, 80, 50, 0.06)",
                  border: "1px solid rgba(0, 80, 50, 0.15)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {buildAccountClipboardText(accountCreatedReveal)}
              </pre>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                className="btn-admin-secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      buildAccountClipboardText(accountCreatedReveal),
                    );
                    toast.success("Account details copied to clipboard");
                  } catch {
                    toast.error("Could not copy — select and copy manually");
                  }
                }}
              >
                <FontAwesomeIcon icon={faCopy} className="me-1" />
                Copy all to clipboard
              </Button>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-admin-primary text-white"
            onClick={() => setAccountCreatedReveal(null)}
          >
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
