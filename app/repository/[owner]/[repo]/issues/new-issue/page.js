"use client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import styles from "../../../../../styles.module.css"
import { ethers } from "ethers";
import useWeb3Store from "@/store/useWeb3Store";

export default function NewIssue() {
  const { account, stakingContract, token, repoId } = useWeb3Store();
  const router = useRouter()
  const { owner, repo } = useParams()

  const [issueId, setIssueId] = useState()
  const [ethPrize, setEthPrize] = useState(0.05)
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getGitHubToken = () => localStorage.getItem("githubAccessToken")

  const checkDuplicateIssue = async () => {
    try {
      const LStoken = getGitHubToken()
      if (!LStoken) return setError("GitHub access token not found."), false

      const response = await fetch(
        `https://muj-gitstakeai.onrender.com/api/avoidDUp/${owner}/${repo}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LStoken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title, body: description })
        }
      )
      return (response.ok) ? (await response.json()).message.includes("Similar") : false;

    } catch (error) {
      console.error("Error checking for duplicates:", error)
      return false
    }
  }

  const handleCreateIssue = async () => {
    console.log("In handleCreateIssue...")
    if (!title.trim() || !description.trim()) return setError("Title and description are required.")

    setLoading(true)
    setError(null)

    try {
      if (await checkDuplicateIssue()) {
        setError("A similar issue already exists. Please check existing issues.")
        setLoading(false)
        return
      }

      const LStoken = getGitHubToken()
      if (!LStoken) return setError("GitHub access token not found."), setLoading(false)

      // const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      //   headers: {
      //     Authorization: `token ${LStoken}`,
      //   },
      // })
      // const repoData = (repoResponse.ok) ? await repoResponse.json() : null;
      // const repoId = repoData?.id;
      if (!repoId) throw new Error("Failed to fetch repository ID.");

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${LStoken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            body: description,
            labels: tags.split(",").map((tag) => tag.trim()),
          }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        setIssueId(data?.number)
        console.log("IssueIDState: ", issueId)

        if (data && repoId) {
          try {
            console.log("creatingIssue...", stakingContract.target, token.target, account, repoId, data?.number, ethers.parseEther(ethPrize.toString()))
            if (token && account) {
              const tx = await stakingContract.createIssue(
                repoId,
                data?.number,
                ethers.parseEther(ethPrize.toString())
              );
              await tx.wait();
            }
          }
          catch (error) {
            console.log("create issue:", error)
          }
          router.push(`/repository/${owner}/${repo}/issues`)
        }
        else setError("Issue ID was not generated.")

      } else setError(`Failed to create issue: ${response}`)

    }
    catch (error) {
      setError(`An error occurred: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = async (field, value) => {
    if (field === 'title') setTitle(value)
    if (field === 'description') setDescription(value)
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          padding: "30px 20%",
          gap: 30,
        }}
      >
        <div>
          Set Win Prize (minimum 0.1 ETH) <br />
          <input
            type="number"
            placeholder="ETH Prize"
            value={ethPrize}
            onChange={(e) => setEthPrize(parseFloat(e.target.value))}
            min="0.1"
            step="0.1"
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "750px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          Add Title
          <br />
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "750px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>

        <div>
          Add Tags (comma separated)
          <br />
          <input
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "750px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>

        <div>
          Add Description
          <br />
          <textarea
            placeholder="Add your description here..."
            value={description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{
              minHeight: 150,
              color: "var(--font)",
              padding: "5px",
              width: "750px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <button
            className={styles.ForkButton}
            onClick={handleCreateIssue}
            style={{ width: 200 }}
          >
            {loading ? "Creating..." : "Create New Issue"}
          </button>
        </div>
      </div>
    </>
  )
}