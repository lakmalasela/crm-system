import React, { useState, useEffect } from 'react';
import { contactService } from '../api/contactService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../utils/sweetAlert';
import { useAuth } from '../context/AuthContext';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const { canEdit, canDelete, canCreate } = useAuth();

  const fetchContacts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, page_size: 10 };
      if (search) {
        params.search = search;
      }
      const response = await contactService.searchContacts(params);
      setContacts(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContacts(1, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchContacts(1, '');
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowEditModal(true);
  };

  const handleUpdateContact = async (updatedData) => {
    const result = await showConfirmAlert(
      'Update Contact',
      `Are you sure you want to update ${editingContact.full_name}'s information?`,
      'Yes, Update'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        // Include the company field in the payload
        const payload = {
          ...updatedData,
          company: editingContact.company_id || editingContact.company
        };
        await contactService.updateContact(editingContact.company_id, editingContact.id, payload);
        showSuccessAlert('Contact Updated', 'Contact has been updated successfully');
        setShowEditModal(false);
        setEditingContact(null);
        fetchContacts(currentPage, searchTerm);
      } catch (err) {
        setError('Failed to update contact');
        showErrorAlert('Error', 'Failed to update contact. Please try again.');
        console.error('Error updating contact:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteContact = async (contact) => {
    const result = await showConfirmAlert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.full_name}? This action cannot be undone.`,
      'Yes, Delete'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await contactService.deleteContact(contact.company_id, contact.id);
        showSuccessAlert('Contact Deleted', 'Contact has been deleted successfully');
        fetchContacts(currentPage, searchTerm);
      } catch (err) {
        setError('Failed to delete contact');
        showErrorAlert('Error', 'Failed to delete contact. Please try again.');
        console.error('Error deleting contact:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fas fa-address-book me-2"></i>
          Contacts
        </h1>
      </div>

      <ErrorMessage error={error} />
          
      {/* Search Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <i className="fas fa-search me-2"></i>
            Search Contacts
          </h5>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search contacts by name, email, or company..."
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-fill"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Search
                      </>
                    )}
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="btn btn-outline-secondary"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Contacts List */}
      {loading && contacts.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <LoadingSpinner size="large" text="Loading contacts..." />
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            {contacts.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <i className="fas fa-user me-1"></i>
                        Name
                      </th>
                      <th>
                        <i className="fas fa-envelope me-1"></i>
                        Email
                      </th>
                      <th>
                        <i className="fas fa-phone me-1"></i>
                        Phone
                      </th>
                      <th>
                        <i className="fas fa-briefcase me-1"></i>
                        Role
                      </th>
                      <th>
                        <i className="fas fa-building me-1"></i>
                        Company
                      </th>
                      <th>
                        <i className="fas fa-cog me-1"></i>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                              {contact.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="fw-medium">{contact.full_name}</div>
                              {contact.is_primary && (
                                <span className="badge bg-success text-white badge-sm">Primary</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <a href={`mailto:${contact.email}`} className="text-decoration-none">
                            {contact.email}
                          </a>
                        </td>
                        <td>
                          {contact.phone ? (
                            <a href={`tel:${contact.phone}`} className="text-decoration-none">
                              {contact.phone}
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {contact.role ? (
                            <span className="badge bg-info text-white">{contact.role}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {contact.company_name ? (
                            <span className="fw-medium text-primary">{contact.company_name}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {canEdit() && (
                              <button
                                onClick={() => handleEditContact(contact)}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit Contact"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            )}
                            {canDelete() && (
                              <button
                                onClick={() => handleDeleteContact(contact)}
                                className="btn btn-sm btn-outline-danger"
                                title="Delete Contact"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                            {!canEdit() && !canDelete() && (
                              <span className="text-muted small">
                                <i className="fas fa-lock me-1"></i>
                                No permissions
                              </span>
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
                <i className="fas fa-address-book fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">
                  {searchTerm ? 'No contacts found matching your search.' : 'No contacts available.'}
                </h5>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first contact.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && editingContact && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  Edit Contact
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingContact(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updatedData = {
                    full_name: formData.get('full_name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    role: formData.get('role'),
                  };
                  handleUpdateContact(updatedData);
                }}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        className="form-control"
                        defaultValue={editingContact.full_name}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        defaultValue={editingContact.email}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        defaultValue={editingContact.phone || ''}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        name="role"
                        className="form-control"
                        defaultValue={editingContact.role || ''}
                        placeholder="e.g., Manager, Developer, etc."
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingContact(null);
                      }}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      <i className="fas fa-save me-2"></i>
                      Update Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
