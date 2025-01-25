const mongoose = require("mongoose")
const { Schema } = mongoose
const bcrypt = require("bcrypt")

const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
})

const Counter = mongoose.model("counter", counterSchema)

const userSchema = new Schema({
    userId: { type: Number, unique: true },
    googleId: { type: String, sparse: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, sparse: true },
    needsUsername: { type: Boolean, default: false },
})

userSchema.pre("validate", function (next) {
    this.username = this.username.toLowerCase()
    next()
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }

    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: "userId" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true },
            )
            this.userId = counter.seq
        } catch (error) {
            return next(error)
        }
    }

    next()
})

mongoose.model("users", userSchema)

