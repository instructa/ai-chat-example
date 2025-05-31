import { createAPIFileRoute } from "@tanstack/react-start/api"
import { mockStreamResponse, createSSEResponse, createDoneResponse } from "../../../lib/chat-stream"

export const APIRoute = createAPIFileRoute("/api/chat")({
    POST: async ({ request }) => {
        try {
            const body = await request.json()
            const { message } = body

            if (!message) {
                return new Response("Message is required", { status: 400 })
            }

            const encoder = new TextEncoder()
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of mockStreamResponse(message)) {
                            controller.enqueue(encoder.encode(createSSEResponse(chunk)))
                        }
                        controller.enqueue(encoder.encode(createDoneResponse()))
                    } catch (error) {
                        console.error("Streaming error:", error)
                    } finally {
                        controller.close()
                    }
                },
            })

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            })
        } catch (error) {
            console.error("API Error:", error)
            return new Response("Internal Server Error", { status: 500 })
        }
    },
})