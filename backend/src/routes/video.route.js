import express from "express"
import uploadFileToGoogleDrive from "../utils/uploadFile.js"
import fs from "fs"
import { userModel } from "../models/user.js"
import upload from "../middlewares/multer.middleware.js"
const videoRouter = express.Router()

videoRouter.post("/", upload.single("file"), async (req, res) => {
    const { name, username } = req.body

    if (!name || !username) {
        return res.json({
            success: false,
            message: "Name or username is undefined"
        }).status(503)

    }
    if (!req.file) {
        return res.json({
            success: false,
            message: "file does not exist"
        }).status(503)
    }

    const filePath = req.file.path

    try {
        const url = uploadFileToGoogleDrive(filePath)
        fs.unlink(filePath, async (error) => {
            if (error) {
                console.log(`error at unlinking file ${error.message}`)
            }
        })

        const newUser = await new userModel({
            name: name,
            username: username,
            videoUrl: url
        })

        if (!newUser) {
            return res.json({
                success: false,
                message: "User does not created"
            }).status(503)
        }

        await newUser.save()

        res.json({
            success: true,
            message: "Video uploaded Successfully",
            user: newUser
        })

    } catch (error) {
        console.log(`Error in catch block ${error}`)
    }
})

export default videoRouter