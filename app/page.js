"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import styles from "../app/styles.module.css"
import Image from "next/image"
import bg from "./assets/bg3.jpeg"
import logo from "./assets/logo3.png"

export default function Home() {
  const router = useRouter()
  const [token, setToken] = useState("")

  const handleLogin = () => {
    if (token) {
      localStorage.setItem("githubAccessToken", token)
      router.push("/dashboard")
    } else {
      alert("Please enter a GitHub access token.")
    }
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.mainLeft}>
          <div>
            <a style={{ color: "#1ecbe1" }}>S</a>ta
            <a style={{ color: "var(--divider)" }}>k</a>e.{" "}
          </div>
          <div>
            S<a style={{ color: "var(--divider)" }}>o</a>lv
            <a style={{ color: "#1ecbe1" }}>e</a>.{" "}
          </div>
          <div>
            <a style={{ color: "#1ecbe1" }}>E</a>ar
            <a style={{ color: "var(--divider)" }}>n</a>.{" "}
          </div>
        </div>
        <div className={styles.mainRight}>
          <div style={{ display: "flex", justifyContent: "Center" }}>
            <Image src={logo} width={250} height={250} alt="GitStake Logo" />
          </div>
          Enter your GitHub Access Token <br />
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)} // Update state on input change
            style={{
              color: "var(--divider)",
              fontFamily: "var(--font-lucida)",
              fontSize: 20,
              height: 40,
              width: "80%",
              marginTop: 10,
            }}
          />
          <button className={styles.LoginButton} onClick={handleLogin}>
            Log In
          </button>
        </div>
      </main>
      <Image
        style={{
          position: "absolute",
          top: 100,
          left: 60,
          opacity: 0.15,
          zIndex: 1,
          overflow: "hidden",
        }}
        src={bg}
        width={1300}
        alt="Background"
      />
    </>
  )
}

