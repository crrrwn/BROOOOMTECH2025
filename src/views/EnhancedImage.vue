<template>
  <div class="relative inline-block">
    <!-- Loading state -->
    <div 
      v-if="loading"
      class="flex items-center justify-center bg-gray-100 rounded"
      :class="containerClass"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-xs text-gray-500">Loading...</p>
      </div>
    </div>

    <!-- Error state -->
    <div 
      v-else-if="error"
      class="flex items-center justify-center bg-red-50 border-2 border-red-200 rounded cursor-pointer"
      :class="containerClass"
      @click="retry"
    >
      <div class="text-center">
        <AlertTriangle class="h-6 w-6 text-red-500 mx-auto mb-1" />
        <p class="text-xs text-red-600">Failed to load</p>
        <p class="text-xs text-red-500">Click to retry</p>
      </div>
    </div>

    <!-- Success state -->
    <img 
      v-else
      :src="currentSrc"
      :alt="alt"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
      @click="$emit('click', $event)"
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { getImageUrl } from '../utils/imageUtils'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Image'
  },
  class: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const loading = ref(true)
const error = ref(false)
const currentSrc = ref('')
const retryCount = ref(0)

const containerClass = computed(() => {
  return props.class || 'w-12 h-12'
})

const imageClass = computed(() => {
  return props.class
})

const loadImage = async () => {
  if (!props.src) return

  loading.value = true
  error.value = false

  try {
    // Try to get enhanced URL
    const enhancedUrl = await getImageUrl(extractFilePath(props.src))
    currentSrc.value = enhancedUrl || props.src
  } catch (err) {
    console.error('Error getting enhanced URL:', err)
    currentSrc.value = props.src
  }
}

const extractFilePath = (url) => {
  try {
    // Extract file path from Supabase URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === 'object')
    if (bucketIndex !== -1 && bucketIndex + 2 < pathParts.length) {
      return pathParts.slice(bucketIndex + 2).join('/')
    }
    return url
  } catch {
    return url
  }
}

const handleLoad = () => {
  loading.value = false
  error.value = false
}

const handleError = () => {
  loading.value = false
  error.value = true
  console.error('Image failed to load:', currentSrc.value)
}

const retry = () => {
  if (retryCount.value < 3) {
    retryCount.value++
    // Add timestamp to force reload
    const url = new URL(currentSrc.value)
    url.searchParams.set('retry', retryCount.value)
    url.searchParams.set('t', Date.now())
    currentSrc.value = url.toString()
    loadImage()
  }
}

watch(() => props.src, () => {
  retryCount.value = 0
  loadImage()
})

onMounted(() => {
  loadImage()
})
</script>
