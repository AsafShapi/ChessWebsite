const { Server } = require("socket.io")
const handleAuthentication = require("./handlers/auth")
const handleRoomEvents = require("./handlers/room")
const handleChatEvents = require("./handlers/chat")
const handleFriendEvents = require("./handlers/friend")
const handleDisconnect = require("./handlers/disconnect")
const { handleGameEvents, handleRematchEvents } = require("./handlers/game")

module.exports = (server) => {
    const io = new Server(server)

    io.on("connection", (socket) => {
        console.log("New client connected")

        // Handle user authentication
        socket.on("authenticate", (userId) => handleAuthentication(io, socket, userId))

        // Handle room-related events
        handleRoomEvents(io, socket)

        // Handle chat-related events
        handleChatEvents(io, socket)

        // Handle friend-related events
        handleFriendEvents(io, socket)

        // Handle game-related events
        handleGameEvents(io, socket)
        handleRematchEvents(io, socket)

        // Handle disconnection
        socket.on("disconnect", () => handleDisconnect(io, socket))
    })

    return io
}

