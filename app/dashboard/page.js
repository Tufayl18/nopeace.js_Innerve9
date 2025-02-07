"use client"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { useRouter } from "next/navigation" 
import styles from "../styles.module.css"
import MyStatsCard from "@/components/myStats"
import ChatBot from "@/components/chatbot"

export default function Dashboard() {
  const [repos, setRepos] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRepos, setFilteredRepos] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [globalRepos, setGlobalRepos] = useState([])
  const router = useRouter() 
  let LStoken
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        LStoken = localStorage.getItem("githubAccessToken")
        if (LStoken) {
          const response = await axios.get(
            "https://api.github.com/user/repos",
            {
              headers: {
                Authorization: `token ${LStoken}`,
              },
            },
          )
          setRepos(response.data)
          setFilteredRepos(response.data)
        }
      } catch (error) {
        setError("Failed to fetch repositories")
        console.error("Error fetching repositories:", error)
      }
    }

    fetchRepos()
  }, [])

  const debounce = (func, delay) => {
    let debounceTimer
    return (...args) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => func.apply(this, args), delay)
    }
  }

  const handleSearch = useCallback(
    debounce(async (query) => {
      if (query) {
        setLoading(true)
        try {
          if(LStoken){
            
          const filtered = repos.filter((repo) =>
            repo.name.toLowerCase().includes(query.toLowerCase()),
          )

          const globalResponse = await axios.get(
            `https://api.github.com/search/repositories?q=${query}+in:name`,
            {
              headers: {
                Authorization: `token ${LStoken}`,
              },
            },
          )
          setGlobalRepos(globalResponse.data.items)

          setFilteredRepos(
            filtered.length > 0 ? filtered : globalResponse.data.items,
          )
          }else{
            setError("Unauthorized Access, no token found")
          }
        } catch (error) {
          setError("Failed to search repositories")
          console.error("Error searching repositories:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setFilteredRepos(repos)
        setGlobalRepos([])
      }
    }, 500),
    [repos],
  )

  useEffect(() => {
    handleSearch(searchQuery)
  }, [searchQuery, handleSearch])

  const handleRepoClick = (owner, repoName) => {
    router.push(`/repository/${owner}/${repoName}`)
  }

  return (
    <>
      <main className={styles.DashboardMain}>
        <div className={styles.searchBar}>
          <input
            placeholder="Type to Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <div className={styles.YourRepos}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: "var(--aqua)",
            }}
          >
            My Repositories
          </div>
          <div className={styles.YourReposContainer}>
            {error && <p>{error}</p>}
            {filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => handleRepoClick(repo.owner.login, repo.name)}
                >
                  <a
                    href={`/repository/${repo.owner.login}/${repo.name}`}
                    onClick={(e) => {
                      e.preventDefault() 
                      handleRepoClick(repo.owner.login, repo.name)
                    }}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {repo.full_name}
                  </a>
                </div>
              ))
            ) : (
              <p>No repositories found</p>
            )}
            {searchQuery &&
              globalRepos.length > 0 &&
              filteredRepos.length === 0 && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      color: "var(--aqua)",
                    }}
                  >
                    Global Repositories
                  </div>
                  {loading && <p>Loading...</p>}
                  {globalRepos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() =>
                        handleRepoClick(repo.owner.login, repo.name)
                      }
                    >
                      <a
                        href={`/repository/${repo.owner.login}/${repo.name}`}
                        onClick={(e) => {
                          e.preventDefault() 
                          handleRepoClick(repo.owner.login, repo.name)
                        }}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {repo.full_name}
                      </a>
                    </div>
                  ))}
                </>
              )}
          </div>
        </div>
        <div>
          <MyStatsCard />
        </div>
        <div>
          <ChatBot />
        </div>
      </main>
    </>
  )
}
