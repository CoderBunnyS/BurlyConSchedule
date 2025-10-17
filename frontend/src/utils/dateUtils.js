/**
 * Convert a date input value to a UTC date string that preserves the local date
 * @param {string} dateInputValue - The value from an HTML date input (YYYY-MM-DD)
 * @returns {string} - ISO string that represents the same date in UTC
 */
export function localDateToUTC(dateInputValue) {
  // Parse date as local midnight
  const [year, month, day] = dateInputValue.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 0, 0, 0);
  
  // Create a UTC date with the same year, month, day
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  
  return utcDate.toISOString();
}

/**
 * Convert a UTC date string to local date format for display
 * @param {string} utcDateString - ISO date string from backend
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function utcToLocalDate(utcDateString) {
  const date = new Date(utcDateString);
  // Get the UTC components
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string consistently regardless of timezone
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date for display
 */
export function formatDateDisplay(dateString) {
  // Parse just the date portion, ignoring time and timezone
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  
  // Create a date object using local timezone
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get the date portion from an ISO string consistently
 * @param {string} isoString - ISO date string
 * @returns {string} - YYYY-MM-DD format
 */
export function getDatePortion(isoString) {
  if (!isoString) return '';
  
  if (isoString.length === 10 && isoString.includes('-')) {
    return isoString;
  }
  
  // extract the date portion
  return isoString.split('T')[0];
}

/**
 * Normalize date for comparison, accounting for timezone issues
 * @param {string} dateString - Date string from backend
 * @returns {string} - Normalized date in YYYY-MM-DD format
 */
export function normalizeDateForComparison(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const hours = date.getUTCHours();
  
  if (hours >= 20) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
}