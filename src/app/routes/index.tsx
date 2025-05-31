import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Card } from "../../components/ui/card"

export const Route = createFileRoute("/")({
    component: Home
})

type Message = {
    id: string
    role: "user" | "assistant"
    content: string
}

function Home() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: ""
        }
        setMessages(prev => [...prev, assistantMessage])

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage.content }),
            })

            console.log("Response status:", response.status)
            console.log("Response headers:", response.headers)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("Error response:", errorText)
                throw new Error(`Failed to send message: ${response.status}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split("\n")

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6)
                            if (data === "[DONE]") continue
                            
                            try {
                                const parsed = JSON.parse(data)
                                setMessages(prev => 
                                    prev.map(msg => 
                                        msg.id === assistantMessage.id 
                                            ? { ...msg, content: msg.content + parsed.content }
                                            : msg
                                    )
                                )
                            } catch (e) {
                                console.error("Failed to parse SSE data:", e)
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error)
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === assistantMessage.id 
                        ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                        : msg
                )
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
            <Card className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        message.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-900"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                
                <form onSubmit={handleSubmit} className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            Send
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
