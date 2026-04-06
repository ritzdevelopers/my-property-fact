"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
  Spinner,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import {
  cilBell,
  cilCheck,
  cilTrash,
  cilViewModule,
  cilEnvelopeOpen,
  cilPhone,
  cilWarning,
  cilSearch,
  cilPeople,
  cilOptions,
  cilUser,
  cilHome,
  cilClock,
  cilChevronRight,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [userPropertyIds, setUserPropertyIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    fetchUserPropertiesAndLeads();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const fetchUserProperties = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}user/property-listings`,
        {
          withCredentials: true,
        },
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        const propertyIds = response.data.map((property) => property.id);
        return propertyIds;
      }
      return [];
    } catch (err) {
      console.error("Error fetching user properties:", err);
      return [];
    }
  };

  const fetchUserPropertiesAndLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const propertyIds = await fetchUserProperties();
      setUserPropertyIds(propertyIds);

      if (propertyIds.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const leadsResponse = await axios.get(
        `${API_BASE_URL}enquiry/get-user-leads`,
        {
          withCredentials: true,
        },
      );

      const leadsList = Array.isArray(leadsResponse.data)
        ? leadsResponse.data
        : [];

      const leadNotifications = leadsList.map((lead, index) => ({
        id: lead.id || index + 1,
        type: "email",
        title: lead.name || "Unknown",
        message:
          lead.message || `Inquiry for ${lead.propertyName || "property"}`,
        timestamp:
          lead.createdAt || lead.created_at || new Date().toISOString(),
        isRead: lead.status && lead.status.toLowerCase() !== "new",
        priority: getLeadPriority(lead.status),
        category: "leads",
        actionUrl: `/portal/dashboard/leads`,
        leadData: lead,
      }));

      leadNotifications.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setNotifications(leadNotifications);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getLeadPriority = (status) => {
    if (!status) return "high";
    const statusLower = status.toLowerCase();
    if (statusLower === "new" || statusLower === "hot") return "high";
    if (statusLower === "warm" || statusLower === "contacted") return "medium";
    return "low";
  };

  const getStatusBadge = (status) => {
    if (!status) return "danger";
    const statusLower = status.toLowerCase();
    if (statusLower === "new" || statusLower === "hot") return "danger";
    if (statusLower === "warm" || statusLower === "contacted") return "warning";
    if (statusLower === "cold") return "secondary";
    if (statusLower === "converted" || statusLower === "closed")
      return "success";
    return "info";
  };

  // Memoize filtered notifications for performance
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !notification.isRead) ||
        (filter === "read" && notification.isRead);

      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        !debouncedSearchTerm ||
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        (notification.leadData?.name &&
          notification.leadData.name.toLowerCase().includes(searchLower)) ||
        (notification.leadData?.email &&
          notification.leadData.email.toLowerCase().includes(searchLower)) ||
        (notification.leadData?.phone &&
          notification.leadData.phone.includes(debouncedSearchTerm));

      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, debouncedSearchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = useMemo(() => {
    return filteredNotifications.slice(startIndex, endIndex);
  }, [filteredNotifications, startIndex, endIndex]);

  // Memoize counts for performance
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );
  const highPriorityCount = useMemo(
    () =>
      notifications.filter((n) => n.priority === "high" && !n.isRead).length,
    [notifications],
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMarkAsRead = useCallback(
    async (id) => {
      const notification = notifications.find((n) => n.id === id);
      if (notification && notification.leadData) {
        try {
          if (
            notification.leadData.status &&
            notification.leadData.status.toLowerCase() === "new"
          ) {
            await axios.put(
              `${API_BASE_URL}enquiry/update-status/${notification.leadData.id}`,
              { status: "Contacted" },
              { withCredentials: true },
            );
          }
        } catch (err) {
          console.error("Error updating lead status:", err);
        }
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    },
    [notifications],
  );

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    for (const notification of unreadNotifications) {
      if (
        notification.leadData &&
        notification.leadData.status &&
        notification.leadData.status.toLowerCase() === "new"
      ) {
        try {
          await axios.put(
            `${API_BASE_URL}enquiry/update-status/${notification.leadData.id}`,
            { status: "Contacted" },
            { withCredentials: true },
          );
        } catch (err) {
          console.error("Error updating lead status:", err);
        }
      }
    }

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleNotificationAction = () => {
    router.push("/portal/dashboard/leads");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60)
        return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      if (diffHours < 24)
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      if (diffDays < 7)
        return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;

      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="notifications-modern-page">
      {/* Modern Header */}
      <div className="notifications-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon-wrapper">
              <CIcon icon={cilBell} className="header-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <div>
              <h1 className="page-title">Lead Notifications</h1>
              <p className="page-subtitle">
                {userPropertyIds.length > 0
                  ? `${userPropertyIds.length} ${userPropertyIds.length === 1 ? "property" : "properties"} • ${notifications.length} ${notifications.length === 1 ? "lead" : "leads"}`
                  : "No properties yet"}
              </p>
            </div>
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <Button
                variant="primary"
                onClick={handleMarkAllAsRead}
                className="mark-all-read-btn"
              >
                <CIcon icon={cilCheck} className="me-2" />
                Mark All Read
              </Button>
            )}
            <Button
              variant="outline-primary"
              onClick={handleNotificationAction}
            >
              View All Leads
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          className="mb-4"
        >
          <CIcon icon={cilWarning} className="me-2" />
          {error}
        </Alert>
      )}

      {/* Modern Stats Cards */}
      <Row className="g-4 mb-4">
        <Col lg={4} md={6}>
          <Card className="stat-card-modern stat-card-primary">
            <Card.Body>
              <div className="stat-content-modern">
                <div className="stat-icon-modern">
                  <CIcon icon={cilPeople} />
                </div>
                <div className="stat-info-modern">
                  <div className="stat-label">Total Leads</div>
                  <div className="stat-value">{notifications.length}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="stat-card-modern stat-card-warning">
            <Card.Body>
              <div className="stat-content-modern">
                <div className="stat-icon-modern">
                  <CIcon icon={cilBell} />
                </div>
                <div className="stat-info-modern">
                  <div className="stat-label">Unread</div>
                  <div className="stat-value">{unreadCount}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="stat-card-modern stat-card-danger">
            <Card.Body>
              <div className="stat-content-modern">
                <div className="stat-icon-modern">
                  <CIcon icon={cilWarning} />
                </div>
                <div className="stat-info-modern">
                  <div className="stat-label">High Priority</div>
                  <div className="stat-value">{highPriorityCount}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modern Search and Filter Bar */}
      <Card className="filter-card-modern mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={8}>
              <div className="search-wrapper-modern">
                <CIcon icon={cilSearch} className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search leads by name, email, phone, or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-modern"
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <div className="filter-buttons-modern">
                  <Button
                    variant={filter === "all" ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="filter-btn"
                  >
                    All ({notifications.length})
                  </Button>
                  <Button
                    variant={
                      filter === "unread" ? "warning" : "outline-warning"
                    }
                    size="sm"
                    onClick={() => setFilter("unread")}
                    className="filter-btn"
                  >
                    Unread ({unreadCount})
                  </Button>
                  <Button
                    variant={filter === "read" ? "success" : "outline-success"}
                    size="sm"
                    onClick={() => setFilter("read")}
                    className="filter-btn"
                  >
                    Read ({notifications.length - unreadCount})
                  </Button>
                </div>
                <Form.Select
                  size="sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="items-per-page-select"
                  style={{ width: "auto" }}
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                  <option value={100}>100 per page</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modern Notifications Grid */}
      {loading ? (
        <div className="loading-container-modern">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="empty-state-card-modern">
          <Card.Body className="text-center py-5">
            <div className="empty-icon-wrapper">
              <CIcon icon={cilBell} className="empty-icon" />
            </div>
            <h4 className="empty-title">No notifications found</h4>
            <p className="empty-message">
              {userPropertyIds.length === 0
                ? "You don't have any properties yet. Add properties to start receiving lead notifications."
                : "No lead notifications match your current filters."}
            </p>
            {userPropertyIds.length === 0 && (
              <Button
                variant="primary"
                onClick={() =>
                  router.push("/portal/dashboard/listings?action=add")
                }
              >
                Add Your First Property
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="notifications-info-bar mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredNotifications.length)} of{" "}
                  {filteredNotifications.length} notifications
                </strong>
                {debouncedSearchTerm && (
                  <span className="text-muted ms-2">
                    (filtered from {notifications.length} total)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Row className="g-4">
            {paginatedNotifications.map((notification) => (
              <Col lg={6} key={notification.id}>
                <Card
                  className={`notification-card-modern ${!notification.isRead ? "unread" : ""}`}
                >
                  <Card.Body>
                    <div className="notification-card-header">
                      <div className="notification-avatar">
                        <CIcon icon={cilUser} className="avatar-icon" />
                      </div>
                      <div className="notification-header-content">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="notification-name mb-0">
                            {notification.title}
                          </h6>
                          {!notification.isRead && (
                            <Badge bg="primary" className="unread-dot"></Badge>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          {notification.leadData?.status && (
                            <Badge
                              bg={getStatusBadge(notification.leadData.status)}
                              className="status-badge"
                            >
                              {notification.leadData.status}
                            </Badge>
                          )}
                          <small className="text-muted d-flex align-items-center">
                            <CIcon icon={cilClock} className="me-1" size="sm" />
                            {formatDate(notification.timestamp)}
                          </small>
                        </div>
                      </div>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="link"
                          className="notification-menu-btn"
                        >
                          <CIcon icon={cilOptions} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          <Dropdown.Item
                            onClick={() => handleViewNotification(notification)}
                          >
                            <CIcon icon={cilViewModule} className="me-2" />
                            View Details
                          </Dropdown.Item>
                          {!notification.isRead && (
                            <Dropdown.Item
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CIcon icon={cilCheck} className="me-2" />
                              Mark as Read
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                          >
                            <CIcon icon={cilTrash} className="me-2" />
                            Remove
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    <div className="notification-message">
                      <p className="mb-0">{notification.message}</p>
                    </div>

                    {notification.leadData && (
                      <div className="notification-contact-info">
                        {notification.leadData.email && (
                          <div className="contact-item">
                            <CIcon
                              icon={cilEnvelopeOpen}
                              className="contact-icon"
                            />
                            <span>{notification.leadData.email}</span>
                          </div>
                        )}
                        {notification.leadData.phone && (
                          <div className="contact-item">
                            <CIcon icon={cilPhone} className="contact-icon" />
                            <span>{notification.leadData.phone}</span>
                          </div>
                        )}
                        {notification.leadData.propertyName && (
                          <div className="contact-item">
                            <CIcon icon={cilHome} className="contact-icon" />
                            <span>{notification.leadData.propertyName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="notification-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewNotification(notification)}
                        className="action-btn-primary"
                      >
                        View Details
                        <CIcon icon={cilChevronRight} className="ms-1" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Pagination */}
      {filteredNotifications.length > itemsPerPage && (
        <Card className="pagination-card-modern mt-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="pagination-info">
                <span className="text-muted">
                  Page {currentPage} of {totalPages} •{" "}
                  {filteredNotifications.length}{" "}
                  {filteredNotifications.length === 1
                    ? "notification"
                    : "notifications"}
                </span>
              </div>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modern Detail Modal */}
      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        size="lg"
        className="notification-modal-modern"
      >
        <Modal.Header closeButton className="modal-header-modern">
          <div className="d-flex align-items-center gap-3">
            <div className="modal-avatar">
              <CIcon icon={cilUser} />
            </div>
            <div>
              <Modal.Title className="modal-title-modern">
                {selectedNotification?.title}
              </Modal.Title>
              {selectedNotification?.leadData?.status && (
                <Badge
                  bg={getStatusBadge(selectedNotification.leadData.status)}
                  className="mt-1"
                >
                  {selectedNotification.leadData.status}
                </Badge>
              )}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="modal-body-modern">
          {selectedNotification && (
            <div>
              <div className="modal-meta">
                <small className="text-muted d-flex align-items-center">
                  <CIcon icon={cilClock} className="me-1" />
                  {formatDate(selectedNotification.timestamp)}
                </small>
              </div>

              <div className="modal-message">
                <p>{selectedNotification.message}</p>
              </div>

              {selectedNotification.leadData && (
                <div className="modal-details-card">
                  <h6 className="details-title">Lead Information</h6>
                  <Row className="g-3">
                    {selectedNotification.leadData.name && (
                      <Col md={6}>
                        <div className="detail-item">
                          <strong>Name:</strong>
                          <span>{selectedNotification.leadData.name}</span>
                        </div>
                      </Col>
                    )}
                    {selectedNotification.leadData.email && (
                      <Col md={6}>
                        <div className="detail-item">
                          <strong>Email:</strong>
                          <span>{selectedNotification.leadData.email}</span>
                        </div>
                      </Col>
                    )}
                    {selectedNotification.leadData.phone && (
                      <Col md={6}>
                        <div className="detail-item">
                          <strong>Phone:</strong>
                          <span>{selectedNotification.leadData.phone}</span>
                        </div>
                      </Col>
                    )}
                    {selectedNotification.leadData.propertyName && (
                      <Col md={6}>
                        <div className="detail-item">
                          <strong>Property:</strong>
                          <span>
                            {selectedNotification.leadData.propertyName}
                          </span>
                        </div>
                      </Col>
                    )}
                    {selectedNotification.leadData.propertyId && (
                      <Col md={6}>
                        <div className="detail-item">
                          <strong>Property ID:</strong>
                          <span>
                            {selectedNotification.leadData.propertyId}
                          </span>
                        </div>
                      </Col>
                    )}
                    {selectedNotification.leadData.message && (
                      <Col md={12}>
                        <div className="detail-item">
                          <strong>Message:</strong>
                          <span>{selectedNotification.leadData.message}</span>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-modern">
          <Button
            variant="secondary"
            onClick={() => setShowNotificationModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleNotificationAction}>
            View All Leads
            <CIcon icon={cilChevronRight} className="ms-2" />
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx global>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */

        .notifications-header {
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(104, 172, 120, 0.25);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon {
          font-size: 2rem;
          color: white;
        }

        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          border: 2px solid white;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .page-subtitle {
          margin: 0.5rem 0 0;
          opacity: 0.9;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .stat-card-modern {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .stat-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-card-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-card-warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .stat-card-danger {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        .stat-content-modern {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-icon-modern {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
        }

        .filter-card-modern {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .search-wrapper-modern {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 1;
        }

        .search-input-modern {
          padding-left: 3rem;
          border-radius: 12px;
          border: 2px solid #e9ecef;
          height: 48px;
          transition: all 0.3s ease;
        }

        .search-input-modern:focus {
          border-color: var(--portal-primary);
          box-shadow: 0 0 0 0.2rem rgba(104, 172, 120, 0.1);
        }

        .filter-buttons-modern {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          border-radius: 8px;
          font-weight: 500;
        }

        .items-per-page-select {
          border-radius: 8px;
          border: 2px solid #e9ecef;
        }

        .notifications-info-bar {
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .pagination-card-modern {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .pagination-info {
          font-size: 0.9rem;
        }

        .pagination .page-link {
          border-radius: 8px;
          margin: 0 2px;
          border: 2px solid #e9ecef;
          color: #495057;
          transition: all 0.2s ease;
        }

        .pagination .page-link:hover {
          background: var(--portal-primary);
          border-color: var(--portal-primary);
          color: white;
        }

        .pagination .page-item.active .page-link {
          background: var(--portal-primary);
          border-color: var(--portal-primary);
          color: white;
        }

        .pagination .page-item.disabled .page-link {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notification-card-modern {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
        }

        .notification-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .notification-card-modern.unread {
          border-left: 4px solid var(--portal-primary);
          background: linear-gradient(to right, #f0f2ff 0%, white 4%);
        }

        .notification-card-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .notification-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(
            135deg,
            var(--portal-primary) 0%,
            var(--portal-primary-dark) 100%
          );
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-icon {
          color: white;
          font-size: 1.5rem;
        }

        .notification-header-content {
          flex: 1;
          min-width: 0;
        }

        .notification-name {
          font-weight: 600;
          color: #212529;
          font-size: 1.1rem;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          border-radius: 50%;
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
        }

        .notification-message {
          color: #6c757d;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .notification-contact-info {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #495057;
          font-size: 0.9rem;
        }

        .contact-item:last-child {
          margin-bottom: 0;
        }

        .contact-icon {
          color: var(--portal-primary);
          width: 18px;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn-primary {
          border-radius: 8px;
          font-weight: 500;
        }

        .notification-menu-btn {
          color: #6c757d;
          padding: 0.25rem;
          border: none;
        }

        .notification-menu-btn:hover {
          color: var(--portal-primary);
        }

        .empty-state-card-modern {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .empty-icon {
          font-size: 2.5rem;
          color: #adb5bd;
        }

        .empty-title {
          color: #212529;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-message {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .loading-container-modern {
          text-align: center;
          padding: 4rem 0;
        }

        .modal-header-modern {
          border-bottom: 2px solid #f8f9fa;
          padding: 1.5rem;
        }

        .modal-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(
            135deg,
            var(--portal-primary) 0%,
            var(--portal-primary-dark) 100%
          );
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .modal-title-modern {
          font-weight: 600;
          color: #212529;
        }

        .modal-body-modern {
          padding: 1.5rem;
        }

        .modal-meta {
          margin-bottom: 1rem;
        }

        .modal-message {
          margin-bottom: 1.5rem;
          color: #495057;
          line-height: 1.6;
        }

        .modal-details-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .details-title {
          font-weight: 600;
          color: #212529;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item strong {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .detail-item span {
          color: #212529;
        }

        .modal-footer-modern {
          border-top: 2px solid #f8f9fa;
          padding: 1rem 1.5rem;
        }

        @media (max-width: 768px) {
          .notifications-modern-page {
            padding: 1rem;
          }

          .notifications-header {
            padding: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .stat-content-modern {
            flex-direction: column;
            text-align: center;
          }

          .filter-buttons-modern {
            flex-direction: column;
          }

          .filter-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
