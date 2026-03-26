import React, { useState, useEffect } from 'react';
import { companyService } from '../api/companyService';
import { activityService } from '../api/activityService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalContacts: 0,
    recentActivities: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companiesResponse, activitiesResponse] = await Promise.all([
          companyService.getCompanies({ page_size: 5 }),
          activityService.getActivities({ page_size: 10 })
        ]);

        setStats({
          totalCompanies: companiesResponse.count || 0,
          totalContacts: companiesResponse.results?.reduce((acc, company) => acc + (company.contact_count || 0), 0) || 0,
          recentActivities: activitiesResponse.results || [],
          loading: false,
          error: null
        });
      } catch (err) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityColor = (action) => {
    const colors = {
      'CREATE': 'bg-success',
      'UPDATE': 'bg-warning',
      'DELETE': 'bg-danger',
      'call': 'bg-primary',
      'email': 'bg-info',
      'meeting': 'bg-warning',
      'task': 'bg-secondary',
      'note': 'bg-light'
    };
    return colors[action] || 'bg-secondary';
  };

  const getActivityIcon = (action) => {
    const icons = {
      'CREATE': 'fa-plus',
      'UPDATE': 'fa-edit',
      'DELETE': 'fa-trash',
      'call': 'fa-phone',
      'email': 'fa-envelope',
      'meeting': 'fa-users',
      'task': 'fa-tasks',
      'note': 'fa-sticky-note'
    };
    return icons[action] || 'fa-circle';
  };

  const getActivityDescription = (activity) => {
    if (activity.title) return activity.title;
    if (activity.description) return activity.description;
    
    const action = activity.action.toLowerCase();
    const model = activity.model_name.toLowerCase();
    
    return `${action} ${model}: ${activity.object_repr || 'Unknown'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`card ${color} text-white`}>
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <div className="rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              {icon}
            </div>
          </div>
          <div className="ms-3">
            <h6 className="card-subtitle mb-1 text-white opacity-90">{title}</h6>
            <h3 className="card-title mb-0">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );

  if (stats.loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fas fa-tachometer-alt me-2"></i>
          Dashboard
        </h1>
      </div>

      <ErrorMessage error={stats.error} />

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={<i className="fas fa-building"></i>}
            color="bg-primary"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts}
            icon={<i className="fas fa-users"></i>}
            color="bg-success"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Recent Activities"
            value={stats.recentActivities.length}
            icon={<i className="fas fa-history"></i>}
            color="bg-info"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Active Today"
            value={stats.recentActivities.filter(a => 
              new Date(a.created_at).toDateString() === new Date().toDateString()
            ).length}
            icon={<i className="fas fa-chart-line"></i>}
            color="bg-warning"
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-history me-2"></i>
                Recent Activities
              </h5>
            </div>
            <div className="card-body">
              {stats.recentActivities.length > 0 ? (
                <div className="timeline">
                  {stats.recentActivities.map((activity, index) => (
                    <div key={activity.id} className="timeline-item d-flex align-items-start mb-3">
                      <div className="timeline-marker flex-shrink-0">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white ${getActivityColor(activity.action)}`} style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                          <i className={`fas ${getActivityIcon(activity.action)}`}></i>
                        </div>
                      </div>
                      <div className="timeline-content flex-grow-1 ms-3">
                        <div className="card border-0 bg-light">
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-subtitle mb-0 text-muted">
                                <i className="fas fa-user me-1"></i>
                                {activity.user_name}
                              </h6>
                              <small className="text-muted">
                                {formatDate(activity.created_at)}
                              </small>
                            </div>
                            <h5 className="card-title mb-2">{getActivityDescription(activity)}</h5>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${getActivityColor(activity.action)} text-white`}>
                                {activity.action}
                              </span>
                              <span className="badge bg-secondary text-white">
                                {activity.model_name}
                              </span>
                            </div>
                            {activity.object_repr && (
                              <p className="card-text mt-2 mb-0">
                                <i className="fas fa-tag me-1 text-muted"></i>
                                {activity.object_repr}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-history fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No recent activities</h5>
                  <p className="text-muted">Start by creating companies or contacts to see activity here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
