import Header from "../components/header"
import Button from "../components/ui/button"
import styles from "../styles/modules/page.module.css"

export default function Home() {
  return (
    <>
      <Header />
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
          <div className="container">
            <h2 className={styles.sectionTitle}>Why Choose FaceSecure?</h2>
            <div className={styles.features}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔒</div>
                <h3>Enhanced Security</h3>
                <p>Biometric authentication that's nearly impossible to replicate</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚡</div>
                <h3>Lightning Fast</h3>
                <p>Verify your identity in seconds, not minutes</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🌐</div>
                <h3>Works Everywhere</h3>
                <p>Compatible with any device that has a camera</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <p>© 2023 FaceSecure. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
