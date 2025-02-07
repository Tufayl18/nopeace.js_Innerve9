"use client"
import "./globals.css";
import styles from "./styles.module.css";
import Header from "../components/header.js";

import { useEffect, useState } from "react";
import useWeb3Store from "../store/useWeb3Store";

export default function RootLayout({ children }) {

  const { connectWallet, account, handleAccountChange, handleChainChange } = useWeb3Store();
  const [isLoading, setIsLoading] = useState()

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChange);
      window.ethereum.on("chainChanged", handleChainChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
        window.ethereum.removeListener("chainChanged", handleChainChange);
      }
    };
  }, [])

  // const [init, setInit] = useState({
  //   provider: null,
  //   account: 0x00,
  //   stakingContract: null,
  //   token: null,
  //   chainId: null
  // })

  const handleWallet = async () => {
    try {
      setIsLoading(true);
      await connectWallet();
      console.log("Wallet connected");
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <html lang="en">
      <body>
        <div className={styles.backgroundDiv}>
          <Header handleWallet={handleWallet} account={account} />
          {/* <Web3Context.Provider value={init}> */}
          {isLoading ? <p>Loading...</p> : children}
          {/* </Web3Context.Provider> */}
        </div>
      </body>
    </html>
  );
}
