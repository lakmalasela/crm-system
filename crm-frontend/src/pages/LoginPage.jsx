import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { loginSchema } from '../utils/validation';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const LoginPage = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    password: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values);
      showSuccessAlert('Login Successful', 'Welcome to CRM System');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      showErrorAlert('Login Failed', 'Invalid username or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="card-title">
              <i className="fas fa-sign-in-alt text-primary me-2"></i>
              Sign in to CRM
            </h2>
            <p className="text-muted">Enter your credentials to access the system</p>
          </div>
          
          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="form-control"
                    placeholder="Enter your username"
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
                    autoComplete="current-password"
                    className="form-control"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <FormikErrorMessage
                    name="password"
                    component="div"
                    className="text-danger small mt-1"
                  />
                </div>

                <ErrorMessage error={error} onDismiss={clearError} />

                <div className="d-grid">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign in
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

export default LoginPage;
