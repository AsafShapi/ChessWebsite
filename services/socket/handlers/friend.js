const { userSockets } = require("../state")

function handleFriendEvents(io, socket) {
    socket.on("friend-request-sent", ({ friendId }) => {
        const receiverSocketId = userSockets.get(friendId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("friend-request-received")
        }
    })

    socket.on("friend-request-responded", ({ friendId }) => {
        const receiverSocketId = userSockets.get(friendId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("friend-request-updated")
        }
    })
}

module.exports = handleFriendEvents

