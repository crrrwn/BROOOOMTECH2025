<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <Truck class="h-12 w-12 text-green-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-green-600 hover:text-green-500">
            sign in to existing account
          </router-link>
        </p>
      </div>
      
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="First Name"
              />
            </div>
            <div>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Last Name"
              />
            </div>
          </div>
          
          <div>
            <input
              v-model="form.middleName"
              type="text"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Middle Name (Optional)"
            />
          </div>
          
          <div>
            <input
              v-model="form.contact"
              type="tel"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Contact Number"
            />
          </div>
          
          <div>
            <textarea
              v-model="form.address"
              required
              rows="3"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Complete Address"
            ></textarea>
          </div>
          
          <div>
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          
          <div>
            <input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Password (min. 6 characters)"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" />
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/"
            class="font-medium text-green-600 hover:text-green-500"
          >
            ← Back to home
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, Loader2 } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const loading = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  contact: '',
  address: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  if (form.password.length < 6) {
    toast.error('Password must be at least 6 characters long')
    return
  }

  loading.value = true

  try {
    const { error } = await authStore.signUp(form)
    
    if (error) throw error

    toast.success('Registration successful! Please check your email to confirm your account before logging in.')
    router.push('/login')
  } catch (error) {
    console.error('Registration error:', error)
    toast.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>
