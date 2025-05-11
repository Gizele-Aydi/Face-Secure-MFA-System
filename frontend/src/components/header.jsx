import Link from "next/link"
import styles from "../styles/modules/header.module.css"
import ThemeToggle from "./theme-toggle"

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🔒</span>
          <span className={styles.logoText}>FaceSecure</span>
        </Link>
        <div className={styles.headerRight}>
          <ThemeToggle />
          <nav className={styles.nav}>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/register" className={styles.navLink}>
              Sign Up
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
