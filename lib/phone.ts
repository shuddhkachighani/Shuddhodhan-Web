// Normalizes an Indian mobile number for comparison: strips everything but
// digits, then drops any country-code prefix by keeping the last 10 digits.
// "+91 98765 43210", "919876543210" and "9876543210" all normalize the same.
export function normalizeMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function isValidNormalizedMobile(value: string): boolean {
  return /^[6-9][0-9]{9}$/.test(value);
}
