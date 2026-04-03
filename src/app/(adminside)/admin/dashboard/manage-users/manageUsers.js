"use client";
import { useState, useEffect } from "react";
import { Button, Col, Form, Modal, Row, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";

const apiWithAuth = () => ({
  withCredentials: true,
  headers: {
    ...(typeof window !== "undefined" && Cookies.get("token")
      ? { Authorization: `Bearer ${Cookies.get("token")}` }
      : {}),
  },
});

export default function ManageUsers({ users: initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    email: "",
    phone: "",
    location: "",
    enabled: true,
    verified: false,
    roleIds: [],
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
      } finally {
        if (!cancelled) setRolesLoading(false);
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
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (roleId) => {
    setFormData((prev) => {
      const roleIds = prev.roleIds || [];
      if (roleIds.includes(roleId)) {
        return {
          ...prev,
          roleIds: roleIds.filter((id) => id !== roleId),
        };
      } else {
        return {
          ...prev,
          roleIds: [...roleIds, roleId],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowLoading(true);

    try {
      const auth = apiWithAuth();
      const jsonAuth = {
        ...auth,
        headers: { ...auth.headers, "Content-Type": "application/json" },
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${formData.id}`,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          verified: formData.verified,
          enabled: formData.enabled,
        },
        jsonAuth,
      );

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/${formData.id}/roles`,
        formData.roleIds,
        jsonAuth,
      );

      toast.success("User updated successfully");
      router.refresh();
      handleClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
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
      router.refresh();
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
        router.refresh();
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate user");
    }
  };

  const getRoleNames = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return "No roles";
    return userRoles.map((role) => role.roleName).join(", ");
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      renderCell: (params) => (
        <div style={{ paddingLeft: "10px" }}>{params.value}</div>
      ),
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 200,
      renderCell: (params) => (
        <div style={{ paddingLeft: "10px" }}>{params.value || "N/A"}</div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      renderCell: (params) => (
        <div style={{ paddingLeft: "10px" }}>{params.value || "N/A"}</div>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => (
        <div style={{ paddingLeft: "10px" }}>{params.value || "N/A"}</div>
      ),
    },
    {
      field: "roles",
      headerName: "Roles",
      width: 300,
      renderCell: (params) => {
        const roleNames = getRoleNames(params.value);
        return (
          <div style={{ paddingLeft: "10px" }}>
            {roleNames.split(", ").map((role, idx) => (
              <Badge key={idx} bg="primary" className="me-1">
                {role}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      field: "enabled",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <div style={{ paddingLeft: "10px" }}>
          <Badge bg={params.value ? "success" : "danger"}>
            {params.value ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      field: "verified",
      headerName: "Verified",
      width: 100,
      renderCell: (params) => (
        <div style={{ paddingLeft: "10px" }}>
          <Badge bg={params.value ? "success" : "secondary"}>
            {params.value ? "Yes" : "No"}
          </Badge>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      sortable: false,
      renderCell: (params) => {
        const user = params.row;
        return (
          <div style={{ paddingLeft: "10px", display: "flex", gap: "8px" }}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => openEditModal(user)}
            >
              <FontAwesomeIcon icon={faPencil} className="me-1" />
              Edit
            </Button>
            {user.enabled ? (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDeactivate(user.id)}
              >
                <FontAwesomeIcon icon={faTimes} className="me-1" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleActivate(user.id)}
              >
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Activate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tableData = users.map((user, index) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    location: user.location,
    roles: user.roles || [],
    enabled: user.enabled !== undefined ? user.enabled : true,
    verified: user.verified || false,
    createdAt: user.createdAt,
  }));

  return (
    <div className="container-fluid">
      <DashboardHeader heading="Manage Users" />

      <div>
        <DataTable list={tableData} columns={columns} />
      </div>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
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
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="enabled"
                    label="Active"
                    checked={formData.enabled}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="verified"
                    label="Verified"
                    checked={formData.verified}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Roles</Form.Label>
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #dee2e6",
                      padding: "10px",
                      borderRadius: "4px",
                    }}
                  >
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
                      roles.map((role) => (
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={showLoading}>
              {showLoading ? "Updating..." : "Update User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
