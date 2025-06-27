<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="flex justify-center">
          <Truck class="h-12 w-12 text-green-600" />
        </div>
        
        <div v-if="loading" class="mt-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <h2 class="mt-4 text-2xl font-bold text-gray-900">Confirming your email...</h2>
          <p class="mt-2 text-gray-600">Please wait while we verify your account.</p>
        </div>

        <div v-else-if="confirmed" class="mt-6">
          <CheckCircle class="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900">Email Confirmed!</h2>
          <p class="mt-2 text-gray-600">Your account has been successfully verified.</p>
          <div class="mt-6">
            <router-link
              to="/dashboard"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go to Dashboard
            </router-link>
          </div>
        </div>

        <div v-else class="mt-6">
          <XCircle class="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900">Confirmation Failed</h2>
          <p class="mt-2 text-gray-600">{{ errorMessage }}</p>
          <div class="mt-6 space-y-3">
            <router-link
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Try Login
            </router-link>
            <router-link
              to="/register"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Register Again
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, CheckCircle, XCircle } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(true)
const confirmed = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  const result = await authStore.handleEmailConfirmation()
  
  if (result.success) {
    confirmed.value = true
    toast.success('Email confirmed successfully! Welcome to BroomTech!')
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } else {
    confirmed.value = false
    errorMessage.value = result.error?.message || 'Email confirmation failed'
    toast.error('Email confirmation failed')
  }
})
</script>
