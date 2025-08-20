// src/utils/dateUtils.js
// Date utility functions to handle timezone issues in shift management

/**
 * Convert a date input value to a UTC date string that preserves the local date
 * @param {string} dateInputValue - The value from an HTML date input (YYYY-MM-DD)
 * @returns {string} - ISO string that represents the same date in UTC
 */
export function localDateToUTC(dateInputValue) {
  // Parse the date as local midnight
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
  
  // If it's already just a date (YYYY-MM-DD), return as is
  if (isoString.length === 10 && isoString.includes('-')) {
    return isoString;
  }
  
  // Otherwise extract the date portion
  return isoString.split('T')[0];
}

/**
 * Normalize date for comparison, accounting for timezone issues
 * @param {string} dateString - Date string from backend
 * @returns {string} - Normalized date in YYYY-MM-DD format
 */
export function normalizeDateForComparison(dateString) {
  if (!dateString) return '';
  
  // If the date appears to be offset by timezone, adjust it
  const date = new Date(dateString);
  
  // Check if the time portion suggests a timezone offset
  const hours = date.getUTCHours();
  
  // If the UTC hours are not 0, we might have a timezone issue
  // Adjust to get the intended date
  if (hours >= 20) {
    // Date was likely saved as previous day due to timezone
    date.setUTCDate(date.getUTCDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
}