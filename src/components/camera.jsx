"use client"

import { useState, useRef, useEffect } from "react"
import styles from "../styles/modules/camera.module.css"
import Button from "./ui/button"

export default function Camera({ onCapture, mode }) {
  const videoRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState("prompt") // 'prompt', 'granted', 'denied'
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)

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

      // Request camera access
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

  const handleCapture = () => {
    setIsCapturing(true)

    // Simulate face detection process
    setTimeout(() => {
      setIsCapturing(false)
      setCaptureComplete(true)

      // Notify parent component
      setTimeout(() => {
        onCapture()
      }, 1000)
    }, 3000)
  }

  return (
    <div className={styles.container}>
      {permissionState === "prompt" && !error && (
        <div className={styles.permissionPrompt}>
          <div className={styles.permissionIcon}>📷</div>
          <h3>Camera Access Required</h3>
          <p>We need access to your camera for facial recognition. Your face data will not be stored.</p>
          <Button variant="primary" onClick={requestCameraPermission}>
            Allow Camera Access
          </Button>
        </div>
      )}

      {permissionState === "denied" && (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
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
          <span className={styles.errorIcon}>⚠️</span>
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

            {isCapturing && (
              <div className={styles.scanOverlay}>
                <div className={styles.scanLine}></div>
              </div>
            )}

            {captureComplete && (
              <div className={styles.successOverlay}>
                <span className={styles.successIcon}>✓</span>
              </div>
            )}

            <div className={styles.faceGuide}></div>
          </div>

          <div className={styles.instructions}>
            {!isCapturing && !captureComplete && (
              <>
                <p>
                  {mode === "register"
                    ? "Position your face in the center for registration"
                    : "Look directly at the camera for verification"}
                </p>
                <Button variant="primary" onClick={handleCapture} disabled={isCapturing}>
                  {mode === "register" ? "Capture Face" : "Verify Face"}
                </Button>
              </>
            )}

            {isCapturing && <p>Please hold still... Analyzing your face</p>}

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
