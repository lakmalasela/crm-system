import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showConfirmAlert } from '../utils/sweetAlert';

const NavBar = () => {
  const { user, logout, isAdmin, isManager, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await showConfirmAlert(
      'Logout Confirmation',
      'Are you sure you want to logout? You will need to login again to access the system.',
      'Yes, Logout'
    );
    
    if (result.isConfirmed) {
      await logout();
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          <i className="fas fa-building me-2"></i>
          <strong>CRM System</strong>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                to="/dashboard"
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  isActive('/companies') || isActive('/companies/') ? 'active' : ''
                }`}
                to="/companies"
              >
                <i className="fas fa-building me-2"></i>
                Companies
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/activities') ? 'active' : ''}`}
                to="/activities"
              >
                <i className="fas fa-history me-2"></i>
                Activities
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/contacts') ? 'active' : ''}`}
                to="/contacts"
              >
                <i className="fas fa-address-book me-2"></i>
                Contacts
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/user-register') ? 'active' : ''}`}
                to="/user-register"
              >
                <i className="fas fa-user-plus me-2"></i>
                User Register
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            <div className="me-3 d-flex flex-column">
              <span className="badge bg-primary text-white mb-1">
                <i className="fas fa-user me-1"></i>
                {user?.username || user?.email || user?.name || 'User'}
              </span>
              <div className="d-flex gap-1">
                <span className={`badge ${isAdmin() ? 'bg-danger' : isManager() ? 'bg-warning' : 'bg-info'} text-white`}>
                  <i className={`fas ${isAdmin() ? 'fa-crown' : isManager() ? 'fa-user-tie' : 'fa-user'} me-1`}></i>
                  {user?.role}
                </span>
                <span className={`badge ${user?.organization_plan === 'PRO' ? 'bg-success' : 'bg-secondary'} text-white`}>
                  <i className="fas fa-building me-1"></i>
                  {user?.organization_name || 'No Org'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm"
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;