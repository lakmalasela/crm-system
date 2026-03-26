import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Company validation schema
export const companySchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .required('Company name is required'),
  industry: yup
    .string()
    .max(50, 'Industry must not exceed 50 characters'),
  country: yup
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters')
    .required('Country is required'),
  website: yup
    .string()
    .url('Invalid website URL')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  email: yup
    .string()
    .email('Invalid email format')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .min(8, 'Phone number must be at least 8 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  address: yup
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

// Contact validation schema
export const contactSchema = yup.object().shape({
  first_name: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .required('First name is required'),
  last_name: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .required('Last name is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .min(8, 'Phone number must be at least 8 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  position: yup
    .string()
    .max(100, 'Position must not exceed 100 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  is_primary: yup
    .boolean()
    .default(false),
});

// Activity validation schema
export const activitySchema = yup.object().shape({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .required('Title is required'),
  description: yup
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  activity_type: yup
    .string()
    .oneOf(['call', 'email', 'meeting', 'task', 'note'], 'Invalid activity type')
    .required('Activity type is required'),
  company: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  scheduled_at: yup
    .date()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

// Register validation schema
export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .email('Invalid email format')
    .required('Username (email) is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(['STAFF', 'ADMIN', 'MANAGER'], 'Invalid role')
    .required('Role is required'),
});
