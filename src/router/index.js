import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "../stores/auth"

// Import components
import HomePage from "../views/HomePage.vue"
import LoginPage from "../views/LoginPage.vue"
import RegisterPage from "../views/RegisterPage.vue"
import ForgotPasswordPage from "../views/ForgotPasswordPage.vue"
import EmailConfirmed from "../views/EmailConfirmed.vue"
import DashboardLayout from "../layouts/DashboardLayout.vue"
import Dashboard from "../views/Dashboard.vue"
import BookService from "../views/BookService.vue"
import MyOrders from "../views/MyOrders.vue"
import UploadPayment from "../views/UploadPayment.vue"
import Profile from "../views/Profile.vue"
import OrderDetails from "../views/OrderDetails.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresGuest: true },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPasswordPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/email-confirmed",
    name: "EmailConfirmed",
    component: EmailConfirmed,
    meta: { requiresGuest: true },
  },
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "book-service",
        name: "BookService",
        component: BookService,
      },
      {
        path: "my-orders",
        name: "MyOrders",
        component: MyOrders,
      },
      {
        path: "upload-payment",
        name: "UploadPayment",
        component: UploadPayment,
      },
      {
        path: "profile",
        name: "Profile",
        component: Profile,
      },
      {
        path: "order-details/:id",
        name: "OrderDetails",
        component: OrderDetails,
        props: true,
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Simplified navigation guards - only user authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  try {
    console.log("Router guard: Navigating to:", to.path)
    console.log("Router guard: Route params:", to.params)
    console.log("Router guard: Route name:", to.name)

    // For public routes, allow immediate access
    if (!to.meta.requiresAuth && !to.meta.requiresGuest) {
      console.log("Router guard: Public route, allowing access")
      return next()
    }

    // For guest-only routes, quick check if user exists
    if (to.meta.requiresGuest) {
      // Quick check without full initialization
      if (authStore.user || authStore.hasStoredSession()) {
        console.log("Router guard: User exists, redirecting to dashboard")
        return next("/dashboard")
      } else {
        console.log("Router guard: No user, allowing guest access")
        return next()
      }
    }

    // For protected user routes, ensure auth is initialized
    if (to.meta.requiresAuth) {
      if (!authStore.initialized) {
        console.log("Router guard: Initializing auth for protected route")
        try {
          await Promise.race([
            authStore.initialize(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Router timeout")), 3000)),
          ])
        } catch (error) {
          console.warn("Router guard timeout, redirecting to login:", error)
          return next("/login")
        }
      }

      if (!authStore.user) {
        console.log("Router guard: No user, redirecting to login")
        return next("/login")
      }

      console.log("Router guard: User authenticated, allowing access to:", to.path)
      return next()
    }

    console.log("Router guard: Default case, allowing navigation")
    next()
  } catch (error) {
    console.error("Router guard error:", error)
    // On error, redirect to login for protected routes
    if (to.meta.requiresAuth) {
      next("/login")
    } else {
      next()
    }
  }
})

export default router
