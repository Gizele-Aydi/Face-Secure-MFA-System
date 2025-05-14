import SharedHeader from "../components/shared-header"
import Button from "../components/ui/button"
import styles from "./page.module.css"

export default function Home() {
  return (
    <>
      <SharedHeader />
      <main className={styles.main}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Secure Your Account with <span className={styles.highlight}>Facial Recognition</span>
            </h1>
            <p className={styles.subtitle}>
              Experience the next level of security with our cutting-edge facial recognition technology. Simple, fast,
              and more secure than traditional passwords.
            </p>
            <div className={styles.buttonGroup}>
              <Button href="/register" size="lg">
                Sign Up
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Login
              </Button>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.faceScanAnimation}>
              <div className={styles.faceOutline}></div>
              <div className={styles.scanLine}></div>
              <div className={styles.scanPoints}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={styles.point}
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Why Choose FaceSecure?</h2>
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M7 12h10" />
                  <path d="M12 7v10" />
                </svg>
              </div>
              <h3>Enhanced Security</h3>
              <p>Biometric authentication that's nearly impossible to replicate</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m13 2-2 2.5h3L12 7" />
                  <path d="M12 22v-3" />
                  <path d="M12 17v-2.5" />
                  <path d="m6 13-2.5 2.5" />
                  <path d="M18 13h-3" />
                  <path d="m2 9 2.5 2.5L7 9" />
                  <path d="M22 9h-3" />
                  <path d="m18 13 2.5-2.5" />
                  <path d="M13 22h-2" />
                </svg>
              </div>
              <h3>Lightning Fast</h3>
              <p>Verify your identity in seconds, not minutes</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3>Works Everywhere</h3>
              <p>Compatible with any device that has a camera</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}



