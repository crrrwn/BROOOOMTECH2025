// AI Dynamic Pricing System
import { supabase } from "../lib/supabase" // Declare or import the supabase variable

export const calculateDeliveryFee = async (serviceType, distance, timeOfDay, demand = "normal", orderValue = 0) => {
  const baseRates = {
    "Food Delivery": 50,
    "Bill Payments": 40,
    "Pick-up & Drop": 60,
    "Surprise Gift Delivery": 55,
    "Medicine Delivery": 65,
    "Grocery / Pabili": 70,
  }

  const serviceMultipliers = {
    "Food Delivery": 1.0,
    "Bill Payments": 0.8,
    "Pick-up & Drop": 1.2,
    "Surprise Gift Delivery": 1.1,
    "Medicine Delivery": 1.3,
    "Grocery / Pabili": 1.4,
  }

  const timeMultipliers = {
    peak: 1.3, // 7-9 AM, 12-2 PM, 6-8 PM
    normal: 1.0, // Regular hours
    late: 1.2, // 9 PM - 6 AM
    weekend: 1.15, // Saturday and Sunday
  }

  const demandMultipliers = {
    low: 0.9,
    normal: 1.0,
    high: 1.2,
    surge: 1.5,
  }

  const baseRate = baseRates[serviceType] || 50
  const distanceRate = 12 // Per km (increased from 10)
  const serviceMultiplier = serviceMultipliers[serviceType] || 1.0

  // Determine time multiplier with AI logic
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  let timeMultiplier = 1.0

  // Weekend pricing
  if (day === 0 || day === 6) {
    timeMultiplier = timeMultipliers.weekend
  }

  // Peak hours (higher priority than weekend)
  if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
    timeMultiplier = timeMultipliers.peak
  } else if (hour >= 21 || hour <= 6) {
    timeMultiplier = timeMultipliers.late
  }

  const demandMultiplier = demandMultipliers[demand] || 1.0

  // Order value multiplier (for high-value orders)
  let orderValueMultiplier = 1.0
  if (orderValue > 5000) {
    orderValueMultiplier = 1.1 // 10% increase for high-value orders
  } else if (orderValue > 2000) {
    orderValueMultiplier = 1.05 // 5% increase for medium-value orders
  }

  // Weather factor (simulated)
  const weatherMultiplier = await getWeatherMultiplier()

  // Calculate final fee with AI adjustments
  const baseFee = (baseRate + distanceRate * distance) * serviceMultiplier
  const adjustedFee = baseFee * timeMultiplier * demandMultiplier * orderValueMultiplier * weatherMultiplier

  // Apply minimum and maximum limits
  const minFee = 35
  const maxFee = 500
  const finalFee = Math.max(minFee, Math.min(maxFee, adjustedFee))

  return Math.round(finalFee * 100) / 100 // Round to 2 decimal places
}

export const getCurrentDemandLevel = async () => {
  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at")
      .in("status", ["Pending", "Assigned", "Picked Up", "In Transit"])
      .gte("created_at", oneHourAgo.toISOString())

    if (error) return "normal"

    const activeOrders = data?.length || 0
    const recentOrders = data?.filter((order) => new Date(order.created_at) > oneHourAgo).length || 0

    // AI-based demand calculation
    if (activeOrders >= 25 || recentOrders >= 15) return "surge"
    if (activeOrders >= 18 || recentOrders >= 10) return "high"
    if (activeOrders >= 8 || recentOrders >= 5) return "normal"
    return "low"
  } catch (error) {
    return "normal"
  }
}

// Simulated weather impact (in real app, integrate with weather API)
const getWeatherMultiplier = async () => {
  // Simulate weather conditions
  const conditions = ["clear", "cloudy", "rainy", "stormy"]
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

  switch (randomCondition) {
    case "stormy":
      return 1.3 // 30% increase for stormy weather
    case "rainy":
      return 1.15 // 15% increase for rain
    case "cloudy":
      return 1.05 // 5% increase for cloudy weather
    default:
      return 1.0 // No change for clear weather
  }
}

// Get pricing breakdown for transparency
export const getPricingBreakdown = async (serviceType, distance, orderValue = 0) => {
  const demand = await getCurrentDemandLevel()
  const totalFee = await calculateDeliveryFee(serviceType, distance, "normal", demand, orderValue)

  const baseRates = {
    "Food Delivery": 50,
    "Bill Payments": 40,
    "Pick-up & Drop": 60,
    "Surprise Gift Delivery": 55,
    "Medicine Delivery": 65,
    "Grocery / Pabili": 70,
  }

  const baseRate = baseRates[serviceType] || 50
  const distanceRate = 12 * distance

  return {
    baseRate,
    distanceRate,
    demandLevel: demand,
    totalFee,
    breakdown: {
      "Base Rate": `₱${baseRate.toFixed(2)}`,
      "Distance (${distance}km)": `₱${distanceRate.toFixed(2)}`,
      "Service Type": serviceType,
      "Demand Level": demand.toUpperCase(),
      Total: `₱${totalFee.toFixed(2)}`,
    },
  }
}
