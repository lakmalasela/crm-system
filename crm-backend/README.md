# Multi-Tenant CRM System

A production-ready, multi-tenant Customer Relationship Management (CRM) system built with Django REST Framework, PostgreSQL, and AWS S3 integration.

## Architecture Overview

This system demonstrates enterprise-level software engineering practices including:

- **Multi-tenant data isolation** with strict organization-based access control
- **Role-based access control (RBAC)** with Admin, Manager, and Staff roles
- **JWT-based authentication** with token refresh and logout capabilities
- **Comprehensive activity logging** for audit trails
- **AWS S3 integration** for file storage (company logos)
- **Clean architecture** with separation of concerns
- **Production-ready error handling** and consistent API responses

## Features

### Multi-Tenant Architecture
- **Organization-based isolation**: Each organization operates independently
- **Automatic data filtering**: All queries scoped to user's organization
- **Middleware enforcement**: Tenant isolation at request level
- **Subscription plans**: Basic and Pro plan support

### Authentication & Authorization
- **JWT authentication**: Access and refresh tokens
- **Role-based permissions**:
  - **Admin**: Full access (create, read, update, delete)
  - **Manager**: Create, read, update (no delete)
  - **Staff**: Read-only access
- **Organization membership validation**

### Core CRM Functionality
- **Company Management**:
  - Name, industry, country, logo upload
  - Soft delete support
  - Organization-scoped queries
  
- **Contact Management**:
  - Full name, email, phone, role
  - Email uniqueness per company
  - Phone validation (8-15 digits)
  - Company association

### Advanced Features
- **Activity Logging**: Automatic audit trail for all CRUD operations
- **Search & Filtering**: Full-text search and field filtering
- **Pagination**: Efficient data retrieval
- **Soft Delete**: Data retention with logical deletion
- **AWS S3 Integration**: Secure file storage

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/refresh/` - Token refresh
- `POST /api/v1/auth/logout/` - User logout

### Companies
- `GET /api/v1/companies/` - List companies (paginated, searchable)
- `POST /api/v1/companies/` - Create company (Manager+)
- `GET /api/v1/companies/{id}/` - Get company details
- `PUT /api/v1/companies/{id}/` - Update company (Manager+)
- `PATCH /api/v1/companies/{id}/` - Partial update (Manager+)
- `DELETE /api/v1/companies/{id}/` - Soft delete (Admin only)

### Contacts
- `GET /api/v1/contacts/` - List contacts (paginated, searchable)
- `POST /api/v1/contacts/` - Create contact (Manager+)
- `GET /api/v1/contacts/{id}/` - Get contact details
- `PUT /api/v1/contacts/{id}/` - Update contact (Manager+)
- `PATCH /api/v1/contacts/{id}/` - Partial update (Manager+)
- `DELETE /api/v1/contacts/{id}/` - Soft delete (Admin only)

### Query Parameters
- **Pagination**: `?page=2&page_size=10`
- **Search**: `?search=john`
- **Filtering**: `?company=1&role=manager`
- **Ordering**: `?ordering=-created_at`

## Installation & Setup

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- AWS Account (for S3)
- Redis (optional, for caching)

### Environment Setup

1. **Clone and setup**:
```bash
git clone <repository-url>
cd crm-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Environment variables** (.env file):
```env
# Database
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=eu-north-1

# Django
SECRET_KEY=your_secret_key
DEBUG=True
```

4. **Database setup**:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

5. **Run the server**:
```bash
python manage.py runserver
```

##  System Architecture

### Multi-Tenant Implementation
- **Organization Model**: Central tenant model with subscription plans
- **Middleware**: Automatic tenant context injection
- **Query Filtering**: Organization-scoped queries via service layer
- **Permission Checks**: Organization membership validation

### Security Features
- **JWT Tokens**: Secure authentication with refresh mechanism
- **RBAC**: Fine-grained permission control
- **Data Isolation**: Tenant-based data separation
- **Input Validation**: Comprehensive data validation
- **AWS IAM**: Secure S3 access policies

### Clean Architecture
```
accounts/          # User management & authentication
├── models.py      # User, Organization models
├── views.py       # Auth endpoints
├── serializers.py # Data serialization
├── services.py    # Business logic
└── permissions.py # RBAC implementation

companies/         # Company management
├── models.py      # Company model
├── views.py       # CRUD operations
├── serializers.py # Company serialization
└── services.py    # Business logic

contacts/          # Contact management
├── models.py      # Contact model with validation
├── views.py       # CRUD with filtering/search
├── serializers.py # Contact serialization
└── services.py    # Business logic

activity_logs/     # Audit trail system
├── models.py      # Activity log model
└── services.py    # Logging utilities

utils/             # Shared utilities
├── middleware.py  # Multi-tenant middleware
├── mixins.py      # Activity logging mixin
└── exceptions.py  # Error handling
```

##  Testing

### Postman Collection
Import the provided `postman_collection.json` for comprehensive API testing:

1. Open Postman
2. Import → Select file → Choose `postman_collection.json`
3. Set environment variables:
   - `base_url`: `http://localhost:8000`
   - `access_token`: Auto-populated after login
   - `organization_id`: Your organization ID

### Test Sequence
1. **Register User**: Create admin account
2. **Login**: Get JWT tokens
3. **Create Company**: Test company creation
4. **Create Contact**: Test contact creation
5. **Test RBAC**: Verify role-based permissions
6. **Test Search/Filter**: Validate advanced features

##  Database Schema

### Core Models
- **Organization**: Tenant model with subscription plans
- **User**: Custom user model with role and organization
- **Company**: Business entities with organization scope
- **Contact**: Individual contacts with company association
- **ActivityLog**: Comprehensive audit trail

### Relationships
- User → Organization (Many-to-One)
- Company → Organization (Many-to-One)
- Contact → Company (Many-to-One)
- Contact → Organization (Many-to-One)
- ActivityLog → User (Many-to-One)
- ActivityLog → Organization (Many-to-One)

## Security Considerations

### Multi-Tenant Security
- **Data Isolation**: Organization-based query filtering
- **Permission Checks**: Role-based access control
- **Input Validation**: Comprehensive data validation
- **JWT Security**: Token expiration and refresh

### AWS S3 Security
- **IAM Roles**: Least privilege access
- **Bucket Policies**: Secure access configuration
- **Signed URLs**: Temporary access for private files
- **Free Tier**: Cost-effective storage solution

## Production Deployment

### Environment Configuration
- Set `DEBUG=False` in production
- Use environment variables for all secrets
- Configure proper CORS settings
- Set up SSL/TLS termination
- Configure logging and monitoring









