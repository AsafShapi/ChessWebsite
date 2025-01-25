const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const LocalStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const Keys = require("../config/keys")
const bcrypt = require("bcrypt")

const User = mongoose.model("users")

passport.serializeUser((user, done) => {
    done(null, user.userId)
})

passport.deserializeUser((userId, done) => {
    User.findOne({ userId: userId })
        .then((user) => {
            done(null, user)
        })
        .catch((err) => {
            done(err, null)
        })
})

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email: email.toLowerCase() })

                if (!user) {
                    return done(null, false, { message: "Invalid credentials" })
                }

                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    return done(null, false, { message: "Invalid credentials" })
                }

                return done(null, user)
            } catch (err) {
                return done(err)
            }
        },
    ),
)

passport.use(
    new GoogleStrategy(
        {
            clientID: Keys.googleClientID,
            clientSecret: Keys.googleClientSecret,
            callbackURL: "/auth/google/callback",
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({ googleId: profile.id })

                if (existingUser) {
                    return done(null, existingUser)
                }

                const user = await new User({
                    googleId: profile.id,
                    username: `user${Date.now()}`,
                    email: profile.emails[0].value,
                    needsUsername: true,
                }).save()

                done(null, user)
            } catch (err) {
                done(err, null)
            }
        },
    ),
)

