// Alternative image handling utility
import { supabase } from "../lib/supabase"

export const getImageUrl = async (filePath, bucket = "payment-proofs") => {
  try {
    // Method 1: Try public URL first
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    if (data?.publicUrl) {
      // Test if the URL is accessible
      const response = await fetch(data.publicUrl, { method: "HEAD" })
      if (response.ok) {
        return data.publicUrl
      }
    }

    // Method 2: Try signed URL as fallback
    const { data: signedData, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) throw error
    return signedData?.signedUrl
  } catch (error) {
    console.error("Error getting image URL:", error)
    return null
  }
}

export const uploadImage = async (file, path, bucket = "payment-proofs") => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Get the public URL
    const imageUrl = await getImageUrl(path, bucket)

    return {
      data,
      publicUrl: imageUrl,
      error: null,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return {
      data: null,
      publicUrl: null,
      error,
    }
  }
}
