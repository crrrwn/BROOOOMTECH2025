<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">My Orders</h1>
      <router-link
        to="/dashboard/book-service"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Book New Service
      </router-link>
    </div>

    <!-- Filter Tabs -->
    <div class="bg-white rounded-lg shadow-sm p-1">
      <div class="flex space-x-1">
        <button
          v-for="status in filterOptions"
          :key="status.value"
          @click="selectedFilter = status.value"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="selectedFilter === status.value
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ status.label }}
          <span v-if="status.count > 0" class="ml-2 px-2 py-1 text-xs rounded-full"
            :class="selectedFilter === status.value
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600'"
          >
            {{ status.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading your orders...</p>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <Package class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
      <p class="text-gray-600 mb-6">
        {{ selectedFilter === 'all' ? "You haven't placed any orders yet." : `No ${selectedFilter.toLowerCase()} orders found.` }}
      </p>
      <router-link
        to="/dashboard/book-service"
        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        Book Your First Service
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <component :is="getServiceIcon(order.service_type)" class="h-8 w-8 text-green-600" />
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ order.service_type }}</h3>
                <p class="text-sm text-gray-600">Order #{{ order.order_number }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Cancel Button for Eligible Orders -->
              <button
                v-if="canCancelOrder(order)"
                @click="initiateCancellation(order)"
                class="bg-red-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
              <span
                class="px-3 py-1 text-sm font-medium rounded-full"
                :class="getStatusColor(order.status)"
              >
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Cancellation Info -->
          <div v-if="order.status === 'Cancelled'" class="mb-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex items-start">
                <AlertTriangle class="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-red-800">Order Cancelled</p>
                  <p v-if="order.cancellation_reason" class="text-sm text-red-700">
                    Reason: {{ order.cancellation_reason }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Ordered:</span> {{ formatDate(order.created_at) }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Payment:</span> {{ order.payment_method }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Delivery Fee:</span> ₱{{ order.delivery_fee?.toFixed(2) }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Address:</span> {{ truncateAddress(order.delivery_address) }}
              </p>
            </div>
            <div class="flex items-center justify-end space-x-2">
              <router-link
                :to="`/dashboard/order-details/${order.id}`"
                class="bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                View Details
              </router-link>
              <button
                v-if="order.status === 'Delivered'"
                @click="reorderService(order)"
                class="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reorder
              </button>
            </div>
          </div>

          <!-- Order Progress Bar -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{{ getProgressPercentage(order.status) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="getProgressColor(order.status)"
                :style="{ width: `${getProgressPercentage(order.status)}%` }"
              ></div>
            </div>
          </div>
        </div>
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { 
  Package, Clock, AlertTriangle,
  UtensilsCrossed, CreditCard, Gift, Pill, ShoppingCart
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const router = useRouter()
const toast = useToast()
const orders = ref([])
const loading = ref(true)
const selectedFilter = ref('all')

// Cancellation related refs
const showCancelModal = ref(false)
const selectedOrder = ref(null)
const cancelTimeLeft = ref(0)
const cancelReason = ref('')
const cancelReasonOther = ref('')
const cancelling = ref(false)
const cancelTimer = ref(null)

const filterOptions = computed(() => {
  const statusCounts = orders.value.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})

  return [
    { label: 'All Orders', value: 'all', count: orders.value.length },
    { label: 'Pending', value: 'Pending', count: statusCounts.Pending || 0 },
    { label: 'Assigned', value: 'Assigned', count: statusCounts.Assigned || 0 },
    { label: 'In Transit', value: 'In Transit', count: statusCounts['In Transit'] || 0 },
    { label: 'Delivered', value: 'Delivered', count: statusCounts.Delivered || 0 },
    { label: 'Cancelled', value: 'Cancelled', count: statusCounts.Cancelled || 0 }
  ]
})

const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === selectedFilter.value)
})

const canCancelOrder = (order) => {
  if (order.status !== 'Pending') return false
  
  const orderTime = new Date(order.created_at).getTime()
  const currentTime = new Date().getTime()
  const timeDiff = (currentTime - orderTime) / 1000 // in seconds
  
  return timeDiff <= 30
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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateAddress = (address) => {
  if (!address) return 'N/A'
  return address.length > 50 ? address.substring(0, 50) + '...' : address
}

// Cancellation methods
const initiateCancellation = (order) => {
  selectedOrder.value = order
  
  const orderTime = new Date(order.created_at).getTime()
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
  selectedOrder.value = null
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
      .eq('id', selectedOrder.value.id)
    
    if (error) throw error
    
    // Update local orders data
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex] = {
        ...orders.value[orderIndex],
        status: 'Cancelled',
        cancellation_reason: finalReason,
        cancelled_at: new Date().toISOString()
      }
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

const fetchOrders = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    orders.value = data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    toast.error('Error loading orders')
  } finally {
    loading.value = false
  }
}

const reorderService = (order) => {
  router.push({
    path: '/dashboard/book-service',
    query: { reorder: order.id }
  })
}

// Real-time order updates
const subscribeToOrderUpdates = () => {
  supabase
    .channel('order_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, () => {
      fetchOrders()
    })
    .subscribe()
}

onMounted(() => {
  fetchOrders()
  subscribeToOrderUpdates()
})

onUnmounted(() => {
  if (cancelTimer.value) {
    clearInterval(cancelTimer.value)
  }
})
</script>
