import express from "express"
import uploadFileToGoogleDrive from "../utils/uploadFile.js"
import fs from "fs"
import { userModel } from "../models/user.js"
import upload from "../middlewares/multer.middleware.js"
const videoRouter = express.Router()

videoRouter.post("/", upload.single("file"), async (req, res) => {
    const { name, username } = req.body

    
    if (!req.file) {
        return res.json({
            success: false,
            message: "file does not exist"
        }).status(503)
    }

    const filePath = req.file.path
    console.log(filePath)

    try {
        console.log("in the try block")
        const url = await uploadFileToGoogleDrive(filePath)
        console.log("after the try ")
        console.log(url)
        if (!url) {
            res.status(503).json({
                success:"failed to upload video"
            })
        }
        fs.unlink(filePath, async (error) => {
            if (error) {
                console.log(`error at unlinking file ${error.message}`)
            }
        })

        const newUser = await new userModel({
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