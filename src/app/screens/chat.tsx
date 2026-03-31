import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Send, Sparkles } from "lucide-react"
import { sendChat, getOrCreateSession, ChatMessage } from "../../lib/api"

interface Message {
  id: string
  text: string
  sender: "user" | "lydia"
  timestamp: Date
}

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Lydia, your AI health companion. How can I help you today?",
      sender: "lydia",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // history kept in sync with messages for multi-turn context
  const historyRef = useRef<ChatMessage[]>([])

  const quickQuestions = [
    "Why is my period late?",
    "Can I eat fufu with PCOS?",
    "What are PCOS symptoms?",
    "How to manage weight?",
  ]

  useEffect(() => {
    getOrCreateSession().then(setSessionId).catch(console.error)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Build history for API (exclude the opening system message)
    const apiHistory: ChatMessage[] = historyRef.current

    try {
      const res = await sendChat(sessionId, text, apiHistory)

      // Update history for next turn
      historyRef.current = [
        ...apiHistory,
        { role: "user", content: text },
        { role: "assistant", content: res.reply },
      ]

      const lydiaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: res.reply,
        sender: "lydia",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, lydiaMessage])
    } catch (e) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't connect to the server. Please check your connection and try again.",
        sender: "lydia",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Lydia AI</h1>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-white text-foreground rounded-bl-sm shadow-sm"
              }`}
            >
              {message.sender === "lydia" && (
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span className="text-xs font-medium text-accent">Lydia</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-xs font-medium text-accent">Lydia</span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="space-y-3 mt-6">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  onClick={() => handleSendMessage(question)}
                  className="h-auto py-3 px-3 text-xs whitespace-normal rounded-xl border-2"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-6 pb-24 pt-4 bg-background border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSendMessage(inputValue)}
            placeholder="Ask me anything about PCOS..."
            className="flex-1 h-12 rounded-xl bg-white"
            disabled={isTyping || !sessionId}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !sessionId || !inputValue.trim()}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}