const mongoose = require("mongoose")
const requireLogin = require("../middlewares/requireLogin")
const Friend = mongoose.model("friends")
const User = mongoose.model("users")

module.exports = (app) => {
    app.post("/api/friends/request", requireLogin, async (req, res) => {
        try {
            const { friendId } = req.body

            const friend = await User.findOne({ userId: friendId })
            if (!friend) {
                return res.status(404).json({ error: "User not found" })
            }

            const existingRequest = await Friend.findOne({
                $or: [
                    { userId: req.user.userId, friendId },
                    { userId: friendId, friendId: req.user.userId },
                ],
            })

            if (existingRequest) {
                return res.status(400).json({ error: "Friend request already exists" })
            }

            const friendRequest = new Friend({
                userId: req.user.userId,
                friendId,
                status: "pending",
            })

            await friendRequest.save()
            res.json(friendRequest)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    })

    app.put("/api/friends/request/:requestId", requireLogin, async (req, res) => {
        try {
            const { action } = req.body
            const request = await Friend.findById(req.params.requestId)

            if (!request) {
                return res.status(404).json({ error: "Request not found" })
            }

            if (request.friendId !== req.user.userId) {
                return res.status(403).json({ error: "Not authorized" })
            }

            if (action === "accept") {
                request.status = "accepted"
                await request.save()
                res.json(request)
            } else if (action === "reject") {
                await request.deleteOne()
                res.json({ success: true })
            }
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    })

    app.get("/api/friends", requireLogin, async (req, res) => {
        try {
            const userId = req.user.userId

            const friendRecords = await Friend.find({
                $or: [{ userId }, { friendId: userId }],
            })

            const userIds = new Set(friendRecords.flatMap((record) => [record.userId, record.friendId]))
            userIds.delete(userId)

            const users = await User.find({
                userId: { $in: Array.from(userIds) },
            })

            const formatted = friendRecords.map((record) => {
                const friend = users.find(
                    (user) => user.userId === (record.userId === userId ? record.friendId : record.userId),
                )

                return {
                    requestId: record._id,
                    friend: {
                        id: friend.userId,
                        username: friend.username,
                        email: friend.email,
                    },
                    status: record.status,
                    type: record.userId === userId ? "sent" : "received",
                }
            })

            res.json(formatted)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    })

    app.get("/api/users/search", requireLogin, async (req, res) => {
        try {
            const { username } = req.query

            const users = await User.find({
                username: new RegExp(username, "i"),
                userId: { $ne: req.user.userId },
            }).limit(10)

            res.json(
                users.map((user) => ({
                    id: user.userId,
                    username: user.username,
                    email: user.email,
                })),
            )
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    })
}

