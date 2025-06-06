import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    username:String,
    password:String
})

export const userModel = mongoose.model("User",userSchema)