<template>
  <div class="space-y-4">
    <!-- Address Input with Autocomplete -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Delivery Address
      </label>
      <div class="relative">
        <input
          ref="addressInput"
          v-model="addressText"
          type="text"
          placeholder="Search for an address or click on the map..."
          class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          @input="onAddressInput"
        />
        <button
          @click="getCurrentLocation"
          :disabled="loadingLocation"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700 disabled:opacity-50"
          title="Use current location"
        >
          <MapPin v-if="!loadingLocation" class="h-5 w-5" />
          <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
        </button>
      </div>
      <p v-if="zipCodeError" class="text-red-600 text-sm mt-1">
        {{ zipCodeError }}
      </p>
    </div>

    <!-- Map Container -->
    <div class="relative">
      <div
        ref="mapContainer"
        class="w-full h-80 rounded-lg border border-gray-300"
        style="min-height: 320px;"
      ></div>
      
      <!-- Map Loading Overlay -->
      <div
        v-if="mapLoading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">Loading map...</p>
        </div>
      </div>
    </div>

    <!-- Selected Address Display -->
    <div v-if="selectedAddress" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 class="font-medium text-green-900 mb-2">Selected Address:</h4>
      <p class="text-green-800">{{ selectedAddress.formatted_address }}</p>
      <div class="grid grid-cols-2 gap-4 mt-2 text-sm text-green-700">
        <div>
          <span class="font-medium">Coordinates:</span>
          <br>{{ selectedAddress.coordinates.lat.toFixed(6) }}, {{ selectedAddress.coordinates.lng.toFixed(6) }}
        </div>
        <div>
          <span class="font-medium">Zip Code:</span>
          <br>{{ selectedAddress.zip_code || 'N/A' }}
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="font-medium text-blue-900 mb-2">How to select your address:</h4>
      <ul class="text-blue-800 text-sm space-y-1">
        <li>• Type your address in the search box above</li>
        <li>• Click on the map to pin your exact location</li>
        <li>• Use the location button to get your current position</li>
        <li>• Drag the marker to fine-tune your location</li>
        <li>• Only addresses within Calapan City (5200) are allowed</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { MapPin } from 'lucide-vue-next'
import { GOOGLE_MAPS_API_KEY } from '../lib/supabase'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:modelValue', 'address-selected'])

// Refs
const mapContainer = ref(null)
const addressInput = ref(null)
const addressText = ref('')
const selectedAddress = ref(null)
const mapLoading = ref(true)
const loadingLocation = ref(false)
const zipCodeError = ref('')

// Google Maps objects
let map = null
let marker = null
let autocomplete = null
let geocoder = null

// Calapan City bounds
const CALAPAN_BOUNDS = {
  north: 13.4500,
  south: 13.3500,
  east: 121.2000,
  west: 121.1000
}

const CALAPAN_CENTER = {
  lat: 13.4000,
  lng: 121.1500
}

// Load Google Maps API
const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    // Use a simpler approach without callback
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'))
    }

    document.head.appendChild(script)
  })
}

// Initialize map
const initializeMap = async () => {
  try {
    mapLoading.value = true
    await loadGoogleMapsAPI()

    // Create map
    map = new window.google.maps.Map(mapContainer.value, {
      center: CALAPAN_CENTER,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: CALAPAN_BOUNDS,
        strictBounds: false
      }
    })

    // Create marker
    marker = new window.google.maps.Marker({
      map: map,
      draggable: true,
      title: 'Delivery Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#16a34a"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      }
    })

    // Initialize geocoder
    geocoder = new window.google.maps.Geocoder()

    // Initialize autocomplete
    autocomplete = new window.google.maps.places.Autocomplete(addressInput.value, {
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west),
        new window.google.maps.LatLng(CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east)
      ),
      componentRestrictions: { country: 'PH' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    })

    // Map click event
    map.addListener('click', (event) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      if (isWithinCalapan(lat, lng)) {
        setMarkerPosition(lat, lng)
        reverseGeocode(lat, lng)
      } else {
        zipCodeError.value = 'Please select a location within Calapan City (5200)'
      }
    })

    // Marker drag event
    marker.addListener('dragend', (event) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      if (isWithinCalapan(lat, lng)) {
        reverseGeocode(lat, lng)
      } else {
        zipCodeError.value = 'Please select a location within Calapan City (5200)'
        // Reset marker to previous valid position
        if (selectedAddress.value) {
          marker.setPosition(selectedAddress.value.coordinates)
        }
      }
    })

    // Autocomplete place changed
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      
      if (!place.geometry) {
        zipCodeError.value = 'Please select a valid address from the suggestions'
        return
      }

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      if (isWithinCalapan(lat, lng)) {
        setMarkerPosition(lat, lng)
        processPlaceResult(place)
      } else {
        zipCodeError.value = 'Please select an address within Calapan City (5200)'
        addressText.value = ''
      }
    })

    mapLoading.value = false
  } catch (error) {
    console.error('Error initializing map:', error)
    mapLoading.value = false
  }
}

