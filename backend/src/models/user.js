import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    username:{
        type:String,
        require:true,
        unique:true
    },
    videoUrl: String
})

export const userModel = mongoose.model("User",userSchema)