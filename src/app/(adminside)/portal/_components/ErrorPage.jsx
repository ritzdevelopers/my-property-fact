"use client";
import { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Alert,
  Container
} from "react-bootstrap";
import { 
  cilWarning, 
  cilHome, 
  cilReload, 
  cilArrowLeft,
  cilBug,
  cilSearch,
  cilUser,
  cilSettings
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Link from "next/link";

export default function ErrorPage({ 
  errorType = "404", 
  title, 
  message, 
  showRetry = true,
  showHome = true,
  customActions = null 
}) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (errorType === "500" && showRetry) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [errorType, showRetry]);

  const errorConfigs = {
    "404": {
      icon: cilSearch,
      title: "Page Not Found",
      message: "The page you're looking for doesn't exist or has been moved.",
      color: "warning",
      suggestions: [
        "Check the URL for typos",
        "Go back to the previous page",
        "Use the navigation menu to find what you need"
      ]
    },
    "500": {
      icon: cilBug,
      title: "Server Error",
      message: "Something went wrong on our end. We're working to fix it.",
      color: "danger",
      suggestions: [
        "Try refreshing the page",
        "Check your internet connection",
        "Contact support if the problem persists"
      ]
    },
    "403": {
      icon: cilUser,
      title: "Access Denied",
      message: "You don't have permission to access this resource.",
      color: "secondary",
      suggestions: [
        "Contact your administrator for access",
        "Check if you're logged in with the correct account",
        "Verify your user permissions"
      ]
    },
    "network": {
      icon: cilWarning,
      title: "Connection Error",
      message: "Unable to connect to the server. Please check your internet connection.",
      color: "info",
      suggestions: [
        "Check your internet connection",
        "Try refreshing the page",
        "Contact your network administrator"
      ]
    },
    "maintenance": {
      icon: cilSettings,
      title: "Under Maintenance",
      message: "We're currently performing scheduled maintenance. Please try again later.",
      color: "info",
      suggestions: [
        "Check back in a few minutes",
        "Follow our status page for updates",
        "Contact support for urgent issues"
      ]
    }
  };

  const config = errorConfigs[errorType] || errorConfigs["404"];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/portal/dashboard";
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="error-card">
              <Card.Body className="text-center">
                {/* Error Icon */}
                <div className={`error-icon ${config.color}`}>
                  <CIcon icon={config.icon} />
                </div>

                {/* Error Code */}
                <div className="error-code">
                  {errorType}
                </div>

                {/* Error Title */}
                <h1 className="error-title">
                  {displayTitle}
                </h1>

                {/* Error Message */}
                <p className="error-message">
                  {displayMessage}
                </p>

                {/* Suggestions */}
                <div className="error-suggestions">
                  <h6>What you can do:</h6>
                  <ul className="suggestions-list">
                    {config.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>

                {/* Countdown for 500 errors */}
                {errorType === "500" && showRetry && countdown > 0 && (
                  <Alert variant="info" className="countdown-alert">
                    <CIcon icon={cilReload} className="me-2" />
                    Automatically retrying in {countdown} seconds...
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="error-actions">
                  {customActions || (
                    <>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleGoBack}
                        className="me-2"
                      >
                        <CIcon icon={cilArrowLeft} className="me-1" />
                        Go Back
                      </Button>
                      
                      {showRetry && (
                        <Button 
                          variant="outline-primary" 
                          onClick={handleRefresh}
                          className="me-2"
                        >
                          <CIcon icon={cilReload} className="me-1" />
                          Try Again
                        </Button>
                      )}
                      
                      {showHome && (
                        <Link title="Go to Dashboard" href="/portal/dashboard">
                          <Button variant="primary">
                            <CIcon icon={cilHome} className="me-1" />
                            Go to Dashboard
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>

                {/* Additional Help */}
                <div className="error-help">
                  <p className="text-muted">
                    Still having trouble? 
                    <Link title="Contact Support" href="/portal/dashboard/help/contact-support" className="ms-1">
                      Contact Support
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Links */}
            <Row className="mt-4">
              <Col md={4}>
                <Card className="quick-link-card">
                  <Card.Body className="text-center">
                    <CIcon icon={cilHome} className="quick-link-icon" />
                    <h6>Dashboard</h6>
                    <Link title="Go Home" href="/portal/dashboard">
                      <Button variant="outline-primary" size="sm">
                        Go Home
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="quick-link-card">
                  <Card.Body className="text-center">
                    <CIcon icon={cilSearch} className="quick-link-icon" />
                    <h6>Search</h6>
                    <Link title="Find Properties" href="/portal/dashboard/listings">
                      <Button variant="outline-success" size="sm">
                        Find Properties
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="quick-link-card">
                  <Card.Body className="text-center">
                    <CIcon icon={cilSettings} className="quick-link-icon" />
                    <h6>Settings</h6>
                    <Link title="Manage Profile" href="/portal/dashboard/profile">
                      <Button variant="outline-info" size="sm">
                        Manage Profile
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .error-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          padding: 2rem 0;
        }

        .error-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          background: white;
          overflow: hidden;
        }

        .error-icon {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          margin: 0 auto 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .error-icon.warning {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }

        .error-icon.danger {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }

        .error-icon.secondary {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
        }

        .error-icon.info {
          background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        }

        .error-code {
          font-size: 4rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .error-title {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .error-message {
          font-size: 1.1rem;
          color: #6c757d;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .error-suggestions {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .error-suggestions h6 {
          color: #495057;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .suggestions-list {
          margin: 0;
          padding-left: 1.5rem;
          color: #6c757d;
        }

        .suggestions-list li {
          margin-bottom: 0.5rem;
        }

        .countdown-alert {
          margin-bottom: 2rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
        }

        .error-actions {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .error-actions .btn {
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .error-actions .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .error-help {
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .quick-link-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background: white;
          transition: all 0.3s ease;
        }

        .quick-link-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .quick-link-icon {
          font-size: 2rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .quick-link-card h6 {
          color: #495057;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .error-page {
            padding: 1rem 0;
          }

          .error-icon {
            width: 100px;
            height: 100px;
            font-size: 2.5rem;
          }

          .error-code {
            font-size: 3rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .error-actions .btn {
            width: 100%;
            max-width: 200px;
          }
        }

        @media (max-width: 576px) {
          .error-icon {
            width: 80px;
            height: 80px;
            font-size: 2rem;
          }

          .error-code {
            font-size: 2.5rem;
          }

          .error-title {
            font-size: 1.25rem;
          }

          .error-message {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
