<template>
  <div class="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
    <!-- Header -->
    <div class="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
      <div class="flex items-center">
        <Bot class="h-5 w-5 mr-2" />
        <span class="font-semibold">BroomTech Assistant</span>
      </div>
      <button @click="$emit('close')" class="text-white hover:text-gray-200">
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- Chat Messages -->
    <div class="h-80 overflow-y-auto p-4 space-y-3">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-xs px-3 py-2 rounded-lg"
          :class="message.type === 'user' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-900'"
        >
          <p class="text-sm">{{ message.text }}</p>
          <p class="text-xs opacity-75 mt-1">{{ formatTime(message.timestamp) }}</p>
        </div>
      </div>
      
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="px-4 py-2 border-t border-gray-200">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="sendQuickMessage(action.message)"
          class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Type your message..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bot, X, Send } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

defineEmits(['close'])

const messages = ref([])
const newMessage = ref('')
const isTyping = ref(false)

const quickActions = [
  { id: 1, label: 'Track Order', message: 'I want to track my order' },
  { id: 2, label: 'Book Service', message: 'How do I book a service?' },
  { id: 3, label: 'Payment Help', message: 'I need help with payment' },
  { id: 4, label: 'Contact Support', message: 'I need to speak with support' }
]

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const addMessage = (text, type = 'bot') => {
  messages.value.push({
    id: Date.now() + Math.random(),
    text,
    type,
    timestamp: new Date()
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userMessage = newMessage.value.trim()
  addMessage(userMessage, 'user')
  newMessage.value = ''

  isTyping.value = true
  
  // Simulate AI response delay
  setTimeout(() => {
    const response = generateResponse(userMessage)
    isTyping.value = false
    addMessage(response)
  }, 1000 + Math.random() * 2000)
}

const sendQuickMessage = (message) => {
  newMessage.value = message
  sendMessage()
}

const generateResponse = (message) => {
  const lowerMessage = message.toLowerCase()
  
  // Intent detection
  if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
    return "I can help you track your order! Please go to 'My Orders' section in your dashboard to see real-time updates on all your deliveries."
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('service')) {
    return "To book a service, click on 'Book a Service' in your dashboard. We offer Food Delivery, Bill Payments, Pick-up & Drop, Medicine Delivery, Grocery shopping, and Gift Delivery services!"
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
    return "We accept GCash, PayMaya, GoTyme, and Cash on Delivery (COD). For digital payments, you'll need to upload your payment proof with the reference number."
  }
  
  if (lowerMessage.includes('cancel')) {
    return "You can cancel your order within 30 seconds of booking. After that, please contact our support team for assistance."
  }
  
  if (lowerMessage.includes('fee') || lowerMessage.includes('price')) {
    return "Delivery fees are calculated based on distance, service type, and current demand. You'll see the estimated fee before confirming your booking."
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('long')) {
    return "Delivery times vary by service type and location within Calapan City. Typically, food delivery takes 30-60 minutes, while other services may take 1-3 hours."
  }
  
  if (lowerMessage.includes('area') || lowerMessage.includes('location')) {
    return "We currently serve Calapan City (Zip Code: 5200) only. We're working on expanding to other areas soon!"
  }
  
  if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
    return "I'm here to help! You can also contact our support team directly through the app or call our hotline. What specific issue can I assist you with?"
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! Welcome to BroomTech Delivery! I'm your AI assistant. How can I help you today? 😊"
  }
  
  // Default response
  return "I understand you're asking about: '" + message + "'. Let me help you with that! For specific issues, you can also check our FAQ section or contact our support team directly."
}

onMounted(() => {
  // Welcome message
  addMessage("Hi there! 👋 I'm your BroomTech AI assistant. I can help you with booking services, tracking orders, payment questions, and more. How can I assist you today?")
})
</script>
