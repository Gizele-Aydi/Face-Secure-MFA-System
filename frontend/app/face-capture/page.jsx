"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Camera from "../../components/camera"
import SharedHeader from "../../components/shared-header"
import Button from "../../components/ui/button"
import { tokenManager } from "../auth-utils"
import styles from "./face-capture.module.css"

const faceImageStore = {
  login: null,
  register: null,
}

export default function FaceCapture() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "login"
  const [captureComplete, setCaptureComplete] = useState(false)
  const [error, setError] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState(null) // null, "processing", "success", "error"
  const isSubmitting = useRef(false)
  const controllerRef = useRef(null)

  // Only validate mode, not user data
  useEffect(() => {
    if (!["login", "register"].includes(mode)) {
      router.push("/login")
    }
  }, [mode, router])

  const handleSuccessfulAuth = async (token) => {
    // 1. First ensure token is properly stored
    tokenManager.setToken(token)

    // 2. Verify token was actually stored
    await new Promise((resolve) => setTimeout(resolve, 50))
    const storedToken = tokenManager.getToken()

    if (!storedToken) {
      throw new Error("Token storage failed")
    }

    // 3. Update UI state - Only set success status after verification is complete
    setVerificationStatus("success")

    // 4. Force hard redirect to ensure all auth state is initialized
    setTimeout(() => {
      window.location.assign("/dashboard")
    }, 1500) // Short delay to show success state
  }

  const handleCapture = async (imageData) => {
    if (isSubmitting.current) return
    isSubmitting.current = true

    try {
      // Initial setup
      if (imageData) faceImageStore[mode] = imageData
      setCaptureComplete(true)
      setError(null)

      // IMPORTANT: Set to processing state immediately
      setVerificationStatus("processing")

      // Verify user data exists
      const userData = mode === "login" ? window.loginData : window.registerData
      if (!userData) {
        throw new Error("Session expired. Please try again.")
      }

      // Prepare request
      const formData = new FormData()
      if (mode === "login") {
        formData.append("username", userData.email)
        formData.append("password", userData.password)
      } else {
        formData.append("username", userData.username)
        formData.append("email", userData.email)
        formData.append("password", userData.password)
      }

      // Add image to request
      const blob = await createImageBlob(imageData)
      formData.append("face", blob, "face.png")

      // Make API call
      controllerRef.current = new AbortController()
      const timeout = setTimeout(() => controllerRef.current.abort(), 15000)

      const response = await fetch(mode === "login" ? "http://127.0.0.1:8000/signin" : "http://127.0.0.1:8000/signup", {
        method: "POST",
        body: formData,
        signal: controllerRef.current.signal,
      })

      clearTimeout(timeout)

      // Handle response
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed")
      }

      const token = data.access_token || data.token
      if (!token) {
        throw new Error("No token received")
      }

      if (mode === "register") {
        // Registration successful, redirect to login page
        setVerificationStatus("success")
        setTimeout(() => {
          window.location.assign("/login")
        }, 1500) // Short delay to show success state
        return
      }

      await handleSuccessfulAuth(token)
    } catch (error) {
      console.error("Auth error:", error)
      setError(error.message)
      setVerificationStatus("error")
    } finally {
      isSubmitting.current = false
    }
  }

  const createImageBlob = async (imageData) => {
    if (!imageData.startsWith("data:")) return imageData

    const arr = imageData.split(",")
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    const u8arr = new Uint8Array(bstr.length)

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }

    return new Blob([u8arr], { type: mime })
  }

  return (
    <>
      <SharedHeader />
      <main className="page-content">
        <div className="container">
          <div className={styles.captureContainer}>
            <div className={styles.captureCard}>
              <h1 className={styles.captureTitle}>Verify Your Identity</h1>
              <p className={styles.captureSubtitle}>Look at the camera to verify your identity</p>

              {/* Camera component with verification status */}
              <div className={styles.cameraWrapper}>
                <Camera
                  onCapture={handleCapture}
                  mode={mode}
                  disabled={verificationStatus === "processing"}
                  verificationStatus={verificationStatus}
                />
              </div>

              {error && <div className={styles.errorMessage}>{error.toString()}</div>}

              <div className={styles.captureActions}>
                <Button variant="outline" href={`/${mode}`} disabled={verificationStatus === "processing"}>
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
