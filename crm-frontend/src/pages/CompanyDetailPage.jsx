import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage as FormikErrorMessage } from 'formik';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { companyService } from '../api/companyService';
import { contactService } from '../api/contactService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import FileUpload from '../components/FileUpload';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

// Contact validation schema
const contactValidationSchema = yup.object().shape({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  role: yup
    .string()
    .optional(),
  email: yup
    .string()
    .email('Invalid email format')
    .optional(),
  phone: yup
    .string()
    .matches(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional()
});

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);

  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    industry: '',
    country: ''
  });

  const [contactFormData, setContactFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyResponse, contactsResponse] = await Promise.all([
          companyService.getCompany(id),
          contactService.getContacts(id)
        ]);
        
        setCompany(companyResponse);
        setCompanyFormData({
          name: companyResponse.name || '',
          industry: companyResponse.industry || '',
          country: companyResponse.country || ''
        });
        // Set company logo if it exists in the response
        if (companyResponse.logo) {
          setCompanyLogo(companyResponse.logo);
        }
        setContacts(contactsResponse.results || []);
      } catch (err) {
        setError('Failed to load company details');
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    
    // Show confirmation dialog before updating company
    const result = await Swal.fire({
      title: 'Save Changes?',
      html: `Are you sure you want to save the changes to <strong>${companyFormData.name}</strong>?<br><br>
        <div class="text-start">
          <strong>Updated Information:</strong><br>
          ${companyFormData.industry ? `• Industry: ${companyFormData.industry}<br>` : ''}
          ${companyFormData.country ? `• Country: ${companyFormData.country}` : ''}
        </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Save Changes',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setLoading(true);
      const updatedCompany = await companyService.updateCompany(id, companyFormData);
      setCompany(updatedCompany);
      setEditingCompany(false);
      setError(null);
      
      // Show success message
      showSuccessAlert(
        'Company Updated Successfully',
        `${companyFormData.name} has been updated successfully.`
      );
    } catch (err) {
      setError('Failed to update company');
      console.error('Error updating company:', err);
      showErrorAlert(
        'Update Failed',
        'There was an error updating the company. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (values, { setSubmitting, resetForm }) => {
    // Show confirmation dialog before creating contact
    const result = await Swal.fire({
      title: 'Create New Contact?',
      html: `Are you sure you want to add <strong>${values.full_name}</strong> as a new contact?<br><br>
        <div class="text-start">
          <strong>Details:</strong><br>
          ${values.role ? `• Role: ${values.role}<br>` : ''}
          ${values.email ? `• Email: ${values.email}<br>` : ''}
          ${values.phone ? `• Phone: ${values.phone}` : ''}
        </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Create Contact',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    
    if (!result.isConfirmed) {
      setSubmitting(false);
      return;
    }
    
    try {
      setLoading(true);
      await contactService.createContact(id, values);
      const contactsResponse = await contactService.getContacts(id);
      setContacts(contactsResponse.results || []);
      setShowContactModal(false);
      resetForm();
      setError(null);
      
      // Show success message
      showSuccessAlert(
        'Contact Added Successfully',
        `${values.full_name} has been added to your contacts.`
      );
    } catch (err) {
      setError('Failed to create contact');
      console.error('Error creating contact:', err);
      showErrorAlert(
        'Failed to Add Contact',
        'There was an error adding the contact. Please try again.'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    // Find the contact to get their name for the message
    const contactToDelete = contacts.find(contact => contact.id === contactId);
    const contactName = contactToDelete?.full_name || 'this contact';
    
    // Show SweetAlert confirmation
    const result = await Swal.fire({
      title: 'Delete Contact?',
      html: `Are you sure you want to delete <strong>${contactName}</strong>?<br><br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setLoading(true);
      await contactService.deleteContact(id, contactId);
      setContacts(contacts.filter(contact => contact.id !== contactId));
      
      // Show success message
      showSuccessAlert(
        'Contact Deleted',
        `${contactName} has been removed from your contacts.`
      );
    } catch (err) {
      setError('Failed to delete contact');
      console.error('Error deleting contact:', err);
      showErrorAlert(
        'Delete Failed',
        'There was an error deleting the contact. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Document for ${company.name}`);
      
      await companyService.uploadCompanyDocument(id, formData);
      setError(null);
      alert('File uploaded successfully!');
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showErrorAlert('Invalid File', 'Please select an image file for the company logo.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorAlert('File Too Large', 'Please select an image file smaller than 5MB.');
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Update Company Logo?',
      html: `Are you sure you want to update the company logo with <strong>${file.name}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Update Logo',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('logo', file);
      
      // Upload logo to backend
      const response = await companyService.uploadCompanyLogo(id, formData);
      
      // Update company state with new logo URL
      if (response.logo_url) {
        setCompanyLogo(response.logo_url);
        // Also update the company object to include the new logo
        setCompany(prev => ({
          ...prev,
          logo: response.logo_url
        }));
      } else if (response.logo) {
        setCompanyLogo(response.logo);
        setCompany(prev => ({
          ...prev,
          logo: response.logo
        }));
      } else {
        // Fallback to local preview if backend doesn't return URL
        const logoUrl = URL.createObjectURL(file);
        setCompanyLogo(logoUrl);
      }
      
      showSuccessAlert(
        'Logo Updated Successfully',
        'Company logo has been updated successfully.'
      );
    } catch (err) {
      setError('Failed to upload logo');
      console.error('Error uploading logo:', err);
      showErrorAlert(
        'Upload Failed',
        'There was an error uploading the logo. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading company details..." />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 border-4 border-white shadow-xl ring-4 ring-red-500/20 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-4">Company not found</h2>
          <p className="text-gray-600 mb-6">The company you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/companies')}
            className="btn btn-primary btn-lg"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigate('/companies')}
                  className="btn btn-light btn-lg"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Companies
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-6 sm:space-y-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 border-4 border-white shadow-2xl ring-8 ring-blue-500/20 flex items-center justify-center relative overflow-hidden cursor-pointer">
                      {companyLogo ? (
                        <img 
                          src={companyLogo.startsWith('http') ? companyLogo : `http://127.0.0.1:8000${companyLogo}`} 
                          alt="Company Logo" 
                          className="w-full h-full object-cover rounded-3xl"
                          onError={(e) => {
                            console.error('Logo failed to load:', companyLogo);
                            setCompanyLogo(null);
                          }}
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>
                          <i className="fas fa-building text-white text-4xl relative z-10"></i>
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex items-center justify-center">
                        <i className="fas fa-camera text-white text-2xl"></i>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <label className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                        <i className="fas fa-edit text-sm"></i>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
              
              </div>
            </div>

            <ErrorMessage error={error} />

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              <div className="border-b border-gray-200">
                <ul className="nav nav-tabs" id="companyTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                      onClick={() => setActiveTab('details')}
                      type="button"
                      role="tab"
                    >
                      <i className="fas fa-building me-2"></i>
                      Company Details
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'contacts' ? 'active' : ''}`}
                      onClick={() => setActiveTab('contacts')}
                      type="button"
                      role="tab"
                    >
                      <i className="fas fa-users me-2"></i>
                      Contacts ({contacts.length})
                    </button>
                  </li>
                </ul>
              </div>

              <div className="p-8">
                {activeTab === 'details' && (
                  <div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                      <div className="flex justify-between items-center p-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-b border-white/20">
                        <button
                          onClick={() => setEditingCompany(!editingCompany)}
                          className={`btn ${editingCompany ? 'btn-secondary mt-2 mb-2' : 'btn-primary mt-2 mb-2'} btn-lg`}
                        >
                          <i className={`fas ${editingCompany ? 'fa-times' : 'fa-edit'} me-2`}></i>
                          {editingCompany ? 'Cancel' : 'Edit'}
                        </button>
                      </div>

                      {editingCompany ? (
                        <form onSubmit={handleUpdateCompany} className="p-8">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label htmlFor="companyName" className="form-label fw-bold">Company Name</label>
                              <input
                                type="text"
                                className="form-control"
                                id="companyName"
                                name="name"
                                value={companyFormData.name}
                                onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="industry" className="form-label fw-bold">Industry</label>
                              <input
                                type="text"
                                className="form-control"
                                id="industry"
                                name="industry"
                                value={companyFormData.industry}
                                onChange={(e) => setCompanyFormData({...companyFormData, industry: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="country" className="form-label fw-bold">Country</label>
                              <input
                                type="text"
                                className="form-control"
                                id="country"
                                name="country"
                                value={companyFormData.country}
                                onChange={(e) => setCompanyFormData({...companyFormData, country: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-end mt-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn btn-primary btn-lg"
                            >
                              {loading ? <LoadingSpinner size="small" text="" /> : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <ul className="nav nav-tabs mb-4" id="companyInfoTabs" role="tablist">
                            <li className="nav-item" role="presentation">
                              <button
                                className="nav-link active"
                                id="overview-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#overview"
                                type="button"
                                role="tab"
                                aria-controls="overview"
                                aria-selected="true"
                              >
                                <i className="fas fa-eye me-2"></i>
                                Overview
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className="nav-link"
                                id="details-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#details"
                                type="button"
                                role="tab"
                                aria-controls="details"
                                aria-selected="false"
                              >
                                <i className="fas fa-info-circle me-2"></i>
                                Company Details
                              </button>
                            </li>
                          </ul>
                          <div className="tab-content" id="companyInfoTabContent">
                            <div
                              className="tab-pane fade show active"
                              id="overview"
                              role="tabpanel"
                              aria-labelledby="overview-tab"
                            >
                              <div className="p-4">
                                <div className="row g-4">
                                  <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                      <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                          <div className="bg-primary text-white rounded-circle p-3 me-3">
                                            <i className="fas fa-industry"></i>
                                          </div>
                                          <h5 className="card-title mb-0">Industry</h5>
                                        </div>
                                        <p className="card-text fs-5 fw-bold">{company.industry || 'Not specified'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                      <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                          <div className="bg-success text-white rounded-circle p-3 me-3">
                                            <i className="fas fa-globe"></i>
                                          </div>
                                          <h5 className="card-title mb-0">Country</h5>
                                        </div>
                                        <p className="card-text fs-5 fw-bold">{company.country || 'Not specified'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              className="tab-pane fade"
                              id="details"
                              role="tabpanel"
                              aria-labelledby="details-tab"
                            >
                              <div className="p-4">
                                <div className="card">
                                  <div className="card-body">
                                    <h5 className="card-title mb-4">Company Information</h5>
                                    <div className="row g-3">
                                      <div className="col-md-6">
                                        <label className="form-label fw-bold">Company Name</label>
                                        <p className="form-control-plaintext">{company.name}</p>
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label fw-bold">Industry</label>
                                        <p className="form-control-plaintext">{company.industry || 'Not specified'}</p>
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label fw-bold">Country</label>
                                        <p className="form-control-plaintext">{company.country || 'Not specified'}</p>
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label fw-bold">Website</label>
                                        <p className="form-control-plaintext">{company.website || 'Not specified'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'contacts' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                    
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="btn btn-primary mb-2 mt-2"
                      >
                        <i className="fas fa-user-plus me-2"></i>
                        Add Contact
                      </button>
                    </div>

                    {contacts.length > 0 ? (
                      <div className="list-group">
                        {contacts.map((contact) => (
                          <div key={contact.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h5 className="mb-1">{contact.full_name}</h5>
                                <p className="mb-2 text-muted">{contact.role}</p>
                                <div className="small">
                                  {contact.email && (
                                    <div className="mb-1">
                                      <strong>Email:</strong> {contact.email}
                                    </div>
                                  )}
                                  {contact.phone && (
                                    <div>
                                      <strong>Phone:</strong> {contact.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                <i className="fas fa-trash me-1"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No contacts found for this company.</p>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h3>
                        <FileUpload onFileSelect={handleFileUpload} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                        <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Contact</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowContactModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <Formik
                  initialValues={{
                    full_name: '',
                    role: '',
                    email: '',
                    phone: ''
                  }}
                  validationSchema={contactValidationSchema}
                  onSubmit={handleCreateContact}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      <div className="mb-3">
                        <label htmlFor="full_name" className="form-label">Full Name *</label>
                        <Field
                          type="text"
                          className={`form-control ${touched.full_name && errors.full_name ? 'is-invalid' : ''}`}
                          id="full_name"
                          name="full_name"
                        />
                        <FormikErrorMessage name="full_name" component="div" className="invalid-feedback" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="role" className="form-label">Role</label>
                        <Field
                          type="text"
                          className="form-control"
                          id="role"
                          name="role"
                        />
                        <FormikErrorMessage name="role" component="div" className="text-danger small" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <Field
                          type="email"
                          className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                        />
                        <FormikErrorMessage name="email" component="div" className="invalid-feedback" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <Field
                          type="tel"
                          className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                          id="phone"
                          name="phone"
                        />
                        <FormikErrorMessage name="phone" component="div" className="invalid-feedback" />
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          onClick={() => setShowContactModal(false)}
                          className="btn btn-secondary"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || loading}
                          className="btn btn-primary"
                        >
                          {isSubmitting || loading ? <LoadingSpinner size="small" text="" /> : 'Create'}
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
    </>
  );
};

export default CompanyDetailPage;
