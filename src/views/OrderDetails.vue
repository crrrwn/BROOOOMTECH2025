<template>
<div v-if="order" class="max-w-4xl mx-auto space-y-6">
  <!-- Order Header -->
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Order Details</h1>
        <p class="text-gray-600">Order #{{ order.order_number }}</p>
      </div>
      <span
        class="px-4 py-2 text-sm font-medium rounded-full"
        :class="getStatusColor(order.status)"
      >
        {{ order.status }}
      </span>
    </div>

    <!-- Cancellation Status -->
    <div v-if="order.status === 'Cancelled'" class="mb-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <AlertTriangle class="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div class="flex-1">
            <h4 class="text-sm font-medium text-red-800 mb-1">Order Cancelled</h4>
            <p v-if="order.cancellation_reason" class="text-sm text-red-700 mb-2">
              <strong>Reason:</strong> {{ order.cancellation_reason }}
            </p>
            <p v-if="order.cancelled_at" class="text-sm text-red-600">
              <strong>Cancelled on:</strong> {{ formatDate(order.cancelled_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Button for Eligible Orders -->
    <div v-if="canCancelOrder" class="mb-6">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <Clock class="h-5 w-5 text-yellow-600 mr-2" />
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800">Cancellation Available</p>
            <p class="text-sm text-yellow-600">You can cancel this order within 30 seconds of placing it</p>
          </div>
        </div>
      </div>
      <button
        @click="initiateCancellation"
        class="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        Cancel Order
      </button>
    </div>

    <!-- Order Progress -->
    <div class="mb-6">
      <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>Order Progress</span>
        <span>{{ getProgressPercentage(order.status) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="h-3 rounded-full transition-all duration-500"
          :class="getProgressColor(order.status)"
          :style="{ width: `${getProgressPercentage(order.status)}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-2">
        <span>Placed</span>
        <span>Assigned</span>
        <span>In Transit</span>
        <span>Delivered</span>
      </div>
    </div>

    <!-- Service Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
        <div class="space-y-2">
          <div class="flex items-center">
            <component :is="getServiceIcon(order.service_type)" class="h-5 w-5 text-green-600 mr-2" />
            <span class="font-medium">{{ order.service_type }}</span>
          </div>
          <p class="text-sm text-gray-600">
            <span class="font-medium">Ordered:</span> {{ formatDate(order.created_at) }}
          </p>
          <p class="text-sm text-gray-600">
            <span class="font-medium">Payment:</span> {{ order.payment_method }}
          </p>
          <p class="text-sm text-gray-600">
            <span class="font-medium">Delivery Fee:</span> ₱{{ order.delivery_fee?.toFixed(2) }}
          </p>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
        <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
      </div>
    </div>
  </div>

  <!-- Service Details -->
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
    <div class="space-y-3">
      <div v-for="(value, key) in serviceDetails" :key="key" class="flex">
        <span class="font-medium text-gray-700 w-1/3 capitalize">{{ formatKey(key) }}:</span>
        <span class="text-gray-600 w-2/3">{{ value }}</span>
      </div>
    </div>
  </div>

  <!-- Driver Information -->
  <div v-if="order.driver_info" class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
          <User class="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p class="font-medium text-gray-900">{{ order.driver_info.name }}</p>
          <p class="text-sm text-gray-600">{{ order.driver_info.contact }}</p>
          <p class="text-sm text-gray-600">{{ order.driver_info.vehicle_type }} - {{ order.driver_info.vehicle_plate }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="callDriver"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Phone class="h-4 w-4 inline mr-2" />
          Call
        </button>
        <button
          @click="openChat"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle class="h-4 w-4 inline mr-2" />
          Chat
        </button>
      </div>
    </div>
  </div>

  <!-- Order Barcode -->
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Verification</h3>
    <div class="text-center">
      <div class="bg-gray-100 p-8 rounded-lg mb-4">
        <!-- Barcode Display -->
        <div class="mb-4">
          <div class="font-mono text-2xl font-bold text-gray-800 tracking-wider">
            {{ formatBarcode(order.barcode_data) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">Barcode</div>
        </div>
        
        <!-- Order Number -->
        <div class="text-3xl font-mono font-bold text-gray-800 mb-2">
          {{ order.order_number }}
        </div>
        <div class="text-sm text-gray-600">
          Show this to the driver for verification
        </div>
      </div>
      
      <!-- QR Code for order -->
      <div class="mt-4">
        <div class="bg-white p-4 rounded-lg inline-block border border-gray-300">
          <img 
            v-if="qrCodeDataUrl" 
            :src="qrCodeDataUrl" 
            alt="Order QR Code"
            class="w-32 h-32"
          />
          <div v-else class="w-32 h-32 bg-gray-100 flex items-center justify-center">
            <div class="text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p class="text-xs text-gray-500">Generating...</p>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">QR Code for quick verification</p>
      </div>
    </div>
  </div>

  <!-- Payment Proof Section -->
  <div v-if="order.payment_proof_url || order.payment_method !== 'COD'" class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
    
    <div v-if="order.payment_method === 'COD'" class="text-center py-4">
      <CreditCard class="h-12 w-12 text-blue-600 mx-auto mb-2" />
      <p class="text-gray-600">Cash on Delivery</p>
      <p class="text-sm text-gray-500">Payment will be collected upon delivery</p>
    </div>
    
    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-medium">Payment Method:</span> {{ order.payment_method }}
          </p>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-medium">Reference Number:</span> {{ order.payment_reference || 'Not provided' }}
          </p>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-medium">Amount:</span> ₱{{ order.delivery_fee?.toFixed(2) }}
          </p>
          <p class="text-sm text-gray-600">
            <span class="font-medium">Status:</span> 
            <span :class="getPaymentStatusColor(order.status)">
              {{ getPaymentStatusText(order.status) }}
            </span>
          </p>
        </div>
        
        <div v-if="order.payment_proof_url">
          <p class="text-sm font-medium text-gray-700 mb-2">Payment Proof:</p>
          <div class="relative">
            <!-- Clean image display without debug info -->
            <div class="relative inline-block">
              <img 
                :src="order.payment_proof_url" 
                alt="Payment Proof"
                class="w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-75 transition-opacity"
                @click="viewPaymentProof(order.payment_proof_url)"
                @error="handleImageError"
                @load="handleImageLoad"
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
              />
              
              <!-- Loading overlay -->
              <div 
                v-if="imageLoadStatus === 'loading'"
                class="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <div class="text-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p class="text-xs text-gray-500">Loading...</p>
                </div>
              </div>
              
              <!-- Error overlay -->
              <div 
                v-if="imageLoadStatus === 'error'"
                class="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center cursor-pointer border-2 border-red-200"
                @click="retryImageLoad"
              >
                <div class="text-center">
                  <AlertTriangle class="h-6 w-6 text-red-500 mx-auto mb-1" />
                  <p class="text-xs text-red-600">Failed to load</p>
                  <p class="text-xs text-red-500">Click to retry</p>
                </div>
              </div>
              
              <!-- Success overlay on hover -->
              <button
                v-if="imageLoadStatus === 'loaded'"
                @click="viewPaymentProof(order.payment_proof_url)"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg"
              >
                <Eye class="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
              </button>
            </div>
            
            <!-- Clean action buttons -->
            <div class="mt-2 flex gap-2">
              <button
                @click="viewPaymentProof(order.payment_proof_url)"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Full Size
              </button>
              <a 
                :href="order.payment_proof_url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
        
        <div v-else-if="order.payment_method !== 'COD'" class="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
          <Upload class="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p class="text-sm text-gray-500">No payment proof uploaded</p>
          <router-link 
            to="/dashboard/upload-payment"
            class="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Upload Payment Proof
          </router-link>
        </div>
      </div>
      
      <!-- Admin Verification Status -->
      <div v-if="order.payment_method !== 'COD'" class="mt-4 p-3 rounded-lg" :class="getVerificationStatusClass(order.status, order.payment_verified, order.payment_rejection_reason)">
        <div class="flex items-center">
          <component :is="getVerificationIcon(order.status, order.payment_verified, order.payment_rejection_reason)" class="h-5 w-5 mr-2" />
          <div>
            <p class="font-medium">{{ getVerificationTitle(order.status, order.payment_verified, order.payment_rejection_reason) }}</p>
            <p class="text-sm">{{ getVerificationMessage(order.status, order.payment_verified, order.payment_rejection_reason) }}</p>
            <p v-if="order.payment_verified_at" class="text-xs text-gray-500 mt-1">
              Verified on: {{ formatDate(order.payment_verified_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Timeline -->
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
    <div class="space-y-4">
      <div
        v-for="event in orderTimeline"
        :key="event.id"
        class="flex items-start"
      >
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="event.completed ? 'bg-green-100' : 'bg-gray-100'"
          >
            <component
              :is="event.icon"
              class="h-4 w-4"
              :class="event.completed ? 'text-green-600' : 'text-gray-400'"
            />
          </div>
        </div>
        <div class="ml-4 flex-1">
          <p
            class="font-medium"
            :class="event.completed ? 'text-gray-900' : 'text-gray-500'"
          >
            {{ event.title }}
          </p>
          <p
            class="text-sm"
            :class="event.completed ? 'text-gray-600' : 'text-gray-400'"
          >
            {{ event.description }}
          </p>
          <p v-if="event.timestamp" class="text-xs text-gray-500 mt-1">
            {{ formatDate(event.timestamp) }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex gap-4">
      <button
        v-if="order.status === 'Delivered'"
        @click="reorderService"
        class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Reorder
      </button>
      <router-link
        to="/dashboard/my-orders"
        class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Back to Orders
      </router-link>
    </div>
  </div>

  <!-- Chat Modal -->
  <div v-if="showChatModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">Chat with Driver</h3>
        <button @click="showChatModal = false" class="text-gray-400 hover:text-gray-600">
          <X class="h-6 w-6" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="message in chatMessages"
          :key="message.id"
          class="flex"
          :class="message.sender_type === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs px-3 py-2 rounded-lg"
            :class="message.sender_type === 'user' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-900'"
          >
            <p class="text-sm">{{ message.message }}</p>
            <p class="text-xs opacity-75 mt-1">{{ formatTime(message.created_at) }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t">
        <div class="flex gap-2">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim()"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Viewer Modal -->
  <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="closeImageModal">
    <div class="relative max-w-4xl max-h-full p-4">
      <img 
        :src="modalImageSrc" 
        alt="Payment Proof"
        class="max-w-full max-h-full object-contain"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
      <button
        @click="closeImageModal"
        class="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
      >
        <X class="h-6 w-6" />
      </button>
    </div>
  </div>

  <!-- Cancellation Modal -->
  <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-md mx-4">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
        
        <!-- Timer Display -->
        <div v-if="cancelTimeLeft > 0" class="mb-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center">
              <Clock class="h-5 w-5 text-yellow-600 mr-2" />
              <div class="flex-1">
                <p class="text-sm font-medium text-yellow-800">Cancellation Window</p>
                <p class="text-sm text-yellow-600">{{ cancelTimeLeft }} seconds remaining</p>
                <div class="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div 
                    class="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                    :style="{ width: `${(cancelTimeLeft / 30) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Expired -->
        <div v-else class="mb-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <AlertTriangle class="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p class="text-sm font-medium text-red-800">Cancellation Period Expired</p>
                <p class="text-sm text-red-600">You can no longer cancel this order</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancellation Form -->
        <div v-if="cancelTimeLeft > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reason for Cancellation *
          </label>
          <select
            v-model="cancelReason"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 mb-4"
            required
          >
            <option value="">Select a reason</option>
            <option value="Changed my mind">Changed my mind</option>
            <option value="Found alternative solution">Found alternative solution</option>
            <option value="Wrong information entered">Wrong information entered</option>
            <option value="Emergency situation">Emergency situation</option>
            <option value="Price too high">Price too high</option>
            <option value="Delivery time too long">Delivery time too long</option>
            <option value="Other">Other (please specify)</option>
          </select>

          <!-- Custom reason input -->
          <div v-if="cancelReason === 'Other'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Please specify your reason *
            </label>
            <textarea
              v-model="cancelReasonOther"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Please provide more details about your cancellation reason"
              required
            ></textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="closeCancelModal"
            class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Keep Order
          </button>
          <button
            v-if="cancelTimeLeft > 0"
            @click="confirmCancellation"
            :disabled="!cancelReason || (cancelReason === 'Other' && !cancelReasonOther.trim()) || cancelling"
            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="cancelling">Cancelling...</span>
            <span v-else>Cancel Order</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<div v-else class="flex items-center justify-center min-h-screen">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
    <p class="mt-4 text-gray-600">Loading order details...</p>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { 
  User, Phone, MessageCircle, X, Send, Clock, AlertTriangle,
  Package, Truck, CheckCircle, MapPin,
  UtensilsCrossed, CreditCard, Gift, Pill, ShoppingCart,
  Upload, Eye
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const order = ref(null)
const showChatModal = ref(false)
const chatMessages = ref([])
const newMessage = ref('')
const qrCodeDataUrl = ref('')
const showImageModal = ref(false)
const modalImageSrc = ref('')
const imageLoadStatus = ref('loading') // 'loading', 'loaded', 'error'

// Cancellation related refs
const showCancelModal = ref(false)
const cancelTimeLeft = ref(0)
const cancelReason = ref('')
const cancelReasonOther = ref('')
const cancelling = ref(false)
const cancelTimer = ref(null)

let chatSubscription = null

const serviceDetails = computed(() => {
  if (!order.value?.service_details) return {}

  const details = JSON.parse(order.value.service_details)
  const filtered = {}

  // Filter out common fields and format display
  Object.keys(details).forEach(key => {
    if (!['paymentMethod', 'deliveryAddress', 'coordinates', 'specialInstructions'].includes(key) && details[key]) {
      filtered[key] = details[key]
    }
  })

  return filtered
})

const canCancelOrder = computed(() => {
  if (!order.value || order.value.status !== 'Pending') return false
  
  const orderTime = new Date(order.value.created_at).getTime()
  const currentTime = new Date().getTime()
  const timeDiff = (currentTime - orderTime) / 1000 // in seconds
  
  return timeDiff <= 30
})

const orderTimeline = computed(() => {
  if (!order.value) return []

  const timeline = [
    {
      id: 1,
      title: 'Order Placed',
      description: 'Your order has been received',
      icon: Package,
      completed: true,
      timestamp: order.value.created_at
    },
    {
      id: 2,
      title: 'Payment Verification',
      description: order.value.payment_method === 'COD' ? 'Cash on Delivery' : 'Verifying payment proof',
      icon: CreditCard,
      completed: ['Assigned', 'Picked Up', 'In Transit', 'Delivered'].includes(order.value.status),
      timestamp: order.value.payment_verified_at
    },
    {
      id: 3,
      title: 'Driver Assigned',
      description: 'A driver has been assigned to your order',
      icon: User,
      completed: ['Assigned', 'Picked Up', 'In Transit', 'Delivered'].includes(order.value.status),
      timestamp: order.value.assigned_at
    },
    {
      id: 4,
      title: 'Order Picked Up',
      description: 'Driver has picked up your order',
      icon: Truck,
      completed: ['Picked Up', 'In Transit', 'Delivered'].includes(order.value.status),
      timestamp: order.value.picked_up_at
    },
    {
      id: 5,
      title: 'In Transit',
      description: 'Your order is on the way',
      icon: MapPin,
      completed: ['In Transit', 'Delivered'].includes(order.value.status),
      timestamp: order.value.in_transit_at
    },
    {
      id: 6,
      title: 'Delivered',
      description: 'Order has been delivered successfully',
      icon: CheckCircle,
      completed: order.value.status === 'Delivered',
      timestamp: order.value.delivered_at
    }
  ]

  return timeline
})

// Generate QR Code using the qrcode library
const generateQRCode = async (data) => {
  try {
    const qrData = JSON.stringify({
      orderNumber: data.order_number,
      serviceType: data.service_type,
      deliveryFee: data.delivery_fee,
      status: data.status,
      barcode: data.barcode_data,
      timestamp: data.created_at
    })
    
    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      width: 128,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    qrCodeDataUrl.value = qrCodeUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    qrCodeDataUrl.value = ''
  }
}

const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src)
  console.error('Error event:', event)
  imageLoadStatus.value = 'error'

  // Try to get more details about the error
  fetch(event.target.src, { method: 'HEAD' })
    .then(response => {
      console.log('Image URL response status:', response.status)
      console.log('Image URL response headers:', [...response.headers.entries()])
    })
    .catch(fetchError => {
      console.error('Fetch error for image URL:', fetchError)
    })
}

const handleImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src)
  imageLoadStatus.value = 'loaded'
}

const retryImageLoad = () => {
  imageLoadStatus.value = 'loading'
  // Force reload the image by adding a timestamp
  const img = document.querySelector('img[alt="Payment Proof"]')
  if (img && order.value.payment_proof_url) {
    const url = new URL(order.value.payment_proof_url)
    url.searchParams.set('t', Date.now())
    img.src = url.toString()
  }
}

const getServiceIcon = (serviceType) => {
  const icons = {
    'Food Delivery': UtensilsCrossed,
    'Bill Payments': CreditCard,
    'Pick-up & Drop': Package,
    'Surprise Gift Delivery': Gift,
    'Medicine Delivery': Pill,
    'Grocery / Pabili': ShoppingCart
  }
  return icons[serviceType] || Package
}

const getStatusColor = (status) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Assigned': 'bg-blue-100 text-blue-800',
    'Picked Up': 'bg-purple-100 text-purple-800',
    'In Transit': 'bg-indigo-100 text-indigo-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getProgressPercentage = (status) => {
  const percentages = {
    'Pending': 20,
    'Assigned': 40,
    'Picked Up': 60,
    'In Transit': 80,
    'Delivered': 100,
    'Cancelled': 0
  }
  return percentages[status] || 0
}

const getProgressColor = (status) => {
  if (status === 'Cancelled') return 'bg-red-500'
  if (status === 'Delivered') return 'bg-green-500'
  return 'bg-blue-500'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not yet'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatKey = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const formatBarcode = (barcodeData) => {
  if (!barcodeData) return 'N/A'
  return barcodeData.replace(/(\d{4})(?=\d)/g, '$1-')
}

const getPaymentStatusColor = (status) => {
  const colors = {
    'Pending': 'text-yellow-600',
    'Assigned': 'text-blue-600',
    'Picked Up': 'text-purple-600',
    'In Transit': 'text-indigo-600',
    'Delivered': 'text-green-600',
    'Cancelled': 'text-red-600'
  }
  return colors[status] || 'text-gray-600'
}

const getPaymentStatusText = (status) => {
  if (status === 'Pending') return 'Awaiting Admin Verification'
  return 'Verified'
}

const getVerificationStatusClass = (status, verified, rejectionReason) => {
  if (verified) return 'bg-green-50 border border-green-200'
  if (rejectionReason) return 'bg-red-50 border border-red-200'
  if (status === 'Pending') return 'bg-yellow-50 border border-yellow-200'
  return 'bg-green-50 border border-green-200'
}

const getVerificationIcon = (status, verified, rejectionReason) => {
  if (verified) return CheckCircle
  if (rejectionReason) return AlertTriangle
  return Clock
}

const getVerificationTitle = (status, verified, rejectionReason) => {
  if (verified) return 'Payment Verified ✅'
  if (rejectionReason) return 'Payment Rejected ❌'
  return 'Payment Verification Pending ⏳'
}

const getVerificationMessage = (status, verified, rejectionReason) => {
  if (verified) {
    return 'Your payment has been verified by our admin team. Your order is now confirmed and being processed.'
  }
  if (rejectionReason) {
    return `Payment was rejected by admin. Reason: ${rejectionReason}. Please upload a new payment proof or contact support.`
  }
  if (status === 'Pending') {
    return 'Our admin is reviewing your payment proof. This usually takes 5-15 minutes during business hours.'
  }
  return 'Your payment has been verified and your order is being processed.'
}

const viewPaymentProof = (proofUrl) => {
  modalImageSrc.value = proofUrl
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  modalImageSrc.value = ''
}

// Cancellation methods
const initiateCancellation = () => {
  if (!order.value) return
  
  const orderTime = new Date(order.value.created_at).getTime()
  const currentTime = new Date().getTime()
  const timeDiff = (currentTime - orderTime) / 1000 // in seconds
  const remainingTime = Math.max(0, 30 - timeDiff)
  
  if (remainingTime <= 0) {
    toast.error('Cancellation period has expired')
    return
  }
  
  cancelTimeLeft.value = Math.floor(remainingTime)
  showCancelModal.value = true
  
  // Start countdown timer
  startCancelTimer()
}

const startCancelTimer = () => {
  cancelTimer.value = setInterval(() => {
    cancelTimeLeft.value--
    
    if (cancelTimeLeft.value <= 0) {
      clearInterval(cancelTimer.value)
      cancelTimer.value = null
    }
  }, 1000)
}

const closeCancelModal = () => {
  showCancelModal.value = false
  cancelReason.value = ''
  cancelReasonOther.value = ''
  
  if (cancelTimer.value) {
    clearInterval(cancelTimer.value)
    cancelTimer.value = null
  }
}

const confirmCancellation = async () => {
  if (!cancelReason.value || cancelTimeLeft.value <= 0) {
    toast.error('Please select a cancellation reason')
    return
  }
  
  if (cancelReason.value === 'Other' && !cancelReasonOther.value.trim()) {
    toast.error('Please specify your cancellation reason')
    return
  }
  
  cancelling.value = true
  
  try {
    const finalReason = cancelReason.value === 'Other' 
      ? cancelReasonOther.value.trim() 
      : cancelReason.value
    
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'Cancelled',
        cancellation_reason: finalReason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', order.value.id)
    
    if (error) throw error
    
    // Update local order data
    order.value = {
      ...order.value,
      status: 'Cancelled',
      cancellation_reason: finalReason,
      cancelled_at: new Date().toISOString()
    }
    
    toast.success('Order cancelled successfully')
    closeCancelModal()
    
  } catch (error) {
    console.error('Error cancelling order:', error)
    toast.error('Error cancelling order. Please try again.')
  } finally {
    cancelling.value = false
  }
}

const fetchOrder = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        driver_info:drivers(name, contact, vehicle_type, vehicle_plate)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    order.value = data
    
    // Reset image load status when order changes
    imageLoadStatus.value = 'loading'
    
    // Generate QR code after order is loaded
    await nextTick()
    if (order.value) {
      generateQRCode(order.value)
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    toast.error('Error loading order details')
    router.push('/dashboard/my-orders')
  }
}

const callDriver = () => {
  if (order.value.driver_info?.contact) {
    window.open(`tel:${order.value.driver_info.contact}`)
  }
}

const openChat = async () => {
  showChatModal.value = true
  await fetchChatMessages()
  subscribeToChatMessages()
}

const fetchChatMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', order.value.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    chatMessages.value = data || []
  } catch (error) {
    console.error('Error fetching chat messages:', error)
  }
}

const subscribeToChatMessages = () => {
  chatSubscription = supabase
    .channel(`order_messages:${order.value.id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'order_messages',
      filter: `order_id=eq.${order.value.id}`
    }, (payload) => {
      chatMessages.value.push(payload.new)
    })
    .subscribe()
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('order_messages')
      .insert([{
        order_id: order.value.id,
        sender_id: user.id,
        sender_type: 'user',
        message: newMessage.value.trim(),
        created_at: new Date().toISOString()
      }])

    if (error) throw error

    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
    toast.error('Error sending message')
  }
}

const reorderService = () => {
  router.push({
    path: '/dashboard/book-service',
    query: { reorder: order.value.id }
  })
}

// Real-time order updates
const subscribeToOrderUpdates = () => {
  supabase
    .channel(`order_updates:${route.params.id}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${route.params.id}`
    }, (payload) => {
      console.log('Order updated:', payload.new)
      // Update the order data with new information
      order.value = { ...order.value, ...payload.new }
      
      // Show toast notification for payment status changes
      if (payload.new.payment_verified === true && order.value.payment_verified !== true) {
        toast.success('Payment approved by admin! Your order is now confirmed.')
      } else if (payload.new.payment_rejection_reason && !order.value.payment_rejection_reason) {
        toast.error(`Payment rejected: ${payload.new.payment_rejection_reason}`)
      }
      
      // Regenerate QR code if order data changed
      generateQRCode(order.value)
    })
    .subscribe()
}

const initialize = () => {
  fetchOrder()
  subscribeToOrderUpdates()
}

onMounted(initialize)

onUnmounted(() => {
  if (chatSubscription) {
    chatSubscription.unsubscribe()
  }
  if (cancelTimer.value) {
    clearInterval(cancelTimer.value)
  }
})
</script>
