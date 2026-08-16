import { useState } from "react"
import axios from "axios"

import { api } from "../services/api"

type LoginPageProps = {
  onLoginSuccess: (token: string) => void
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const formData = new URLSearchParams()

      formData.append("username", email)
      formData.append("password", password)

      const response = await api.post(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      console.log("LOGIN RESPONSE:", response.data)

      // Expected FastAPI response:
      // {
      //   access_token: "...",
      //   token_type: "bearer"
      // }

      const token =
        response.data.access_token ??
        response.data.token

      console.log("TOKEN RECEIVED:", token)

      if (!token || typeof token !== "string") {
        setError(
          "Login succeeded, but the server did not return a valid access token."
        )

        console.error(
          "Invalid login response:",
          response.data
        )

        return
      }

      localStorage.setItem(
        "access_token",
        token
      )

      console.log(
        "TOKEN IN LOCAL STORAGE:",
        localStorage.getItem("access_token")
      )

      setError("")

      onLoginSuccess(token)
    } catch (error) {
      console.error("LOGIN ERROR:", error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Invalid email or password")
        } else if (!error.response) {
          setError(
            "Unable to connect to the RetailPulse server."
          )
        } else {
          setError(
            "Login failed. Please try again."
          )
        }
      } else {
        setError(
          "Something went wrong. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
            RetailPulse
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Sign in
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Access inventory, sales, tasks and analytics.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-gray-500"
              placeholder="manager@retailpulse.dev"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-gray-500"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-gray-950 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage