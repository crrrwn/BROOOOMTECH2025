// Order Barcode Generation Utility
export const generateOrderBarcode = (orderNumber) => {
  // Generate a unique barcode based on order number and timestamp
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits
  const orderDigits = orderNumber.replace(/\D/g, "").slice(-6) // Extract and limit digits

  // Create a 12-digit barcode: 6 digits from order + 6 from timestamp
  const barcodeData = (orderDigits + timestamp).padStart(12, "0").slice(0, 12)

  return {
    data: barcodeData,
    displayFormat: formatBarcodeDisplay(barcodeData),
    type: "CODE128", // Standard barcode type
  }
}

const formatBarcodeDisplay = (barcodeData) => {
  // Format as groups of 4 digits for better readability
  return barcodeData.replace(/(\d{4})(?=\d)/g, "$1-")
}

// Generate QR code data for order
export const generateOrderQRCode = (orderData) => {
  const qrData = {
    orderNumber: orderData.order_number,
    serviceType: orderData.service_type,
    deliveryFee: orderData.delivery_fee,
    paymentMethod: orderData.payment_method,
    status: orderData.status,
    timestamp: orderData.created_at,
  }

  return JSON.stringify(qrData)
}

// Validate barcode format
export const validateBarcode = (barcodeData) => {
  return /^\d{12}$/.test(barcodeData.replace(/-/g, ""))
}
