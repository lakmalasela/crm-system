import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { companyService } from '../api/companyService';
import { fileUploadService } from '../api/fileUploadService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import FileUpload from '../components/FileUpload';
import { companySchema } from '../utils/validation';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../utils/sweetAlert';
import { useAuth } from '../context/AuthContext';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const { canEdit, canDelete, canCreate } = useAuth();

  const fetchCompanies = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      
      const response = await companyService.getCompanies(params);
      setCompanies(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      setError(null);
    } catch (err) {
      setError('Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCompanies(1, searchTerm);
  };

  const handleCreateCompany = async (values, { setSubmitting }) => {
    try {
      let logoUrl = null;
      
      // Upload logo if selected
      if (logoFile) {
        setLogoUploading(true);
        console.log('Uploading logo file:', logoFile);
        const uploadResult = await fileUploadService.uploadFile(logoFile, 'logos');
        console.log('Upload result:', uploadResult);
        logoUrl = uploadResult.file_url;
        console.log('Logo URL extracted:', logoUrl);
        setLogoUploading(false);
      }

      console.log('Creating company with data:', { ...values, logo: logoUrl });

      // Create company with logo URL
      await companyService.createCompany({
        ...values,
        logo: logoUrl
      });
      
      setShowModal(false);
      showSuccessAlert('Company Created', 'Company has been created successfully');
      fetchCompanies(currentPage, searchTerm);
      
      // Reset logo file
      setLogoFile(null);
    } catch (err) {
      setError('Failed to create company');
      showErrorAlert('Error', 'Failed to create company. Please try again.');
      console.error('Error creating company:', err);
      setLogoUploading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    const result = await showConfirmAlert(
      'Delete Company',
      'Are you sure you want to delete this company? This action cannot be undone.',
      'Yes, Delete'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await companyService.deleteCompany(id);
        showSuccessAlert('Company Deleted', 'Company has been deleted successfully');
        fetchCompanies(currentPage, searchTerm);
      } catch (err) {
        setError('Failed to delete company');
        showErrorAlert('Error', 'Failed to delete company. Please try again.');
        console.error('Error deleting company:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const initialValues = {
    name: '',
    industry: '',
    country: ''
  };

  if (loading && companies.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <LoadingSpinner size="large" text="Loading companies..." />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fas fa-building me-2"></i>
          Companies
        </h1>
        {canCreate() ? (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus me-2"></i>
            Add Company
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary"
            disabled
            title="Only Manager or Admin can create companies"
          >
            <i className="fas fa-lock me-2"></i>
            No Create Access
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      <form onSubmit={handleSearch} className="mb-4">
        <div className="row g-2">
          <div className="col">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-auto">
            <button
              type="submit"
              className="btn btn-secondary"
            >
              <i className="fas fa-search me-2"></i>
              Search
            </button>
          </div>
        </div>
      </form>

      <div className="card">
        <div className="card-body p-0">
          {companies.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Country</th>
                    <th>Logo</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <Link
                          to={`/companies/${company.id}`}
                          className="text-decoration-none text-primary"
                        >
                          <i className="fas fa-building me-2"></i>
                          {company.name}
                        </Link>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {company.industry || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info text-white">
                          <i className="fas fa-globe me-1"></i>
                          {company.country || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={`${company.name} logo`} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            className="rounded border"
                          />
                        ) : (
                          <div 
                            style={{ width: '40px', height: '40px' }}
                            className="rounded border bg-light d-flex align-items-center justify-content-center"
                          >
                            <i className="fas fa-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link
                            to={`/companies/${company.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </Link>
                          {canDelete() && (
                            <button
                              onClick={() => handleDeleteCompany(company.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="fas fa-trash me-1"></i>
                              Delete
                            </button>
                          )}
                          {!canDelete() && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="Only Admin can delete companies"
                            >
                              <i className="fas fa-lock me-1"></i>
                              No Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No companies found</h5>
              <p className="text-muted">Start by adding your first company.</p>
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
                  Add New Company
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
                  validationSchema={companySchema}
                  onSubmit={handleCreateCompany}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Company Name *</label>
                          <Field
                            type="text"
                            name="name"
                            className="form-control"
                          />
                          <FormikErrorMessage
                            name="name"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Industry</label>
                          <Field
                            type="text"
                            name="industry"
                            className="form-control"
                          />
                          <FormikErrorMessage
                            name="industry"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Country *</label>
                          <Field
                            type="text"
                            name="country"
                            className="form-control"
                            placeholder="Enter country"
                          />
                          <FormikErrorMessage
                            name="country"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Company Logo</label>
                          <FileUpload
                            onFileSelect={setLogoFile}
                            accept="jpg,jpeg,png"
                            maxSize={5242880} // 5MB
                          />
                          {logoFile && (
                            <div className="mt-2">
                              <span className="badge bg-success">
                                <i className="fas fa-check me-1"></i>
                                {logoFile.name}
                              </span>
                            </div>
                          )}
                          {logoUploading && (
                            <div className="mt-2">
                              <span className="badge bg-warning">
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Uploading logo...
                              </span>
                            </div>
                          )}
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
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Create Company
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

export default CompaniesPage;
