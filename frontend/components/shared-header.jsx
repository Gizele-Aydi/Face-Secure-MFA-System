"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./header.module.css"
import ThemeToggle from "./theme-toggle"

export default function SharedHeader() {
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"

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
                <span className={styles.disabledLink}>Login</span>
                <span className={styles.disabledLink}>Sign Up</span>
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
