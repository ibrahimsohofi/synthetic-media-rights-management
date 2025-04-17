"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, X, Paperclip, Send, Phone, MinusCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
  status?: "sending" | "sent" | "read"
}

interface ChatAgent {
  id: string
  name: string
  avatar?: string
  department: string
  status: "online" | "away" | "offline"
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [chatStatus, setChatStatus] = useState<"disconnected" | "connecting" | "connected" | "minimized">("disconnected")
  const [agent, setAgent] = useState<ChatAgent | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Simulating an agent connecting after a few seconds
  useEffect(() => {
    if (chatStatus === "connecting") {
      const timer = setTimeout(() => {
        setAgent({
          id: "agent-123",
          name: "Alex Morgan",
          avatar: "/avatars/support-agent.jpg",
          department: "Technical Support",
          status: "online"
        })
        setChatStatus("connected")

        // Add welcome message from agent
        const welcomeMessage: Message = {
          id: `msg-${Date.now()}`,
          content: "Hi there! I'm Alex from the technical support team. How can I help you today with your synthetic media rights?",
          sender: "agent",
          timestamp: new Date(),
          status: "read"
        }
        setMessages(prev => [...prev, welcomeMessage])
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [chatStatus])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true)
      if (chatStatus === "disconnected") {
        setChatStatus("connecting")
      } else if (chatStatus === "minimized") {
        setChatStatus("connected")
      }
    } else {
      if (chatStatus === "connected") {
        setChatStatus("minimized")
      }
      setIsOpen(false)
    }
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message,
      sender: "user",
      timestamp: new Date(),
      status: "sending"
    }

    setMessages(prev => [...prev, userMessage])
    setMessage("")

    // Simulate message being sent and then read
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: "sent" }
            : msg
        )
      )

      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id
              ? { ...msg, status: "read" }
              : msg
          )
        )

        // Simulate agent response
        simulateAgentResponse()
      }, 1000)
    }, 500)
  }

  const simulateAgentResponse = () => {
    // Responses based on keywords in user messages
    const lastUserMessage = messages.filter(m => m.sender === "user").pop()

    if (!lastUserMessage) return

    const responses = [
      "I understand your concern about synthetic media rights. Let me see how I can help.",
      "That's a great question about licensing. Our platform makes it easy to manage different types of licenses.",
      "For rights violations, we have automated detection systems that can help identify unauthorized usage.",
      "Our blockchain registration ensures your creative work is securely timestamped and verifiable.",
      "Have you tried our new AI training opt-out feature? It gives you more control over how your content is used."
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Add agent response after a realistic delay
    setTimeout(() => {
      const agentResponse: Message = {
        id: `msg-${Date.now()}`,
        content: randomResponse,
        sender: "agent",
        timestamp: new Date(),
        status: "read"
      }

      setMessages(prev => [...prev, agentResponse])
    }, 1500 + Math.random() * 1500) // Random delay between 1.5-3 seconds
  }

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        className="fixed right-4 bottom-4 rounded-full p-4 z-50 shadow-lg"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </Button>

      {/* Chat window */}
      <div
        className={`fixed right-4 bottom-20 w-80 sm:w-96 z-50 transition-all duration-300 transform ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <Card className="shadow-xl border overflow-hidden flex flex-col h-[450px]">
          <CardHeader className="bg-violet-500 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {agent && (
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <CardTitle className="text-sm font-medium">
                    {chatStatus === "connecting" ? "Connecting to support..." :
                     chatStatus === "connected" && agent ? agent.name :
                     "Live Support"}
                  </CardTitle>
                  {chatStatus === "connected" && agent && (
                    <p className="text-xs text-white/80">{agent.department}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => {
                    setChatStatus("minimized")
                    setIsOpen(false)
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={toggleChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-y-auto bg-muted/30">
            <div className="p-4 space-y-4">
              {chatStatus === "connecting" ? (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                  <div className="animate-pulse flex space-x-1">
                    <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
                    <div className="h-2 w-2 bg-violet-500 rounded-full animation-delay-200"></div>
                    <div className="h-2 w-2 bg-violet-500 rounded-full animation-delay-500"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">Connecting you to an available support agent...</p>
                </div>
              ) : chatStatus === "connected" ? (
                <>
                  {/* Welcome message */}
                  <div className="bg-muted text-center text-xs py-2 px-4 rounded-md text-muted-foreground">
                    {agent && `You are now connected with ${agent.name}`}
                  </div>

                  {/* Chat messages */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`flex items-end gap-2 max-w-[80%] ${
                        msg.sender === "user" ? "flex-row-reverse" : ""
                      }`}>
                        {msg.sender === "agent" && agent && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}

                        <div>
                          <div className={`px-3 py-2 rounded-lg ${
                            msg.sender === "user"
                              ? "bg-violet-500 text-white rounded-br-none"
                              : "bg-background border rounded-bl-none"
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
                            msg.sender === "user" ? "justify-end" : ""
                          }`}>
                            {new Intl.DateTimeFormat('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            }).format(msg.timestamp)}

                            {msg.sender === "user" && (
                              <span className="ml-1">
                                {msg.status === "sending" ? "●" :
                                 msg.status === "sent" ? "✓" :
                                 msg.status === "read" ? "✓✓" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium">Need help with synthetic media rights?</p>
                    <p className="text-sm text-muted-foreground">Start a conversation with our support team.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setChatStatus("connecting")}
                  >
                    Start Chat
                  </Button>
                </div>
              )}
            </div>
          </CardContent>

          {chatStatus === "connected" && (
            <CardFooter className="p-2 border-t bg-background">
              <div className="flex items-center w-full space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  className="text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  )
}
