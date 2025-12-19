/**
 * Application-wide constants
 * Centralizes all magic strings and configuration values
 */

// ==================== USER ROLES ====================
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.EMPLOYEE]: 'Employee',
};

// ==================== APPOINTMENT STATUS ====================
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  NO_SHOW: 'no_show',
};

export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pending Approval',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELED]: 'Canceled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show',
};

export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: '#E91E63', // Pink
  [APPOINTMENT_STATUS.CONFIRMED]: '#9C27B0', // Purple
  [APPOINTMENT_STATUS.COMPLETED]: '#BA68C8', // Light Purple
  [APPOINTMENT_STATUS.CANCELED]: '#F48FB1', // Light Pink
  [APPOINTMENT_STATUS.NO_SHOW]: '#CE93D8', // Medium Purple
};

// ==================== NOTIFICATION ====================
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
};

export const NOTIFICATION_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  CANCELED: 'canceled',
  NO_SHOW: 'no_show',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  DENIED: 'denied',
};

export const ACTION_LABELS = {
  [NOTIFICATION_ACTIONS.CREATED]: 'Created Appointment',
  [NOTIFICATION_ACTIONS.UPDATED]: 'Updated Appointment',
  [NOTIFICATION_ACTIONS.CANCELED]: 'Canceled Appointment',
  [NOTIFICATION_ACTIONS.NO_SHOW]: 'No Show',
  [NOTIFICATION_ACTIONS.PENDING_APPROVAL]: 'Pending Approval',
  [NOTIFICATION_ACTIONS.APPROVED]: 'Approved',
  [NOTIFICATION_ACTIONS.DENIED]: 'Denied',
};

// ==================== SERVICES ====================
export const SERVICES = {
  SERVICE_1: 'service_1',
  SERVICE_2: 'service_2',
  SERVICE_3: 'service_3',
};

export const SERVICE_LABELS = {
  [SERVICES.SERVICE_1]: 'Service 1',
  [SERVICES.SERVICE_2]: 'Service 2',
  [SERVICES.SERVICE_3]: 'Service 3',
};

// Default service descriptions (can be overridden from backend)
export const SERVICE_DESCRIPTIONS = {
  [SERVICES.SERVICE_1]: 'Small Tattoo (under 2 inches)',
  [SERVICES.SERVICE_2]: 'Medium Tattoo (2-6 inches)',
  [SERVICES.SERVICE_3]: 'Large Tattoo (over 6 inches)',
};

// Default service prices (can be overridden from backend)
export const SERVICE_PRICES = {
  [SERVICES.SERVICE_1]: 100.00,
  [SERVICES.SERVICE_2]: 200.00,
  [SERVICES.SERVICE_3]: 300.00,
};

// ==================== TIME FILTERS ====================
export const TIME_FILTERS = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  ALL: 'all',
};

export const TIME_FILTER_LABELS = {
  [TIME_FILTERS.TODAY]: 'Today',
  [TIME_FILTERS.THIS_WEEK]: 'This Week',
  [TIME_FILTERS.ALL]: 'All',
};

// ==================== DATE RANGES ====================
export const DATE_RANGES = {
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  CUSTOM: 'custom',
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.LAST_7_DAYS]: 'Last 7 Days',
  [DATE_RANGES.LAST_30_DAYS]: 'Last 30 Days',
  [DATE_RANGES.THIS_MONTH]: 'This Month',
  [DATE_RANGES.CUSTOM]: 'Custom Range',
};

// ==================== FEE TYPES ====================
export const FEE_TYPES = {
  FLAT: 'flat',
  PERCENTAGE: 'percentage',
};

export const FEE_TYPE_LABELS = {
  [FEE_TYPES.FLAT]: 'Flat Fee',
  [FEE_TYPES.PERCENTAGE]: 'Percentage',
};

// ==================== CALENDAR VIEWS ====================
export const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
};

// ==================== ROUTES ====================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  APPOINTMENTS: '/appointments',
  CALENDAR: '/appointment-calendar',
  DASHBOARD: '/dashboard',
  EMPLOYEE_DASHBOARD: '/employee-dashboard',
  USER_MANAGEMENT: '/user-management',
  BILLING_REPORTS: '/billing-reports',
  ACCESS_DENIED: '/access-denied',
};

