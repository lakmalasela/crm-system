import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { activityService } from '../api/activityService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { activitySchema } from '../utils/validation';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../utils/sweetAlert';
import { useAuth } from '../context/AuthContext';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    activity_type: '',
    company: '',
    date_from: '',
    date_to: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const { canDelete, canCreate } = useAuth();

  const activityTypes = [
    { value: 'call', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'task', label: 'Task' },
    { value: 'note', label: 'Note' }
  ];

  useEffect(() => {
    fetchActivities();
    fetchCompanies();
  }, [currentPage, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        page_size: 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };
      
      const response = await activityService.getActivities(params);
      setActivities(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      setError(null);
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await activityService.getActivities({ page_size: 100 });
      const uniqueCompanies = [...new Set(response.results?.map(a => a.object_repr).filter(Boolean))];
      setCompanies(uniqueCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleCreateActivity = async (values, { setSubmitting }) => {
    try {
      await activityService.createActivity(values);
      setShowModal(false);
      showSuccessAlert('Activity Created', 'Activity has been logged successfully');
      fetchActivities();
    } catch (err) {
      setError('Failed to create activity');
      showErrorAlert('Error', 'Failed to create activity. Please try again.');
      console.error('Error creating activity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    const result = await showConfirmAlert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      'Yes, Delete'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await activityService.deleteActivity(id);
        showSuccessAlert('Activity Deleted', 'Activity has been deleted successfully');
        fetchActivities();
      } catch (err) {
        setError('Failed to delete activity');
        showErrorAlert('Error', 'Failed to delete activity. Please try again.');
        console.error('Error deleting activity:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      activity_type: '',
      company: '',
      date_from: '',
      date_to: ''
    });
    setCurrentPage(1);
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      call: 'bg-primary text-white',
      email: 'bg-success text-white',
      meeting: 'bg-warning text-dark',
      task: 'bg-info text-white',
      note: 'bg-secondary text-white'
    };
    return colors[type] || 'bg-secondary text-white';
  };

  const getActivityTypeLabel = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.label : type;
  };

  const initialValues = {
    title: '',
    description: '',
    activity_type: 'call',
    company: '',
    scheduled_at: ''
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <LoadingSpinner size="large" text="Loading activities..." />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fas fa-history me-2"></i>
          Activities
        </h1>
        {canCreate() ? (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus me-2"></i>
            Log Activity
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary"
            disabled
            title="Only Manager or Admin can create activities"
          >
            <i className="fas fa-lock me-2"></i>
            No Create Access
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <i className="fas fa-filter me-2"></i>
            Filters
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">From Date</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">To Date</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary"
            >
              <i className="fas fa-times me-2"></i>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {activities.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Object</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <span className="badge bg-light text-dark">
                          <i className="fas fa-user me-1"></i>
                          {activity.user_name}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getActivityTypeColor(activity.action)}`}>
                          {activity.action}
                        </span>
                      </td>
                      <td>
                        <span className="fw-medium">{activity.object_repr}</span>
                        <br />
                        <small className="text-muted">{activity.model_name}</small>
                      </td>
                      <td>
                        {new Date(activity.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {canDelete() ? (
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled
                            title="Only Admin can delete activities"
                          >
                            <i className="fas fa-lock me-1"></i>
                            No Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No activities found</h5>
              <p className="text-muted">Start by logging your first activity.</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      )}

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2"></i>
                  Log New Activity
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <Formik
                  initialValues={initialValues}
                  validationSchema={activitySchema}
                  onSubmit={handleCreateActivity}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Title *</label>
                          <Field
                            type="text"
                            name="title"
                            className="form-control"
                          />
                          <FormikErrorMessage
                            name="title"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Description</label>
                          <Field
                            as="textarea"
                            name="description"
                            rows={3}
                            className="form-control"
                          />
                          <FormikErrorMessage
                            name="description"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Activity Type *</label>
                          <Field
                            as="select"
                            name="activity_type"
                            className="form-select"
                          >
                            {activityTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </Field>
                          <FormikErrorMessage
                            name="activity_type"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Company</label>
                          <Field
                            type="text"
                            name="company"
                            placeholder="Company name or ID"
                            className="form-control"
                          />
                          <FormikErrorMessage
                            name="company"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Scheduled For</label>
                          <Field
                            type="datetime-local"
                            name="scheduled_at"
                            className="form-control"
                          />
                          <FormikErrorMessage
                            name="scheduled_at"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          <i className="fas fa-times me-2"></i>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn-primary"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Logging Activity...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Log Activity
                            </>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
