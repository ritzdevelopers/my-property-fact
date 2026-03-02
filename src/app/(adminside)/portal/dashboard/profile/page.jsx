"use client";
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Tab,
  Tabs,
  Badge,
  ProgressBar,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  cilUser,
  cilLocationPin,
  cilPhone,
  cilEnvelopeOpen,
  cilCalendar,
  cilShieldAlt,
  cilSettings,
  cilStar,
  cilCheck,
  cilPencil,
  cilAccountLogout,
  cilInfo,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useUser } from "../../_contexts/UserContext";
import "../../_components/PortalCommonStyles.css";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005/";

// Helper function to get initials from full name
const getInitials = (fullName) => {
  if (!fullName || !fullName.trim()) return "U";

  const names = fullName.trim().split(/\s+/);
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
  let filledFields = 0;
  const totalFields = 7; // fullName, email, phone, location, bio, experience, avatar

  if (profile.name && profile.name.trim()) filledFields++;
  if (profile.email && profile.email.trim()) filledFields++;
  if (profile.phone && profile.phone.trim()) filledFields++;
  if (profile.location && profile.location.trim()) filledFields++;
  if (profile.bio && profile.bio.trim()) filledFields++;
  if (profile.experience && profile.experience.trim()) filledFields++;
  if (profile.avatar && profile.avatar.trim() && profile.avatar !== "/logo.webp")
    filledFields++;

  return Math.round((filledFields / totalFields) * 100);
};

// Helper function to extract role from roles array
const getRoleFromRoles = (roles) => {
  if (!roles || roles.length === 0) return "Member";

  // Get the first active role
  const activeRole = Array.isArray(roles)
    ? roles.find((role) => role && role.isActive !== false)
    : null;

  if (activeRole) {
    return activeRole.roleName || "Member";
  }

  // Fallback: check if roles is an array of strings
  if (Array.isArray(roles) && roles.length > 0) {
    const firstRole = roles[0];
    if (typeof firstRole === "string") {
      return firstRole.replace("ROLE_", "").replace(/_/g, " ");
    }
  }

  return "Member";
};

