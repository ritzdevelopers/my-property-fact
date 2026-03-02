"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const StatCard = ({ title, value, description, icon, color, gradient }) => {
    return (
        <div className="col-md-6 col-lg-4 col-xl-3">
            <div className="admin-content-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {title}
                        </h6>
                        <h2 className="mb-0" style={{ color: color, fontWeight: 700 }}>
                            {value}
                        </h2>
                    </div>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>
                        {icon}
                    </div>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                    {description}
                </p>
            </div>
        </div>
    );
};

export default function Dashboard({ 
    noOfProjects, 
    noOfUsers, 
    noOfBlogs, 
    noOfEnquiries, 
    noOfCities,
    noOfBuilders,
    noOfAmenities,
    noOfWebStoryCategories,
    noOfWebStories,
    noOfProjectTypes
}) {
    const [currentTime, setCurrentTime] = useState(null);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        // Set mounted flag and initial time on client side only
        setMounted(true);
        setCurrentTime(new Date());
        
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        if (!currentTime) return "Hello";
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        });
    };

    const totalStats = noOfProjects + noOfUsers + noOfBlogs + noOfEnquiries + noOfCities + 
                       noOfBuilders + noOfAmenities + noOfWebStoryCategories + noOfWebStories + noOfProjectTypes;

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
                    <div>
                        <h1 className="mb-2" style={{ fontSize: '2rem', fontWeight: 700, color: '#2c3e50' }}>
                            {getGreeting()}! 👋
                        </h1>
                        <p className="mb-2" style={{ fontSize: '1.1rem', color: '#6c757d', margin: 0 }}>
                            Here&apos;s what&apos;s happening with your platform today
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                            {mounted && currentTime ? (
                                `${formatDate(currentTime)} • ${formatTime(currentTime)}`
                            ) : (
                                <span style={{ opacity: 0 }}>Loading...</span>
                            )}
                        </p>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(104, 172, 120, 0.1) 0%, rgba(104, 172, 120, 0.2) 100%)',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(104, 172, 120, 0.2)',
                        minWidth: '200px'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                            Total Records
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#68ac78' }}>
                            {totalStats.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <StatCard
                    title="Total Projects"
                    value={noOfProjects}
                    description="Active property listings"
                    icon="🏢"
                    color="#68ac78"
                    gradient="linear-gradient(135deg, rgba(104, 172, 120, 0.1) 0%, rgba(104, 172, 120, 0.2) 100%)"
                />
                <StatCard
                    title="Total Users"
                    value={noOfUsers}
                    description="Registered users"
                    icon="👥"
                    color="#4a90e2"
                    gradient="linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.2) 100%)"
                />
                <StatCard
                    title="Total Blogs"
                    value={noOfBlogs}
                    description="Published blog posts"
                    icon="📝"
                    color="#f39c12"
                    gradient="linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.2) 100%)"
                />
                <StatCard
                    title="Total Enquiries"
                    value={noOfEnquiries}
                    description="Customer inquiries"
                    icon="📧"
                    color="#e74c3c"
                    gradient="linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.2) 100%)"
                />
                <StatCard
                    title="Total Cities"
                    value={noOfCities}
                    description="Available cities"
                    icon="🌆"
                    color="#9b59b6"
                    gradient="linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(155, 89, 182, 0.2) 100%)"
                />
                <StatCard
                    title="Total Builders"
                    value={noOfBuilders}
                    description="Registered builders"
                    icon="🏗️"
                    color="#16a085"
                    gradient="linear-gradient(135deg, rgba(22, 160, 133, 0.1) 0%, rgba(22, 160, 133, 0.2) 100%)"
                />
                <StatCard
                    title="Total Amenities"
                    value={noOfAmenities}
                    description="Property amenities"
                    icon="✨"
                    color="#e67e22"
                    gradient="linear-gradient(135deg, rgba(230, 126, 34, 0.1) 0%, rgba(230, 126, 34, 0.2) 100%)"
                />
                <StatCard
                    title="Web Story Categories"
                    value={noOfWebStoryCategories}
                    description="Story categories"
                    icon="📚"
                    color="#3498db"
                    gradient="linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.2) 100%)"
                />
                <StatCard
                    title="Total Web Stories"
                    value={noOfWebStories}
                    description="Published web stories"
                    icon="📖"
                    color="#1abc9c"
                    gradient="linear-gradient(135deg, rgba(26, 188, 156, 0.1) 0%, rgba(26, 188, 156, 0.2) 100%)"
                />
                <StatCard
                    title="Project Types"
                    value={noOfProjectTypes}
                    description="Property types"
                    icon="🏘️"
                    color="#8e44ad"
                    gradient="linear-gradient(135deg, rgba(142, 68, 173, 0.1) 0%, rgba(142, 68, 173, 0.2) 100%)"
                />
            </div>

            {/* Quick Actions */}
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #68ac78 0%, #5a9a68 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>✓</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Property Approvals
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Review and approve pending property listings submitted by users.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/property-approvals" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #68ac78 0%, #5a9a68 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Go to Property Approvals →
                        </Link>
                    </div>
                </div>
                
                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>👥</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Users
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                View and manage all registered users and their permissions.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/manage-users" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Users →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📧</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Enquiries
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                View and respond to customer inquiries and messages.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/enquiries" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            View Enquiries →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📝</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Blogs
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Create, edit, and manage blog posts and categories.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/manage-blogs" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Blogs →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>🌆</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Cities
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Add and manage cities, states, and locations.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/manage-cities" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Cities →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #68ac78 0%, #5a9a68 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>🏗️</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Projects
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Add, edit, and manage all property projects and listings.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/manage-projects" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #68ac78 0%, #5a9a68 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Projects →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Banners
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Add and manage project banners and hero images.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/manage-banners" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Banners →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>🏗️</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Builders
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Add and manage builder information and details.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/builder" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Builders →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>✨</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Amenities
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Add and manage property amenities and features.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/aminities" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Amenities →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📚</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Web Story Categories
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Manage web story categories and organization.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/web-story-category" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Categories →
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="admin-content-card">
                        <div className="mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📖</span>
                            </div>
                            <h5 className="mb-2" style={{ fontWeight: 600, color: '#2c3e50' }}>
                                Manage Web Stories
                            </h5>
                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Create and manage web stories for your platform.
                            </p>
                        </div>
                        <Link 
                            href="/admin/dashboard/web-story" 
                            className="btn admin-action-btn"
                            style={{
                                background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.625rem 1.25rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Manage Web Stories →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
