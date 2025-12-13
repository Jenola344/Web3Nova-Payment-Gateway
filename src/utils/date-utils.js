/**
 * Date Utilities
 * Date manipulation and formatting functions
 */

/**
 * Add days to a date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add hours to a date
 * @param {Date} date - Base date
 * @param {number} hours - Number of hours to add
 * @returns {Date}
 */
const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

/**
 * Add minutes to a date
 * @param {Date} date - Base date
 * @param {number} minutes - Number of minutes to add
 * @returns {Date}
 */
const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

/**
 * Check if date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear();
};

/**
 * Get difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get difference in hours between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in hours
 */
const getHoursDifference = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.floor(diffTime / (1000 * 60 * 60));
};

/**
 * Format date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date
 */
const toISOString = (date) => {
  return new Date(date).toISOString();
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale code (default: 'en-US')
 * @returns {string} Formatted date
 */
const formatDate = (date, locale = 'en-US') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date and time to readable string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale code (default: 'en-US')
 * @returns {string} Formatted date and time
 */
const formatDateTime = (date, locale = 'en-US') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get start of day
 * @param {Date} date - Date
 * @returns {Date} Start of day
 */
const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of day
 * @param {Date} date - Date
 * @returns {Date} End of day
 */
const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Check if date is expired
 * @param {Date} expiryDate - Expiry date
 * @returns {boolean}
 */
const isExpired = (expiryDate) => {
  return isPast(expiryDate);
};

/**
 * Get time remaining until date
 * @param {Date} targetDate - Target date
 * @returns {Object} Time remaining object
 */
const getTimeRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false
  };
};

/**
 * Parse date string
 * @param {string} dateString - Date string
 * @returns {Date|null} Parsed date or null
 */
const parseDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
};

/**
 * Get current timestamp
 * @returns {number} Unix timestamp
 */
const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Convert timestamp to date
 * @param {number} timestamp - Unix timestamp
 * @returns {Date}
 */
const timestampToDate = (timestamp) => {
  return new Date(timestamp * 1000);
};

/**
 * Get age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
const getAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  addDays,
  addHours,
  addMinutes,
  isPast,
  isFuture,
  isToday,
  getDaysDifference,
  getHoursDifference,
  toISOString,
  formatDate,
  formatDateTime,
  startOfDay,
  endOfDay,
  isExpired,
  getTimeRemaining,
  parseDate,
  getCurrentTimestamp,
  timestampToDate,
  getAge
};