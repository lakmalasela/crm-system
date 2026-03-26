# CRM Frontend

A modern React-based frontend for the CRM system with comprehensive features and production-ready architecture.

## Features

### Core Functionality
- **Authentication System**: Login/logout with JWT token management
- **Protected Routing**: Route guards with authentication checks
- **Company Management**: Full CRUD operations for companies
- **Contact Management**: Nested contact management within companies
- **Activity Logging**: Track all activities with filtering and pagination
- **File Upload**: Document management with validation

### Technical Features
- **Centralized API Service**: Axios-based API layer with interceptors
- **State Management**: React Context for authentication and global state
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Loading indicators for better UX
- **Pagination**: Server-side pagination support
- **Form Validation**: Client-side validation with error messages
- **Responsive Design**: Mobile-first responsive layout

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── axios.js           # Axios configuration with interceptors
│   ├── authService.js     # Authentication API calls
│   ├── companyService.js  # Company API calls
│   ├── contactService.js  # Contact API calls
│   └── activityService.js # Activity API calls
├── components/            # Reusable components
│   ├── ErrorMessage.jsx   # Error display component
│   ├── FileUpload.jsx     # File upload component
│   ├── LoadingSpinner.jsx # Loading indicator
│   ├── NavBar.jsx         # Navigation bar
│   └── Pagination.jsx     # Pagination component
├── context/              # React Context
│   └── AuthContext.jsx   # Authentication context
├── pages/                # Page components
│   ├── ActivitiesPage.jsx
│   ├── CompanyDetailPage.jsx
│   ├── CompaniesPage.jsx
│   ├── DashboardPage.jsx
│   └── LoginPage.jsx
├── routes/               # Route components
│   └── ProtectedRoute.jsx
├── App.jsx              # Main App component
└── main.js              # Entry point
```

## Environment Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Environment
VITE_NODE_ENV=development

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

### Production Configuration
For production, update your environment variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_TIMEOUT=10000

# Environment
VITE_NODE_ENV=production

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## API Integration

### Base URL Configuration
The API base URL is configured through environment variables:
- Development: `http://localhost:8000/api/v1/`
- Production: Configured via `VITE_API_BASE_URL`

### Authentication
- JWT tokens are stored in localStorage
- Automatic token injection in API requests
- Automatic logout on token expiration
- Request/response interceptors for error handling

### API Endpoints
The frontend integrates with the following API endpoints:

#### Authentication
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `GET /auth/user/` - Get current user

#### Companies
- `GET /companies/` - List companies (with pagination)
- `POST /companies/` - Create company
- `GET /companies/{id}/` - Get company details
- `PUT /companies/{id}/` - Update company
- `DELETE /companies/{id}/` - Delete company
- `POST /companies/{id}/upload/` - Upload documents

#### Contacts
- `GET /companies/{id}/contacts/` - List company contacts
- `POST /companies/{id}/contacts/` - Create contact
- `PUT /companies/{id}/contacts/{contact_id}/` - Update contact
- `DELETE /companies/{id}/contacts/{contact_id}/` - Delete contact

#### Activities
- `GET /activities/` - List activities (with filtering)
- `POST /activities/` - Create activity
- `PUT /activities/{id}/` - Update activity
- `DELETE /activities/{id}/` - Delete activity

## Features in Detail

### Protected Routing
- All routes except `/` are protected
- Automatic redirect to login on unauthorized access
- Loading states during authentication checks

### File Upload
- Drag and drop support
- File type validation
- File size limits
- Progress indicators

### Pagination
- Server-side pagination
- Customizable page sizes
- Navigation controls

### Error Handling
- Global error interceptors
- User-friendly error messages
- Automatic logout on authentication errors

### Loading States
- Loading spinners for async operations
- Skeleton screens for data loading
- Disabled states during operations

## Development Guidelines

### Code Style
- ES6+ JavaScript features
- Functional components with hooks
- Tailwind CSS for styling
- Modular component architecture

### Best Practices
- Error boundaries for error handling
- Proper cleanup in useEffect hooks
- Optimistic updates where appropriate
- Debounced search inputs

### Security
- Input validation and sanitization
- XSS prevention
- Secure token storage
- CORS configuration

## Deployment

### Build Process
```bash
npm run build
```
This creates an optimized production build in the `dist/` directory.

### Environment-Specific Builds
The build process automatically uses environment variables for:
- API endpoints
- Feature flags
- Configuration settings

### Static Hosting
The built application can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3
- GitHub Pages

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Use semantic versioning

## License
MIT License
