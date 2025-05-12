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
    // Allow both login and register modes
    if (mode !== "login" && mode !== "register") {
      router.push("/login")
      return
    }
    if (mode === "login" && typeof window !== "undefined" && !window.loginData) {
      router.push("/login")
      return
    }
    if (mode === "register" && typeof window !== "undefined" && !window.registerData) {
      router.push("/register")
      return
    }
    if (typeof window !== "undefined") {
      setUserData(mode === "login" ? window.loginData : window.registerData)
    }
  }, [mode, router])

  const handleCapture = async (imageData) => {
    // Store the image in our in-memory object
    if (imageData) {
      faceImageStore[mode] = imageData
    }

    setCaptureComplete(true)
    setError(null)

    try {
      let dataToSend
      let endpoint
      if (mode === "login") {
        dataToSend = window.loginData
        endpoint = "http://127.0.0.1:8000/signin"
      } else {
        dataToSend = window.registerData
        endpoint = "http://127.0.0.1:8000/signup"
      }

      if (!dataToSend) {
        setError("No user data found. Please try again.")
        router.push(mode === "login" ? "/login" : "/register")
        return
      }

      // Prepare FormData for multipart/form-data POST
      const formData = new FormData()
      if (mode === "login") {
        formData.append("username", dataToSend.email)
        formData.append("password", dataToSend.password)
      } else {
        formData.append("username", dataToSend.username)
        formData.append("email", dataToSend.email)
        formData.append("password", dataToSend.password)
      }

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

      const response = await fetch(endpoint, {
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

      // Set authentication and redirect
      if (typeof window !== "undefined") {
        window.isAuthenticated = true
        window.authenticatedUser = mode === "login"
          ? {
              username: dataToSend.email?.split("@")[0] || "User",
              email: dataToSend.email || "user@example.com",
            }
          : {
              username: dataToSend.username,
              email: dataToSend.email,
            }
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
