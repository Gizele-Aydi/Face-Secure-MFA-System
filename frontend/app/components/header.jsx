import Link from "next/link"
import styles from "./header.module.css"

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🔒</span>
          <span className={styles.logoText}>FaceSecure</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/login" className={styles.navLink}>
            Login
          </Link>
          <Link href="/register" className={styles.navLink}>
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  )
}
