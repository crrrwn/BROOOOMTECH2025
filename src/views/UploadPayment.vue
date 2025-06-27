<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Upload Payment Proof</h1>
      <p class="text-gray-600 mt-1">Submit your payment proof for verification</p>
    </div>

    <!-- Pending Orders -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Orders Awaiting Payment</h2>
      
      <div v-if="pendingOrders.length === 0" class="text-center py-8">
        <CreditCard class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No orders awaiting payment</p>
        <router-link
          to="/dashboard/book-service"
          class="text-green-600 hover:text-green-700 font-medium"
        >
          Book a new service
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in pendingOrders"
          :key="order.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-gray-900">{{ order.service_type }}</h3>
              <p class="text-sm text-gray-600">Order #{{ order.order_number }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-green-600">₱{{ order.delivery_fee?.toFixed(2) }}</p>
              <p class="text-sm text-gray-600">{{ order.payment_method }}</p>
            </div>
          </div>

          <!-- Show existing payment proof if available -->
          <div v-if="order.payment_proof_url" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-900">Payment proof uploaded</p>
                <p class="text-xs text-blue-700">Reference: {{ order.payment_reference }}</p>
                <p class="text-xs text-gray-500 mt-1">Status: Awaiting admin verification</p>
              </div>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <img 
                    :src="order.payment_proof_url" 
                    alt="Payment Proof Thumbnail"
                    class="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                    @click="viewPaymentProof(order.payment_proof_url)"
                    @error="(e) => handleImageError(e, order.id)"
                    @load="(e) => handleImageLoad(e, order.id)"
                    crossorigin="anonymous"
                    referrerpolicy="no-referrer"
                  />
                  
                  <!-- Loading overlay for thumbnail -->
                  <div 
                    v-if="getImageStatus(order.id) === 'loading'"
                    class="absolute inset-0 bg-gray-100 rounded flex items-center justify-center"
                  >
                    <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  </div>
                  
                  <!-- Error overlay for thumbnail -->
                  <div 
                    v-if="getImageStatus(order.id) === 'error'"
                    class="absolute inset-0 bg-red-50 rounded flex items-center justify-center cursor-pointer border border-red-200"
                    @click="retryImageLoad(order.id, order.payment_proof_url)"
                  >
                    <AlertTriangle class="h-3 w-3 text-red-500" />
                  </div>
                </div>
                
                <div class="flex flex-col gap-1">
                  <button
                    @click="viewPaymentProof(order.payment_proof_url)"
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Proof
                  </button>
                  <a 
                    :href="order.payment_proof_url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-green-600 hover:text-green-700 text-xs"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-if="order.payment_method !== 'COD'" class="mt-4">
            <button
              @click="selectOrder(order)"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              :disabled="order.payment_proof_url"
            >
              {{ order.payment_proof_url ? 'Payment Proof Uploaded' : 'Upload Payment Proof' }}
            </button>
          </div>
          <div v-else class="mt-4">
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Cash on Delivery - No payment proof needed
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Upload Form -->
    <div v-if="selectedOrder" class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-gray-900">
          Upload Payment for Order #{{ selectedOrder.order_number }}
        </h2>
        <button
          @click="selectedOrder = null"
          class="text-gray-400 hover:text-gray-600"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- QR Payment Section -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 class="font-medium text-blue-900 mb-3">{{ selectedOrder.payment_method }} QR Payment</h4>
        
        <!-- QR Code Display -->
        <div class="text-center mb-4">
          <div class="bg-white p-4 rounded-lg inline-block">
            <img 
              :src="getQRCode(selectedOrder.payment_method)" 
              :alt="`${selectedOrder.payment_method} QR Code`"
              class="w-48 h-48 mx-auto"
            />
          </div>
          <p class="text-sm text-blue-700 mt-2">
            Scan this QR code with your {{ selectedOrder.payment_method }} app to pay ₱{{ selectedOrder.delivery_fee?.toFixed(2) }}
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUploadPayment" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Reference Number *</label>
          <input
            v-model="paymentForm.referenceNumber"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            :class="validationErrors.referenceNumber ? 'border-red-300' : 'border-gray-300'"
            :placeholder="getReferencePlaceholder(selectedOrder.payment_method)"
            @blur="validateReferenceNumber"
          />
          <p v-if="validationErrors.referenceNumber" class="text-red-600 text-sm mt-1">
            {{ validationErrors.referenceNumber }}
          </p>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
          <div class="flex items-start">
            <AlertTriangle class="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div class="text-sm text-yellow-800">
              <p class="font-medium">Admin Verification Required</p>
              <p>Your order will remain PENDING until our admin verifies your payment proof and reference number. This usually takes 5-15 minutes during business hours.</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Amount Paid *</label>
          <input
            v-model="paymentForm.amount"
            type="number"
            step="0.01"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            readonly
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Payment Proof (Screenshot/Photo) *</label>
          <input
            type="file"
            @change="handleFileUpload"
            accept="image/*"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <p class="text-xs text-gray-500 mt-1">Upload a screenshot of your payment receipt</p>
        </div>

        <!-- Preview uploaded proof -->
        <div v-if="paymentProofPreview" class="mt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">Payment Proof Preview:</p>
          <div class="relative inline-block">
            <img 
              :src="paymentProofPreview" 
              alt="Payment Proof Preview"
              class="w-64 h-64 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-75 transition-opacity"
              @click="viewFullImage(paymentProofPreview)"
            />
            <button
              type="button"
              @click="removePreview"
              class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            type="button"
            @click="selectedOrder = null"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Uploading...' : 'Submit Payment Proof' }}
          </button>
        </div>
      </form>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { CreditCard, X, AlertTriangle } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const toast = useToast()
