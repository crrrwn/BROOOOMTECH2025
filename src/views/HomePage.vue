<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <Truck class="h-8 w-8 text-green-600 mr-2" />
            <span class="text-xl font-bold text-gray-800">BroomTech</span>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            <a href="#home" class="text-gray-700 hover:text-green-600 transition-colors">Home</a>
            <a href="#about" class="text-gray-700 hover:text-green-600 transition-colors">About</a>
            <a href="#services" class="text-gray-700 hover:text-green-600 transition-colors">Services</a>
            <router-link to="/login" class="text-gray-700 hover:text-green-600 transition-colors">Login</router-link>
            <router-link to="/register" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Register</router-link>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-700">
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a href="#home" class="block px-3 py-2 text-gray-700">Home</a>
          <a href="#about" class="block px-3 py-2 text-gray-700">About</a>
          <a href="#services" class="block px-3 py-2 text-gray-700">Services</a>
          <router-link to="/login" class="block px-3 py-2 text-gray-700">Login</router-link>
          <router-link to="/register" class="block px-3 py-2 text-green-600 font-medium">Register</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          Fast & Reliable Delivery Service
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-green-100">
          Your trusted partner for food delivery, bill payments, and more in Calapan City
        </p>
        <router-link
          to="/register"
          class="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          Get Started Today
        </router-link>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p class="text-xl text-gray-600">We deliver what you need, when you need it</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="service in services" :key="service.id" class="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
            <component :is="service.icon" class="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ service.name }}</h3>
            <p class="text-gray-600">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About BroomTech</h2>
            <p class="text-lg text-gray-600 mb-6">
              We're revolutionizing delivery services in Calapan City with our reliable, fast, and affordable solutions. 
              From food delivery to bill payments, we've got you covered.
            </p>
            <div class="space-y-4">
              <div class="flex items-center">
                <CheckCircle class="h-6 w-6 text-green-600 mr-3" />
                <span class="text-gray-700">Real-time tracking</span>
              </div>
              <div class="flex items-center">
                <CheckCircle class="h-6 w-6 text-green-600 mr-3" />
                <span class="text-gray-700">24/7 customer support</span>
              </div>
              <div class="flex items-center">
                <CheckCircle class="h-6 w-6 text-green-600 mr-3" />
                <span class="text-gray-700">Secure payments</span>
              </div>
            </div>
          </div>
          <div class="bg-green-100 p-8 rounded-lg">
            <div class="text-center">
              <Truck class="h-24 w-24 text-green-600 mx-auto mb-4" />
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Serving Calapan City</h3>
              <p class="text-gray-600">Zip Code: 5200</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <Truck class="h-8 w-8 text-green-600 mr-2" />
              <span class="text-xl font-bold">BroomTech</span>
            </div>
            <p class="text-gray-400">Your trusted delivery partner in Calapan City.</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
            <div class="space-y-2">
              <a href="#home" class="block text-gray-400 hover:text-white transition-colors">Home</a>
              <a href="#about" class="block text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#services" class="block text-gray-400 hover:text-white transition-colors">Services</a>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact</h3>
            <div class="space-y-2 text-gray-400">
              <p>Calapan City, Oriental Mindoro</p>
              <p>Phone: (043) 123-4567</p>
              <p>Email: info@broomtech.com</p>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BroomTech Delivery System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Truck, Menu, CheckCircle, UtensilsCrossed, CreditCard, 
  Package, Gift, Pill, ShoppingCart 
} from 'lucide-vue-next'

const mobileMenuOpen = ref(false)

const services = [
  {
    id: 1,
    name: 'Food Delivery',
    description: 'Order from your favorite restaurants',
    icon: UtensilsCrossed
  },
  {
    id: 2,
    name: 'Bill Payments',
    description: 'Pay your bills hassle-free',
    icon: CreditCard
  },
  {
    id: 3,
    name: 'Pick-up & Drop',
    description: 'Package pickup and delivery',
    icon: Package
  },
  {
    id: 4,
    name: 'Gift Delivery',
    description: 'Send surprise gifts to loved ones',
    icon: Gift
  },
  {
    id: 5,
    name: 'Medicine Delivery',
    description: 'Prescription and medicine delivery',
    icon: Pill
  },
  {
    id: 6,
    name: 'Grocery Shopping',
    description: 'We shop for you',
    icon: ShoppingCart
  }
]
</script>
