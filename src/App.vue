<template>
  <div id="app">
    <!-- Loading Screen with Timeout -->
    <div v-if="isInitializing" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <Truck class="h-12 w-12 text-green-600 animate-pulse" />
        </div>
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading BroomTech...</p>
        
        <!-- Show retry button after 10 seconds -->
        <div v-if="showRetry" class="mt-4">
          <button 
            @click="retryInitialization"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
          <p class="text-sm text-gray-500 mt-2">Taking longer than expected?</p>
        </div>
      </div>
    </div>

    <!-- Main App Content -->
    <div v-else class="fade-in">
      <router-view />
      <FloatingChatBot v-if="showChatBot" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Truck } from 'lucide-vue-next'
import FloatingChatBot from './components/FloatingChatBot.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const isInitializing = ref(true)
const showRetry = ref(false)

const showChatBot = computed(() => {
  return authStore.user && route.path !== '/' && !route.path.includes('/login') && !route.path.includes('/register')
})

const initializeApp = async () => {
  try {
    console.log('Starting app initialization...')
    await authStore.initialize()
    console.log('App initialization completed')
  } catch (error) {
    console.error('App initialization error:', error)
  } finally {
    // Always stop loading after initialization attempt
    isInitializing.value = false
  }
}

const retryInitialization = () => {
  isInitializing.value = true
  showRetry.value = false
  initializeApp()
}

onMounted(async () => {
  // Set a timeout to show retry button if loading takes too long
  const retryTimeout = setTimeout(() => {
    if (isInitializing.value) {
      showRetry.value = true
    }
  }, 10000) // 10 seconds

  // Set a maximum timeout to force stop loading
  const maxTimeout = setTimeout(() => {
    if (isInitializing.value) {
      console.warn('Initialization timeout reached, forcing app to load')
      isInitializing.value = false
    }
  }, 15000) // 15 seconds

  await initializeApp()

  // Clear timeouts
  clearTimeout(retryTimeout)
  clearTimeout(maxTimeout)
})
</script>

<style>
#app {
  min-height: 100vh;
}

/* Prevent flash of unstyled content */
body {
  background-color: #f9fafb; /* gray-50 */
}

/* Smooth transitions */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