// ==================== API ENDPOINTS ====================
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: 'register/',
  LOGIN: 'login/',
  LOGOUT: 'logout/',
  USER: 'user/',
  CSRF: 'csrf/',
  
  // Users
  USERS: 'users/',
  USER_DETAIL: (id) => `users/${id}/`,
  
  // Clients
  CLIENTS: 'clients/',
  CLIENT_DETAIL: (id) => `clients/${id}/`,
  
  // Services
  SERVICES: 'services/',
  SERVICE_DETAIL: (id) => `services/${id}/`,
  
  // Appointments
  APPOINTMENTS: 'appointments/',
  APPOINTMENT_DETAIL: (id) => `appointments/${id}/`,
  APPOINTMENT_RESCHEDULE: (id) => `appointments/${id}/reschedule/`,
  APPOINTMENT_OVERVIEW: 'appointments/overview/',
  
  // Notifications
  RECENT_ACTIVITY: 'recent-activity/',
  APPROVE_NOTIFICATION: (id) => `recent-activity/${id}/approve/`,
  DECLINE_NOTIFICATION: (id) => `recent-activity/${id}/decline/`,
  DELETE_NOTIFICATION: (id) => `recent-activity/${id}/delete/`,
  
  // Metrics & Billing
  METRICS: 'metrics/',
  BILLING_SUMMARY: 'billing/summary/',
};

// ==================== VALIDATION ====================
export const VALIDATION = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Name requirements
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  
  // Email
  EMAIL_MAX_LENGTH: 254,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Phone
  PHONE_REGEX: /^\d{3}-?\d{3}-?\d{4}$/,
  
  // Appointment
  NOTES_MAX_LENGTH: 1000,
  MAX_APPOINTMENT_HOURS: 8,
  MIN_APPOINTMENT_MINUTES: 15,
  
  // Price
  MAX_PRICE: 99999.99,
  MIN_PRICE: 0.00,
};

// ==================== UI CONFIGURATION ====================
export const UI_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 7,
  PAGE_SIZE_OPTIONS: [5, 7, 10, 20, 50],
  
  // Calendar
  CALENDAR_START_HOUR: 8,
  CALENDAR_END_HOUR: 20,
  TIME_SLOT_INTERVAL: 30, // minutes
  
  // Notifications
  SNACKBAR_DURATION: 3000, // ms
  NOTIFICATION_AUTO_HIDE: 6000, // ms
  
  // Timeouts
  API_TIMEOUT: 10000, // ms
  DEBOUNCE_DELAY: 300, // ms
};

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to view this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'The request timed out. Please try again.',
  
  // Form validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number (format: XXX-XXX-XXXX).',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
  INVALID_TIME_RANGE: 'End time must be after start time.',
  APPOINTMENT_TOO_LONG: `Appointment cannot exceed ${UI_CONFIG.CALENDAR_END_HOUR - UI_CONFIG.CALENDAR_START_HOUR} hours.`,
  
  // Specific actions
  APPOINTMENT_CREATE_ERROR: 'Failed to create appointment. Please try again.',
  APPOINTMENT_UPDATE_ERROR: 'Failed to update appointment. Please try again.',
  APPOINTMENT_DELETE_ERROR: 'Failed to delete appointment. Please try again.',
  CLIENT_CREATE_ERROR: 'Failed to create client. This email may already be in use.',
  LOGIN_ERROR: 'Invalid username or password.',
  LOGOUT_ERROR: 'Failed to logout. Please try again.',
};

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'Appointment created successfully!',
  APPOINTMENT_UPDATED: 'Appointment updated successfully!',
  APPOINTMENT_DELETED: 'Appointment deleted successfully!',
  APPOINTMENT_COMPLETED: 'Appointment marked as completed.',
  APPOINTMENT_NO_SHOW: 'Appointment marked as no-show.',
  NOTIFICATION_APPROVED: 'Appointment request approved.',
  NOTIFICATION_DECLINED: 'Appointment request declined.',
  CLIENT_CREATED: 'Client profile created successfully!',
  CLIENT_UPDATED: 'Client information updated successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTRATION_SUCCESS: 'Registration successful! Please login.',
};

// ==================== CONFIRMATION MESSAGES ====================
export const CONFIRMATION_MESSAGES = {
  DELETE_APPOINTMENT: 'Are you sure you want to delete this appointment?',
  CANCEL_APPOINTMENT: 'Are you sure you want to cancel this appointment?',
  MARK_NO_SHOW: 'Mark this appointment as no-show?',
  MARK_COMPLETED: 'Mark this appointment as completed?',
  LONG_APPOINTMENT: (hours) => `This appointment is ${hours} hours long. Continue?`,
  LEAVE_UNSAVED: 'You have unsaved changes. Are you sure you want to leave?',
};

// ==================== MONTHS ====================
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// ==================== EXPORT DEFAULT ====================
export default {
  USER_ROLES,
  ROLE_LABELS,
  APPOINTMENT_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  NOTIFICATION_STATUS,
  NOTIFICATION_ACTIONS,
  ACTION_LABELS,
  SERVICES,
  SERVICE_LABELS,
  SERVICE_DESCRIPTIONS,
  SERVICE_PRICES,
  TIME_FILTERS,
  TIME_FILTER_LABELS,
  DATE_RANGES,
  DATE_RANGE_LABELS,
  FEE_TYPES,
  FEE_TYPE_LABELS,
  CALENDAR_VIEWS,
  ROUTES,
  API_ENDPOINTS,
  VALIDATION,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIRMATION_MESSAGES,
  MONTHS,
};
