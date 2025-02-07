"use client"
import Link from "next/link"
import styles from "../../../../styles.module.css"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function PullReq() {
  const { owner, repo } = useParams()
  const [pullRequests, setPullRequests] = useState([])
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [linkedIssueNumber, setLinkedIssueNumber] = useState(null)

  const getGitHubToken = () => localStorage.getItem("githubAccessToken")

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchPullRequests = async () => {
      const LStoken = getGitHubToken()
      if (!LStoken) return setError("GitHub access token not found."), false

      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls`,
          {
            headers: {
              Authorization: `token ${LStoken}`,
            },
          }
        );
        if (!response.ok) {
          console.log("Failed to fetch pull requests")
        }
        const data = await response.json()
        setPullRequests(data)

        // Extract issue number from the first PR that has a linked issue
        for (const pr of data) {
          // Check PR body for issue reference (format: #123)
          const issueMatch = pr.body?.match(/#(\d+)/)
          if (issueMatch) {
            setLinkedIssueNumber(issueMatch[1])
            break
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPullRequests();

  }, [owner, repo])

  useEffect(() => {
    if (!linkedIssueNumber) return;

    const fetchSuggestions = async () => {
      if (!linkedIssueNumber) return;
      const LStoken = getGitHubToken()
      if (!LStoken) return setError("GitHub access token not found."), false
      try {
        const response = await fetch(
          `https://muj-gitstakeai.onrender.com/api/suggestions/${owner}/${repo}/${linkedIssueNumber}`,
          {
            headers: {
              Authorization: `token ${LStoken}`,
              'Accept': 'application/json',
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.status}`)
        }
        setSuggestions(await response.json())
      } catch (err) {
        console.error("Error fetching suggestions:", setSuggestions(err))
      }
    }
    fetchSuggestions()
  }, [owner, repo, linkedIssueNumber])

  if (loading) return <p>Loading pull requests...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: "20px 30px",
          gap: 50,
        }}
      >
        <div>
          Highest Stake{" "}
          <div style={{ color: "var(--aqua)", fontSize: 20 }}>5 ETH</div>
        </div>
        <div>
          <input
            placeholder="Type to Search..."
            style={{
              color: "var(--font)",
              padding: "0 5px",
              width: "450px",
              height: "30px",
              background: "var(--button)",
              border: "0.5px solid var(--divider)",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <Link href={`/repository/${owner}/${repo}/pulls/new-pull`}>
            <button className={styles.ForkButton} style={{ width: 200 }}>
              New Pull Request
            </button>
          </Link>
        </div>
      </div>


      <div
        style={{
          margin: "0 auto",
          maxWidth: "100%",
          padding: "10px",
          background: "var(--button)",
          borderRadius: "8px",
          border: "1px solid var(--divider)"
        }}
      >
        <h2 style={{ color: "var(--aqua)", marginBottom: "20px" }}>Suggested Pull Requests</h2>
        {suggestions ? (
          <div style={{ display: "flex", flexDirection: "row", gap: "65px" }}>
            {suggestions.topPullRequest?.url && (
              <div>
                <h3>Top Match (Score: {suggestions.topPullRequest.relevanceScore})</h3>
                <Link href={suggestions.topPullRequest.url}>
                  {suggestions.topPullRequest.title}
                </Link>
              </div>
            )}
            {suggestions.secondOptimal?.url && (
              <div>
                <h3>Second Match</h3>
                <Link href={suggestions.secondOptimal.url}>
                  {suggestions.secondOptimal.title}
                </Link>
              </div>
            )}
            {suggestions.thirdOptimal?.url && (
              <div>
                <h3>Third Match</h3>
                <Link href={suggestions.thirdOptimal.url}>
                  {suggestions.thirdOptimal.title}
                </Link>
              </div>
            )}
          </div>
        ) :
          <p>Loading Suggestions ...</p>
        }
      </div>


      <div className={styles.IssuesTable}>
        <div style={{ color: "var(--aqua)" }}>
          {pullRequests.length} open pull requests
        </div>
        <div style={{ color: "var(--aqua)" }}>Staked GST</div>
        <div style={{ color: "var(--aqua)" }}>Linked Issue</div>
        <div style={{ color: "var(--aqua)" }}>Solver</div>
        <div style={{ color: "var(--aqua)" }}>Reviews</div>
        <div style={{ color: "var(--aqua)" }}>Accepted/Rejected</div>

        <div
          style={{
            height: 0.1,
            gridColumnStart: 1,
            gridColumnEnd: 7,
            backgroundColor: "var(--divider)",
          }}
        ></div>

        {pullRequests.length > 0 ?

          pullRequests.map((pr) => (
            <>
              <div
                style={{
                  paddingLeft: 20,
                  display: "flex",
                  margin: 0,
                  flexDirection: "column",
                  justifyContent: "left",
                }}
                key={pr.id}
              >
                <Link href={`/repository/${owner}/${repo}/pulls/${pr.number}`}>
                  <span style={{ color: "var(--aqua)", fontSize: 20 }}>
                    #{pr.number}
                  </span>
                </Link>{" "}
                <Link href={`/repository/${owner}/${repo}/pulls/${pr.number}`}>
                  {pr.title}
                </Link>
                <span>Posted by {pr.user.login}</span>
              </div>
              <div>5 ETH</div> {/* Keep Win Prize as static */}
              <div>{pr.milestone ? pr.milestone.title : "None"}</div>
              <div>{pr.assignee ? pr.assignee.login : "Unassigned"}</div>
              <div>5</div> {/* Keep Stakes as static */}
              <div>{pr.review_comments}</div>
              <div
                style={{
                  height: 0.1,
                  gridColumnStart: 1,
                  gridColumnEnd: 7,
                  // backgroundColor: "var(--divider)",
                }}
              >

              </div>
            </>
          ))
          :
          <div>Limit Exceeded</div>}
      </div>


    </>
  )
}

// <table>
//     <thead>
//     19 open issues
//     </thead>
// </table>