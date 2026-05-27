"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Nav,
  Tab,
  Container
} from "react-bootstrap";
import { 
  cilCommentSquare, 
  cilEnvelopeOpen, 
  cilFile, 
  cilSend,
  cilInbox,
  cilCheck,
  cilClock,
  cilStar
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Link from "next/link";

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const communicationStats = {
    totalMessages: 156,
    unreadMessages: 23,
    sentToday: 45,
    responseRate: 92,
    avgResponseTime: "2.3 hrs",
    templatesUsed: 28
  };

  const recentActivities = [
    {
      id: 1,
      type: "email",
      subject: "Property Inquiry - 3BHK Villa",
      contact: "Rajesh Kumar",
      time: "2 hours ago",
      status: "sent"
    },
    {
      id: 2,
      type: "sms",
      subject: "Site Visit Reminder",
      contact: "Priya Sharma",
      time: "4 hours ago",
      status: "delivered"
    },
    {
      id: 3,
      type: "email",
      subject: "Property Details & Pricing",
      contact: "Amit Patel",
      time: "1 day ago",
      status: "read"
    },
    {
      id: 4,
      type: "call",
      subject: "Follow-up Call",
      contact: "Neha Singh",
      time: "2 days ago",
      status: "completed"
    }
  ];

  const quickActions = [
    {
      title: "Send Email",
      description: "Compose and send email to leads",
      icon: cilEnvelopeOpen,
      href: "/portal/dashboard/communication/inbox",
      color: "primary"
    },
    {
      title: "Use Template",
      description: "Send pre-built message templates",
      icon: cilFile,
      href: "/portal/dashboard/communication/templates",
      color: "success"
    },
    {
      title: "View Outbox",
      description: "Check sent messages and history",
      icon: cilSend,
      href: "/portal/dashboard/communication/outbox",
      color: "info"
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "sent": "primary",
      "delivered": "success",
      "read": "info",
      "completed": "success",
      "pending": "warning"
    };
    return variants[status] || "secondary";
  };

  const getTypeIcon = (type) => {
    const icons = {
      "email": cilEnvelopeOpen,
      "sms": cilCommentSquare,
      "call": cilInbox
    };
    return icons[type] || cilCommentSquare;
  };

  return (
    <div className="communication-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Communication Hub</h2>
            <p>Manage all your customer communications in one place</p>
          </div>
          <div className="header-actions">
            <Button variant="light">
              <CIcon icon={cilEnvelopeOpen} className="me-1" />
              Quick Compose
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <CIcon icon={cilInbox} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Total Messages</h6>
                  <h3 className="stat-value">{communicationStats.totalMessages}</h3>
                  <small className="stat-change text-info">+12 this week</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon unread">
                  <CIcon icon={cilEnvelopeOpen} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Unread</h6>
                  <h3 className="stat-value">{communicationStats.unreadMessages}</h3>
                  <small className="stat-change text-warning">Needs attention</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <CIcon icon={cilSend} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Sent Today</h6>
                  <h3 className="stat-value">{communicationStats.sentToday}</h3>
                  <small className="stat-change text-success">+5 from yesterday</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <CIcon icon={cilCheck} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Response Rate</h6>
                  <h3 className="stat-value">{communicationStats.responseRate}%</h3>
                  <small className="stat-change text-success">+3% this month</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="g-4">
        {/* Quick Actions */}
        <Col lg={8}>
          <Card className="quick-actions-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilCommentSquare} className="me-2" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {quickActions.map((action, index) => (
                  <Col md={4} key={index}>
                    <Link title={action.title} href={action.href} className="quick-action-link">
                      <Card className="quick-action-card">
                        <Card.Body className="text-center">
                          <div className={`action-icon ${action.color}`}>
                            <CIcon icon={action.icon} />
                          </div>
                          <h6 className="action-title">{action.title}</h6>
                          <p className="action-description">{action.description}</p>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Recent Activities */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilClock} className="me-2" />
                Recent Activities
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="activities-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <CIcon icon={getTypeIcon(activity.type)} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <h6 className="activity-subject">{activity.subject}</h6>
                        <Badge bg={getStatusBadge(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-contact">{activity.contact}</span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Communication Tools */}
          <Card className="tools-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilStar} className="me-2" />
                Communication Tools
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="tools-list">
                <div className="tool-item">
                  <div className="tool-info">
                    <h6>Email Templates</h6>
                    <small className="text-muted">Pre-built message templates</small>
                  </div>
                  <Link title="Manage Email Templates" href="/portal/dashboard/communication/templates">
                    <Button variant="outline-primary" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
                
                <div className="tool-item">
                  <div className="tool-info">
                    <h6>Auto-Responders</h6>
                    <small className="text-muted">Automated response rules</small>
                  </div>
                  <Button variant="outline-secondary" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="tool-item">
                  <div className="tool-info">
                    <h6>Message History</h6>
                    <small className="text-muted">View all communication logs</small>
                  </div>
                  <Link title="View Message History" href="/portal/dashboard/communication/outbox">
                    <Button variant="outline-info" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Performance Metrics */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Performance Metrics</h5>
            </Card.Header>
            <Card.Body>
              <div className="metrics-list">
                <div className="metric-item">
                  <div className="metric-label">Avg. Response Time</div>
                  <div className="metric-value">{communicationStats.avgResponseTime}</div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Templates Used</div>
                  <div className="metric-value">{communicationStats.templatesUsed}</div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Success Rate</div>
                  <div className="metric-value">94%</div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Customer Satisfaction</div>
                  <div className="metric-value">4.7/5</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.unread {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }

        .quick-actions-card, .tools-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          background: white;
        }

        .quick-action-link {
          text-decoration: none;
          color: inherit;
        }

        .quick-action-card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .quick-action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          margin: 0 auto 1rem;
        }

        .action-icon.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .action-icon.success {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .action-icon.info {
          background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        }

        .action-title {
          margin: 0 0 0.5rem;
          font-weight: 600;
          color: #495057;
        }

        .action-description {
          margin: 0;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .activity-subject {
          margin: 0;
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
        }

        .activity-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #6c757d;
        }

        .tools-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tool-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .tool-info h6 {
          margin: 0 0 0.25rem;
          font-weight: 600;
          color: #495057;
        }

        .tool-info small {
          color: #6c757d;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .metric-label {
          font-weight: 500;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .metric-value {
          font-weight: 700;
          color: #495057;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .communication-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .stat-content {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .activity-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .activity-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .tool-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