// Check if coordinates are within Calapan City
const isWithinCalapan = (lat, lng) => {
  // More flexible bounds for Calapan City
  const FLEXIBLE_BOUNDS = {
    north: 13.5000,
    south: 13.3000,
    east: 121.2500,
    west: 121.0500
  }
  
  return lat >= FLEXIBLE_BOUNDS.south && 
         lat <= FLEXIBLE_BOUNDS.north && 
         lng >= FLEXIBLE_BOUNDS.west && 
         lng <= FLEXIBLE_BOUNDS.east
}

// Set marker position
const setMarkerPosition = (lat, lng) => {
  const position = { lat, lng }
  marker.setPosition(position)
  map.panTo(position)
  zipCodeError.value = ''
}

// Reverse geocode coordinates to address
const reverseGeocode = (lat, lng) => {
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const result = results[0]
      const zipCode = extractZipCode(result.address_components)
      
      if (zipCode === '5200') {
        const addressData = {
          formatted_address: result.formatted_address,
          coordinates: { lat, lng },
          zip_code: zipCode,
          address_components: result.address_components
        }
        
        selectedAddress.value = addressData
        addressText.value = result.formatted_address
        emit('update:modelValue', addressData)
        emit('address-selected', addressData)
        zipCodeError.value = ''
      } else {
        zipCodeError.value = 'This location is not within Calapan City (5200). Please select a different location.'
      }
    }
  })
}

// Process autocomplete place result
const processPlaceResult = (place) => {
  const zipCode = extractZipCode(place.address_components)
  
  if (zipCode === '5200') {
    const addressData = {
      formatted_address: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      zip_code: zipCode,
      address_components: place.address_components
    }
    
    selectedAddress.value = addressData
    addressText.value = place.formatted_address
    emit('update:modelValue', addressData)
    emit('address-selected', addressData)
    zipCodeError.value = ''
  } else {
    zipCodeError.value = 'Please select an address within Calapan City (5200)'
    addressText.value = ''
  }
}

// Extract zip code from address components
const extractZipCode = (addressComponents) => {
  // Check for postal code first
  for (const component of addressComponents) {
    if (component.types.includes('postal_code')) {
      return component.long_name
    }
  }
  
  // If no postal code found, check if it's in Calapan area by locality
  for (const component of addressComponents) {
    if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
      const locality = component.long_name.toLowerCase()
      if (locality.includes('calapan')) {
        return '5200' // Default to Calapan zip code
      }
    }
  }
  
  return '5200' // Default for Calapan area
}

// Get current location
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    zipCodeError.value = 'Geolocation is not supported by this browser'
    return
  }

  loadingLocation.value = true
  zipCodeError.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      if (isWithinCalapan(lat, lng)) {
        setMarkerPosition(lat, lng)
        reverseGeocode(lat, lng)
      } else {
        zipCodeError.value = 'Your current location is outside Calapan City (5200). Please manually select an address within the service area.'
      }
      
      loadingLocation.value = false
    },
    (error) => {
      console.error('Geolocation error:', error)
      zipCodeError.value = 'Unable to get your current location. Please manually select an address.'
      loadingLocation.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  )
}

// Handle address input
const onAddressInput = () => {
  if (!addressText.value) {
    selectedAddress.value = null
    emit('update:modelValue', null)
    zipCodeError.value = ''
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== selectedAddress.value) {
    selectedAddress.value = newValue
    addressText.value = newValue.formatted_address || ''
    
    if (map && marker && newValue.coordinates) {
      setMarkerPosition(newValue.coordinates.lat, newValue.coordinates.lng)
    }
  }
}, { immediate: true })

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  // Cleanup
  if (autocomplete) {
    window.google.maps.event.clearInstanceListeners(autocomplete)
  }
  if (map) {
    window.google.maps.event.clearInstanceListeners(map)
  }
  if (marker) {
    window.google.maps.event.clearInstanceListeners(marker)
  }
})
</script>
