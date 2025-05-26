/**
 * Currency formatting utilities for the application
 */

/**
 * Format a number as Philippine Peso (₱)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted string with Philippine Peso symbol
 */
export const formatCurrency = (
  amount: number, 
  options: { 
    showSymbol?: boolean; 
    decimal?: number;
    useGrouping?: boolean;
  } = {}
): string => {
  const {
    showSymbol = true,
    decimal = 2,
    useGrouping = true
  } = options;

  try {
    // Format the number with commas for thousands
    const formatted = new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
      useGrouping: useGrouping
    }).format(amount);

    // Add the Philippine Peso symbol if requested
    return showSymbol ? `₱${formatted}` : formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return showSymbol ? `₱${amount.toFixed(decimal)}` : amount.toFixed(decimal);
  }
};

/**
 * Parse a string value that may contain currency symbols or commas
 * @param value - The string value to parse
 * @returns The parsed number or 0 if invalid
 */
export const parseCurrencyValue = (value: string): number => {
  // Remove currency symbol, commas, and other non-numeric characters (except decimal point)
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Parse the cleaned string to a number
  const parsed = parseFloat(cleaned);
  
  // Return the parsed value or 0 if NaN
  return isNaN(parsed) ? 0 : parsed;
}; 