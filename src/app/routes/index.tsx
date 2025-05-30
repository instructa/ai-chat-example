import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: Home
})

function Home() {
    return (
        <div className="bg-red-500 p-2">
            <h3>Hello from Claude Code</h3>
        </div>
    )
}
