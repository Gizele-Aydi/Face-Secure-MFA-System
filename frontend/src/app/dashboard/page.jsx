"use client"

import { useRouter } from "next/navigation"
import Header from "../../components/header"
import Button from "../../components/ui/button"
import styles from "../../styles/modules/dashboard.module.css"

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = () => {
    // Redirect to home
    router.push("/")
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <div className="container">
          <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
              <div className={styles.userProfile}>
                <div className={styles.userAvatar}>U</div>
                <div className={styles.userInfo}>
                  <h1 className={styles.welcomeMessage}>
                    Welcome, <span className={styles.username}>User</span>!
                  </h1>
                  <p className={styles.userEmail}>user@example.com</p>
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
