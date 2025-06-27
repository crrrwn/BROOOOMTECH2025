<template>
  <!-- Chat Button -->
  <div v-if="!showChat" class="fixed bottom-6 right-6 z-50">
    <button
      @click="showChat = true"
      class="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
    >
      <Bot class="h-6 w-6" />
    </button>
    <div v-if="hasUnreadMessages" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {{ unreadCount }}
    </div>
  </div>

  <!-- Chat Window -->
  <div v-if="showChat" class="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
    <!-- Header -->
    <div class="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
      <div class="flex items-center">
        <Bot class="h-5 w-5 mr-2" />
        <div>
          <span class="font-semibold">BroomTech Assistant</span>
          <div class="flex items-center text-xs text-green-100">
            <div class="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
            Online
          </div>
        </div>
      </div>
      <button @click="showChat = false" class="text-white hover:text-gray-200 transition-colors">
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- Chat Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Bot, X, Send } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const showChat = ref(false)
const messages = ref([])
const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const unreadCount = ref(0)

const quickActions = [
  { id: 1, label: 'Track Order', message: 'I want to track my order' },
  { id: 2, label: 'Book Service', message: 'How do I book a service?' },
  { id: 3, label: 'Payment Help', message: 'I need help with payment' },
  { id: 4, label: 'Service Areas', message: 'What areas do you serve?' },
  { id: 5, label: 'Contact Support', message: 'I need to speak with support' }
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
  
  if (type === 'bot' && !showChat.value) {
    unreadCount.value++
  }
  
  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userMessage = newMessage.value.trim()
  addMessage(userMessage, 'user')
  newMessage.value = ''

  isTyping.value = true
  
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
  const userName = authStore.profile?.first_name || 'there'
  
  if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
    return `Hi ${userName}! I can help you track your order. Please go to 'My Orders' section in your dashboard to see real-time updates on all your deliveries.`
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('service')) {
    return `Great question, ${userName}! To book a service, click on 'Book a Service' in your dashboard. We offer Food Delivery, Bill Payments, Pick-up & Drop, Gift Delivery, Medicine Delivery, and Grocery Shopping!`
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
    return `We accept multiple payment methods: Cash on Delivery (COD), GCash, PayMaya, and GoTyme. For digital payments, you'll need to upload your payment proof with the reference number.`
  }
  
  if (lowerMessage.includes('area') || lowerMessage.includes('location') || lowerMessage.includes('serve')) {
    return `We currently serve Calapan City (Zip Code: 5200) only. We're working hard to expand to other areas in Oriental Mindoro soon!`
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello ${userName}! 👋 Welcome to BroomTech Delivery! I'm your AI assistant. How can I assist you today?`
  }
  
  return `I understand you're asking about: "${message}". Let me help you with that! For specific questions, you can also contact our support team. What would you like to know more about?`
}

watch(showChat, (newValue) => {
  if (newValue) {
    unreadCount.value = 0
  }
})

onMounted(() => {
  if (authStore.user) {
    const userName = authStore.profile?.first_name || 'there'
    addMessage(`Hi ${userName}! 👋 Welcome to BroomTech Delivery! I'm your AI assistant. How can I assist you today?`)
  }
})

const hasUnreadMessages = computed(() => unreadCount.value > 0)
</script>
