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

onMounted(() => {
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

  initializeApp()

  // Clear timeouts
  clearTimeout(retryTimeout)
  clearTimeout(maxTimeout)
})
</script>

<style>
#app {
  min-height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Prevent flash of unstyled content */
body {
  margin: 0;
  padding: 0;
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

/* Utility classes */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease;
}

.transition-all {
  transition: all 0.2s ease;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Loading animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Form styles */
.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500;
}

.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500;
}

/* Card styles */
.card {
  @apply bg-white overflow-hidden shadow rounded-lg;
}

.card-header {
  @apply px-4 py-5 sm:px-6 border-b border-gray-200;
}

.card-body {
  @apply px-4 py-5 sm:p-6;
}

/* Status badges */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge-green {
  @apply bg-green-100 text-green-800;
}

.badge-yellow {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-red {
  @apply bg-red-100 text-red-800;
}

.badge-blue {
  @apply bg-blue-100 text-blue-800;
}

.badge-gray {
  @apply bg-gray-100 text-gray-800;
}

/* Toast notifications */
.toast {
  @apply fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto;
}

.toast-success {
  @apply border-l-4 border-green-400;
}

.toast-error {
  @apply border-l-4 border-red-400;
}

.toast-warning {
  @apply border-l-4 border-yellow-400;
}

.toast-info {
  @apply border-l-4 border-blue-400;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .container {
    @apply px-4;
  }
  
  .card {
    @apply mx-4;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
