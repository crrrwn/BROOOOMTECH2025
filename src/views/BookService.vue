<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Service Selection -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Book a Service</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          v-for="service in services"
          :key="service.id"
          @click="selectedService = service"
          class="p-4 border-2 rounded-lg cursor-pointer transition-all"
          :class="selectedService && selectedService.id === service.id 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 hover:border-green-300'"
        >
          <component :is="service.icon" class="h-8 w-8 text-green-600 mb-2" />
          <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
          <p class="text-sm text-gray-600">{{ service.description }}</p>
        </div>
      </div>
    </div>

    <!-- Service Form -->
    <div v-if="selectedService" class="bg-white rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">
        {{ selectedService.name }} Details
      </h3>
      
      <form @submit.prevent="handleBooking" class="space-y-6">
        <!-- Food Delivery Form -->
        <div v-if="selectedService.id === 'food-delivery'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Restaurant Name *</label>
            <input
              v-model="bookingForm.restaurantName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.restaurantName ? 'border-red-300' : 'border-gray-300'"
              placeholder="Which restaurant are you ordering from?"
              @blur="validateField('restaurantName')"
            />
            <p v-if="validationErrors.restaurantName" class="text-red-600 text-sm mt-1">
              {{ validationErrors.restaurantName }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Food Items *</label>
            <textarea
              v-model="bookingForm.foodItems"
              required
              rows="3"
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.foodItems ? 'border-red-300' : 'border-gray-300'"
              placeholder="List the food items you want to order..."
              @blur="validateField('foodItems')"
            ></textarea>
            <p v-if="validationErrors.foodItems" class="text-red-600 text-sm mt-1">
              {{ validationErrors.foodItems }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Estimated Order Value</label>
            <input
              v-model="bookingForm.orderValue"
              type="number"
              step="0.01"
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.orderValue ? 'border-red-300' : 'border-gray-300'"
              placeholder="Approximate total cost of food"
              @blur="validateField('orderValue')"
            />
            <p v-if="validationErrors.orderValue" class="text-red-600 text-sm mt-1">
              {{ validationErrors.orderValue }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Food Photos (Optional)</label>
            <input
              type="file"
              @change="(e) => handleServiceImageUpload(e, 'food')"
              accept="image/*"
              multiple
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Upload photos of the food you want to order (optional)</p>
            
            <!-- Preview uploaded images -->
            <div v-if="serviceImages.food.length > 0" class="mt-3 grid grid-cols-3 gap-2">
              <div v-for="(image, index) in serviceImages.food" :key="index" class="relative">
                <img 
                  :src="image.preview" 
                  alt="Food Photo"
                  class="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  @click="removeServiceImage('food', index)"
                  class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bill Payments Form -->
        <div v-if="selectedService.id === 'bill-payments'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Bill Type *</label>
            <select
              v-model="bookingForm.billType"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select bill type</option>
              <option value="Electricity">Electricity (ORMECO)</option>
              <option value="Water">Water Bill</option>
              <option value="Internet">Internet/Cable</option>
              <option value="Phone">Phone Bill</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Loan">Loan Payment</option>
              <option value="Insurance">Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Account Number/Reference *</label>
            <input
              v-model="bookingForm.accountNumber"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.accountNumber ? 'border-red-300' : 'border-gray-300'"
              placeholder="Account number or reference number"
              @blur="validateField('accountNumber')"
            />
            <p v-if="validationErrors.accountNumber" class="text-red-600 text-sm mt-1">
              {{ validationErrors.accountNumber }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Payment Location *</label>
            <input
              v-model="bookingForm.paymentLocation"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.paymentLocation ? 'border-red-300' : 'border-gray-300'"
              placeholder="Where should we pay this bill?"
              @blur="validateField('paymentLocation')"
            />
            <p v-if="validationErrors.paymentLocation" class="text-red-600 text-sm mt-1">
              {{ validationErrors.paymentLocation }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount to Pay *</label>
            <input
              v-model="bookingForm.billAmount"
              type="number"
              step="0.01"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.billAmount ? 'border-red-300' : 'border-gray-300'"
              placeholder="Amount to be paid"
              @blur="validateField('billAmount')"
            />
            <p v-if="validationErrors.billAmount" class="text-red-600 text-sm mt-1">
              {{ validationErrors.billAmount }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Bill Statement (Optional)</label>
            <input
              type="file"
              @change="(e) => handleServiceImageUpload(e, 'bill')"
              accept="image/*,.pdf"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Upload your bill statement for reference (optional)</p>
            
            <!-- Preview uploaded file -->
            <div v-if="serviceImages.bill.length > 0" class="mt-3">
              <div v-for="(file, index) in serviceImages.bill" :key="index" class="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <span class="text-sm text-gray-700">{{ file.file.name }}</span>
                <button
                  type="button"
                  @click="removeServiceImage('bill', index)"
                  class="text-red-500 hover:text-red-700"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pick-up & Drop Form -->
        <div v-if="selectedService.id === 'pickup-drop'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Pick-up Location *</label>
            <input
              v-model="bookingForm.pickupLocation"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.pickupLocation ? 'border-red-300' : 'border-gray-300'"
              placeholder="Where should we pick up the item?"
              @blur="validateField('pickupLocation')"
            />
            <p v-if="validationErrors.pickupLocation" class="text-red-600 text-sm mt-1">
              {{ validationErrors.pickupLocation }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Item Description *</label>
            <textarea
              v-model="bookingForm.itemDescription"
              required
              rows="3"
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.itemDescription ? 'border-red-300' : 'border-gray-300'"
              placeholder="Describe the item(s) to be picked up..."
              @blur="validateField('itemDescription')"
            ></textarea>
            <p v-if="validationErrors.itemDescription" class="text-red-600 text-sm mt-1">
              {{ validationErrors.itemDescription }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Package Size/Weight *</label>
            <select
              v-model="bookingForm.packageSize"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select size</option>
              <option value="Small">Small (fits in bag)</option>
              <option value="Medium">Medium (box size)</option>
              <option value="Large">Large (requires special handling)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Contact Person at Pick-up *</label>
            <input
              v-model="bookingForm.pickupContact"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.pickupContact ? 'border-red-300' : 'border-gray-300'"
              placeholder="Name and contact number"
              @blur="validateField('pickupContact')"
            />
            <p v-if="validationErrors.pickupContact" class="text-red-600 text-sm mt-1">
              {{ validationErrors.pickupContact }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Item Photos (Optional)</label>
            <input
              type="file"
              @change="(e) => handleServiceImageUpload(e, 'pickup')"
              accept="image/*"
              multiple
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Upload photos of the items to be picked up (optional)</p>
            
            <!-- Preview uploaded images -->
            <div v-if="serviceImages.pickup.length > 0" class="mt-3 grid grid-cols-3 gap-2">
              <div v-for="(image, index) in serviceImages.pickup" :key="index" class="relative">
                <img 
                  :src="image.preview" 
                  alt="Item Photo"
                  class="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  @click="removeServiceImage('pickup', index)"
                  class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gift Delivery Form -->
        <div v-if="selectedService.id === 'gift-delivery'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Gift Type *</label>
            <select
              v-model="bookingForm.giftType"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select gift type</option>
              <option value="Flowers">Flowers</option>
              <option value="Cake">Cake</option>
              <option value="Food">Food/Treats</option>
              <option value="Gift Box">Gift Box</option>
              <option value="Surprise Package">Surprise Package</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Where to Buy/Pick up Gift *</label>
            <input
              v-model="bookingForm.giftSource"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.giftSource ? 'border-red-300' : 'border-gray-300'"
              placeholder="Store name or location to get the gift"
              @blur="validateField('giftSource')"
            />
            <p v-if="validationErrors.giftSource" class="text-red-600 text-sm mt-1">
              {{ validationErrors.giftSource }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Gift Budget *</label>
            <input
              v-model="bookingForm.giftBudget"
              type="number"
              step="0.01"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.giftBudget ? 'border-red-300' : 'border-gray-300'"
              placeholder="Budget for the gift"
              @blur="validateField('giftBudget')"
            />
            <p v-if="validationErrors.giftBudget" class="text-red-600 text-sm mt-1">
              {{ validationErrors.giftBudget }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Recipient Name *</label>
            <input
              v-model="bookingForm.recipientName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.recipientName ? 'border-red-300' : 'border-gray-300'"
              placeholder="Name of the person receiving the gift"
              @blur="validateField('recipientName')"
            />
            <p v-if="validationErrors.recipientName" class="text-red-600 text-sm mt-1">
              {{ validationErrors.recipientName }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Special Message (Optional)</label>
            <textarea
              v-model="bookingForm.giftMessage"
              rows="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Message to include with the gift"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Gift Reference Photos (Optional)</label>
            <input
              type="file"
              @change="(e) => handleServiceImageUpload(e, 'gift')"
              accept="image/*"
              multiple
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Upload reference photos of the gift you want (optional)</p>
            
            <!-- Preview uploaded images -->
            <div v-if="serviceImages.gift.length > 0" class="mt-3 grid grid-cols-3 gap-2">
              <div v-for="(image, index) in serviceImages.gift" :key="index" class="relative">
                <img 
                  :src="image.preview" 
                  alt="Gift Reference"
                  class="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  @click="removeServiceImage('gift', index)"
                  class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Medicine Delivery Form -->
        <div v-if="selectedService.id === 'medicine-delivery'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Pharmacy Name *</label>
            <input
              v-model="bookingForm.pharmacyName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.pharmacyName ? 'border-red-300' : 'border-gray-300'"
              placeholder="Which pharmacy to buy from?"
              @blur="validateField('pharmacyName')"
            />
            <p v-if="validationErrors.pharmacyName" class="text-red-600 text-sm mt-1">
              {{ validationErrors.pharmacyName }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Medicine List *</label>
            <textarea
              v-model="bookingForm.medicineList"
              required
              rows="3"
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.medicineList ? 'border-red-300' : 'border-gray-300'"
              placeholder="List of medicines needed..."
              @blur="validateField('medicineList')"
            ></textarea>
            <p v-if="validationErrors.medicineList" class="text-red-600 text-sm mt-1">
              {{ validationErrors.medicineList }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Prescription Upload</label>
            <input
              type="file"
              @change="handlePrescriptionUpload"
              accept="image/*,.pdf"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Upload prescription image or PDF (required for prescription medicines)</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Estimated Budget</label>
            <input
              v-model="bookingForm.medicineBudget"
              type="number"
              step="0.01"
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.medicineBudget ? 'border-red-300' : 'border-gray-300'"
              placeholder="Approximate budget for medicines"
              @blur="validateField('medicineBudget')"
            />
            <p v-if="validationErrors.medicineBudget" class="text-red-600 text-sm mt-1">
              {{ validationErrors.medicineBudget }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Patient Name *</label>
            <input
              v-model="bookingForm.patientName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.patientName ? 'border-red-300' : 'border-gray-300'"
              placeholder="Name of the patient"
              @blur="validateField('patientName')"
            />
            <p v-if="validationErrors.patientName" class="text-red-600 text-sm mt-1">
              {{ validationErrors.patientName }}
            </p>
          </div>
        </div>

        <!-- Grocery Shopping Form -->
        <div v-if="selectedService.id === 'grocery-pabili'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Store Preference *</label>
            <select
              v-model="bookingForm.storePreference"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select store</option>
              <option value="SM Calapan">SM Calapan</option>
              <option value="Nuciti Central Mall">Nuciti Central Mall</option>
              <option value="Puregold">Puregold</option>
              <option value="Local Market">Local Market</option>
              <option value="Any Store">Any Available Store</option>
              <option value="Specific Store">Specific Store (specify below)</option>
            </select>
          </div>
          <div v-if="bookingForm.storePreference === 'Specific Store'">
            <label class="block text-sm font-medium text-gray-700">Specify Store *</label>
            <input
              v-model="bookingForm.specificStore"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.specificStore ? 'border-red-300' : 'border-gray-300'"
              placeholder="Name and location of specific store"
              @blur="validateField('specificStore')"
            />
            <p v-if="validationErrors.specificStore" class="text-red-600 text-sm mt-1">
              {{ validationErrors.specificStore }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Shopping List *</label>
            <textarea
              v-model="bookingForm.shoppingList"
              required
              rows="4"
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.shoppingList ? 'border-red-300' : 'border-gray-300'"
              placeholder="List all items you need (be specific with brands, sizes, quantities)..."
              @blur="validateField('shoppingList')"
            ></textarea>
            <p v-if="validationErrors.shoppingList" class="text-red-600 text-sm mt-1">
              {{ validationErrors.shoppingList }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Shopping Budget *</label>
            <input
              v-model="bookingForm.shoppingBudget"
              type="number"
              step="0.01"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              :class="validationErrors.shoppingBudget ? 'border-red-300' : 'border-gray-300'"
              placeholder="Total budget for shopping"
              @blur="validateField('shoppingBudget')"
            />
            <p v-if="validationErrors.shoppingBudget" class="text-red-600 text-sm mt-1">
              {{ validationErrors.shoppingBudget }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Alternative Options</label>
            <textarea
              v-model="bookingForm.alternatives"
              rows="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="What to do if items are not available? (optional)"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Shopping List Photos (Optional)</label>
            <input
              type="file"
              @change="(e) => handleServiceImageUpload(e, 'grocery')"
              accept="image/*"
              multiple
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Upload photos of specific items or brands you want (optional)</p>
            
            <!-- Preview uploaded images -->
            <div v-if="serviceImages.grocery.length > 0" class="mt-3 grid grid-cols-3 gap-2">
              <div v-for="(image, index) in serviceImages.grocery" :key="index" class="relative">
                <img 
                  :src="image.preview" 
                  alt="Shopping Reference"
                  class="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  @click="removeServiceImage('grocery', index)"
                  class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Google Maps Address Picker -->
        <GoogleMapsAddressPicker
          v-model="selectedAddress"
          @address-selected="onAddressSelected"
        />

        <!-- Special Instructions -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Special Instructions (Optional)</label>
          <textarea
            v-model="bookingForm.specialInstructions"
            rows="2"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Any special instructions for the driver..."
          ></textarea>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="bookingForm.paymentMethod"
                type="radio"
                value="COD"
                class="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span class="ml-2 text-sm text-gray-700">Cash on Delivery (COD)</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="bookingForm.paymentMethod"
                type="radio"
                value="GCash"
                class="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span class="ml-2 text-sm text-gray-700">GCash (QR Payment)</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="bookingForm.paymentMethod"
                type="radio"
                value="PayMaya"
                class="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span class="ml-2 text-sm text-gray-700">PayMaya (QR Payment)</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="bookingForm.paymentMethod"
                type="radio"
                value="GoTyme"
                class="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span class="ml-2 text-sm text-gray-700">GoTyme (QR Payment)</span>
            </label>
          </div>
        </div>

        <!-- QR Payment Section -->
        <div v-if="isQRPayment" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-3">{{ bookingForm.paymentMethod }} QR Payment</h4>
          
          <!-- QR Code Display -->
          <div class="text-center mb-4">
            <div class="bg-white p-4 rounded-lg inline-block">
              <img 
                :src="getQRCode(bookingForm.paymentMethod)" 
                :alt="`${bookingForm.paymentMethod} QR Code`"
                class="w-48 h-48 mx-auto"
              />
            </div>
            <p class="text-sm text-blue-700 mt-2">
              Scan this QR code with your {{ bookingForm.paymentMethod }} app to pay ₱{{ deliveryFee.toFixed(2) }}
            </p>
          </div>

          <!-- Reference Number Input -->
          <div>
            <label class="block text-sm font-medium text-blue-700 mb-2">
              Payment Reference Number *
            </label>
            <input
              v-model="bookingForm.paymentReference"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="validationErrors.paymentReference ? 'border-red-300' : 'border-gray-300'"
              :placeholder="getReferencePlaceholder(bookingForm.paymentMethod)"
              @blur="validateField('paymentReference')"
            />
            <p v-if="validationErrors.paymentReference" class="text-red-600 text-sm mt-1">
              {{ validationErrors.paymentReference }}
            </p>
            <p class="text-xs text-blue-600 mt-1">
              Enter the reference number from your payment receipt for verification
            </p>
          </div>

          <!-- Payment Proof Upload -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-blue-700 mb-2">
              Upload Payment Proof *
            </label>
            <input
              type="file"
              @change="handlePaymentProofUpload"
              accept="image/*"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-xs text-blue-600 mt-1">
              Upload a screenshot of your payment receipt
            </p>
          </div>

          <!-- Preview uploaded proof -->
          <div v-if="paymentProofPreview" class="mt-4">
            <p class="text-sm font-medium text-blue-700 mb-2">Payment Proof Preview:</p>
            <img 
              :src="paymentProofPreview" 
              alt="Payment Proof Preview"
              class="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
          </div>
        </div>

        <!-- AI Dynamic Delivery Fee Display -->
        <div v-if="selectedAddress" class="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <span class="font-medium text-gray-700">🤖 AI Dynamic Delivery Fee:</span>
            <span class="text-2xl font-bold text-green-600">₱{{ deliveryFee.toFixed(2) }}</span>
          </div>
          
          <!-- Pricing Breakdown -->
          <div v-if="pricingBreakdown" class="text-sm space-y-1">
            <div class="grid grid-cols-2 gap-2">
              <div class="text-gray-600">Base Rate:</div>
              <div class="text-right font-medium">₱{{ pricingBreakdown.baseRate.toFixed(2) }}</div>
              
              <div class="text-gray-600">Distance (~{{ estimatedDistance }}km):</div>
              <div class="text-right font-medium">₱{{ pricingBreakdown.distanceRate.toFixed(2) }}</div>
              
              <div class="text-gray-600">Service Type:</div>
              <div class="text-right text-green-600 font-medium">{{ selectedService.name }}</div>
              
              <div class="text-gray-600">Demand Level:</div>
              <div class="text-right font-medium" :class="getDemandColor(demandLevel)">
                {{ demandLevel.toUpperCase() }}
              </div>
              
              <div v-if="getOrderValue() > 0" class="text-gray-600">Order Value Bonus:</div>
              <div v-if="getOrderValue() > 0" class="text-right text-blue-600 font-medium">
                ₱{{ getOrderValue().toFixed(2) }}
              </div>
            </div>
            
            <div class="border-t pt-2 mt-2">
              <div class="flex justify-between font-bold text-green-700">
                <span>Total Fee:</span>
                <span>₱{{ deliveryFee.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <!-- AI Factors Display -->
          <div class="mt-3 p-2 bg-white rounded border text-xs text-gray-600">
            <p class="font-medium mb-1">🧠 AI Pricing Factors:</p>
            <div class="grid grid-cols-2 gap-1">
              <span>• Time of day</span>
              <span>• Current demand</span>
              <span>• Service complexity</span>
              <span>• Weather conditions</span>
              <span>• Distance optimization</span>
              <span>• Order value</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            type="button"
            @click="resetForm"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            :disabled="loading || !selectedAddress || !isFormValid"
            class="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Booking...' : `Book Service - ₱${deliveryFee.toFixed(2)}` }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { 
  UtensilsCrossed, CreditCard, Package, Gift, Pill, ShoppingCart
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { calculateDeliveryFee, getCurrentDemandLevel } from '../utils/pricing'
import { 
  validateRestaurantName, validateFoodItems, validateAccountNumber, 
  validateItemDescription, validateMedicineList, validateShoppingList,
  validateAmount, validateContactInfo, validateQRReference, sanitizeInput
} from '../utils/validation'
import GoogleMapsAddressPicker from '../components/GoogleMapsAddressPicker.vue'
import { X } from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()
const loading = ref(false)

const selectedAddress = ref(null)
const estimatedDistance = ref(2)
const demandLevel = ref('normal')
const paymentProofPreview = ref(null)

const services = [
  {
    id: 'food-delivery',
    name: 'Food Delivery',
    description: 'Order from restaurants',
    icon: UtensilsCrossed
  },
  {
    id: 'bill-payments',
    name: 'Bill Payments',
    description: 'Pay your bills hassle-free',
    icon: CreditCard
  },
  {
    id: 'pickup-drop',
    name: 'Pick-up & Drop',
    description: 'Package pickup and delivery',
    icon: Package
  },
  {
    id: 'gift-delivery',
    name: 'Surprise Gift Delivery',
    description: 'Send surprise gifts',
    icon: Gift
  },
  {
    id: 'medicine-delivery',
    name: 'Medicine Delivery',
    description: 'Prescription delivery',
    icon: Pill
  },
  {
    id: 'grocery-pabili',
    name: 'Grocery / Pabili',
    description: 'Grocery shopping service',
    icon: ShoppingCart
  }
]

const selectedService = ref(null)
const validationErrors = reactive({})

const bookingForm = reactive({
  // Common fields
  specialInstructions: '',
  paymentMethod: 'COD',
  paymentReference: '',
  prescriptionFile: null,
  paymentProofFile: null,
  
  // Food Delivery
  restaurantName: '',
  foodItems: '',
  orderValue: '',
  
  // Bill Payments
  billType: '',
  accountNumber: '',
  paymentLocation: '',
  billAmount: '',
  
  // Pick-up & Drop
  pickupLocation: '',
  itemDescription: '',
  packageSize: '',
  pickupContact: '',
  
  // Gift Delivery
  giftType: '',
  giftSource: '',
  giftBudget: '',
  recipientName: '',
  giftMessage: '',
  
  // Medicine Delivery
  pharmacyName: '',
  medicineList: '',
  medicineBudget: '',
  patientName: '',
  
  // Grocery Shopping
  storePreference: '',
  specificStore: '',
  shoppingList: '',
  shoppingBudget: '',
  alternatives: ''
})

const serviceImages = reactive({
  food: [],
  bill: [],
  pickup: [],
  gift: [],
  medicine: [],
  grocery: []
})

const pricingBreakdown = ref(null)

// Check if payment method is QR-based
const isQRPayment = computed(() => {
  return ['GCash', 'PayMaya', 'GoTyme'].includes(bookingForm.paymentMethod)
})

// Form validation based on selected service
const isFormValid = computed(() => {
  if (!selectedService.value || !selectedAddress.value) return false
  
  // Check for validation errors
  if (Object.keys(validationErrors).some(key => validationErrors[key])) return false
  
  // Check QR payment requirements
  if (isQRPayment.value) {
    if (!bookingForm.paymentReference || !bookingForm.paymentProofFile) return false
  }
  
  switch (selectedService.value.id) {
    case 'food-delivery':
      return bookingForm.restaurantName && bookingForm.foodItems
    case 'bill-payments':
      return bookingForm.billType && bookingForm.accountNumber && bookingForm.paymentLocation && bookingForm.billAmount
    case 'pickup-drop':
      return bookingForm.pickupLocation && bookingForm.itemDescription && bookingForm.packageSize && bookingForm.pickupContact
    case 'gift-delivery':
      return bookingForm.giftType && bookingForm.giftSource && bookingForm.giftBudget && bookingForm.recipientName
    case 'medicine-delivery':
      return bookingForm.pharmacyName && bookingForm.medicineList && bookingForm.patientName
    case 'grocery-pabili':
      return bookingForm.storePreference && bookingForm.shoppingList && bookingForm.shoppingBudget
    default:
      return true
  }
})

// Calculate delivery fee based on service and distance with AI pricing
const deliveryFee = ref(50)

// Get order value based on service type
const getOrderValue = () => {
  switch (selectedService.value?.id) {
    case 'food-delivery':
      return parseFloat(bookingForm.orderValue) || 0
    case 'bill-payments':
      return parseFloat(bookingForm.billAmount) || 0
    case 'gift-delivery':
      return parseFloat(bookingForm.giftBudget) || 0
    case 'medicine-delivery':
      return parseFloat(bookingForm.medicineBudget) || 0
    case 'grocery-pabili':
      return parseFloat(bookingForm.shoppingBudget) || 0
    default:
      return 0
  }
}

// Validation function
const validateField = (fieldName) => {
  const value = sanitizeInput(bookingForm[fieldName] || '')
  let isValid = true
  let errorMessage = ''

  switch (fieldName) {
    case 'restaurantName':
    case 'pharmacyName':
    case 'giftSource':
    case 'pickupLocation':
    case 'paymentLocation':
    case 'specificStore':
      isValid = validateRestaurantName(value)
      errorMessage = isValid ? '' : 'Please enter a valid name (2-100 characters, no spam)'
      break
    case 'foodItems':
    case 'itemDescription':
      isValid = validateItemDescription(value)
      errorMessage = isValid ? '' : 'Please provide a valid description (5-300 characters, no spam)'
      break
    case 'medicineList':
      isValid = validateMedicineList(value)
      errorMessage = isValid ? '' : 'Please enter valid medicine names (3-500 characters, no spam)'
      break
    case 'shoppingList':
      isValid = validateShoppingList(value)
      errorMessage = isValid ? '' : 'Please enter a valid shopping list (5-1000 characters, no spam)'
      break
    case 'accountNumber':
      isValid = validateAccountNumber(value)
      errorMessage = isValid ? '' : 'Please enter a valid account number (3-50 characters)'
      break
    case 'pickupContact':
    case 'recipientName':
    case 'patientName':
      isValid = validateContactInfo(value)
      errorMessage = isValid ? '' : 'Please enter valid information (5-100 characters, no spam)'
      break
    case 'orderValue':
    case 'billAmount':
    case 'giftBudget':
    case 'medicineBudget':
    case 'shoppingBudget':
      isValid = validateAmount(value)
      errorMessage = isValid ? '' : 'Please enter a valid amount (1-50,000)'
      break
    case 'paymentReference':
      if (isQRPayment.value) {
        isValid = validateQRReference(value, bookingForm.paymentMethod)
        errorMessage = isValid ? '' : `Please enter a valid ${bookingForm.paymentMethod} reference number`
      }
      break
  }

  if (isValid) {
    delete validationErrors[fieldName]
  } else {
    validationErrors[fieldName] = errorMessage
  }

  return isValid
}

// Get QR code image based on payment method
const getQRCode = (paymentMethod) => {
  // In a real app, these would be actual QR codes for your business accounts
  const qrCodes = {
    'GCash': '/placeholder.svg?height=200&width=200&text=GCash+QR',
    'PayMaya': '/placeholder.svg?height=200&width=200&text=PayMaya+QR',
    'GoTyme': '/placeholder.svg?height=200&width=200&text=GoTyme+QR'
  }
  return qrCodes[paymentMethod] || '/placeholder.svg?height=200&width=200'
}

// Get reference number placeholder
const getReferencePlaceholder = (paymentMethod) => {
  const placeholders = {
    'GCash': 'Enter 13-digit GCash reference number',
    'PayMaya': 'Enter 12-13 digit PayMaya reference number',
    'GoTyme': 'Enter 10-15 character GoTyme reference number'
  }
  return placeholders[paymentMethod] || 'Enter reference number'
}

// Calculate distance from Calapan center to selected address
const calculateDistance = (lat, lng) => {
  const calapanCenter = { lat: 13.4000, lng: 121.1500 }
  
  const R = 6371 // Earth's radius in km
  const dLat = (lat - calapanCenter.lat) * Math.PI / 180
  const dLng = (lng - calapanCenter.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(calapanCenter.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c

  return Math.max(1, Math.round(distance * 10) / 10) // Minimum 1km
}

const onAddressSelected = (address) => {
  selectedAddress.value = address
  if (address && address.coordinates) {
    estimatedDistance.value = calculateDistance(
      address.coordinates.lat,
      address.coordinates.lng
    )
  }
}

const handlePrescriptionUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    bookingForm.prescriptionFile = file
  }
}

const handlePaymentProofUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    bookingForm.paymentProofFile = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      paymentProofPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Handle service image uploads
const handleServiceImageUpload = (event, serviceType) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(`File ${file.name} is too large. Maximum size is 5MB.`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      serviceImages[serviceType].push({
        file,
        preview: e.target.result,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  })
}

// Remove service image
const removeServiceImage = (serviceType, index) => {
  serviceImages[serviceType].splice(index, 1)
}

// Get demand level color
const getDemandColor = (level) => {
  const colors = {
    'low': 'text-green-600',
    'normal': 'text-blue-600',
    'high': 'text-orange-600',
    'surge': 'text-red-600'
  }
  return colors[level] || 'text-gray-600'
}

// Update delivery fee calculation with AI pricing
const updateDeliveryFee = async () => {
  if (!selectedService.value || !selectedAddress.value) return
  
  try {
    const orderValue = getOrderValue()
    const distance = estimatedDistance.value
    
    // Get AI-calculated delivery fee
    deliveryFee.value = await calculateDeliveryFee(
      selectedService.value.name,
      distance,
      'normal',
      demandLevel.value,
      orderValue
    )
    
    // Get detailed pricing breakdown
    const { getPricingBreakdown } = await import('../utils/pricing')
    pricingBreakdown.value = await getPricingBreakdown(
      selectedService.value.name,
      distance,
      orderValue
    )
  } catch (error) {
    console.error('Error calculating delivery fee:', error)
    // Fallback to basic calculation
    deliveryFee.value = 50 + (estimatedDistance.value * 12)
  }
}

const resetForm = () => {
  selectedService.value = null
  paymentProofPreview.value = null
  // Reset all form fields
  Object.keys(bookingForm).forEach(key => {
    if (key === 'paymentMethod') {
      bookingForm[key] = 'COD'
    } else if (key === 'prescriptionFile' || key === 'paymentProofFile') {
      bookingForm[key] = null
    } else {
      bookingForm[key] = ''
    }
  })
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    delete validationErrors[key]
  })
  selectedAddress.value = null
}

const handleBooking = async () => {
  if (!selectedAddress.value) {
    toast.error('Please select a delivery address')
    return
  }

  if (!isFormValid.value) {
    toast.error('Please fill in all required fields correctly')
    return
  }

  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const orderNumber = `BT${Date.now()}`
    
    // Generate barcode for the order
    const { generateOrderBarcode } = await import('../utils/barcode')
    const barcodeInfo = generateOrderBarcode(orderNumber)
    
    // Upload prescription if needed
    let prescriptionUrl = null
    if (bookingForm.prescriptionFile) {
      const fileExt = bookingForm.prescriptionFile.name.split('.').pop()
      const fileName = `${user.id}/${orderNumber}/prescription.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, bookingForm.prescriptionFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName)
      
      prescriptionUrl = publicUrl
    }

    // Upload payment proof if QR payment
    let paymentProofUrl = null
    if (isQRPayment.value && bookingForm.paymentProofFile) {
      const fileExt = bookingForm.paymentProofFile.name.split('.').pop()
      const fileName = `${user.id}/${orderNumber}/payment_proof.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, bookingForm.paymentProofFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)
      
      paymentProofUrl = publicUrl
    }

    // Upload service images
    let serviceImageUrls = []
    const currentServiceType = selectedService.value.id
    const images = serviceImages[currentServiceType]

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const fileExt = image.file.name.split('.').pop()
        const fileName = `${user.id}/${orderNumber}/service_${i + 1}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(fileName, image.file)

        if (uploadError) {
          console.error('Service image upload error:', uploadError)
          continue // Skip this image but continue with others
        }

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName)
        
        serviceImageUrls.push(publicUrl)
      }
    }

    // Prepare service details based on service type
    const serviceDetails = {
      serviceType: selectedService.value.id,
      estimatedDistance: estimatedDistance.value,
      demandLevel: demandLevel.value,
      specialInstructions: sanitizeInput(bookingForm.specialInstructions)
    }

    // Add serviceImageUrls to serviceDetails
    if (serviceImageUrls.length > 0) {
      serviceDetails.serviceImages = serviceImageUrls
    }

    // Add service-specific details
    switch (selectedService.value.id) {
      case 'food-delivery':
        Object.assign(serviceDetails, {
          restaurantName: sanitizeInput(bookingForm.restaurantName),
          foodItems: sanitizeInput(bookingForm.foodItems),
          orderValue: bookingForm.orderValue
        })
        break
      case 'bill-payments':
        Object.assign(serviceDetails, {
          billType: bookingForm.billType,
          accountNumber: sanitizeInput(bookingForm.accountNumber),
          paymentLocation: sanitizeInput(bookingForm.paymentLocation),
          billAmount: bookingForm.billAmount
        })
        break
      case 'pickup-drop':
        Object.assign(serviceDetails, {
          pickupLocation: sanitizeInput(bookingForm.pickupLocation),
          itemDescription: sanitizeInput(bookingForm.itemDescription),
          packageSize: bookingForm.packageSize,
          pickupContact: sanitizeInput(bookingForm.pickupContact)
        })
        break
      case 'gift-delivery':
        Object.assign(serviceDetails, {
          giftType: bookingForm.giftType,
          giftSource: sanitizeInput(bookingForm.giftSource),
          giftBudget: bookingForm.giftBudget,
          recipientName: sanitizeInput(bookingForm.recipientName),
          giftMessage: sanitizeInput(bookingForm.giftMessage)
        })
        break
      case 'medicine-delivery':
        Object.assign(serviceDetails, {
          pharmacyName: sanitizeInput(bookingForm.pharmacyName),
          medicineList: sanitizeInput(bookingForm.medicineList),
          medicineBudget: bookingForm.medicineBudget,
          patientName: sanitizeInput(bookingForm.patientName)
        })
        break
      case 'grocery-pabili':
        Object.assign(serviceDetails, {
          storePreference: bookingForm.storePreference,
          specificStore: sanitizeInput(bookingForm.specificStore),
          shoppingList: sanitizeInput(bookingForm.shoppingList),
          shoppingBudget: bookingForm.shoppingBudget,
          alternatives: sanitizeInput(bookingForm.alternatives)
        })
        break
    }

    const orderData = {
      user_id: user.id,
      order_number: orderNumber,
      service_type: selectedService.value.name,
      service_details: JSON.stringify(serviceDetails),
      delivery_address: selectedAddress.value.formatted_address,
      coordinates: JSON.stringify(selectedAddress.value.coordinates),
      payment_method: bookingForm.paymentMethod,
      delivery_fee: deliveryFee.value,
      prescription_url: prescriptionUrl,
      payment_proof_url: paymentProofUrl,
      payment_reference: isQRPayment.value ? sanitizeInput(bookingForm.paymentReference) : null,
      barcode_data: barcodeInfo.data,
      status: 'Pending',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error

    // Save payment proof record if QR payment
    if (isQRPayment.value && paymentProofUrl) {
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .insert([{
          order_id: data.id,
          user_id: user.id,
          payment_method: bookingForm.paymentMethod,
          reference_number: sanitizeInput(bookingForm.paymentReference),
          amount: deliveryFee.value,
          proof_url: paymentProofUrl,
          status: 'Pending'
        }])

      if (proofError) console.error('Error saving payment proof:', proofError)
    }

    toast.success('Service booked successfully!')
    router.push(`/dashboard/order/${data.id}`)
  } catch (error) {
    console.error('Booking error:', error)
    toast.error(error.message)
  } finally {
    loading.value = false
  }
}

// Get current demand level on component mount
const initializeDemand = async () => {
  try {
    demandLevel.value = await getCurrentDemandLevel()
  } catch (error) {
    console.error('Error getting demand level:', error)
  }
}

// Watch for service changes to reset form
watch(selectedService, async (newService) => {
  if (newService) {
    // Reset form fields but keep common ones
    const commonFields = ['specialInstructions', 'paymentMethod']
    Object.keys(bookingForm).forEach(key => {
      if (!commonFields.includes(key)) {
        if (key === 'prescriptionFile' || key === 'paymentProofFile') {
          bookingForm[key] = null
        } else {
          bookingForm[key] = ''
        }
      }
    })
    
    // Clear service images
    Object.keys(serviceImages).forEach(key => {
      serviceImages[key] = []
    })
    
    // Clear validation errors
    Object.keys(validationErrors).forEach(key => {
      delete validationErrors[key]
    })
    paymentProofPreview.value = null
    
    // Recalculate delivery fee
    await updateDeliveryFee()
  }
})

// Watch payment method changes
watch(() => bookingForm.paymentMethod, (newMethod) => {
  if (newMethod !== 'COD') {
    bookingForm.paymentReference = ''
    bookingForm.paymentProofFile = null
    paymentProofPreview.value = null
  }
})

// Watch for address changes to update delivery fee
watch(selectedAddress, async (newAddress) => {
  if (newAddress && newAddress.coordinates) {
    const distance = calculateDistance(
      newAddress.coordinates.lat,
      newAddress.coordinates.lng
    )
    estimatedDistance.value = distance
    await updateDeliveryFee()
  }
})

// Add watch for order value changes
watch(() => getOrderValue(), async () => {
  await updateDeliveryFee()
})

// Initialize demand level
initializeDemand()
</script>
