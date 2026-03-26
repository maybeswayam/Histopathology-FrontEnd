"use client"

import { useState } from "react"
import { Bot, Send, Sparkles, UserRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { unifiedAPI } from "@/services/unified-api"

interface Message {
  text: string
  isUser: boolean
}

const starterPrompts = [
  "Explain the latest result in simple terms",
  "How should I interpret confidence?",
  "What does the heatmap show?",
]

export function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (message = input) => {
    if (message.trim() === "") return

    const userMessage: Message = { text: message, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await unifiedAPI.sendChatMessage(message)
      const botMessage: Message = { text: response, isUser: false }
      setMessages((prev) => [...prev, botMessage])
    } catch {
      const errorMessage: Message = {
        text: "I could not get a response right now. Please try again in a moment.",
        isUser: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-[36px] border border-emerald-100 bg-white shadow-[0_24px_80px_-50px_rgba(22,101,52,0.18)]">
      <div className="flex items-center justify-between border-b border-emerald-100 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/80">
            Assistant
          </p>
          <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-950">
            Gemini copilot
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ask follow-up questions about the project, the workflow, or interpretation.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/15">
          <Bot className="h-5 w-5" />
        </div>
      </div>

      <div className="flex h-[470px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(236,253,245,0.85))] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Ready to help</p>
                    <p className="text-sm text-slate-600">
                      Start with one of these prompts or ask your own question.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void handleSendMessage(prompt)}
                    className="rounded-[22px] border border-emerald-100 bg-white px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-slate-950"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.isUser ? "user" : "bot"}-${index}`}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] items-start gap-3 ${
                  message.isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                    message.isUser
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {message.isUser ? (
                    <UserRound className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`rounded-[24px] px-4 py-3 text-sm leading-7 shadow-sm ${
                    message.isUser
                      ? "bg-emerald-600 text-white"
                      : "border border-emerald-100 bg-emerald-50/50 text-slate-700"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-slate-600 shadow-sm">
                  Thinking...
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-emerald-100 p-4">
          <div className="flex items-center gap-3 rounded-[26px] border border-emerald-100 bg-emerald-50/40 p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  e.preventDefault()
                  void handleSendMessage()
                }
              }}
              placeholder="Ask about predictions, heatmaps, or workflow..."
              className="h-12 flex-1 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <Button
              onClick={() => void handleSendMessage()}
              disabled={isLoading}
              className="h-12 rounded-[20px] bg-emerald-600 px-4 text-white hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
