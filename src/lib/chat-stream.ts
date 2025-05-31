export async function* mockStreamResponse(message: string) {
    const responses = [
        "Hello! I'm a mock assistant. How can I help you today?",
        "That's an interesting question! Let me think about it...",
        "I appreciate your message. Here's what I think about that topic...",
        "Thanks for reaching out! I'm here to help with any questions you might have.",
        "Great question! Based on what you've asked, here's my response...",
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]
    const words = response.split(" ")

    for (let i = 0; i < words.length; i++) {
        yield words[i] + (i < words.length - 1 ? " " : "")
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))
    }
}

export function createSSEResponse(content: string) {
    return `data: ${JSON.stringify({ content })}\n\n`
}

export function createDoneResponse() {
    return "data: [DONE]\n\n"
}