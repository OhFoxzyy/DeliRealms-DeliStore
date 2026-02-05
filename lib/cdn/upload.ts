const RUST_API_URL = process.env.NEXT_PUBLIC_RUST_API_URL || "http://localhost:3002"
const CDN_API_KEY = process.env.NEXT_PUBLIC_CDN_API_KEY || ""

export interface UploadedFile {
  id: string
  filename: string
  size: number
  mime_type: string
  url: string
}

export interface UploadOptions {
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  success: boolean
  file?: UploadedFile
  error?: string
}

/**
 * Upload a file to the CDN using global API key
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  try {
    console.log("[v0] uploadFile called with:", file.name, file.type, file.size)
    console.log("[v0] RUST_API_URL:", RUST_API_URL)
    console.log("[v0] CDN_API_KEY configured:", !!CDN_API_KEY)

    if (!CDN_API_KEY) {
      console.error("[v0] CDN_API_KEY is not configured!")
      return {
        success: false,
        error: "CDN API key not configured. Please set CDN_API_KEY in your .env file.",
      }
    }

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && options.onProgress) {
          const progress = (e.loaded / e.total) * 100
          console.log("[v0] Upload progress:", progress)
          options.onProgress(progress)
        }
      })

      xhr.addEventListener("load", () => {
        console.log("[v0] XHR load event - status:", xhr.status)
        console.log("[v0] XHR response:", xhr.responseText)

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            console.log("[v0] Parsed response data:", data)
            resolve({ success: true, file: data })
          } catch (error) {
            console.error("[v0] Failed to parse response:", error)
            resolve({ success: false, error: "Invalid response from server" })
          }
        } else {
          console.error("[v0] Upload failed with status:", xhr.status, xhr.statusText)
          resolve({
            success: false,
            error: `Upload failed: ${xhr.statusText || xhr.responseText}`,
          })
        }
      })

      xhr.addEventListener("error", () => {
        console.error("[v0] XHR error event")
        resolve({ success: false, error: "Network error occurred" })
      })

      const uploadUrl = `${RUST_API_URL}/cdn/upload`
      console.log("[v0] Opening XHR POST to:", uploadUrl)
      xhr.open("POST", uploadUrl)
      xhr.setRequestHeader("X-API-Key", CDN_API_KEY)
      console.log("[v0] Sending XHR request...")
      xhr.send(formData)
    })
  } catch (error) {
    console.error("[v0] uploadFile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Upload a profile picture with validation
 */
export async function uploadProfilePicture(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  console.log("[v0] uploadProfilePicture called with:", file.name, file.type, file.size)

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    console.error("[v0] Invalid file type:", file.type)
    return {
      success: false,
      error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.",
    }
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    console.error("[v0] File too large:", file.size, "max:", maxSize)
    return {
      success: false,
      error: "File too large. Maximum size is 5MB.",
    }
  }

  console.log("[v0] Validation passed, calling uploadFile...")
  return uploadFile(file, options)
}

/**
 * Delete a file from the CDN using global API key
 */
export async function deleteFile(filename: string): Promise<boolean> {
  try {
    if (!CDN_API_KEY) {
      return false
    }

    const response = await fetch(`${RUST_API_URL}/cdn/files/${filename}`, {
      method: "DELETE",
      headers: {
        "X-API-Key": CDN_API_KEY,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Failed to delete file:", error)
    return false
  }
}

/**
 * Get the full CDN URL for a file
 */
export function getCDNUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  if (path.startsWith("/cdn/")) {
    return path
  }

  if (!path.startsWith("/") && !path.includes("/")) {
    return `${RUST_API_URL}/cdn/files/${path}`
  }

  return path
}


/**
 * Fetch all files from the CDN
 */
export async function fetchFiles(): Promise<UploadedFile[]> {
  try {
    const response = await fetch(`${RUST_API_URL}/cdn/files`, {
      headers: CDN_API_KEY ? { "X-API-Key": CDN_API_KEY } : {},
    })
    if (!response.ok) {
      throw new Error("Failed to fetch files")
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch files:", error)
    return []
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  maxWidth = 2048,
  maxHeight = 2048,
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`,
        })
      } else {
        resolve({ valid: true })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, error: "Failed to load image" })
    }

    img.src = url
  })
}

/**
 * Create a thumbnail from an image file
 */
export async function createThumbnail(file: File, maxWidth = 200, maxHeight = 200): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement("canvas")
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        resolve(blob)
      }, file.type)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

