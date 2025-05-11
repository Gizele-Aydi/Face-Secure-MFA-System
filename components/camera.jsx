"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./camera.module.css"
import Button from "./ui/button"

// In-memory storage for face images
const faceImageStore = {
  register: null,
  login: null,
}

export default function Camera({ onCapture, mode }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState("prompt") // 'prompt', 'granted', 'denied'
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)

  const requestCameraPermission = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: "camera" })
        setPermissionState(result.state)

        // Listen for permission changes
        result.addEventListener("change", () => {
          setPermissionState(result.state)
        })
      }

      // Request camera access - using user (front) camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setPermissionState("granted")
      setIsLoading(false)
    } catch (err) {
      console.error("Error accessing camera:", err)

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied")
        setError("Camera access denied. Please allow camera access in your browser settings.")
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.")
      } else {
        setError("Could not access camera. Please ensure your device has a working camera.")
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Clean up function to stop all tracks when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL("image/png")
    return imageDataUrl
  }

  const handleCapture = () => {
    setIsCapturing(true)
    setCountdown(5) // Start 5-second countdown

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval)

          // Capture the image
          const imageData = captureImage()
          setCapturedImage(imageData)

          // Store the image in our in-memory object
          faceImageStore[mode] = imageData

          // Complete the capture process
          setIsCapturing(false)
          setCaptureComplete(true)

          // Notify parent component after a short delay
          setTimeout(() => {
            onCapture(imageData)
          }, 1000)

          return null
        }
        return prevCount - 1
      })
    }, 1000)
  }

  return (
    <div className={styles.container}>
      {permissionState === "prompt" && !error && (
        <div className={styles.permissionPrompt}>
          <div className={styles.permissionIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 8v.5A2.5 2.5 0 0 1 12.5 11h-.5" />
              <path d="M17 15v-1a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v1" />
              <rect width="18" height="18" x="3" y="3" rx="2" />
            </svg>
          </div>
          <h3>Camera Access Required</h3>
          <p>We need access to your camera for facial recognition. Your face data will not be stored on any server.</p>
          <Button variant="primary" onClick={requestCameraPermission}>
            Allow Camera Access
          </Button>
        </div>
      )}

      {permissionState === "denied" && (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <p>Camera access was denied. Please enable camera access in your browser settings and refresh this page.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      )}

      {isLoading && permissionState !== "prompt" && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Initializing camera...</p>
        </div>
      )}

      {error && permissionState !== "denied" && (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {permissionState === "granted" && !isLoading && !error && (
        <>
          <div
            className={`${styles.videoContainer} ${isCapturing ? styles.capturing : ""} ${captureComplete ? styles.complete : ""}`}
          >
            <video ref={videoRef} className={styles.video} autoPlay playsInline muted />

            {/* Hidden canvas for capturing images */}
            <canvas ref={canvasRef} className={styles.hiddenCanvas} />

            {isCapturing && (
              <div className={styles.countdownOverlay}>
                <div className={styles.countdown}>{countdown}</div>
              </div>
            )}

            {captureComplete && (
              <div className={styles.successOverlay}>
                <span className={styles.successIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </div>
            )}

            {/* Oval face guide */}
            <div className={styles.faceGuideOval}></div>
          </div>

          <div className={styles.instructions}>
            {!isCapturing && !captureComplete && (
              <>
                <ul className={styles.instructionsList}>
                  <li>Position your face inside the oval</li>
                  <li>Keep still during the capture</li>
                  <li>Ensure good lighting on your face</li>
                </ul>
                <Button variant="primary" onClick={handleCapture} disabled={isCapturing}>
                  {mode === "register" ? "Capture Face" : "Verify Face"}
                </Button>
              </>
            )}

            {isCapturing && <p>Please hold still... Capturing in {countdown} seconds</p>}

            {captureComplete && (
              <p className={styles.successText}>
                {mode === "register" ? "Face registered successfully!" : "Face verified successfully!"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
