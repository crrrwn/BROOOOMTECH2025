import { defineStore } from "pinia"
import { ref } from "vue"
import { supabase } from "../lib/supabase"

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const initialized = ref(false)

  // Check if we have a stored session immediately
  const hasStoredSession = () => {
    try {
      const stored = localStorage.getItem("supabase.auth.token")
      return !!stored
    } catch {
      return false
    }
  }

  const initialize = async () => {
    if (initialized.value) {
      console.log("Auth already initialized")
      return
    }

    loading.value = true
    console.log("Initializing auth store...")

    try {
      // Quick session check with shorter timeout
      const {
        data: { session },
        error,
      } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Session timeout")), 3000)),
      ])

      if (error) {
        console.error("Session error:", error)
        return
      }

      console.log("Session retrieved:", !!session)

      if (session?.user) {
        console.log("User found in session:", session.user.id)
        user.value = session.user
        // Fetch profile in background, don't wait for it
        fetchProfile().catch(console.error)
      } else {
        console.log("No user session found")
        user.value = null
        profile.value = null
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
      // Clear any corrupted session data
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.error("Error signing out:", signOutError)
      }
    } finally {
      loading.value = false
      initialized.value = true
      console.log("Auth initialization completed")
    }
  }

  const fetchProfile = async () => {
    if (!user.value) {
      console.log("No user to fetch profile for")
      return
    }

    try {
      console.log("Fetching profile for user:", user.value.id)

      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.value.id).single()

      if (error) {
        console.log("Profile fetch error:", error)
        if (error.code === "PGRST116") {
          console.log("No profile found")
          // Don't auto-create, let registration handle it
        }
      } else {
        console.log("Profile found:", data)
        profile.value = data
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const createProfile = async (userData) => {
    try {
      console.log("Creating profile with data:", userData)

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) throw new Error("No authenticated user")

      const profileData = {
        id: currentUser.id,
        first_name: userData.firstName || "User",
        last_name: userData.lastName || "Name",
        middle_name: userData.middleName || "",
        contact: userData.contact || "09000000000",
        address: userData.address || "Calapan City",
        email: currentUser.email,
      }

      const { data, error } = await supabase.from("user_profiles").insert([profileData]).select().single()

      if (error) throw error

      console.log("Profile created successfully:", data)
      profile.value = data
      return { data, error: null }
    } catch (error) {
      console.error("Error creating profile:", error)
      return { data: null, error }
    }
  }

  const signUp = async (userData) => {
    loading.value = true

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            middle_name: userData.middleName,
            contact: userData.contact,
            address: userData.address,
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    loading.value = true

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      user.value = data.user
      // Fetch profile in background
      fetchProfile().catch(console.error)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      profile.value = null
      initialized.value = false

      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  const handleEmailConfirmation = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser && currentUser.email_confirmed_at) {
        user.value = currentUser
        await fetchProfile()
        return { success: true }
      }

      return { success: false, error: "Email not confirmed" }
    } catch (error) {
      console.error("Email confirmation error:", error)
      return { success: false, error }
    }
  }

  // Listen to auth changes with better error handling
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session?.user?.id)

    try {
      if (event === "SIGNED_IN" && session?.user) {
        user.value = session.user
        fetchProfile().catch(console.error)
      } else if (event === "SIGNED_OUT") {
        user.value = null
        profile.value = null
        // Don't reset initialized to allow quick re-initialization
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        user.value = session.user
      }
    } catch (error) {
      console.error("Auth state change error:", error)
    }
  })

  return {
    user,
    profile,
    loading,
    initialized,
    hasStoredSession,
    initialize,
    fetchProfile,
    createProfile,
    signUp,
    signIn,
    signOut,
    handleEmailConfirmation,
  }
})
