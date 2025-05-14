"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import SharedHeader from "../../components/shared-header"
import Button from "../../components/ui/button"
import { tokenManager } from "../auth-utils"
import styles from "./dashboard.module.css"


export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const fetchUser = async () => {
    const token = tokenManager.getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Unauthorized")
      }

      const data = await res.json()
      setUser({
        username: data.username,
        email: data.email,
      })
    } catch (err) {
      console.error("Failed to fetch user data:", err)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  fetchUser()
}, [router])

  const handleLogout = async () => {
  try {
    const token = tokenManager.getToken()
    await fetch("http://127.0.0.1:8000/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch (e) {
    // Ignore errors for logout
  }
  tokenManager.removeToken()
  router.push("/")
}

  if (isLoading) {
    return (
      <>
        <SharedHeader />
        <main className="page-content">
          <div className="container">
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <SharedHeader />
      <main className="page-content">
        <div className="container">
          <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
              <div className={styles.userProfile}>
                <div className={styles.userAvatar}>{user.username?.charAt(0).toUpperCase() || "U"}</div>
                <div className={styles.userInfo}>
                  <h1 className={styles.welcomeMessage}>
                    Welcome, <span className={styles.username}>{user.username}</span>!
                  </h1>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            <div className={styles.dashboardContent}>
              <div className={styles.securityCard}>
                <h2>Security Status</h2>
                <div className={styles.securityStatus}>
                  <div className={styles.securityItem}>
                    <div className={`${styles.securityIcon} ${styles.success}`}>✓</div>
                    <div className={styles.securityInfo}>
                      <h3>Facial Recognition</h3>
                      <p>Enabled and working properly</p>
                    </div>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={`${styles.securityIcon} ${styles.success}`}>✓</div>
                    <div className={styles.securityInfo}>
                      <h3>Password Protection</h3>
                      <p>Strong password detected</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.recentActivity}>
                <h2>Recent Activity</h2>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <div className={styles.activityTime}>Just now</div>
                    <div className={styles.activityInfo}>
                      <h3>Successful login</h3>
                      <p>Face verification completed</p>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityTime}>Today</div>
                    <div className={styles.activityInfo}>
                      <h3>Account created</h3>
                      <p>Welcome to FaceSecure!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}