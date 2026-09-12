export type ValidationResult = string | undefined

export function validateRequired(
  value: string,
  fieldName: string,
): ValidationResult {
  if (!value.trim()) {
    return `${fieldName} is required`
  }

  return undefined
}

export function validateFirstName(
  value: string,
): ValidationResult {
  if (!value.trim()) {
    return 'First name is required'
  }

  if (value.trim().length < 2) {
    return 'First name must be at least 2 characters'
  }

  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) {
    return 'Please enter a valid first name'
  }

  return undefined
}

export function validateLastName(
  value: string,
): ValidationResult {
  if (!value.trim()) {
    return 'Last name is required'
  }

  if (value.trim().length < 2) {
    return 'Last name must be at least 2 characters'
  }

  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) {
    return 'Please enter a valid last name'
  }

  return undefined
}

export function validateEmail(
  value: string,
): ValidationResult {
  if (!value.trim()) {
    return 'Email address is required'
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value.trim())) {
    return 'Please enter a valid email address'
  }

  return undefined
}

export function validatePhone(
  value: string,
): ValidationResult {
  if (!value.trim()) {
    return 'Phone number is required'
  }

  /*
   * Remove spaces, brackets and hyphens.
   *
   * Examples:
   * 0801 234 5678
   * 0801-234-5678
   * +234 801 234 5678
   */
  const cleanedPhone = value.replace(
    /[\s()-]/g,
    '',
  )

  /*
   * Nigerian international format:
   *
   * +2348012345678
   *
   * Nigerian mobile prefixes:
   * 070
   * 071
   * 080
   * 081
   * 090
   * 091
   */
  if (
    /^(\+234)[789]\d{9}$/.test(
      cleanedPhone,
    )
  ) {
    return undefined
  }

  /*
   * Nigerian local format:
   *
   * 08012345678
   *
   * Must start with:
   * 070
   * 071
   * 080
   * 081
   * 090
   * 091
   */
  if (
    /^0[789]\d{9}$/.test(
      cleanedPhone,
    )
  ) {
    return undefined
  }

  return 'Enter a valid Nigerian phone number'
}

export function validatePassword(
  value: string,
): ValidationResult {
  if (!value) {
    return 'Password is required'
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters'
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain an uppercase letter'
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must contain a lowercase letter'
  }

  if (!/\d/.test(value)) {
    return 'Password must contain a number'
  }

  return undefined
}
