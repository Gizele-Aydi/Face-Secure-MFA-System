"use client"

import { useState, useRef, useEffect } from "react"
import styles from "../styles/modules/camera.module.css"
import Button from "./ui/button"

export default function Camera({ onCapture, mode }) {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)

  // Function to initialize the camera
  const initializeCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First, check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser")
      }

      // List available devices for debugging
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      console.log("Available video devices:", videoDevices)

      // Try to get the rear camera first
      let cameraStream = null

      try {
        // Try rear camera first
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        console.log("Rear camera accessed successfully")
      } catch (err) {
        console.log("Could not access rear camera, trying front camera:", err)

        try {
          // Fall back to front camera
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          })
          console.log("Front camera accessed successfully")
        } catch (frontErr) {
          throw frontErr // Re-throw if front camera also fails
        }
      }

      // If we got a stream, set it
      if (cameraStream) {
        setStream(cameraStream)

        // Wait for the next render cycle before setting the video source
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = cameraStream
            console.log("Stream attached to video element")
          } else {
            console.error("Video element not available when setting stream")
            throw new Error("Video element not available")
          }
        }, 0)
      } else {
        throw new Error("Could not initialize camera stream")
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Camera initialization error:", err)
      setError(`Camera error: ${err.message || "Unknown error"}`)
      setIsLoading(false)
    }
  }

  // Handle video element events
  const handleVideoCanPlay = () => {
    console.log("Video can play now")
    setCameraReady(true)
    setIsLoading(false)
  }

  const handleVideoError = (e) => {
    console.error("Video element error:", e)
    setError("Error displaying video feed. Please refresh and try again.")
    setIsLoading(false)
  }

  // Handle capture button click
  const handleCapture = () => {
    if (!cameraReady) {
      setError("Camera is not ready yet. Please wait.")
      return
    }

    setIsCapturing(true)
    setCountdown(5) // Start 5-second countdown

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval)

          // Simulate face detection process
          setTimeout(() => {
            setIsCapturing(false)
            setCaptureComplete(true)

            // Notify parent component
            setTimeout(() => {
              onCapture()
            }, 1000)
          }, 1000)

          return null
        }
        return prevCount - 1
      })
    }, 1000)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className={styles.container}>
      <div className={styles.cameraContainer}>
        {/* Always render the video element */}
        <div
          className={`${styles.videoContainer} ${isCapturing ? styles.capturing : ""} ${captureComplete ? styles.complete : ""}`}
        >
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            playsInline
            muted
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
          />

          {isCapturing && (
            <div className={styles.scanOverlay}>
              <div className={styles.scanLine}></div>
              {countdown && <div className={styles.countdown}>{countdown}</div>}
            </div>
          )}

          {captureComplete && (
            <div className={styles.successOverlay}>
              <span className={styles.successIcon}>✓</span>
            </div>
          )}

          {/* Face guide - only show when camera is ready */}
          {cameraReady && <div className={styles.faceGuide}></div>}
        </div>

        {/* Status indicators and controls */}
        <div className={styles.controls}>
          {isLoading && (
            <div className={styles.statusIndicator}>
              <div className={styles.spinner}></div>
              <p>Initializing camera...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorIndicator}>
              <span className={styles.errorIcon}>⚠️</span>
              <p>{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          )}

          {!stream && !isLoading && !error && (
            <div className={styles.startPrompt}>
              <p>Camera access is required for facial recognition</p>
              <Button variant="primary" onClick={initializeCamera}>
                Start Camera
              </Button>
            </div>
          )}

          {cameraReady && !isCapturing && !captureComplete && (
            <div className={styles.captureControls}>
              <p>
                {mode === "register"
                  ? "Position your face in the center for registration"
                  : "Look directly at the camera for verification"}
              </p>
              <Button variant="primary" onClick={handleCapture}>
                {mode === "register" ? "Capture Face" : "Verify Face"}
              </Button>
            </div>
          )}

          {isCapturing && <p className={styles.captureStatus}>Please hold still... Analyzing your face</p>}

          {captureComplete && (
            <p className={styles.successText}>
              {mode === "register" ? "Face registered successfully!" : "Face verified successfully!"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
