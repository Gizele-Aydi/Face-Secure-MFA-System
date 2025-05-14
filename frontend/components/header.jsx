import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./header.module.css"
import ThemeToggle from "./theme-toggle"

export default function Header() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

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
          {isDashboard ? (
            <>
              <span className={`${styles.navLink} ${styles.disabled}`}>Login</span>
              <span className={`${styles.navLink} ${styles.disabled}`}>Sign Up</span>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/register" className={styles.navLink}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
      </div>
    </header>
  )
}