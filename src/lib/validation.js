export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}

export function isValidPhone(value) {
  return /^[\d\s+()-]{7,15}$/.test(value || "");
}

export function isValidPincode(value) {
  return /^\d{4,10}$/.test(value || "");
}

export function isStrongPassword(value) {
  return (value || "").length >= 8;
}

export function required(value) {
  return String(value ?? "").trim().length > 0;
}

// Runs a set of { field: [value, ...validators] } and returns { field: errorMessage }
export function validateFields(rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, [value, checks]]) => {
    for (const check of checks) {
      if (!check.test(value)) {
        errors[field] = check.message;
        break;
      }
    }
  });
  return errors;
}
