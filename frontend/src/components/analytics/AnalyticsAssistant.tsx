import {
  Bot,
  LoaderCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react"

import {
  useState,
  type FormEvent,
} from "react"

import ReactMarkdown from "react-markdown"

import { api } from "../../services/api"


type AnalyticsAssistantProps = {
  token: string
  days: number
  onLogout: () => void
}


type Message = {
  id: number
  role: "user" | "assistant"
  content: string
}


const suggestedQuestions = [
  "What should I restock first?",
  "Summarize my business performance.",
  "What is my best-performing product?",
  "What should I focus on this week?",
]


function AnalyticsAssistant({
  token,
  days,
  onLogout,
}: AnalyticsAssistantProps) {

  const [question, setQuestion] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [messages, setMessages] =
    useState<Message[]>([])


  async function askQuestion(
    questionToAsk?: string
  ) {

    const finalQuestion = (
      questionToAsk ??
      question
    ).trim()


    if (
      !finalQuestion ||
      loading
    ) {
      return
    }


    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: finalQuestion,
    }


    setMessages(
      (currentMessages) => [
        ...currentMessages,
        userMessage,
      ]
    )

    setQuestion("")
    setError("")
    setLoading(true)


    try {

      const response =
        await api.post(
          "/assistant/query",
          {
            question:
              finalQuestion,

            context_days:
              days,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )


      const assistantMessage: Message = {
        id:
          Date.now() + 1,

        role:
          "assistant",

        content:
          response.data.answer,
      }


      setMessages(
        (currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]
      )


    } catch (error: any) {

      console.error(
        "Assistant request failed:",
        error
      )


      if (
        error.response?.status ===
        401
      ) {
        onLogout()
        return
      }


      if (
        error.response?.status ===
        403
      ) {
        setError(
          "You do not have permission to use the business assistant."
        )

        return
      }


      setError(
        error.response?.data?.detail ??
        "Unable to reach RetailPulse Assistant."
      )


    } finally {

      setLoading(false)

    }
  }


  function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault()

    askQuestion()
  }


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-gray-100 px-6 py-5">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles size={19} />
            </div>


            <div>

              <h3 className="font-semibold text-gray-900">
                Ask RetailPulse
              </h3>

              <p className="mt-0.5 text-xs text-gray-500">
                Business decision support using your live data
              </p>

            </div>

          </div>


          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Last {days} days
          </span>

        </div>

      </div>


      {/* Empty state */}

      {messages.length === 0 && (

        <div className="px-6 py-6">

          <div className="rounded-2xl bg-gray-50 p-5">

            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">

              <Bot
                size={17}
                className="text-blue-600"
              />

              Ask a business question

            </div>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Get recommendations based on your sales,
              inventory and operational data.
            </p>


            <div className="mt-4 flex flex-wrap gap-2">

              {suggestedQuestions.map(
                (suggestion) => (

                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      askQuestion(
                        suggestion
                      )
                    }
                    disabled={loading}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>

                )
              )}

            </div>

          </div>

        </div>

      )}


      {/* Conversation */}

      {messages.length > 0 && (

        <div className="max-h-[520px] space-y-5 overflow-y-auto px-6 py-6">

          {messages.map(
            (message) => (

              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role ===
                  "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {/* Assistant icon */}

                {message.role ===
                  "assistant" && (

                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">

                    <Bot size={16} />

                  </div>

                )}


                {/* Message bubble */}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role ===
                    "user"
                      ? "bg-gray-900 text-white"
                      : "border border-gray-100 bg-gray-50 text-gray-700"
                  }`}
                >

                  {message.role ===
                  "assistant" ? (

                    <div className="text-sm leading-6">

                      <ReactMarkdown
                        components={{

                          p: ({
                            children,
                          }) => (
                            <p className="mb-3 last:mb-0">
                              {children}
                            </p>
                          ),


                          strong: ({
                            children,
                          }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),


                          ul: ({
                            children,
                          }) => (
                            <ul className="mb-3 list-disc space-y-1 pl-5">
                              {children}
                            </ul>
                          ),


                          ol: ({
                            children,
                          }) => (
                            <ol className="mb-3 list-decimal space-y-1 pl-5">
                              {children}
                            </ol>
                          ),


                          li: ({
                            children,
                          }) => (
                            <li>
                              {children}
                            </li>
                          ),


                          h1: ({
                            children,
                          }) => (
                            <h1 className="mb-2 text-base font-semibold text-gray-900">
                              {children}
                            </h1>
                          ),


                          h2: ({
                            children,
                          }) => (
                            <h2 className="mb-2 text-sm font-semibold text-gray-900">
                              {children}
                            </h2>
                          ),


                          h3: ({
                            children,
                          }) => (
                            <h3 className="mb-2 text-sm font-semibold text-gray-900">
                              {children}
                            </h3>
                          ),

                        }}
                      >
                        {message.content}
                      </ReactMarkdown>

                    </div>

                  ) : (

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>

                  )}

                </div>


                {/* User icon */}

                {message.role ===
                  "user" && (

                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">

                    <User size={16} />

                  </div>

                )}

              </div>

            )
          )}


          {/* Loading message */}

          {loading && (

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot size={16} />
              </div>


              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">

                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Analyzing your business...

              </div>

            </div>

          )}

        </div>

      )}


      {/* Error */}

      {error && (

        <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm text-red-700">
            {error}
          </p>

        </div>

      )}


      {/* Input */}

      <div className="border-t border-gray-100 bg-gray-50/70 p-4">

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3"
        >

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={(event) => {

              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {

                event.preventDefault()

                askQuestion()

              }

            }}
            rows={1}
            placeholder="Ask about sales, inventory or business performance..."
            className="min-h-[46px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />


          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >

            {loading ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send size={18} />
            )}

          </button>

        </form>


        <p className="mt-2 text-center text-[11px] text-gray-400">
          Recommendations are based on available RetailPulse data.
        </p>

      </div>

    </div>
  )
}


export default AnalyticsAssistant