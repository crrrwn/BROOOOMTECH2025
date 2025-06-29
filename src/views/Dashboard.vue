<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
      <h1 class="text-2xl font-bold mb-2">
        Welcome back, {{ userProfile?.first_name }}! 👋
      </h1>
      <p class="text-green-100">Ready to book your next delivery?</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <Package class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalOrders }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <Clock class="h-8 w-8 text-yellow-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingOrders }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <Truck class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">In Transit</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.inTransitOrders }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <CheckCircle class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Completed</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.completedOrders }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link
          to="/dashboard/book-service"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <Plus class="h-6 w-6 text-green-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Book New Service</p>
            <p class="text-sm text-gray-600">Start a new delivery request</p>
          </div>
        </router-link>
        
        <router-link
          to="/dashboard/my-orders"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <Eye class="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Track Orders</p>
            <p class="text-sm text-gray-600">View your order status</p>
          </div>
        </router-link>
        
        <router-link
          to="/dashboard/upload-payment"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <Upload class="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Upload Payment</p>
            <p class="text-sm text-gray-600">Submit payment proof</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <router-link
          to="/dashboard/my-orders"
          class="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          View all
        </router-link>
      </div>
      
      <div v-if="recentOrders.length === 0" class="text-center py-8">
        <Package class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No orders yet</p>
        <router-link
          to="/dashboard/book-service"
          class="text-green-600 hover:text-green-700 font-medium"
        >
          Book your first service
        </router-link>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="order in recentOrders"
          :key="order.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component :is="getServiceIcon(order.service_type)" class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="font-medium text-gray-900">{{ order.service_type }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusColor(order.status)"
            >
              {{ order.status }}
            </span>
            <router-link
              :to="`/dashboard/order-details/${order.id}`"
              class="ml-3 text-green-600 hover:text-green-700"
            >
              <Eye class="h-4 w-4" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  Package, Clock, Truck, CheckCircle, Plus, Eye, Upload,
  UtensilsCrossed, CreditCard, Gift, Pill, ShoppingCart
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const userProfile = ref(null)
const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  inTransitOrders: 0,
  completedOrders: 0
})
const recentOrders = ref([])

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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      userProfile.value = data
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', user.id)
      
      if (orders) {
        stats.value.totalOrders = orders.length
        stats.value.pendingOrders = orders.filter(o => o.status === 'Pending').length
        stats.value.inTransitOrders = orders.filter(o => ['Assigned', 'Picked Up', 'In Transit'].includes(o.status)).length
        stats.value.completedOrders = orders.filter(o => o.status === 'Delivered').length
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchRecentOrders = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      recentOrders.value = data || []
    }
  } catch (error) {
    console.error('Error fetching recent orders:', error)
  }
}

onMounted(() => {
  fetchUserProfile()
  fetchStats()
  fetchRecentOrders()
})
</script>