export default function Profile() {
  const router = useRouter();
  const { logout } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    location: "",
    bio: "",
    avatar: null,
    verified: false,
    rating: 0,
    totalDeals: 0,
    joinDate: "",
  });

  const [stats, setStats] = useState({
    profileCompletion: 0,
  });

  const [recentAchievements] = useState([
    {
      id: 1,
      title: "Top Performer",
      description: "Achieved highest sales in Q3 2024",
      date: "2024-10-15",
      type: "performance",
    },
    {
      id: 2,
      title: "Client Satisfaction",
      description: "Maintained 95% satisfaction rate",
      date: "2024-10-10",
      type: "satisfaction",
    },
    {
      id: 3,
      title: "Quick Response",
      description: "Average response time under 2 minutes",
      date: "2024-10-05",
      type: "response",
    },
  ]);

  // Fetch user profile from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}users/me`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          const userData = response.data;
          const updatedProfile = {
            name: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            role: getRoleFromRoles(userData.roles || userData.role),
            experience: userData.experience || "",
            location: userData.location || "",
            bio: userData.bio || "",
            avatar: userData.avatar || null,
            verified: userData.verified || false,
            rating: userData.rating || 0,
            totalDeals: userData.totalDeals || 0,
            joinDate: userData.createdAt
              ? new Date(userData.createdAt).toISOString().split("T")[0]
              : "",
          };

          setProfile(updatedProfile);

          // Calculate profile completion
          const completion = calculateProfileCompletion(updatedProfile);
          setStats({ profileCompletion: completion });

          setError(null);
        } else {
          if (response.status === 401) {
            setError("Session expired. Please login again.");
            logout();
            router.push("/");
          } else {
            setError("Failed to load profile. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, logout]);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("No auth token found. Please login again.");
        setSaving(false);
        return;
      }

      const updateData = {
        fullName: profile.name,
        phone: profile.phone || null,
        location: profile.location || null,
        bio: profile.bio || null,
        avatar: profile.avatar || null,
        experience: profile.experience || null,
      };

      const response = await axios.put(`${API_BASE_URL}users/me`, updateData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const updatedUser = await response.data;
        const updatedProfile = {
          name: updatedUser.fullName || profile.name,
          email: updatedUser.email || profile.email,
          phone: updatedUser.phone || profile.phone,
          role: getRoleFromRoles(updatedUser.roles || updatedUser.role),
          experience: updatedUser.experience || profile.experience,
          location: updatedUser.location || profile.location,
          bio: updatedUser.bio || profile.bio,
          avatar: updatedUser.avatar || null,
          verified:
            updatedUser.verified !== undefined
              ? updatedUser.verified
              : profile.verified,
          rating:
            updatedUser.rating !== undefined
              ? updatedUser.rating
              : profile.rating,
          totalDeals:
            updatedUser.totalDeals !== undefined
              ? updatedUser.totalDeals
              : profile.totalDeals,
          joinDate: profile.joinDate,
        };

        setProfile(updatedProfile);

        // Recalculate profile completion
        const completion = calculateProfileCompletion(updatedProfile);
        setStats({ profileCompletion: completion });

        setSuccess("Profile updated successfully!");
        setEditMode(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = response.data;
        setError(
          errorData.message || "Failed to update profile. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="portal-content">
        <div className="loading-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h3 className="mt-3">Loading Profile...</h3>
          <p className="text-muted">
            Please wait while we load your profile data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h2>My Profile</h2>
            <p>
              Welcome back, {profile.name || "User"}! Manage your account
              settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Row - Full Width */}
      <Row className="g-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon primary">
                  <CIcon icon={cilStar} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Total Deals</h6>
                  <h3 className="stat-value">{profile.totalDeals || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon info">
                  <CIcon icon={cilCalendar} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Experience</h6>
                  <h3 className="stat-value">{profile.experience || "0"}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon success">
                  <CIcon icon={cilUser} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Profile</h6>
                  <h3 className="stat-value">
                    {stats.profileCompletion || 0}%
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon warning">
                  <CIcon icon={cilStar} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Rating</h6>
                  <h3 className="stat-value">{profile.rating || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Profile Overview - Left Sidebar */}
        <Col lg={4} md={12} className="order-lg-1 order-2">
          <Card className="dashboard-card">
            <Card.Body className="text-center">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  <div className="avatar-border">
                    {profile.avatar && profile.avatar.trim() ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        width={140}
                        height={140}
                        className="avatar-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="avatar-initials"
                      style={{
                        display:
                          profile.avatar && profile.avatar.trim()
                            ? "none"
                            : "flex",
                      }}
                    >
                      {getInitials(profile.name)}
                    </div>
                  </div>
                  {profile.verified && (
                    <Badge bg="success" className="verified-badge">
                      <CIcon icon={cilCheck} className="me-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <h4 className="profile-name">{profile.name || "User"}</h4>
              <p className="profile-role">{profile.role || "Member"}</p>
              <div className="profile-rating">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <CIcon
                      key={star}
                      icon={cilStar}
                      className={`star-icon ${star <= Math.round(profile.rating) ? "star-filled" : "star-empty"}`}
                    />
                  ))}
                </div>
                <div className="rating-info">
                  <span className="rating-text">{profile.rating || 0}</span>
                  <span className="rating-count">(127 reviews)</span>
                </div>
              </div>
              <div className="d-grid gap-2 mt-3">
                <Button
                  variant="primary"
                  onClick={() => setEditMode(!editMode)}
                >
                  <CIcon icon={cilPencil} className="me-2" />
                  {editMode ? "Cancel Edit" : "Edit Profile"}
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>
                  <CIcon icon={cilAccountLogout} className="me-2" />
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Profile Completion */}
          <Card className="dashboard-card mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <CIcon icon={cilSettings} className="me-2" />
                <h5 className="mb-0">Profile Completion</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold d-flex align-items-center">
                    <CIcon icon={cilUser} className="me-2" />
                    Profile Info
                  </span>
                  <span className="text-primary fw-bold">
                    {stats.profileCompletion || 0}%
                  </span>
                </div>
                <ProgressBar
                  now={stats.profileCompletion || 0}
                  variant="success"
                  style={{ height: "10px", borderRadius: "10px" }}
                />
              </div>
              <Alert variant="info" className="mb-0">
                <CIcon icon={cilInfo} className="me-2" />
                Complete your profile to get better visibility and more
                opportunities.
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Details - Main Content */}
        <Col lg={8} md={12} className="order-lg-2 order-1">
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <CIcon icon={cilUser} className="me-2" />
                <h5 className="mb-0">Personal Information</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                  className="mb-3"
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => setSuccess(null)}
                  className="mb-3"
                >
                  {success}
                </Alert>
              )}

              {!editMode ? (
                // Read-only view
                <div className="profile-info-view">
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilUser} className="me-2" />
                          Full Name
                        </div>
                        <div className="info-value">
                          {profile.name || "Not provided"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilEnvelopeOpen} className="me-2" />
                          Email Address
                        </div>
                        <div className="info-value">
                          {profile.email || "Not provided"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilPhone} className="me-2" />
                          Phone Number
                        </div>
                        <div className="info-value">
                          {profile.phone || "Not provided"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilLocationPin} className="me-2" />
                          Location
                        </div>
                        <div className="info-value">
                          {profile.location || "Not provided"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilSettings} className="me-2" />
                          Experience
                        </div>
                        <div className="info-value">
                          {profile.experience || "Not provided"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilCalendar} className="me-2" />
                          Member Since
                        </div>
                        <div className="info-value">
                          {profile.joinDate
                            ? new Date(profile.joinDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Not available"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="info-item">
                        <div className="info-label">
                          <CIcon icon={cilUser} className="me-2" />
                          Bio
                        </div>
                        <div className="info-value bio-text">
                          {profile.bio ||
                            "No bio provided yet. Click 'Edit Profile' to add one."}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                // Editable form
                <Form className="profile-form">
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilUser} className="me-2" />
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Enter your full name"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilEnvelopeOpen} className="me-2" />
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={profile.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="your.email@example.com"
                          disabled
                        />
                        <Form.Text className="text-muted small">
                          Email cannot be changed
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilPhone} className="me-2" />
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          value={profile.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="+1 234 567 8900"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilLocationPin} className="me-2" />
                          Location
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="City, State, Country"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilSettings} className="me-2" />
                          Experience
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.experience}
                          onChange={(e) =>
                            handleInputChange("experience", e.target.value)
                          }
                          placeholder="e.g., 5 years, Senior Agent"
                        />
                        <Form.Text className="text-muted small">
                          Your professional experience
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilCalendar} className="me-2" />
                          Member Since
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={profile.joinDate}
                          disabled
                        />
                        <Form.Text className="text-muted small">
                          Account creation date
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          <CIcon icon={cilUser} className="me-2" />
                          Bio
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={profile.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          placeholder="Tell us about yourself..."
                        />
                        <Form.Text className="text-muted small">
                          Write a short bio to help others know you better
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button
                      variant="secondary"
                      className="w-100 w-sm-auto"
                      onClick={() => {
                        setEditMode(false);
                        setError(null);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="w-100 w-sm-auto"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilCheck} className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Achievements - Full Width */}
      <Row className="g-4 mt-2">
        <Col xs={12}>
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <CIcon icon={cilStar} className="me-2" />
                <h5 className="mb-0">Recent Achievements</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {recentAchievements.map((achievement) => (
                  <Col xs={12} sm={6} lg={4} key={achievement.id}>
                    <div className="achievement-item-modern h-100">
                      <div
                        className={`achievement-icon-modern achievement-${achievement.type}`}
                      >
                        <CIcon icon={cilStar} />
                      </div>
                      <div className="achievement-content-modern">
                        <h6 className="achievement-title-modern">
                          {achievement.title}
                        </h6>
                        <p className="achievement-description-modern">
                          {achievement.description}
                        </p>
                        <div className="achievement-date-modern">
                          <CIcon icon={cilCalendar} className="me-1" />
                          {new Date(achievement.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        /* Profile-specific styles */
        .profile-avatar-wrapper {
          margin-bottom: 1.5rem;
        }

        .profile-avatar {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .avatar-border {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--portal-primary, #68ac78) 0%,
            var(--portal-primary-dark, #0d5834) 100%
          );
          padding: 5px;
          box-shadow: 0 8px 25px rgba(104, 172, 120, 0.3);
          animation: pulse 2s ease-in-out infinite;
          margin: 0 auto;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        :global(.avatar-image) {
          border-radius: 50%;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border: 4px solid white;
        }

        .avatar-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--portal-primary, #68ac78) 0%,
            var(--portal-primary-dark, #0d5834) 100%
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          border: 4px solid white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        :global(.verified-badge) {
          position: absolute;
          bottom: 5px;
          right: 5px;
          font-size: 0.75rem;
          padding: 0.4rem 0.7rem;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          font-weight: 600;
        }

        :global(.profile-name) {
          color: var(--portal-gray-800, #212529);
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        :global(.profile-role) {
          color: var(--portal-gray-600, #6c757d);
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        :global(.profile-rating) {
          margin-bottom: 2rem;
        }

        .rating-stars {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        :global(.star-icon) {
          font-size: 1.2rem;
          transition: all 0.2s;
        }

        :global(.star-filled) {
          color: #ffc107;
        }

        :global(.star-empty) {
          color: #e0e0e0;
        }

        .rating-info {
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        :global(.rating-text) {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--portal-gray-800, #212529);
        }

        :global(.rating-count) {
          color: var(--portal-gray-600, #6c757d);
          font-size: 0.875rem;
        }

        .profile-info-view {
          padding: 0.5rem 0;
        }

        .info-item {
          margin-bottom: 1.5rem;
        }

        .info-label {
          font-weight: 600;
          color: var(--portal-gray-600, #6c757d);
          margin-right: 1rem;
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          color: var(--portal-gray-800, #212529);
          font-size: 1rem;
          font-weight: 500;
          padding: 0.75rem 0;
          min-height: 2.5rem;
          display: flex;
          align-items: center;
        }

        .bio-text {
          white-space: pre-wrap;
          line-height: 1.6;
          color: var(--portal-gray-700, #495057);
          padding: 1rem;
          background: var(--portal-gray-50, #f8f9fa);
          border-radius: 8px;
          min-height: 100px;
          font-style: italic;
        }

        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .achievement-item-modern {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: linear-gradient(
            135deg,
            var(--portal-gray-50, #f8f9fa) 0%,
            #ffffff 100%
          );
          border-radius: 12px;
          border-left: 4px solid var(--portal-primary, #68ac78);
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          height: 100%;
        }

        .achievement-item-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .achievement-icon-modern {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .achievement-performance {
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          color: white;
        }

        .achievement-satisfaction {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        }

        .achievement-response {
          background: linear-gradient(
            135deg,
            #17a2b8 0%,
            var(--portal-primary, #68ac78) 100%
          );
          color: white;
        }

        .achievement-content-modern {
          flex: 1;
        }

        .achievement-title-modern {
          margin: 0 0 0.5rem;
          font-weight: 700;
          color: var(--portal-gray-800, #212529);
          font-size: 1.1rem;
        }

        .achievement-description-modern {
          margin: 0 0 0.75rem;
          color: var(--portal-gray-600, #6c757d);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .achievement-date-modern {
          color: var(--portal-gray-500, #adb5bd);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
        }

        @media (max-width: 992px) {
          .avatar-border {
            width: 120px;
            height: 120px;
          }
        }

        @media (max-width: 768px) {
          .avatar-border {
            width: 100px;
            height: 100px;
          }

          .achievement-item-modern {
            padding: 1rem;
            gap: 0.875rem;
          }

          .achievement-icon-modern {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }

          .achievement-title-modern {
            font-size: 1rem;
          }

          .achievement-description-modern {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 576px) {
          .avatar-border {
            width: 90px;
            height: 90px;
          }

          :global(.profile-name) {
            font-size: 1.25rem;
          }

          .info-item {
            margin-bottom: 1.25rem;
          }

          .info-label {
            font-size: 0.8rem;
          }

          .info-value {
            font-size: 0.9rem;
          }

          .achievement-item-modern {
            padding: 0.875rem;
            gap: 0.75rem;
          }

          .achievement-icon-modern {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
