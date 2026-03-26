import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { registerSchema } from '../utils/validation';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const UserRegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    password: '',
    role: 'STAFF',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
     const orgId = user?.organization?.id;
     
      
      if (!orgId) {
        showErrorAlert('Registration Failed', 'No organization found. Please log in again.');
        setSubmitting(false);
        return;
      }
      
      const registrationData = {
        ...values,
        organization: parseInt(orgId)
      };
      console.log('Submitting registration data:', registrationData);
      
      const response = await authService.register(registrationData);
      console.log('Registration response:', response);
      
      showSuccessAlert('Registration Successful', 'User has been registered successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      showErrorAlert('Registration Failed', err.response?.data?.message || 'Failed to register user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg" style={{ width: '500px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="card-title">
              <i className="fas fa-user-plus text-primary me-2"></i>
              User Registration
            </h2>
            <p className="text-muted">Create a new user account</p>
          </div>
          
          <Formik
            initialValues={initialValues}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username (Email)</label>
                  <Field
                    id="username"
                    name="username"
                    type="email"
                    autoComplete="email"
                    className="form-control"
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                  />
                  <FormikErrorMessage
                    name="username"
                    component="div"
                    className="text-danger small mt-1"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className="form-control"
                    placeholder="Enter password"
                    disabled={isSubmitting}
                  />
                  <FormikErrorMessage
                    name="password"
                    component="div"
                    className="text-danger small mt-1"
                  />
                  <div className="form-text text-muted">
                    Password must contain at least 6 characters with uppercase, lowercase, and number.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <Field
                    as="select"
                    id="role"
                    name="role"
                    className="form-control"
                    disabled={isSubmitting}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                  </Field>
                  <FormikErrorMessage
                    name="role"
                    component="div"
                    className="text-danger small mt-1"
                  />
                </div>

                <ErrorMessage error={null} onDismiss={() => {}} />

                <div className="d-grid">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Register User
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
  );
};

export default UserRegisterPage;
