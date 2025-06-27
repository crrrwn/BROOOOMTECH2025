<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Profile Header -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center space-x-6">
        <div class="relative">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
            <img
              v-if="profile.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.first_name"
              class="w-full h-full object-cover"
            />
            <User v-else class="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ profile.first_name }} {{ profile.last_name }}
          </h1>
          <p class="text-gray-600">{{ profile.email }}</p>
          <p class="text-sm text-gray-500 mt-1">
            Member since {{ formatDate(profile.created_at) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Profile Form -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Profile Information</h2>
        <button
          v-if="!editMode"
          @click="editMode = true"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Edit class="w-4 h-4 inline mr-2" />
          Edit Profile
        </button>
      </div>

      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name</label>
            <input
              v-model="profile.first_name"
              type="text"
              :disabled="!editMode"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              v-model="profile.last_name"
              type="text"
              :disabled="!editMode"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Middle Name</label>
          <input
            v-model="profile.middle_name"
            type="text"
            :disabled="!editMode"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            v-model="profile.contact"
            type="tel"
            :disabled="!editMode"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            v-model="profile.address"
            :disabled="!editMode"
            required
            rows="3"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
          ></textarea>
        </div>

        <div v-if="editMode" class="flex gap-4">
          <button
            type="button"
            @click="cancelEdit"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { User, Edit } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const toast = useToast()
const editMode = ref(false)
const loading = ref(false)

const profile = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  contact: '',
  address: '',
  avatar_url: '',
  created_at: ''
})

const originalProfile = reactive({})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const fetchProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    Object.assign(profile, data)
    Object.assign(originalProfile, data)
  } catch (error) {
    console.error('Error fetching profile:', error)
    toast.error('Error loading profile')
  }
}

const handleUpdateProfile = async () => {
  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        middle_name: profile.middle_name,
        contact: profile.contact,
        address: profile.address
      })
      .eq('id', user.id)

    if (error) throw error

    Object.assign(originalProfile, profile)
    editMode.value = false
    toast.success('Profile updated successfully')
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('Error updating profile')
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  Object.assign(profile, originalProfile)
  editMode.value = false
}

onMounted(() => {
  fetchProfile()
})
</script>
