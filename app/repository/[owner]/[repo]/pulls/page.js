"use client"
import Link from "next/link"
import styles from "../../../../styles.module.css"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import useWeb3Store from "@/store/useWeb3Store"

export default function PullReq() {
  const { owner, repo } = useParams()
  const [pullRequests, setPullRequests] = useState([])
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [linkedIssueNumber, setLinkedIssueNumber] = useState(null)

  const [LStoken, setLStoken] = useState(() =>
    localStorage.getItem("githubAccessToken"),
  )

  const { account, stakingContract, token, repoId } = useWeb3Store()

  useEffect(() => {
    if (!owner || !repo) return

    const fetchPullRequests = async () => {
      if (!LStoken) return setError("GitHub access token not found."), false

      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls`,
          {
            headers: {
              Authorization: `token ${LStoken}`,
            },
          },
        )
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
    fetchPullRequests()
  }, [owner, repo])

  useEffect(() => {
    if (!linkedIssueNumber) return

    const fetchSuggestions = async () => {
      if (!linkedIssueNumber) return
      if (!LStoken) return setError("GitHub access token not found."), false
      try {
        const response = await fetch(
          `https://muj-gitstakeai.onrender.com/api/suggestions/${owner}/${repo}/${linkedIssueNumber}`,
          {
            headers: {
              Authorization: `token ${LStoken}`,
              Accept: "application/json",
            },
          },
        )
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

  const getPullsInfo = async (repoId, issueId) => {
    try {
      if (token && account) {
        const [pullReqIndex, pullReqId, staker, amt] =
          await stakingContract.getStake(repoId, issueId, index)
        return {
          pullReqIndex,
          pullReqId,
          staker: staker.toString(),
          stakedAmt: GSTers.formatGSTer(amt, 18),
        }
      }
    } catch (e) {
      console.error("Error fetching Stake:", e)
      return {
        pullReqIndex: 0,
        pullReqId: 0,
        staker: "0x00",
        stakedAmt: 0,
      }
    }
  }

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
          <div style={{ color: "var(--aqua)", fontSize: 20 }}>
            {Math.max(
              ...Object.values(pullRequests).map((info) =>
                parseFloat(info?.stakedAmt || 0),
              ),
            ).toFixed(2)}{" "}
            GST
          </div>
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

      {/* if owner */}
      <div
        style={{
          margin: "0 auto",
          maxWidth: "100%",
          padding: "10px",
          background: "var(--button)",
          borderRadius: "8px",
          border: "1px solid var(--divider)",
        }}
      >
        <div
          style={{
            color: "var(--aqua)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Suggested Pull Requests
        </div>
        {suggestions ? (
          <div style={{ display: "flex", flexDirection: "row", gap: "65px" }}>
            {suggestions.topPullRequest?.url && (
              <div>
                <div>
                  Top Match (Score: {suggestions.topPullRequest.relevanceScore})
                </div>
                <Link href={suggestions.topPullRequest.url}>
                  {suggestions.topPullRequest.title}
                </Link>
              </div>
            )}
            {suggestions.secondOptimal?.url && (
              <div>
                <div>Second Match</div>
                <Link href={suggestions.secondOptimal.url}>
                  {suggestions.secondOptimal.title}
                </Link>
              </div>
            )}
            {suggestions.thirdOptimal?.url && (
              <div>
                <div>Third Match</div>
                <Link href={suggestions.thirdOptimal.url}>
                  {suggestions.thirdOptimal.title}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p>Loading Suggestions ...</p>
        )}
      </div>
      {/* end if owner */}

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

        {/* {pullRequests.length > 0 ? (
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
              <div>5 GST</div>
              <div>{pr.milestone ? pr.milestone.title : "None"}</div>
              <div>{pr.assignee ? pr.assignee.login : "Unassigned"}</div>
              <div>5</div>
              <div>{pr.review_comments}</div>
              <div
                style={{
                  height: 0.1,
                  gridColumnStart: 1,
                  gridColumnEnd: 7,
                  // backgroundColor: "var(--divider)",
                }}
              ></div>
            </>
          ))
        ) : (
          <div>Limit Exceeded</div>
        )} */}

        {pullRequests.length > 0 ? (
          pullRequests.map((pr, i) => (
            <React.Fragment key={pr.id}>
              {getPullsInfo(repoId, issueId, i).then((stakeInfo) => {
                if (stakeInfo.pullReqId !== 0) {
                  return (
                    <div
                      style={{
                        paddingLeft: 20,
                        display: "flex",
                        margin: 0,
                        flexDirection: "column",
                        justifyContent: "left",
                      }}
                    >
                      <Link
                        href={`/repository/${owner}/${repo}/pulls/${pr.number}`}
                      >
                        <span style={{ color: "var(--aqua)", fontSize: 20 }}>
                          #{pr.number}
                        </span>
                      </Link>{" "}
                      <Link
                        href={`/repository/${owner}/${repo}/pulls/${pr.number}`}
                      >
                        {pr.title}
                      </Link>
                      <span>Posted by {pr.user.login}</span>
                      <div>{stakeInfo.stakedAmt} GST</div>
                      <div>{pr.milestone ? pr.milestone.title : "None"}</div>
                      <div>
                        {pr.assignee ? pr.assignee.login : "Unassigned"}
                      </div>
                      <div>{stakeInfo.pullReqIndex}</div>
                      <div>{pr.review_comments}</div>
                      <div
                        style={{
                          height: 0.1,
                          gridColumnStart: 1,
                          gridColumnEnd: 7,
                        }}
                      ></div>
                    </div>
                  )
                }
                return null
              })}
            </React.Fragment>
          ))
        ) : (
          <p>No pull requests found.</p>
        )}
      </div>
    </>
  )
}

// <table>
//     <thead>
//     19 open issues
//     </thead>
// </table>
