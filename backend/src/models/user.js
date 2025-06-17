import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    videoUrl: String
})

export const userModel = mongoose.model("User",userSchema)