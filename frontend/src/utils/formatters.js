/**
 * Format currency for Indian Rupees
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  return Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
};

/**
 * Format package/salary in LPA (Lakhs Per Annum)
 * @param {number} amount - The package amount
 * @returns {string} Formatted package string with ₹ and LPA
 */
export const formatPackage = (amount) => {
  return `₹${formatCurrency(amount)} LPA`;
};

/**
 * Format date to localized string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format CGPA to 2 decimal places
 * @param {number} cgpa - The CGPA value
 * @returns {string} Formatted CGPA
 */
export const formatCGPA = (cgpa) => {
  if (cgpa === null || cgpa === undefined || isNaN(cgpa)) {
    return 'N/A';
  }
  return Number(cgpa).toFixed(2);
};

/**
 * Format phone number (Indian format)
 * @param {string} phone - The phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Truncate text to specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
