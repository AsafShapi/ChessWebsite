const passport = require("passport")
const mongoose = require("mongoose")
const User = mongoose.model("users")

module.exports = (app) => {
    app.post("/auth/local/signup", async (req, res) => {
        const { username, email, password } = req.body

        try {
            const existingUser = await User.findOne({
                $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
            })

            if (existingUser) {
                return res.status(400).json({
                    error: "Username or email already exists",
                })
            }

            const user = await new User({
                username,
                email: email.toLowerCase(),
                password,
            }).save()

            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: "Error logging in after signup" })
                }
                res.json(user)
            })
        } catch (error) {
            console.error("Signup error:", error)
            res.status(500).json({ error: "Error creating user" })
        }
    })

    app.post("/auth/local/login", passport.authenticate("local"), (req, res) => {
        res.json(req.user)
    })

    app.get(
        "/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email"],
        }),
    )

    app.get("/auth/google/callback", passport.authenticate("google"), (req, res) => {
        res.redirect("/")
    })

    app.post("/auth/username", async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not logged in" })
        }

        const { username } = req.body

        try {
            const existingUser = await User.findOne({
                username: username.toLowerCase(),
            })
            if (existingUser) {
                return res.status(400).json({ error: "Username already taken" })
            }

            const user = await User.findOneAndUpdate(
                { userId: req.user.userId },
                {
                    username,
                    needsUsername: false,
                },
                { new: true },
            )

            res.json(user)
        } catch (error) {
            console.error("Username update error:", error)
            res.status(500).json({ error: "Error updating username" })
        }
    })

    app.get("/api/logout", (req, res) => {
        req.logout()
        res.redirect("/")
    })

    app.get("/api/current_user", (req, res) => {
        res.json(req.user || null)
    })
}

