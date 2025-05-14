import "../styles/globals.css"
import { Poppins } from "next/font/google"
import ThemeProvider from "../components/theme-provider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata = {
  title: "FaceSecure - Facial Recognition Authentication",
  description: "Secure your account with facial recognition technology",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.variable}>
        <ThemeProvider>
          <div className="page">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
