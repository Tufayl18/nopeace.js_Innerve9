import { create } from "zustand"
import { Contract, ethers } from "ethers"
import {
  tokenABI,
  stakingContractABI,
  tokenContractAdds,
  stakingContractAdds,
} from "../constants/index"

const useWeb3Store = create((set, get) => ({
  provider: null,
  account: "0x00",
  stakingContract: null,
  token: null,
  chainId: null,
  repoId: null,
  setRepoId: (id) => set({ repoId: id }),

  connectWallet: async () => {
    try {
      if (!window.ethereum) throw new Error("No MetaMask found.")

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const account = accounts[0]

      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      })
      const chainId = parseInt(chainIdHex, 16)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const stakingContractAdd = stakingContractAdds[chainId]?.[0] || null
      const tokenContractAdd = tokenContractAdds[chainId]?.[0] || null

      if (!stakingContractAdd || !tokenContractAdd) {
        throw new Error("Unsupported network")
      }

      const stakingContract = new Contract(
        stakingContractAdd,
        stakingContractABI,
        signer,
      )
      const token = new Contract(tokenContractAdd, tokenABI, signer)

      set({ provider, account, stakingContract, token, chainId })

      return { provider, account, stakingContract, token, chainId }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw new Error(error.message)
    }
  },

  handleAccountChange: async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    const account = accounts[0]
    console.log("Changed account:", account)
    set({ account })
  },

  handleChainChange: async () => {
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)
    console.log("Changed chainId:", chainId)
    set({ chainId })
  },
}))

export default useWeb3Store
