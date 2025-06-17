import {google} from "googleapis"
import fs from "fs"
import dotenv from "dotenv"
import { url } from "inspector";

dotenv.config()


const keyFile = JSON.parse(
    Buffer.from(process.env.GOOGLE_DRIVE_SERVICE_KEY, "base64").toString()
);
const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const uploadFileToGoogleDrive = async (filePath) => {
    try {
        console.log("inside try block in upload files")
        if (!filePath) {
            throw new Error('File path is required');
        }
        console.log("after file path not exist")
        const drive = await google.drive({ version: 'v3', auth })
console.log("drive")
        // upload file to Google Drive

        const fileMetadata = {
            name: filePath.split('/').pop(), 
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // Folder ID to upload the file into
        };

        console.log("meta data")

        const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath) // Readable stream for file upload
        };

        console.log("media")

        const driveResponse = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        console.log("drive response")
        const fileId = driveResponse.data.id;
        console.log(fileId)
        const Url = `https://drive.google.com/file/d/${fileId}/preview`;
        console.log(Url)
       
        console.log('File uploaded successfully. File ID:', driveResponse.data.id);
        return  Url ;
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        throw error;
    }
}

export default uploadFileToGoogleDrive