const pendingOrders = ref([])
const selectedOrder = ref(null)
const loading = ref(false)
const paymentProofPreview = ref(null)
const showImageModal = ref(false)
const modalImageSrc = ref('')
const imageStatuses = ref({}) // Track image load status for each order

const validationErrors = reactive({})

const paymentForm = reactive({
  referenceNumber: '',
  amount: '',
  proofFile: null
})

const isFormValid = computed(() => {
  return paymentForm.referenceNumber && 
         paymentForm.proofFile && 
         !validationErrors.referenceNumber
})

const getImageStatus = (orderId) => {
  return imageStatuses.value[orderId] || 'loading'
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

const getQRCode = (paymentMethod) => {
  const qrCodes = {
    'GCash': '/placeholder.svg?height=200&width=200&text=GCash+QR',
    'PayMaya': '/placeholder.svg?height=200&width=200&text=PayMaya+QR',
    'GoTyme': '/placeholder.svg?height=200&width=200&text=GoTyme+QR'
  }
  return qrCodes[paymentMethod] || '/placeholder.svg?height=200&width=200'
}

const getReferencePlaceholder = (paymentMethod) => {
  const placeholders = {
    'GCash': 'Enter 13-digit GCash reference number',
    'PayMaya': 'Enter 12-13 digit PayMaya reference number',
    'GoTyme': 'Enter 10-15 character GoTyme reference number'
  }
  return placeholders[paymentMethod] || 'Enter reference number'
}

const validateReferenceNumber = async () => {
  if (!paymentForm.referenceNumber.trim()) {
    validationErrors.referenceNumber = 'Reference number is required'
    return
  }

  const { validateReferenceCode } = await import('../utils/validation')
  const validation = await validateReferenceCode(
    paymentForm.referenceNumber, 
    selectedOrder.value.payment_method,
    selectedOrder.value.id
  )

  if (validation.isValid) {
    delete validationErrors.referenceNumber
  } else {
    validationErrors.referenceNumber = validation.error
  }
}

const fetchPendingOrders = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    pendingOrders.value = data || []
    
    // Initialize image statuses
    data?.forEach(order => {
      if (order.payment_proof_url) {
        imageStatuses.value[order.id] = 'loading'
      }
    })
  } catch (error) {
    console.error('Error fetching pending orders:', error)
  }
}

const selectOrder = (order) => {
  selectedOrder.value = order
  paymentForm.amount = order.delivery_fee?.toFixed(2) || '0.00'
  paymentForm.referenceNumber = ''
  paymentForm.proofFile = null
  paymentProofPreview.value = null
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    delete validationErrors[key]
  })
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    paymentForm.proofFile = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      paymentProofPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePreview = () => {
  paymentProofPreview.value = null
  paymentForm.proofFile = null
  // Reset file input
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

const viewFullImage = (imageSrc) => {
  modalImageSrc.value = imageSrc
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  modalImageSrc.value = ''
}

const handleImageError = (event, orderId) => {
  console.error('Image failed to load for order:', orderId)
  imageStatuses.value[orderId] = 'error'
}

const handleImageLoad = (event, orderId) => {
  console.log('Image loaded successfully for order:', orderId)
  imageStatuses.value[orderId] = 'loaded'
}

const retryImageLoad = (orderId, imageUrl) => {
  imageStatuses.value[orderId] = 'loading'
  // Force reload the image by adding a timestamp
  const img = document.querySelector(`img[alt="Payment Proof Thumbnail"][src*="${imageUrl}"]`)
  if (img) {
    const url = new URL(imageUrl)
    url.searchParams.set('t', Date.now())
    img.src = url.toString()
  }
}

const handleUploadPayment = async () => {
  if (!paymentForm.proofFile) {
    toast.error('Please upload payment proof')
    return
  }

  // Validate reference number
  await validateReferenceNumber()
  if (validationErrors.referenceNumber) {
    toast.error('Please enter a valid reference number')
    return
  }

  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upload payment proof file
    const fileExt = paymentForm.proofFile.name.split('.').pop()
    const fileName = `${user.id}/${selectedOrder.value.id}/${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, paymentForm.proofFile)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName)

    // Update order with payment proof
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_proof_url: publicUrl,
        payment_reference: paymentForm.referenceNumber
      })
      .eq('id', selectedOrder.value.id)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // Save payment proof record
    const { error: insertError } = await supabase
      .from('payment_proofs')
      .insert([{
        order_id: selectedOrder.value.id,
        user_id: user.id,
        payment_method: selectedOrder.value.payment_method,
        reference_number: paymentForm.referenceNumber,
        amount: parseFloat(paymentForm.amount),
        proof_url: publicUrl,
        status: 'Pending'
      }])

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    toast.success('Payment proof uploaded successfully!')
    
    // Reset form
    selectedOrder.value = null
    Object.keys(paymentForm).forEach(key => {
      if (key === 'proofFile') {
        paymentForm[key] = null
      } else {
        paymentForm[key] = ''
      }
    })
    paymentProofPreview.value = null

    fetchPendingOrders()
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    toast.error(`Error uploading payment proof: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const viewPaymentProof = (proofUrl) => {
  modalImageSrc.value = proofUrl
  showImageModal.value = true
}

onMounted(() => {
  fetchPendingOrders()
})
</script>
