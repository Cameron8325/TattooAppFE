import moment from 'moment';

/**
 * Format a date string to MM/DD/YYYY format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Format a time string to 12-hour format with AM/PM
 * @param {string} timeString - Time in HH:mm:ss or HH:mm format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return timeString;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format date and time together
 * @param {string} dateString - ISO date string
 * @param {string} timeString - Time string
 * @returns {string} Combined formatted string
 */
export const formatDateTime = (dateString, timeString) => {
  if (!dateString) return '';
  const formattedDate = formatDate(dateString);
  if (!timeString) return formattedDate;
  const formattedTime = formatTime(timeString);
  return `${formattedDate} at ${formattedTime}`;
};

/**
 * Check if a date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is in the current week
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isThisWeek = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  
  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
};

/**
 * Check if a date is in the past
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isPast = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Check if a date is in the future
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isFuture = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Sort appointments by date and time
 * @param {Array} appointments - Array of appointment objects
 * @param {boolean} ascending - Sort order (true = oldest first)
 * @returns {Array} Sorted appointments
 */
export const sortByDateTime = (appointments, ascending = true) => {
  return [...appointments].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time || '00:00:00'}`);
    const dateTimeB = new Date(`${b.date}T${b.time || '00:00:00'}`);
    return ascending ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
  });
};

/**
 * Get time slots for a day
 * @param {number} startHour - Starting hour (0-23)
 * @param {number} endHour - Ending hour (0-23)
 * @param {number} intervalMinutes - Minutes between slots
 * @returns {Array} Array of time strings in HH:mm format
 */
export const getTimeSlots = (startHour = 9, endHour = 18, intervalMinutes = 30) => {
  const slots = [];
  let currentHour = startHour;
  let currentMinute = 0;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
    const hours = String(currentHour).padStart(2, '0');
    const minutes = String(currentMinute).padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    
    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
};

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12h - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string} Time in HH:mm format
 */
export const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24h - Time in HH:mm format
 * @returns {string} Time in 12-hour format with AM/PM
 */
export const convertTo12Hour = (time24h) => {
  return formatTime(time24h);
};

/**
 * Calculate duration between two times
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @returns {number} Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
};

/**
 * Format duration in human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1 hour 30 minutes")
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Validate that end time is after start time
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @returns {boolean} True if valid
 */
export const isValidTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  try {
    const duration = calculateDuration(startTime, endTime);
    return duration > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date N days from today
 * @param {number} days - Number of days to add (negative for past)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getDateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get the start and end of current week
 * @returns {Object} { start: string, end: string } in YYYY-MM-DD format
 */
export const getCurrentWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    start: formatDateToISO(start),
    end: formatDateToISO(end)
  };
};

/**
 * Format date for display with relative information
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with relative info (e.g., "Today, 12/11/2024")
 */
export const formatDateWithRelative = (dateString) => {
  if (!dateString) return '';
  
  const formatted = formatDate(dateString);
  
  if (isToday(dateString)) {
    return `Today, ${formatted}`;
  }
  
  const tomorrow = getDateOffset(1);
  if (dateString === tomorrow) {
    return `Tomorrow, ${formatted}`;
  }
  
  const yesterday = getDateOffset(-1);
  if (dateString === yesterday) {
    return `Yesterday, ${formatted}`;
  }
  
  return formatted;
};

// Export all functions as default object
export default {
  formatDate,
  formatTime,
  formatDateTime,
  isToday,
  isThisWeek,
  isPast,
  isFuture,
  sortByDateTime,
  getTimeSlots,
  convertTo24Hour,
  convertTo12Hour,
  calculateDuration,
  formatDuration,
  isValidTimeRange,
  getTodayDate,
  getDateOffset,
  getCurrentWeekRange,
  formatDateWithRelative,
};
