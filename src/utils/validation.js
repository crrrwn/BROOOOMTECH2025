// Enhanced Form validation utilities with spam prevention
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+63|0)?[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s\-.]+$/
  const spamRegex = /^[A-Z]{5,}$|^[a-z]{20,}$|^(.)\1{4,}$/
  return nameRegex.test(name) && !spamRegex.test(name) && name.trim().length >= 2 && name.trim().length <= 50
}

export const validateAddress = (address) => {
  // Prevent spammy inputs
  const spamRegex = /^[A-Z]{5,}$|^[a-z]{20,}$|^[0-9]+$|^(.)\1{4,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.,#]+$/
  return (
    !spamRegex.test(address) &&
    validCharsRegex.test(address) &&
    address.trim().length >= 10 &&
    address.trim().length <= 200
  )
}

export const validateZipCode = (zipCode) => {
  return zipCode === "5200" // Only Calapan City
}

export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, "")
}

export const validateReferenceNumber = (refNumber) => {
  // GCash/PayMaya reference numbers are typically 13 digits
  const refRegex = /^[0-9]{10,15}$/
  return refRegex.test(refNumber)
}

// Service-specific validations
export const validateRestaurantName = (name) => {
  const spamRegex = /^[A-Z]{5,}$|^[a-z]{15,}$|^(.)\1{3,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.&']+$/
  return validCharsRegex.test(name) && !spamRegex.test(name) && name.trim().length >= 2 && name.trim().length <= 100
}

export const validateFoodItems = (items) => {
  const spamRegex = /^[A-Z]{10,}$|^[a-z]{30,}$|^(.)\1{5,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.,$$$$&']+$/
  return validCharsRegex.test(items) && !spamRegex.test(items) && items.trim().length >= 5 && items.trim().length <= 500
}

export const validateAccountNumber = (accountNum) => {
  const validRegex = /^[a-zA-Z0-9-]+$/
  const spamRegex = /^(.)\1{4,}$/
  return (
    validRegex.test(accountNum) &&
    !spamRegex.test(accountNum) &&
    accountNum.trim().length >= 3 &&
    accountNum.trim().length <= 50
  )
}

export const validateItemDescription = (description) => {
  const spamRegex = /^[A-Z]{10,}$|^[a-z]{30,}$|^(.)\1{5,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.,$$$$&']+$/
  return (
    validCharsRegex.test(description) &&
    !spamRegex.test(description) &&
    description.trim().length >= 5 &&
    description.trim().length <= 300
  )
}

export const validateMedicineList = (medicines) => {
  const spamRegex = /^[A-Z]{10,}$|^[a-z]{30,}$|^(.)\1{5,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.,$$$$&'/]+$/
  return (
    validCharsRegex.test(medicines) &&
    !spamRegex.test(medicines) &&
    medicines.trim().length >= 3 &&
    medicines.trim().length <= 500
  )
}

export const validateShoppingList = (list) => {
  const spamRegex = /^[A-Z]{10,}$|^[a-z]{30,}$|^(.)\1{5,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.,$$$$&'/]+$/
  return validCharsRegex.test(list) && !spamRegex.test(list) && list.trim().length >= 5 && list.trim().length <= 1000
}

export const validateAmount = (amount) => {
  const numAmount = Number.parseFloat(amount)
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 50000
}

export const validateContactInfo = (contact) => {
  const spamRegex = /^[A-Z]{10,}$|^[a-z]{20,}$|^(.)\1{4,}$/
  const validCharsRegex = /^[a-zA-Z0-9\s\-.,$$$$+]+$/
  return (
    validCharsRegex.test(contact) &&
    !spamRegex.test(contact) &&
    contact.trim().length >= 5 &&
    contact.trim().length <= 100
  )
}

// QR Payment reference validation with stricter rules
export const validateQRReference = (reference, paymentMethod) => {
  if (!reference || typeof reference !== "string") return false

  const cleanRef = reference.replace(/\s/g, "").toUpperCase()

  switch (paymentMethod) {
    case "GCash":
      // GCash reference format: exactly 13 digits
      return /^[0-9]{13}$/.test(cleanRef)
    case "PayMaya":
      // PayMaya reference format: 12-13 digits
      return /^[0-9]{12,13}$/.test(cleanRef)
    case "GoTyme":
      // GoTyme reference format: 10-15 alphanumeric characters
      return /^[A-Z0-9]{10,15}$/.test(cleanRef)
    default:
      return false
  }
}

// Validate reference code format and check for duplicates
export const validateReferenceCode = async (reference, paymentMethod, orderId = null) => {
  // First check format
  if (!validateQRReference(reference, paymentMethod)) {
    return {
      isValid: false,
      error: `Invalid ${paymentMethod} reference format`,
    }
  }

  // Check for duplicates in database
  try {
    const { supabase } = await import("../lib/supabase")

    let query = supabase
      .from("payment_proofs")
      .select("id, order_id")
      .eq("reference_number", reference.replace(/\s/g, ""))
      .eq("payment_method", paymentMethod)

    if (orderId) {
      query = query.neq("order_id", orderId)
    }

    const { data, error } = await query

    if (error) {
      return {
        isValid: false,
        error: "Error validating reference code",
      }
    }

    if (data && data.length > 0) {
      return {
        isValid: false,
        error: "This reference number has already been used",
      }
    }

    return {
      isValid: true,
      error: null,
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Error validating reference code",
    }
  }
}
