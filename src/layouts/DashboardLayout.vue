<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div class="flex items-center flex-shrink-0 px-4">
          <Truck class="h-8 w-8 text-green-600 mr-2" />
          <span class="text-xl font-bold text-gray-800">BroomTech</span>
        </div>
        
        <div class="mt-8 flex-grow flex flex-col">
          <nav class="flex-1 px-2 space-y-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path === item.href 
                ? 'bg-green-100 text-green-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <component :is="item.icon" class="mr-3 h-5 w-5" />
              {{ item.name }}
            </router-link>
          </nav>
        </div>

        <!-- User Profile Section -->
        <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <img
                class="h-8 w-8 rounded-full bg-green-100"
                :src="userProfile?.avatar_url || '/placeholder.svg?height=32&width=32'"
                :alt="userProfile?.first_name || 'User'"
              />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-700">
                {{ userProfile?.first_name }} {{ userProfile?.last_name }}
              </p>
              <button
                @click="handleLogout"
                class="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile sidebar -->
    <div v-if="sidebarOpen" class="fixed inset-0 flex z-40 md:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="sidebarOpen = false"></div>
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button
            @click="sidebarOpen = false"
            class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <X class="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div class="flex-shrink-0 flex items-center px-4">
            <Truck class="h-8 w-8 text-green-600 mr-2" />
            <span class="text-xl font-bold text-gray-800">BroomTech</span>
          </div>
          <nav class="mt-5 px-2 space-y-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              @click="sidebarOpen = false"
              class="group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors"
              :class="$route.path === item.href 
                ? 'bg-green-100 text-green-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <component :is="item.icon" class="mr-4 h-6 w-6" />
              {{ item.name }}
            </router-link>
          </nav>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Top navigation -->
      <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <button
          @click="sidebarOpen = true"
          class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 md:hidden"
        >
          <Menu class="h-6 w-6" />
        </button>
        
        <div class="flex-1 px-4 flex justify-between items-center">
          <div class="flex-1 flex">
            <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
          </div>
          
          <div class="ml-4 flex items-center md:ml-6">
            <button class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <Bell class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Truck, Menu, X, Bell, LayoutDashboard, Calendar, 
  Package, Upload, User 
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const sidebarOpen = ref(false)
const userProfile = ref(null)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Book a Service', href: '/dashboard/book-service', icon: Calendar },
  { name: 'My Orders', href: '/dashboard/my-orders', icon: Package },
  { name: 'Upload Payment', href: '/dashboard/upload-payment', icon: Upload },
  { name: 'Profile', href: '/dashboard/profile', icon: User }
]

const pageTitle = computed(() => {
  const currentNav = navigation.find(item => item.href === route.path)
  return currentNav ? currentNav.name : 'Dashboard'
})

const handleLogout = async () => {
  try {
    const { error } = await authStore.signOut()
    if (error) throw error
    
    toast.success('Logged out successfully')
    router.push('/')
  } catch (error) {
    toast.error('Error logging out')
  }
}

const fetchUserProfile = async () => {
  try {
    await authStore.fetchProfile()
    userProfile.value = authStore.profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>
