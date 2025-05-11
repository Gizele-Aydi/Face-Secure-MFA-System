"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Camera from "../../components/camera"
import SharedHeader from "../../components/shared-header"
import Button from "../../components/ui/button"
import styles from "./face-capture.module.css"

// In-memory storage for face images
const faceImageStore = {
  login: null,
}

export default function FaceCapture() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "login"
  const [captureComplete, setCaptureComplete] = useState(false)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only allow login mode
    console.log("Face capture mode:", mode)
    if (mode !== "login") {
      console.log("Invalid mode, redirecting to /login")
      router.push("/login")
      return
    }
    if (typeof window !== "undefined" && !window.loginData) {
      console.log("No login data found, redirecting to /login")
      router.push("/login")
    }
    if (typeof window !== "undefined") {
      setUserData(window.loginData)
      console.log("Loaded userData for login:", window.loginData)
    }
  }, [mode, router])

  const handleCapture = async (imageData) => {
    // Store the image in our in-memory object
    if (imageData) {
      faceImageStore[mode] = imageData
      console.log("Face image captured for login:", imageData)
    }

    setCaptureComplete(true)
    setError(null)
    console.log("Face capture complete, sending authentication request...")

    try {
      const loginData = typeof window !== "undefined" ? window.loginData : null
      if (!loginData) {
        setError("No login data found. Please login again.")
        router.push("/login")
        return
      }

      // Prepare FormData for multipart/form-data POST
      const formData = new FormData()
      formData.append("username", loginData.email)
      formData.append("password", loginData.password)

      // Convert base64 image to Blob if needed
      let blob
      if (imageData.startsWith("data:")) {
        const arr = imageData.split(",")
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        blob = new Blob([u8arr], { type: mime })
      } else {
        blob = imageData // fallback
      }
      formData.append("face", blob, "face.png")

      const response = await fetch("http://127.0.0.1:8000/signin", {
        method: "POST",
        body: formData,
      })

      let data
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        // Handle FastAPI validation errors (422)
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            setError(data.detail.map(e => e.msg).join(", "))
          } else if (typeof data.detail === "string") {
            setError(data.detail)
          } else {
            setError("Face verification failed. Please try again.")
          }
        } else {
          setError("Face verification failed. Please try again.")
        }
        setCaptureComplete(false)
        return
      }

      // For login mode, set authentication flag and redirect to dashboard
      if (typeof window !== "undefined") {
        window.isAuthenticated = true
        window.authenticatedUser = {
          username: loginData.email?.split("@")[0] || "User",
          email: loginData.email || "user@example.com",
        }
        console.log("User authenticated, redirecting to /dashboard")
      }
      router.push("/dashboard")
    } catch (err) {
      setError("Network error. Please try again.")
      setCaptureComplete(false)
    }
  }

  const pageTitle = "Verify Your Identity"
  const pageDescription = "Look at the camera to verify your identity"

  return (
    <>
      <SharedHeader />
      <main className="page-content">
        <div className="container">
          <div className={styles.captureContainer}>
            <div className={styles.captureCard}>
              <h1 className={styles.captureTitle}>{pageTitle}</h1>
              <p className={styles.captureSubtitle}>{pageDescription}</p>

              <Camera onCapture={handleCapture} mode={mode} />

              {error && (
                <div className={styles.errorMessage}>{typeof error === "string" ? error : "An error occurred."}</div>
              )}

              <div className={styles.captureActions}>
                <Button
                  variant="outline"
                  href="/login"
                  disabled={captureComplete}
                >
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
